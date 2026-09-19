import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

import type { ProjectContent } from './io';
import { stableIdSchema, termSchema } from './schema';
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
    // 原为 .length(13)：这份计划表是配额制度（13 领域 × 25 条 = 325）的历史快照，
    // 分组数曾被强制等于领域数。配额取消后（见 schema.ts 的 domainsSchema），
    // 领域可以增删，历史计划表不应该跟着报错——它只是当时的生产排期，不是当前内容结构。
    groups: z.array(catalogGroupSchema).min(1),
    mergeReviews: z.array(mergeReviewSchema),
  })
  .strict();

export type CatalogPlan = z.infer<typeof catalogPlanSchema>;
export type CatalogCandidateTuple = z.infer<typeof candidateTupleSchema>;
export const PUBLISHED_CATALOG_BATCHES = ['B', 'C', 'D'] as const;

const catalogSummariesSchema = z.record(stableIdSchema, z.string().min(10).max(160));
export type CatalogSummaries = z.infer<typeof catalogSummariesSchema>;

/**
 * 目录词条的手工内容覆盖层。
 *
 * 为什么需要它：`scripts/sync-catalog.ts` 会按 catalog-plan.yml **整体重写**目录词条的
 * frontmatter。也就是说，凡是「计划表产不出来的字段」，直接改那些 .mdx 文件都会在
 * 下一次 `pnpm generate:data` 时被静默抹掉——这不是假设，2026-09-19 实测丢了 30 条
 * `chain` 字段，而 CI 不会报错（文件仍然是合法的）。
 *
 * 所以规则只有一条，且必须机械执行：
 *   · 手写词条（deep-content，sync-catalog 不碰它）→ 字段写在 .mdx 的 frontmatter 里；
 *   · 目录词条（由计划表生成）→ 字段写在 catalog-term-details.yml 里，由生成器写进文件。
 * 每条词条只有一个权威位置，不会出现两处互相覆盖。
 *
 * 现在装 chain / chainRole，后续 I3 的 boundaries / minAction 同样会落到这里。
 */
export const catalogTermDetailsSchema = z.record(
  stableIdSchema,
  termSchema.pick({ chain: true, chainRole: true, boundaries: true, minAction: true }).strict(),
);
export type CatalogTermDetails = z.infer<typeof catalogTermDetailsSchema>;

export async function loadCatalogTermDetails(root = process.cwd()): Promise<CatalogTermDetails> {
  const filePath = path.join(root, 'src/data/catalog-term-details.yml');
  const source = await readFile(filePath, 'utf8').catch(() => '');
  if (source.trim() === '') return {};
  return catalogTermDetailsSchema.parse(parseYaml(source));
}

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
    // 这里刻意**不再**校验两件事：
    //   1. 分组顺序必须与领域顺序一一对应；
    //   2. 每个分组恰好 25 条 candidates（曾经的「每域 25 条」配额约束）。
    //
    // 原因：catalog-plan.yml 是首批 325 条内容的生产档案——排期（batch）、
    // 人工评分、命名仲裁（mergeReviews）的历史记录。它不是当前内容结构的约束：
    // 领域可以按知识结构增删，每域词条数也不再由配额决定。
    // 计划表自身的引用正确性仍然保留（引用的领域必须存在、分组不得重复）。
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

  // 同理不再要求「每个领域都必须出现在计划表里」：新增领域不需要回填历史计划表。

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

  // 这里刻意**不再**要求「每个已存在的词条都必须在计划表里登记」。
  //
  // 原先的三条规则（CATALOG_EXISTING_TERM_MISSING / _DRIFT /
  // CATALOG_UNSCHEDULED_TERM_PUBLISHED）合起来构成一道登记制度：
  // 任何新词条都必须先写进 catalog-plan.yml 才能通过构建。
  // 那是首批 325 条的生产流程要求，不是内容结构的要求。
  // 解耦之后：词条是当前内容的唯一事实源，计划表是历史档案，
  // 两者不必再逐条对齐；新词条只受内容质量门禁管辖。
  // 命名唯一性仍由 validation.ts 的 validateLookupKeys 全库兜底，能力没有丢失。

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

  // 同样不再要求「已存在词条的别名都必须在 mergeReviews 里登记」：
  // 那是首批内容的命名仲裁记录，新词条的别名由 validateLookupKeys 全库查重即可。

  return diagnostics;
}

export function validatePublishedCatalogSummaries(
  catalog: CatalogPlan,
  summaries: CatalogSummaries,
): CatalogDiagnostic[] {
  const diagnostics: CatalogDiagnostic[] = [];
  const publishedIds = new Set(
    flattenCatalogCandidates(catalog)
      .filter((candidate) => PUBLISHED_CATALOG_BATCHES.includes(candidate.batch as 'B' | 'C' | 'D'))
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
