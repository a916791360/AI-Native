import {
  countCatalogBatches,
  loadCatalogPlan,
  loadCatalogSummaries,
  validatePublishedCatalogSummaries,
  validateCatalogPlan,
} from '../src/lib/content/catalog';
import { loadValidatedProjectContent } from './lib/project';

const [catalog, summaries, project] = await Promise.all([
  loadCatalogPlan(),
  loadCatalogSummaries(),
  loadValidatedProjectContent(),
]);
const diagnostics = [
  ...validateCatalogPlan(catalog, project),
  ...validatePublishedCatalogSummaries(catalog, summaries),
];

if (diagnostics.length > 0) {
  throw new Error(
    diagnostics
      .map((item) => `[${item.code}] src/data/catalog-plan.yml#${item.fieldPath}: ${item.message}`)
      .join('\n'),
  );
}

const counts = countCatalogBatches(catalog);
console.log(
  `Catalog plan valid: ${catalog.targetCount} candidates across ${catalog.groups.length} domains; batches A/B/C/D = ${counts.A}/${counts.B}/${counts.C}/${counts.D}.`,
);
