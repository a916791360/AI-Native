import { describe, expect, it } from 'vitest';

import { loadProjectContent } from '../../../src/lib/content/io';
import {
  deepContentTermIds,
  loadContentProductionPlan,
  loadResearchPackets,
  validateContentProduction,
} from '../../../src/lib/content/production';

describe('stage 9 content production', () => {
  it('keeps verified and researched work traceable without activating planned waves', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);

    expect(validateContentProduction(plan, packets, project)).toEqual([]);
    expect(plan.batches[0]).toMatchObject({ id: 'sample-1', kind: 'sample', status: 'verified' });
    expect(plan.batches[1]).toMatchObject({
      id: 'foundation-1',
      kind: 'foundation',
      status: 'verified',
    });
    expect(plan.batches[1]?.terms).toHaveLength(20);
    expect(plan.batches[1]?.waves?.flatMap((wave) => wave.terms)).toEqual(plan.batches[1]?.terms);
    expect(plan.batches[1]?.waves?.map(({ status }) => status)).toEqual([
      'verified',
      'verified',
      'verified',
      'verified',
    ]);
    expect(plan.batches[2]).toMatchObject({
      id: 'collaboration-1',
      kind: 'collaboration',
      status: 'research',
    });
    expect(plan.batches[2]?.terms).toHaveLength(20);
    expect(plan.batches[2]?.waves?.flatMap((wave) => wave.terms)).toEqual(plan.batches[2]?.terms);
    expect(plan.batches[2]?.waves?.map(({ status }) => status)).toEqual([
      'research',
      'planned',
      'planned',
      'planned',
    ]);
    expect(deepContentTermIds(plan).size).toBe(33);
    expect(packets).toHaveLength(33);
  });

  it('enforces the approved collaboration batch size', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);
    const undersized = structuredClone(plan);
    undersized.batches[2]!.terms = undersized.batches[2]!.terms.slice(0, 14);

    expect(validateContentProduction(undersized, packets, project)).toContainEqual(
      expect.objectContaining({ code: 'PRODUCTION_COLLABORATION_SIZE' }),
    );
  });

  it('keeps planned waves outside protection and rejects premature packets', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);
    const plannedCopy = structuredClone(plan);
    plannedCopy.batches[1]!.status = 'research';
    plannedCopy.batches[1]!.waves![3]!.status = 'planned';

    expect(deepContentTermIds(plannedCopy).size).toBe(28);
    expect(
      validateContentProduction(plannedCopy, packets, project).filter(
        ({ code }) => code === 'PRODUCTION_PACKET_PREMATURE',
      ),
    ).toHaveLength(5);
  });

  it('keeps term and packet states aligned with an active wave', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);
    const researchPlan = structuredClone(plan);
    researchPlan.batches[1]!.status = 'research';
    researchPlan.batches[1]!.waves![0]!.status = 'research';
    const diagnostics = validateContentProduction(researchPlan, packets, project);

    expect(diagnostics.filter(({ code }) => code === 'PRODUCTION_TERM_STATUS')).toHaveLength(5);
    expect(diagnostics.filter(({ code }) => code === 'PRODUCTION_PACKET_STATUS')).toHaveLength(5);
  });
});
