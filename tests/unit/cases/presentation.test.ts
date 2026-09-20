import { describe, expect, it } from 'vitest';

import { loadCaseStudies } from '../../../src/lib/cases/io';
import {
  caseHref,
  gateHref,
  getGateContext,
  referenceHref,
  resolveGateResources,
} from '../../../src/lib/cases/presentation';

async function loadGoldenCase() {
  const cases = await loadCaseStudies();
  return cases.find(({ data }) => data.id === 'user-feedback-analysis')!.data;
}

describe('stage 13 case presentation model', () => {
  it('derives deterministic case and gate routes', () => {
    expect(caseHref('user-feedback-analysis')).toBe('/learn/cases/user-feedback-analysis/');
    expect(gateHref('user-feedback-analysis', 'decide-ai-boundary')).toBe(
      '/learn/cases/user-feedback-analysis/decide-ai-boundary/',
    );
  });

  it('resolves each gate resource in YAML order', async () => {
    const data = await loadGoldenCase();
    const gate = data.gates[4]!;
    const resources = resolveGateResources(data, gate);

    expect(resources.artifacts.map(({ id }) => id)).toEqual(['evaluation-guardrails']);
    expect(resources.metrics.map(({ id }) => id)).toEqual(gate.metricIds);
    expect(resources.failureModes.map(({ id }) => id)).toEqual(gate.failureModeIds);
    expect(resources.references.map(({ id }) => id)).toEqual(gate.referenceIds);
  });

  it('provides continuous navigation and accumulated materials', async () => {
    const data = await loadGoldenCase();
    const context = getGateContext(data, 'design-control-and-recovery');

    expect(context?.previous?.id).toBe('select-workflow');
    expect(context?.next?.id).toBe('define-evaluation-and-cost');
    expect(context?.accumulatedArtifacts.map(({ id }) => id)).toEqual([
      'ai-applicability-card',
      'opportunity-assessment',
      'workflow-selection',
      'responsibility-recovery',
    ]);
  });

  it('maps knowledge and source references to public destinations', async () => {
    const data = await loadGoldenCase();
    const term = data.references.find(({ kind }) => kind === 'term')!;
    const route = data.references.find(({ kind }) => kind === 'route')!;
    const source = data.references.find(({ kind }) => kind === 'source')!;

    expect(referenceHref(term)).toBe(`/terms/${term.targetId}/`);
    expect(referenceHref(route)).toBe(`/routes/${route.targetId}/`);
    expect(referenceHref(source)).toBe(source.url);
  });

  it('keeps every term-* gate resource linked back to a term page', async () => {
    const data = await loadGoldenCase();
    const termReferences = new Map(
      data.references
        .filter(({ kind }) => kind === 'term')
        .map((reference) => [reference.id, reference]),
    );
    const termReferenceIds = data.gates.flatMap(({ referenceIds }) =>
      referenceIds.filter((referenceId) => referenceId.startsWith('term-')),
    );

    expect(termReferenceIds.length).toBeGreaterThan(0);
    for (const referenceId of termReferenceIds) {
      const reference = termReferences.get(referenceId);
      expect(reference).toBeDefined();
      expect(referenceHref(reference!)).toBe(`/terms/${reference?.targetId}/`);
    }
  });
});
