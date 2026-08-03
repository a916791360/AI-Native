import type {
  CaseArtifact,
  CaseFailureMode,
  CaseGate,
  CaseMetric,
  CaseReference,
  CaseStudy,
} from './schema';

export const ASSESSMENT_LABELS = {
  recommended: '推荐路径',
  conditional: '有条件成立',
  risky: '风险较高',
} as const;

export const CLAIM_KIND_LABELS = {
  fact: '事实',
  assumption: '假设',
  unknown: '未知项',
  recommendation: '建议',
} as const;

export const EVIDENCE_LABELS = {
  E0: '尚无外部证据',
  E1: '案例内建议',
  E2: '产品方法基线',
  E3: '外部来源支持',
} as const;

export const CASE_STATUS_LABELS = {
  planned: '计划中',
  draft: '内容草稿',
  verified: '已核验',
  'needs-review': '待复核',
} as const;

export const CASE_STAGE_LABELS = {
  'model-boundaries': '是否使用 AI',
  'opportunity-judgment': '业务价值与数据条件',
  'solution-choice': '任务拆解与方案选择',
  'product-experience': '人机协作与失败恢复',
  'quality-constraints': '评测、成本与上线治理',
  capstone: '完整项目与持续迭代',
} as const;

export interface GateResources {
  artifacts: CaseArtifact[];
  metrics: CaseMetric[];
  failureModes: CaseFailureMode[];
  references: CaseReference[];
}

function pickByIds<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

export function caseHref(caseId: string): string {
  return `/learn/cases/${caseId}/`;
}

export function gateHref(caseId: string, gateId: string): string {
  return `${caseHref(caseId)}${gateId}/`;
}

export function referenceHref(reference: CaseReference): string {
  if (reference.kind === 'term' && reference.targetId) return `/terms/${reference.targetId}/`;
  if (reference.kind === 'route' && reference.targetId) return `/routes/${reference.targetId}/`;
  return reference.url ?? caseHref('user-feedback-analysis');
}

export function resolveGateResources(caseStudy: CaseStudy, gate: CaseGate): GateResources {
  return {
    artifacts: pickByIds(caseStudy.artifacts, gate.artifactIds),
    metrics: pickByIds(caseStudy.metrics, gate.metricIds),
    failureModes: pickByIds(caseStudy.failureModes, gate.failureModeIds),
    references: pickByIds(caseStudy.references, gate.referenceIds),
  };
}

export function getGateContext(caseStudy: CaseStudy, gateId: string) {
  const index = caseStudy.gates.findIndex((gate) => gate.id === gateId);
  if (index < 0) return undefined;
  const gate = caseStudy.gates[index]!;
  return {
    gate,
    index,
    previous: caseStudy.gates[index - 1],
    next: caseStudy.gates[index + 1],
    resources: resolveGateResources(caseStudy, gate),
    accumulatedArtifacts: caseStudy.artifacts.slice(0, index + 1),
  };
}
