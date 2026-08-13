import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

import type { ProjectContent } from './io';
import { parseFrontmatter } from './io';
import { stableIdSchema } from './schema';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must use YYYY-MM-DD');
const productionStatusSchema = z.enum(['planned', 'research', 'draft', 'verified']);

const productionWaveSchema = z
  .object({
    id: stableIdSchema,
    focus: z.string().min(10),
    status: productionStatusSchema,
    terms: z.array(stableIdSchema).min(1),
  })
  .strict();

const productionBatchSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(['sample', 'foundation', 'collaboration', 'product', 'rag', 'pm']),
    status: productionStatusSchema,
    terms: z.array(stableIdSchema).min(1),
    waves: z.array(productionWaveSchema).min(1).optional(),
  })
  .strict();

export const contentProductionPlanSchema = z
  .object({
    version: z.literal(1),
    targetVerified: z
      .object({ min: z.number().int().min(80), max: z.number().int().max(120) })
      .strict()
      .refine(({ min, max }) => min <= max, 'min must not exceed max'),
    batches: z.array(productionBatchSchema).min(1),
  })
  .strict();

const researchClaimSchema = z
  .object({
    id: stableIdSchema,
    statement: z.string().min(20),
    evidenceType: z.enum(['definition', 'mechanism', 'practice', 'boundary', 'risk']),
    sourceIds: z.array(stableIdSchema).min(1),
  })
  .strict();

export const researchPacketSchema = z
  .object({
    termId: stableIdSchema,
    batch: stableIdSchema,
    status: z.enum(['research', 'draft', 'verified']),
    accessedAt: dateSchema,
    sourceIds: z.array(stableIdSchema).min(2),
    timeBoundary: z.string().min(10),
    claims: z.array(researchClaimSchema).min(3),
  })
  .strict();

export type ContentProductionPlan = z.infer<typeof contentProductionPlanSchema>;
export type ResearchPacket = z.infer<typeof researchPacketSchema>;

export interface ResearchPacketDocument {
  filePath: string;
  data: ResearchPacket;
  body: string;
}

export interface ProductionDiagnostic {
  code: string;
  filePath: string;
  message: string;
}

export async function loadContentProductionPlan(root = process.cwd()) {
  const filePath = path.join(root, 'src/data/content-production.yml');
  return contentProductionPlanSchema.parse(parseYaml(await readFile(filePath, 'utf8')));
}

export async function loadResearchPackets(root = process.cwd()): Promise<ResearchPacketDocument[]> {
  const directory = path.join(root, 'research/content-packets');
  const names = (await readdir(directory))
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort();

  return Promise.all(
    names.map(async (name) => {
      const filePath = path.join('research/content-packets', name);
      const parsed = parseFrontmatter(await readFile(path.join(root, filePath), 'utf8'), filePath);
      return {
        filePath,
        data: researchPacketSchema.parse(parsed.data),
        body: parsed.body,
      };
    }),
  );
}

export function deepContentTermIds(plan: ContentProductionPlan): Set<string> {
  return new Set(
    plan.batches.flatMap((batch) => {
      if (!batch.waves) return batch.status === 'planned' ? [] : batch.terms;
      return batch.waves.filter((wave) => wave.status !== 'planned').flatMap((wave) => wave.terms);
    }),
  );
}

function expectedBatchStatus(batch: ContentProductionPlan['batches'][number]) {
  if (!batch.waves) return batch.status;
  const statuses = batch.waves.map((wave) => wave.status);
  if (statuses.every((status) => status === 'planned')) return 'planned';
  if (statuses.every((status) => status === 'verified')) return 'verified';
  if (statuses.some((status) => status === 'draft')) return 'draft';
  return 'research';
}

export function validateContentProduction(
  plan: ContentProductionPlan,
  packets: ResearchPacketDocument[],
  project: ProjectContent,
): ProductionDiagnostic[] {
  const diagnostics: ProductionDiagnostic[] = [];
  const terms = new Map(project.terms.map((document) => [document.data.id, document.data]));
  const packetsByTerm = new Map(packets.map((packet) => [packet.data.termId, packet]));
  const assigned = new Set<string>();

  for (const batch of plan.batches) {
    if (batch.kind === 'sample' && (batch.terms.length < 8 || batch.terms.length > 12)) {
      diagnostics.push({
        code: 'PRODUCTION_SAMPLE_SIZE',
        filePath: 'src/data/content-production.yml',
        message: `sample batch ${batch.id} must contain 8-12 terms`,
      });
    }
    if (batch.kind === 'foundation' && (batch.terms.length < 20 || batch.terms.length > 30)) {
      diagnostics.push({
        code: 'PRODUCTION_FOUNDATION_SIZE',
        filePath: 'src/data/content-production.yml',
        message: `foundation batch ${batch.id} must contain 20-30 terms`,
      });
    }
    if (batch.kind === 'collaboration' && (batch.terms.length < 15 || batch.terms.length > 25)) {
      diagnostics.push({
        code: 'PRODUCTION_COLLABORATION_SIZE',
        filePath: 'src/data/content-production.yml',
        message: `collaboration batch ${batch.id} must contain 15-25 terms`,
      });
    }
    if (batch.kind === 'product' && (batch.terms.length < 20 || batch.terms.length > 30)) {
      diagnostics.push({
        code: 'PRODUCTION_PRODUCT_SIZE',
        filePath: 'src/data/content-production.yml',
        message: `product batch ${batch.id} must contain 20-30 terms`,
      });
    }
    if (batch.kind === 'pm' && (batch.terms.length < 5 || batch.terms.length > 15)) {
      diagnostics.push({
        code: 'PRODUCTION_PM_SIZE',
        filePath: 'src/data/content-production.yml',
        message: `pm batch ${batch.id} must contain 5-15 terms`,
      });
    }

    const waveTerms = batch.waves?.flatMap((wave) => wave.terms);
    if (waveTerms && waveTerms.join('\n') !== batch.terms.join('\n')) {
      diagnostics.push({
        code: 'PRODUCTION_WAVE_SEQUENCE',
        filePath: 'src/data/content-production.yml',
        message: `waves in ${batch.id} must contain every batch term once and in production order`,
      });
    }
    if (batch.waves && expectedBatchStatus(batch) !== batch.status) {
      diagnostics.push({
        code: 'PRODUCTION_BATCH_STATUS',
        filePath: 'src/data/content-production.yml',
        message: `${batch.id} status must summarize its wave statuses`,
      });
    }

    const waveStatusByTerm = new Map(
      batch.waves?.flatMap((wave) => wave.terms.map((id) => [id, wave.status] as const)),
    );

    for (const id of batch.terms) {
      if (assigned.has(id)) {
        diagnostics.push({
          code: 'PRODUCTION_TERM_DUPLICATE',
          filePath: 'src/data/content-production.yml',
          message: `${id} appears in more than one content batch`,
        });
      }
      assigned.add(id);

      const term = terms.get(id);
      if (!term) {
        diagnostics.push({
          code: 'PRODUCTION_TERM_UNKNOWN',
          filePath: 'src/data/content-production.yml',
          message: `${id} is not a public term`,
        });
        continue;
      }
      const productionStatus = waveStatusByTerm.get(id) ?? batch.status;
      const expectedTermStatus = productionStatus === 'research' ? 'catalogued' : productionStatus;
      if (productionStatus !== 'planned' && term.status !== expectedTermStatus) {
        diagnostics.push({
          code: 'PRODUCTION_TERM_STATUS',
          filePath: `src/content/terms/${term.domain}/${id}.mdx`,
          message: `${id} is ${productionStatus} in batch ${batch.id} but its term is ${term.status}`,
        });
      }

      const packet = packetsByTerm.get(id);
      if (productionStatus === 'planned') {
        if (packet) {
          diagnostics.push({
            code: 'PRODUCTION_PACKET_PREMATURE',
            filePath: packet.filePath,
            message: `${id} has a research packet but batch ${batch.id} is still planned`,
          });
        }
        continue;
      }
      if (!packet) {
        diagnostics.push({
          code: 'PRODUCTION_PACKET_MISSING',
          filePath: `research/content-packets/${id}.md`,
          message: `${id} requires a research packet`,
        });
        continue;
      }
      if (path.basename(packet.filePath, '.md') !== id || packet.data.batch !== batch.id) {
        diagnostics.push({
          code: 'PRODUCTION_PACKET_IDENTITY',
          filePath: packet.filePath,
          message: `packet identity must match ${id} in batch ${batch.id}`,
        });
      }
      if (packet.data.status !== productionStatus) {
        diagnostics.push({
          code: 'PRODUCTION_PACKET_STATUS',
          filePath: packet.filePath,
          message: `${id} packet is ${packet.data.status} but its production status is ${productionStatus}`,
        });
      }
      if (packet.body.length < 30) {
        diagnostics.push({
          code: 'PRODUCTION_PACKET_NOTES',
          filePath: packet.filePath,
          message: `${id} packet requires editorial notes`,
        });
      }

      const termSourceIds = new Set(term.sources.map((source) => source.id));
      for (const sourceId of packet.data.sourceIds) {
        if (!termSourceIds.has(sourceId)) {
          diagnostics.push({
            code: 'PRODUCTION_PACKET_SOURCE_UNKNOWN',
            filePath: packet.filePath,
            message: `${sourceId} is not registered on term ${id}`,
          });
        }
      }
      for (const claim of packet.data.claims) {
        for (const sourceId of claim.sourceIds) {
          if (!packet.data.sourceIds.includes(sourceId)) {
            diagnostics.push({
              code: 'PRODUCTION_CLAIM_SOURCE_UNKNOWN',
              filePath: packet.filePath,
              message: `${claim.id} references unregistered source ${sourceId}`,
            });
          }
        }
      }
    }
  }

  for (const packet of packets) {
    if (!assigned.has(packet.data.termId)) {
      diagnostics.push({
        code: 'PRODUCTION_PACKET_UNPLANNED',
        filePath: packet.filePath,
        message: `${packet.data.termId} is not assigned to a content batch`,
      });
    }
  }

  return diagnostics;
}
