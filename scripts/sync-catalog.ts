import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadCatalogPlan, loadCatalogSummaries } from '../src/lib/content/catalog';
import { deepContentTermIds, loadContentProductionPlan } from '../src/lib/content/production';
import {
  buildPublishedCatalogRelations,
  buildPublishedCatalogTerms,
  serializeCatalogRelations,
  serializeCatalogTerm,
} from './lib/catalog-generation';

const root = process.cwd();
const [catalog, summaries, production] = await Promise.all([
  loadCatalogPlan(root),
  loadCatalogSummaries(root),
  loadContentProductionPlan(root),
]);
const protectedIds = deepContentTermIds(production);
const terms = buildPublishedCatalogTerms(catalog, summaries).filter(
  ({ candidate }) => !protectedIds.has(candidate.id),
);

for (const { candidate, data } of terms) {
  const directory = path.join(root, 'src/content/terms', candidate.domain);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${candidate.id}.mdx`), serializeCatalogTerm(data), 'utf8');
}

const relations = buildPublishedCatalogRelations(catalog, summaries);
await writeFile(
  path.join(root, 'src/data/catalog-relations.yml'),
  serializeCatalogRelations(relations),
  'utf8',
);

console.log(
  `Synced ${terms.length} generated catalog terms, protected ${protectedIds.size} deep-content terms, and wrote ${relations.length} relations.`,
);
