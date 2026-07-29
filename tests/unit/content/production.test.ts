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
      status: 'research',
    });
    expect(plan.batches[1]?.terms).toHaveLength(20);
    expect(plan.batches[1]?.waves?.flatMap((wave) => wave.terms)).toEqual(plan.batches[1]?.terms);
    expect(plan.batches[1]?.waves?.map(({ status }) => status)).toEqual([
      'research',
      'planned',
      'planned',
      'planned',
    ]);
    expect(deepContentTermIds(plan).size).toBe(13);
    expect(packets).toHaveLength(13);
  });

  it('activates protection and packet requirements one wave at a time', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);
    const activePlan = structuredClone(plan);
    activePlan.batches[1]!.waves![1]!.status = 'research';

    expect(deepContentTermIds(activePlan).size).toBe(18);
    expect(
      validateContentProduction(activePlan, packets, project).filter(
        ({ code }) => code === 'PRODUCTION_PACKET_MISSING',
      ),
    ).toHaveLength(5);
  });
});
