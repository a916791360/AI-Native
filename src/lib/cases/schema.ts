import { z } from 'astro/zod';

import { stableIdSchema } from '../content/schema';

export const CASE_STAGE_IDS = [
  'model-boundaries',
  'opportunity-judgment',
  'solution-choice',
  'product-experience',
  'quality-constraints',
  'capstone',
] as const;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must use YYYY-MM-DD');

const dateSchema = z.union([
  dateStringSchema,
  z.date().transform((value) => value.toISOString().slice(0, 10)),
]);

const claimSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(['fact', 'assumption', 'unknown', 'recommendation']),
    evidence: z.enum(['E0', 'E1', 'E2', 'E3']),
    statement: z.string().min(10),
  })
  .strict();

const optionSchema = z
  .object({
    id: stableIdSchema,
    label: z.string().min(4),
    assessment: z.enum(['recommended', 'conditional', 'risky']),
    rationale: z.string().min(10),
    conditions: z.array(z.string().min(4)).min(1),
    risks: z.array(z.string().min(4)).min(1),
    consequences: z.array(z.string().min(4)).min(1),
    artifactDelta: z.string().min(10),
  })
  .strict();

const gateSchema = z
  .object({
    id: stableIdSchema,
    order: z.number().int().min(1).max(6),
    stageId: z.enum(CASE_STAGE_IDS),
    status: z.enum(['planned', 'draft', 'verified', 'needs-review']),
    title: z.string().min(4),
    question: z.string().min(8),
    decision: z.string().min(10),
    facts: z.array(claimSchema).min(2),
    unknowns: z.array(claimSchema).min(1),
    options: z.array(optionSchema).min(2),
    artifactIds: z.array(stableIdSchema).min(1),
    metricIds: z.array(stableIdSchema).min(1),
    failureModeIds: z.array(stableIdSchema).min(1),
    referenceIds: z.array(stableIdSchema).min(1),
  })
  .strict();

const artifactSchema = z
  .object({
    id: stableIdSchema,
    type: z.enum([
      'ai-applicability',
      'opportunity-assessment',
      'workflow-selection',
      'responsibility-recovery',
      'evaluation-guardrails',
      'complete-review',
    ]),
    title: z.string().min(4),
    summary: z.string().min(10),
  })
  .strict();

const metricSchema = z
  .object({
    id: stableIdSchema,
    category: z.enum(['business', 'quality', 'operation', 'human', 'cost']),
    label: z.string().min(3),
    definition: z.string().min(10),
    desiredDirection: z.enum(['increase', 'decrease', 'range', 'guardrail']),
    thresholdStatus: z.enum(['baseline-needed', 'defined']),
    threshold: z.string().min(3).optional(),
  })
  .strict();

const failureModeSchema = z
  .object({
    id: stableIdSchema,
    title: z.string().min(3),
    signal: z.string().min(6),
    impact: z.string().min(8),
    recovery: z.string().min(8),
    owner: z.string().min(2),
  })
  .strict();

const referenceSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(['term', 'route', 'source']),
    label: z.string().min(2),
    targetId: stableIdSchema.optional(),
    url: z.url({ protocol: /^https$/ }).optional(),
    publisher: z.string().min(2).optional(),
    accessedAt: dateSchema.optional(),
    stability: z.enum(['stable', 'evolving']).optional(),
    supports: z.string().min(8),
  })
  .strict();

export const caseStudySchema = z
  .object({
    id: stableIdSchema,
    title: z.string().min(4),
    level: z.enum(['focus', 'capstone']),
    domain: z.string().min(2),
    audience: z.array(z.string().min(2)).min(1),
    businessContext: z.string().min(20),
    currentProcess: z.array(z.string().min(4)).min(2),
    objective: z.string().min(15),
    baseline: z.array(claimSchema).min(1),
    constraints: z.array(claimSchema).min(1),
    status: z.enum(['planned', 'draft', 'verified', 'needs-review']),
    updatedAt: dateSchema,
    verifiedAt: dateSchema.optional(),
    gates: z.array(gateSchema).length(6),
    artifacts: z.array(artifactSchema).length(6),
    metrics: z.array(metricSchema).min(1),
    failureModes: z.array(failureModeSchema).min(1),
    references: z.array(referenceSchema).min(1),
  })
  .strict();

export type CaseStudy = z.infer<typeof caseStudySchema>;
export type CaseGate = z.infer<typeof gateSchema>;
export type CaseArtifact = z.infer<typeof artifactSchema>;
export type CaseMetric = z.infer<typeof metricSchema>;
export type CaseFailureMode = z.infer<typeof failureModeSchema>;
export type CaseReference = z.infer<typeof referenceSchema>;
