import { describe, expect, it } from 'vitest';

import { loadCaseStudies } from '../../../src/lib/cases/io';

describe('all six verified case studies contract', () => {
  it('enforces verified lifecycle and gate consistency across all 6 cases', async () => {
    const cases = await loadCaseStudies();
    expect(cases).toHaveLength(6);

    for (const { data: caseStudy } of cases) {
      expect(caseStudy.status).toBe('verified');
      expect(caseStudy.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(caseStudy.gates).toHaveLength(6);
      expect(caseStudy.gates.every(({ status }) => status === 'verified')).toBe(true);
      expect(caseStudy.gates.every(({ options }) => options.length >= 2)).toBe(true);
      expect(
        caseStudy.gates.every(
          ({ options }) => options.filter((o) => o.assessment === 'recommended').length === 1,
        ),
      ).toBe(true);
      expect(caseStudy.artifacts).toHaveLength(6);
      expect(caseStudy.failureModes.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('guarantees external source coverage and E3 evidence backing for every case', async () => {
    const cases = await loadCaseStudies();

    for (const { data: caseStudy } of cases) {
      const sourceReferences = caseStudy.references.filter(({ kind }) => kind === 'source');
      const referencedIds = new Set(caseStudy.gates.flatMap(({ referenceIds }) => referenceIds));

      expect(sourceReferences.length).toBeGreaterThanOrEqual(3);
      for (const source of sourceReferences) {
        expect(source.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(source.supports.length).toBeGreaterThan(15);
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
          .filter(({ thresholdStatus }) => thresholdStatus === 'baseline-needed')
          .every(({ threshold }) => threshold === undefined),
      ).toBe(true);
    }
  });

  it('keeps organization-specific unknowns at E0 with recoverable failure paths', async () => {
    const cases = await loadCaseStudies();

    for (const { data: caseStudy } of cases) {
      expect(caseStudy.baseline.filter(({ kind }) => kind === 'unknown')).toEqual(
        expect.arrayContaining([expect.objectContaining({ evidence: 'E0' })]),
      );
      for (const gate of caseStudy.gates) {
        expect(
          gate.unknowns.every(({ kind, evidence }) => kind === 'unknown' && evidence === 'E0'),
        ).toBe(true);
        expect(gate.failureModeIds.length).toBeGreaterThan(0);
      }
    }
  });
});
