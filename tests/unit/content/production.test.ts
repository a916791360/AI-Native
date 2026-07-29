import { describe, expect, it } from 'vitest';

import { loadProjectContent } from '../../../src/lib/content/io';
import {
  deepContentTermIds,
  loadContentProductionPlan,
  loadResearchPackets,
  validateContentProduction,
} from '../../../src/lib/content/production';

describe('stage 9 content production', () => {
  it('keeps the first sample batch within the approved range and fully traceable', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);

    expect(validateContentProduction(plan, packets, project)).toEqual([]);
    expect(plan.batches[0]).toMatchObject({ id: 'sample-1', kind: 'sample', status: 'verified' });
    expect(deepContentTermIds(plan).size).toBe(8);
    expect(packets).toHaveLength(8);
  });
});
