import { describe, expect, it } from 'vitest';

import {
  countCatalogBatches,
  loadCatalogPlan,
  loadCatalogSummaries,
  validatePublishedCatalogSummaries,
  validateCatalogPlan,
} from '../../../src/lib/content/catalog';
import { loadProjectContent } from '../../../src/lib/content/io';
import { isSelectableTerm } from '../../../src/lib/content/visibility';

describe('stage 8 catalog plan', () => {
  it('keeps 300 canonical candidates aligned with the current vertical slice', async () => {
    const [catalog, project] = await Promise.all([loadCatalogPlan(), loadProjectContent()]);

    expect(validateCatalogPlan(catalog, project)).toEqual([]);
    expect(countCatalogBatches(catalog)).toEqual({ A: 12, B: 108, C: 120, D: 85 });
    expect(catalog.groups.every((group) => group.terms.length === 25)).toBe(true);
  });

  it('rejects a merge variant assigned to two canonical terms', async () => {
    const [catalog, project] = await Promise.all([loadCatalogPlan(), loadProjectContent()]);
    const copy = structuredClone(catalog);
    copy.mergeReviews[1]!.variants.push(copy.mergeReviews[0]!.variants[0]!);

    expect(validateCatalogPlan(copy, project).map((item) => item.code)).toContain(
      'CATALOG_VARIANT_DUPLICATE',
    );
  });

  it('provides one editorial summary for every published catalog term', async () => {
    const [catalog, summaries] = await Promise.all([loadCatalogPlan(), loadCatalogSummaries()]);

    expect(validatePublishedCatalogSummaries(catalog, summaries)).toEqual([]);
    expect(Object.keys(summaries)).toHaveLength(313);
  });

  it('publishes batches B, C and D as catalogue entries and keeps C 档 out of the entry set', async () => {
    const project = await loadProjectContent();
    const catalogued = project.terms.filter(({ data }) => data.status === 'catalogued');
    const drafts = project.terms.filter(({ data }) => data.status === 'draft');
    const verified = project.terms.filter(({ data }) => data.status === 'verified');
    const deprecated = project.terms.filter(({ data }) => data.status === 'deprecated');
    const selectableIds = new Set(
      project.terms.filter(({ data }) => isSelectableTerm(data)).map(({ data }) => data.id),
    );

    expect(project.terms).toHaveLength(327);
    expect(catalogued).toHaveLength(0);
    expect(drafts).toHaveLength(0);
    // I6-03：C 档 150 条合并降级，剩下的 177 条才是可独立选择的入口。
    expect(verified).toHaveLength(177);
    expect(deprecated).toHaveLength(150);

    // 「不再单独成页」的判据不是数字，而是这两条：每条废弃词条都写明了去向，
    // 且去向必须是另一条**仍然作为入口存在**的词条——否则旧链接只是从一个
    // 死胡同被送到另一个死胡同。
    for (const { data } of deprecated) {
      expect(data.deprecationReason, `${data.id} 缺 deprecationReason`).toBeTruthy();
      expect(selectableIds.has(data.replacedBy ?? ''), `${data.id} → ${data.replacedBy}`).toBe(
        true,
      );
    }
  });
});
