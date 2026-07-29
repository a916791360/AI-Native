import { describe, expect, it } from 'vitest';

import {
  countCatalogBatches,
  loadCatalogPlan,
  loadCatalogSummaries,
  validateBatchBSummaries,
  validateCatalogPlan,
} from '../../../src/lib/content/catalog';
import { loadProjectContent } from '../../../src/lib/content/io';

describe('stage 8 catalog plan', () => {
  it('keeps 300 canonical candidates aligned with the current vertical slice', async () => {
    const [catalog, project] = await Promise.all([loadCatalogPlan(), loadProjectContent()]);

    expect(validateCatalogPlan(catalog, project)).toEqual([]);
    expect(countCatalogBatches(catalog)).toEqual({ A: 12, B: 108, C: 120, D: 60 });
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

  it('provides one editorial summary for every batch B term', async () => {
    const [catalog, summaries] = await Promise.all([loadCatalogPlan(), loadCatalogSummaries()]);

    expect(validateBatchBSummaries(catalog, summaries)).toEqual([]);
    expect(Object.keys(summaries)).toHaveLength(108);
  });

  it('publishes batch B as connected catalogue entries', async () => {
    const project = await loadProjectContent();
    const catalogued = project.terms.filter(({ data }) => data.status === 'catalogued');
    const connected = new Set(
      project.relations.flatMap((relation) => [relation.source, relation.target]),
    );

    expect(project.terms).toHaveLength(120);
    expect(catalogued).toHaveLength(108);
    expect(catalogued.every(({ data }) => connected.has(data.id))).toBe(true);
  });
});
