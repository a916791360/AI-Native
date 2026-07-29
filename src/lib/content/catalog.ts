import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

import type { ProjectContent } from './io';
import { stableIdSchema } from './schema';
import { normalizeLookupKey } from './validation';

const scoreSchema = z
  .union([z.string(), z.number().int()])
  .transform(String)
  .refine((value) => /^[1-5]{4}$/.test(value), 'must contain four scores from 1 to 5');

const routeCodesSchema = z
  .string()
  .regex(/^(?:none|F?H?P?R?)$/, 'must use F, H, P and R once in that order, or none');

const candidateTupleSchema = z.tuple([
  stableIdSchema,
  z.string().min(1),
  z.string().min(1),
  z.enum(['beginner', 'intermediate', 'advanced']),
  z.enum(['core', 'extended']),
  z.enum(['A', 'B', 'C', 'D']),
  scoreSchema,
  routeCodesSchema,
]);

const catalogGroupSchema = z
  .object({
    domain: stableIdSchema,
    terms: z.array(candidateTupleSchema).min(1),
  })
  .strict();

const mergeVariantSchema = z
  .object({
    value: z.string().min(1),
    language: z.enum(['zh-CN', 'en']),
    kind: z.enum(['alias', 'abbreviation', 'duplicate']),
  })
  .strict();

const mergeReviewSchema = z
  .object({
    canonical: stableIdSchema,
    variants: z.array(mergeVariantSchema).min(1),
    reason: z.string().min(10),
  })
  .strict();

export const catalogPlanSchema = z
  .object({
    version: z.literal(1),
    targetCount: z.number().int().min(300).max(500),
    groups: z.array(catalogGroupSchema).length(12),
    mergeReviews: z.array(mergeReviewSchema),
  })
  .strict();

export type CatalogPlan = z.infer<typeof catalogPlanSchema>;
export type CatalogCandidateTuple = z.infer<typeof candidateTupleSchema>;
export const PUBLISHED_CATALOG_BATCHES = ['B', 'C'] as const;

const catalogSummariesSchema = z.record(stableIdSchema, z.string().min(10).max(160));
export type CatalogSummaries = z.infer<typeof catalogSummariesSchema>;

export interface CatalogCandidate {
  id: string;
  nameZh: string;
  nameEn: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ring: 'core' | 'extended';
  batch: 'A' | 'B' | 'C' | 'D';
  scores: {
    foundation: number;
    search: number;
    route: number;
    business: number;
  };
  routeCodes: string;
  domain: string;
}

export interface CatalogDiagnostic {
  code: string;
  fieldPath: string;
  message: string;
}

export async function loadCatalogPlan(root = process.cwd()): Promise<CatalogPlan> {
  const filePath = path.join(root, 'src/data/catalog-plan.yml');
  const source = await readFile(filePath, 'utf8');
  return catalogPlanSchema.parse(parseYaml(source));
}

export async function loadCatalogSummaries(root = process.cwd()): Promise<CatalogSummaries> {
  const filePath = path.join(root, 'src/data/catalog-summaries.yml');
  const source = await readFile(filePath, 'utf8');
  return catalogSummariesSchema.parse(parseYaml(source));
}

export function flattenCatalogCandidates(catalog: CatalogPlan): CatalogCandidate[] {
  return catalog.groups.flatMap((group) =>
    group.terms.map((tuple) => {
      const [id, nameZh, nameEn, difficulty, ring, batch, scoreText, routeCodes] = tuple;
      const scores = [...scoreText].map(Number);
      return {
        id,
        nameZh,
        nameEn,
        difficulty,
        ring,
        batch,
        scores: {
          foundation: scores[0]!,
          search: scores[1]!,
          route: scores[2]!,
          business: scores[3]!,
        },
        routeCodes,
        domain: group.domain,
      };
    }),
  );
}

export function validateCatalogPlan(
  catalog: CatalogPlan,
  project: ProjectContent,
): CatalogDiagnostic[] {
  const diagnostics: CatalogDiagnostic[] = [];
  const add = (code: string, fieldPath: string, message: string) =>
    diagnostics.push({ code, fieldPath, message });
  const domainIds = new Set(project.domains.map((domain) => domain.id));
  const groupIds = new Set<string>();
  const candidates = new Map<string, { domain: string; tuple: CatalogCandidateTuple }>();
  const lookupOwners = new Map<string, string>();
  const batchCounts = { A: 0, B: 0, C: 0, D: 0 };

  catalog.groups.forEach((group, groupIndex) => {
    const expectedDomain = project.domains.toSorted((left, right) => left.order - right.order)[
      groupIndex
    ];
    if (group.domain !== expectedDomain?.id) {
      add(
        'CATALOG_DOMAIN_ORDER',
        `groups.${groupIndex}.domain`,
        `expected ${expectedDomain?.id ?? 'no domain'} at this position`,
      );
    }
    if (!domainIds.has(group.domain)) {
      add(
        'CATALOG_DOMAIN_UNKNOWN',
        `groups.${groupIndex}.domain`,
        `unknown domain ${group.domain}`,
      );
    }
    if (groupIds.has(group.domain)) {
      add(
        'CATALOG_DOMAIN_DUPLICATE',
        `groups.${groupIndex}.domain`,
        `duplicate domain ${group.domain}`,
      );
    }
    groupIds.add(group.domain);
    if (group.terms.length !== 25) {
      add(
        'CATALOG_DOMAIN_QUOTA',
        `groups.${groupIndex}.terms`,
        `expected 25 candidates; received ${group.terms.length}`,
      );
    }

    group.terms.forEach((tuple, termIndex) => {
      const [id, nameZh, nameEn, , , batch] = tuple;
      const fieldPath = `groups.${groupIndex}.terms.${termIndex}`;
      if (candidates.has(id))
        add('CATALOG_ID_DUPLICATE', fieldPath, `duplicate candidate ID ${id}`);
      candidates.set(id, { domain: group.domain, tuple });
      batchCounts[batch] += 1;

      for (const value of [nameZh, nameEn]) {
        const key = normalizeLookupKey(value);
        const owner = lookupOwners.get(key);
        if (owner && owner !== id) {
          add('CATALOG_NAME_CONFLICT', fieldPath, `${value} conflicts with ${owner}`);
        } else {
          lookupOwners.set(key, id);
        }
      }
    });
  });

  for (const domainId of domainIds) {
    if (!groupIds.has(domainId))
      add('CATALOG_DOMAIN_MISSING', 'groups', `missing domain ${domainId}`);
  }

  if (candidates.size !== catalog.targetCount) {
    add(
      'CATALOG_TARGET_MISMATCH',
      'targetCount',
      `declares ${catalog.targetCount} but contains ${candidates.size} unique candidates`,
    );
  }

  const cumulativeB = batchCounts.A + batchCounts.B;
  const cumulativeC = cumulativeB + batchCounts.C;
  if (batchCounts.A !== 12) {
    add(
      'CATALOG_BATCH_A_MISMATCH',
      'groups',
      `batch A must contain the 12 vertical-slice terms; received ${batchCounts.A}`,
    );
  }
  if (cumulativeB < 80 || cumulativeB > 120) {
    add('CATALOG_BATCH_B_RANGE', 'groups', `batch A+B contains ${cumulativeB}; expected 80-120`);
  }
  if (cumulativeC < 220 || cumulativeC > 300) {
    add('CATALOG_BATCH_C_RANGE', 'groups', `batch A+B+C contains ${cumulativeC}; expected 220-300`);
  }

  for (const termDocument of project.terms) {
    const term = termDocument.data;
    const candidate = candidates.get(term.id);
    if (!candidate) {
      add('CATALOG_EXISTING_TERM_MISSING', 'groups', `missing existing term ${term.id}`);
      continue;
    }
    const [, nameZh, nameEn, , , batch] = candidate.tuple;
    if (candidate.domain !== term.domain || nameZh !== term.nameZh || nameEn !== term.nameEn) {
      add(
        'CATALOG_EXISTING_TERM_DRIFT',
        'groups',
        `existing term ${term.id} must keep its candidate identity and domain assignment`,
      );
    }
    if (!['A', ...PUBLISHED_CATALOG_BATCHES].includes(batch)) {
      add(
        'CATALOG_UNSCHEDULED_TERM_PUBLISHED',
        'groups',
        `existing term ${term.id} belongs to unpublished batch ${batch}`,
      );
    }
  }

  const variantOwners = new Map<string, string>();
  catalog.mergeReviews.forEach((review, reviewIndex) => {
    if (!candidates.has(review.canonical)) {
      add(
        'CATALOG_MERGE_TARGET_UNKNOWN',
        `mergeReviews.${reviewIndex}.canonical`,
        `unknown canonical term ${review.canonical}`,
      );
    }
    review.variants.forEach((variant, variantIndex) => {
      const key = normalizeLookupKey(variant.value);
      const canonicalOwner = lookupOwners.get(key);
      if (canonicalOwner && canonicalOwner !== review.canonical) {
        add(
          'CATALOG_VARIANT_NAME_CONFLICT',
          `mergeReviews.${reviewIndex}.variants.${variantIndex}`,
          `${variant.value} conflicts with canonical term ${canonicalOwner}`,
        );
      }
      const variantOwner = variantOwners.get(key);
      if (variantOwner && variantOwner !== review.canonical) {
        add(
          'CATALOG_VARIANT_DUPLICATE',
          `mergeReviews.${reviewIndex}.variants.${variantIndex}`,
          `${variant.value} is already assigned to ${variantOwner}`,
        );
      } else {
        variantOwners.set(key, review.canonical);
      }
    });
  });

  for (const termDocument of project.terms) {
    const term = termDocument.data;
    const variants = [...term.abbreviations, ...term.aliases.map((alias) => alias.value)];
    for (const variant of variants) {
      if (variantOwners.get(normalizeLookupKey(variant)) !== term.id) {
        add(
          'CATALOG_EXISTING_VARIANT_MISSING',
          'mergeReviews',
          `${variant} must resolve to existing term ${term.id}`,
        );
      }
    }
  }

  return diagnostics;
}

export function validatePublishedCatalogSummaries(
  catalog: CatalogPlan,
  summaries: CatalogSummaries,
): CatalogDiagnostic[] {
  const diagnostics: CatalogDiagnostic[] = [];
  const publishedIds = new Set(
    flattenCatalogCandidates(catalog)
      .filter((candidate) => PUBLISHED_CATALOG_BATCHES.includes(candidate.batch as 'B' | 'C'))
      .map((candidate) => candidate.id),
  );

  for (const id of publishedIds) {
    if (!summaries[id]) {
      diagnostics.push({
        code: 'CATALOG_SUMMARY_MISSING',
        fieldPath: id,
        message: `published catalog term ${id} requires a directory summary`,
      });
    }
  }
  for (const id of Object.keys(summaries)) {
    if (!publishedIds.has(id)) {
      diagnostics.push({
        code: 'CATALOG_SUMMARY_UNEXPECTED',
        fieldPath: id,
        message: `summary does not belong to a published catalog term ${id}`,
      });
    }
  }

  return diagnostics;
}

export function countCatalogBatches(catalog: CatalogPlan) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const group of catalog.groups) {
    for (const tuple of group.terms) counts[tuple[5]] += 1;
  }
  return counts;
}
