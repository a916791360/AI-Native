import { describe, expect, it } from 'vitest';

import { loadProjectContent } from '../../../src/lib/content/io';
import {
  deepContentTermIds,
  loadContentProductionPlan,
  loadResearchPackets,
  validateContentProduction,
} from '../../../src/lib/content/production';

describe('stage 9 content production', () => {
  it('keeps verified work traceable without treating planned terms as deep content', async () => {
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
      status: 'planned',
    });
    expect(plan.batches[1]?.terms).toHaveLength(20);
    expect(plan.batches[1]?.waves?.flatMap((wave) => wave.terms)).toEqual(plan.batches[1]?.terms);
    expect(deepContentTermIds(plan).size).toBe(8);
    expect(packets).toHaveLength(8);
  });

  it('activates deep-content protection and packet requirements at research status', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);
    const activePlan = structuredClone(plan);
    activePlan.batches[1]!.status = 'research';

    expect(deepContentTermIds(activePlan).size).toBe(28);
    expect(
      validateContentProduction(activePlan, packets, project).filter(
        ({ code }) => code === 'PRODUCTION_PACKET_MISSING',
      ),
    ).toHaveLength(20);
  });
});
