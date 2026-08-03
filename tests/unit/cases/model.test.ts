import { describe, expect, it } from 'vitest';

import { LEARNING_MODULES } from '../../../src/data/learning';
import { loadCaseStudies } from '../../../src/lib/cases/io';
import { buildCaseNavigation, buildCaseRegistry } from '../../../src/lib/cases/generate';
import { CASE_STAGE_IDS } from '../../../src/lib/cases/schema';
import { validateCaseStudies } from '../../../src/lib/cases/validation';
import { loadProjectContent } from '../../../src/lib/content/io';

async function loadFixture() {
  const [cases, project] = await Promise.all([loadCaseStudies(), loadProjectContent()]);
  return { cases, project };
}

describe('stage 12B case content model', () => {
  it('validates the golden case and keeps its stages aligned with the learning spine', async () => {
    const { cases, project } = await loadFixture();

    expect(validateCaseStudies(cases, project)).toEqual([]);
    expect(cases).toHaveLength(1);
    expect(cases[0]?.data.gates).toHaveLength(6);
    expect(CASE_STAGE_IDS).toEqual(LEARNING_MODULES.map(({ id }) => id));
  });

  it('builds deterministic registry and continuous static navigation', async () => {
    const { cases } = await loadFixture();
    const registry = buildCaseRegistry(cases);
    const navigation = buildCaseNavigation(cases);

    expect(buildCaseRegistry(cases)).toEqual(registry);
    expect(buildCaseNavigation(cases)).toEqual(navigation);
    expect(registry.cases[0]).toMatchObject({
      id: 'user-feedback-analysis',
      gateCount: 6,
      artifactCount: 6,
      status: 'draft',
    });
    expect(navigation.cases[0]?.gates[0]).toMatchObject({
      id: 'decide-ai-boundary',
      previousGateId: undefined,
      nextGateId: 'establish-value-and-data',
    });
    expect(navigation.cases[0]?.gates.at(-1)).toMatchObject({
      id: 'govern-launch-and-iteration',
      previousGateId: 'define-evaluation-and-cost',
      nextGateId: undefined,
    });
  });

  it('rejects an invalid knowledge reference', async () => {
    const { cases, project } = await loadFixture();
    const invalid = structuredClone(cases);
    invalid[0]!.data.references[0]!.targetId = 'missing-term';

    expect(validateCaseStudies(invalid, project).map(({ code }) => code)).toContain(
      'CASE_REFERENCE_UNKNOWN',
    );
  });

  it('rejects duplicate gates', async () => {
    const { cases, project } = await loadFixture();
    const invalid = structuredClone(cases);
    invalid[0]!.data.gates[1]!.id = invalid[0]!.data.gates[0]!.id;

    expect(validateCaseStudies(invalid, project).map(({ code }) => code)).toContain(
      'CASE_GATE_DUPLICATE_ID',
    );
  });

  it('rejects a gate without a failure mode', async () => {
    const { cases, project } = await loadFixture();
    const invalid = structuredClone(cases);
    invalid[0]!.data.gates[0]!.failureModeIds = [];

    expect(validateCaseStudies(invalid, project).map(({ code }) => code)).toContain(
      'CASE_GATE_FAILURE_REQUIRED',
    );
  });

  it('rejects lifecycle status that overstates case completion', async () => {
    const { cases, project } = await loadFixture();
    const invalid = structuredClone(cases);
    invalid[0]!.data.status = 'verified';

    expect(validateCaseStudies(invalid, project).map(({ code }) => code)).toEqual(
      expect.arrayContaining(['CASE_STATUS_INCONSISTENT', 'CASE_VERIFIED_DATE_REQUIRED']),
    );
  });
});
