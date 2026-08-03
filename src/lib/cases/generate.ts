import type { CaseStudyDocument } from './io';

function byCaseId(left: CaseStudyDocument, right: CaseStudyDocument): number {
  return left.data.id.localeCompare(right.data.id, 'en');
}

export function buildCaseRegistry(documents: CaseStudyDocument[]) {
  return {
    version: 1,
    cases: [...documents].sort(byCaseId).map(({ data }) => ({
      id: data.id,
      url: `/learn/cases/${data.id}/`,
      title: data.title,
      level: data.level,
      domain: data.domain,
      audience: data.audience,
      objective: data.objective,
      status: data.status,
      updatedAt: data.updatedAt,
      gateCount: data.gates.length,
      artifactCount: data.artifacts.length,
      metricCount: data.metrics.length,
      failureModeCount: data.failureModes.length,
      stageIds: data.gates.map(({ stageId }) => stageId),
    })),
  };
}

export function buildCaseNavigation(documents: CaseStudyDocument[]) {
  return {
    version: 1,
    cases: [...documents].sort(byCaseId).map(({ data }) => ({
      caseId: data.id,
      caseUrl: `/learn/cases/${data.id}/`,
      firstGateId: data.gates[0]?.id,
      lastGateId: data.gates.at(-1)?.id,
      gates: data.gates.map((gate, index) => ({
        id: gate.id,
        order: gate.order,
        stageId: gate.stageId,
        title: gate.title,
        status: gate.status,
        url: `/learn/cases/${data.id}/${gate.id}/`,
        previousGateId: data.gates[index - 1]?.id,
        nextGateId: data.gates[index + 1]?.id,
        artifactIds: gate.artifactIds,
      })),
    })),
  };
}
