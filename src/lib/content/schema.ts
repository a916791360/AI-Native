import { z } from 'astro/zod';

export const stableIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase ASCII kebab-case');

function isValidCalendarDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must use YYYY-MM-DD')
  .refine(isValidCalendarDate, 'must be a valid calendar date');

export const domainSchema = z
  .object({
    id: stableIdSchema,
    // 原为 .max(13)：领域总数曾被硬编码为 13，领域序号上限也照着 13 写死。
    // 配额取消后（见下方 domainsSchema），领域可以按知识结构增删，序号上限放宽。
    order: z.number().int().min(1).max(30),
    nameZh: z.string().min(2),
    nameEn: z.string().min(2),
    shortNameZh: z.string().min(2),
    description: z.string().min(10).max(100),
    ring: z.enum(['core', 'extended']),
  })
  .strict();

/**
 * 领域（学科分类）：
 *
 * 这里曾经是 `.length(13)` —— 一个把「内容量」写死进结构的配额。
 * 13 个领域 × 每域 25 条 = 325 条，词条数量由配额倒推而非知识需求决定，
 * 直接后果是同一概念被拆成多条（retrieval / context-retrieval /
 * retrieval-query / retrieval-augmented-generation 并存）。
 *
 * 现在只约束「有多少个领域」这个量级，不约束「必须恰好几个」。
 * 新增、合并、拆分领域都不再需要凑数或回头改这里的数字。
 * 领域 id 唯一性由下面的 superRefine 保证。
 *
 * 注意：不要把这条约束与 chain（认知链路）的 `.length(8)` 混为一谈。
 * 8 站是设计决策（这条链路就该有 8 个位置），13 只是曾经的内容配额。
 */
export const domainsSchema = z
  .array(domainSchema)
  .min(8)
  .max(20)
  .superRefine((domains, ctx) => {
    const seen = new Set<string>();
    for (const [index, domain] of domains.entries()) {
      if (seen.has(domain.id)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `duplicate domain id: ${domain.id}`,
        });
      }
      seen.add(domain.id);
    }
  });

/**
 * 认知链路站（第二坐标轴）：把用户从「不知道从哪开始」带到「能自己走了」。
 *
 * 这里的 `.length(8)` 是**故意保留**的，与上面 domainsSchema 删掉的 `.length(13)`
 * 性质完全不同：
 *   · 8 站是设计决策 —— 这条链路就该有 8 个位置，多一个少一个都不成立；
 *   · 13 曾经是内容配额 —— 为了让总数凑够 325 而定的数，本可以多可以少。
 *
 * 后人请勿「顺手统一」把这条也删掉。顺序由 order 表达，必须是 1..8 的连续序列。
 */
export const chainStationSchema = z
  .object({
    id: stableIdSchema,
    order: z.number().int().min(1).max(8),
    nameZh: z.string().min(2),
    question: z.string().min(8),
    goal: z.string().min(10),
    coreTerms: z.array(stableIdSchema).min(3).max(5),
    action: z.string().min(10),
  })
  .strict();

export const chainSchema = z.array(chainStationSchema).length(8);

const aliasSchema = z
  .object({
    value: z.string().min(1),
    language: z.enum(['zh-CN', 'en']),
  })
  .strict();
const sourceSchema = z
  .object({
    id: stableIdSchema,
    type: z.enum([
      'paper',
      'standard',
      'law',
      'official-doc',
      'textbook',
      'course',
      'research-institute',
      'engineering-practice',
      'media',
      'personal',
    ]),
    title: z.string().min(3),
    url: z.url({ protocol: /^https$/ }),
    publisher: z.string().min(2),
    publishedAt: dateSchema.optional(),
    accessedAt: dateSchema,
  })
  .strict();

export const termSchema = z
  .object({
    id: stableIdSchema,
    nameZh: z.string().min(1),
    nameEn: z.string().min(1),
    abbreviations: z.array(z.string().min(1)).default([]),
    aliases: z.array(aliasSchema).default([]),
    summary: z.string().min(10).max(160),
    domain: stableIdSchema,
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    ring: z.enum(['core', 'extended']),
    status: z.enum(['catalogued', 'draft', 'verified', 'needs-review', 'deprecated']),
    priority: z.number().int().min(1).max(5).default(3),
    featured: z.boolean().default(false),
    publishedAt: dateSchema.optional(),
    updatedAt: dateSchema.optional(),
    verifiedAt: dateSchema.optional(),
    sources: z.array(sourceSchema).default([]),

    // ---- 认知链路定位（第二坐标轴）-----------------------------------------
    // 词条同时拥有两个位置：domain 是「它在档案柜的哪一格」（用于查阅），
    // chain 是「它在理解路径的第几站」（用于学习）。
    // 前者服务「我知道要找什么」，后者服务「我不知道要找什么」。
    //
    // 全部声明为 optional：325 条存量不可能同一天填完，
    // 强制必填会让全站立刻构建失败。「A 档词条必须填」由
    // scripts/check-content-quality.ts 按档位执行，不写在 schema 里。
    chain: z.number().int().min(1).max(8).optional(),
    chainRole: z.enum(['intro', 'core', 'advanced']).optional(),

    // ---- 边界声明 ----------------------------------------------------------
    // 回答「它解决什么、不解决什么、和最容易混淆的邻居差在哪」，
    // 而不只是「它是什么」。confusions[].with 用 stableIdSchema 而不是自由文本：
    // 这样「MCP vs Function Calling」是一条可校验的引用，
    // 能被门禁检查，也能自动渲染成对比链接。
    boundaries: z
      .object({
        solves: z.string().min(10),
        notSolves: z.string().min(10),
        confusions: z
          .array(
            z.object({
              with: stableIdSchema,
              difference: z.string().min(10),
            }),
          )
          .min(1)
          .max(3),
      })
      .strict()
      .optional(),

    // ---- 上手动作 ----------------------------------------------------------
    // 把「亲自试一下」从散文变成结构化字段，门禁才好判断它是不是空动作。
    minAction: z.string().min(10).optional(),

    deprecationReason: z.string().min(10).optional(),
    replacedBy: stableIdSchema.optional(),
  })
  .strict();

const routeTermSchema = z
  .object({
    id: stableIdSchema,
    reviewReason: z.string().min(10).optional(),
  })
  .strict();

const routeChapterSchema = z
  .object({
    id: stableIdSchema,
    title: z.string().min(2),
    transition: z.string().min(10),
    terms: z.array(routeTermSchema),
  })
  .strict();

const prerequisiteExceptionSchema = z
  .object({
    source: stableIdSchema,
    target: stableIdSchema,
    explanation: z.string().min(10),
  })
  .strict();

export const routeSchema = z
  .object({
    id: stableIdSchema,
    order: z.number().int().min(1).max(5),
    nameZh: z.string().min(2),
    summary: z.string().min(10).max(160),
    audience: z.array(z.string().min(2)).min(1),
    prerequisites: z.array(stableIdSchema).default([]),
    learningGoals: z.array(z.string().min(5)).min(1),
    estimatedTerms: z.number().int().positive(),
    chapters: z.array(routeChapterSchema).min(1),
    outcomes: z.array(z.string().min(5)).min(1),
    prerequisiteExceptions: z.array(prerequisiteExceptionSchema).default([]),
    status: z.enum(['draft', 'published']),
  })
  .strict();

export const relationSchema = z
  .object({
    id: stableIdSchema,
    source: stableIdSchema,
    target: stableIdSchema,
    type: z.enum(['prerequisite', 'component', 'comparison', 'application']),
    explanation: z.string().min(1),
  })
  .strict();

export const relationsSchema = z.array(relationSchema);

export type Domain = z.infer<typeof domainSchema>;
export type ChainStation = z.infer<typeof chainStationSchema>;
export type Term = z.infer<typeof termSchema>;
export type Route = z.infer<typeof routeSchema>;
export type Relation = z.infer<typeof relationSchema>;
