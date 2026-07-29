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
    order: z.number().int().min(1).max(12),
    nameZh: z.string().min(2),
    nameEn: z.string().min(2),
    shortNameZh: z.string().min(2),
    description: z.string().min(10).max(100),
    ring: z.enum(['core', 'extended']),
  })
  .strict();

export const domainsSchema = z.array(domainSchema).length(12);

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
export type Term = z.infer<typeof termSchema>;
export type Route = z.infer<typeof routeSchema>;
export type Relation = z.infer<typeof relationSchema>;
