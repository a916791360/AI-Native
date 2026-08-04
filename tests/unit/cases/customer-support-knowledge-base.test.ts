import { describe, expect, it } from 'vitest';

import { loadCaseStudies } from '../../../src/lib/cases/io';

async function loadSupportCase() {
  const cases = await loadCaseStudies();
  return cases.find(({ data }) => data.id === 'customer-support-knowledge-base')!.data;
}

describe('stage 14 customer support knowledge-base case', () => {
  it('keeps the verified lifecycle and six-stage contract explicit', async () => {
    const caseStudy = await loadSupportCase();

    expect(caseStudy.status).toBe('verified');
    expect(caseStudy.verifiedAt).toBe('2026-08-04');
    expect(caseStudy.gates).toHaveLength(6);
    expect(caseStudy.gates.every(({ status }) => status === 'verified')).toBe(true);
    expect(caseStudy.gates.every(({ options }) => options.length === 3)).toBe(true);
    expect(caseStudy.artifacts).toHaveLength(6);
  });

  it('maps every external source into at least one gate without inventing thresholds', async () => {
    const caseStudy = await loadSupportCase();
    const sourceReferences = caseStudy.references.filter(({ kind }) => kind === 'source');
    const referencedIds = new Set(caseStudy.gates.flatMap(({ referenceIds }) => referenceIds));

    expect(sourceReferences).toHaveLength(5);
    for (const source of sourceReferences) {
      expect(source.accessedAt).toBe('2026-08-04');
      expect(source.supports.length).toBeGreaterThan(20);
      expect(referencedIds).toContain(source.id);
    }

    const externallySupportedGates = caseStudy.gates.filter(({ facts }) =>
      facts.some(({ evidence }) => evidence === 'E3'),
    );
    for (const gate of externallySupportedGates) {
      expect(
        gate.referenceIds.some((id) => sourceReferences.some((source) => source.id === id)),
      ).toBe(true);
    }

    expect(
      caseStudy.metrics
        .filter(({ thresholdStatus }) => thresholdStatus === 'defined')
        .map(({ id }) => id),
    ).toEqual(['permission-violation-count']);
    expect(
      caseStudy.metrics
        .filter(({ thresholdStatus }) => thresholdStatus === 'baseline-needed')
        .every(({ threshold }) => threshold === undefined),
    ).toBe(true);
  });

  it('keeps organization-specific unknowns at E0 and gives every gate a recovery path', async () => {
    const caseStudy = await loadSupportCase();

    expect(caseStudy.baseline.filter(({ kind }) => kind === 'unknown')).toEqual(
      expect.arrayContaining([expect.objectContaining({ evidence: 'E0' })]),
    );
    for (const gate of caseStudy.gates) {
      expect(
        gate.unknowns.every(({ kind, evidence }) => kind === 'unknown' && evidence === 'E0'),
      ).toBe(true);
      expect(gate.failureModeIds.length).toBeGreaterThan(0);
    }
  });
});
