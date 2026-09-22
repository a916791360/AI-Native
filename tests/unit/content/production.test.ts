import { describe, expect, it } from 'vitest';

import { loadProjectContent } from '../../../src/lib/content/io';
import {
  deepContentTermIds,
  loadContentProductionPlan,
  loadResearchPackets,
  validateContentProduction,
} from '../../../src/lib/content/production';

describe('stage 9 content production', () => {
  it('keeps completed content work traceable across all approved waves', async () => {
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
      status: 'verified',
    });
    expect(plan.batches[2]?.terms).toHaveLength(20);
    expect(plan.batches[2]?.waves?.flatMap((wave) => wave.terms)).toEqual(plan.batches[2]?.terms);
    expect(plan.batches[2]?.waves?.map(({ status }) => status)).toEqual([
      'verified',
      'verified',
      'verified',
      'verified',
    ]);
    expect(plan.batches[3]).toMatchObject({
      id: 'product-1',
      kind: 'product',
      status: 'verified',
    });
    expect(plan.batches[3]?.terms).toHaveLength(20);
    expect(plan.batches[3]?.waves?.flatMap((wave) => wave.terms)).toEqual(plan.batches[3]?.terms);
    expect(plan.batches[3]?.waves?.map(({ status }) => status)).toEqual([
      'verified',
      'verified',
      'verified',
      'verified',
    ]);
    expect(deepContentTermIds(plan).size).toBe(93);
    expect(packets).toHaveLength(93);
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

  it('enforces the approved product batch size', async () => {
    const [plan, packets, project] = await Promise.all([
      loadContentProductionPlan(),
      loadResearchPackets(),
      loadProjectContent(),
    ]);
    const undersized = structuredClone(plan);
    undersized.batches[3]!.terms = undersized.batches[3]!.terms.slice(0, 19);

    expect(validateContentProduction(undersized, packets, project)).toContainEqual(
      expect.objectContaining({ code: 'PRODUCTION_PRODUCT_SIZE' }),
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

    expect(deepContentTermIds(plannedCopy).size).toBe(88);
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

    // I6-03：deprecated 是词条的合法终态，与生产进度是两件事，因此不再比对
    // （一条内容做完的深度词条完全可以被判为不再单独成页）。
    // 期望值从数据算出来，而不是写死 5——写死的话，下一次有人废弃这条 wave 里的
    // 词条就会得到一个「测试失败」而不是「口径已变」的信号。
    const wave = researchPlan.batches[1]!.waves![0]!;
    const deprecated = new Set(
      project.terms.filter(({ data }) => data.status === 'deprecated').map(({ data }) => data.id),
    );
    const expected = wave.terms.filter((id) => !deprecated.has(id)).length;
    expect(expected).toBeGreaterThan(0);

    expect(diagnostics.filter(({ code }) => code === 'PRODUCTION_TERM_STATUS')).toHaveLength(
      expected,
    );
    expect(diagnostics.filter(({ code }) => code === 'PRODUCTION_PACKET_STATUS')).toHaveLength(5);
  });
});
