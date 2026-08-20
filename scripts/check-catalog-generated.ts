import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadCatalogPlan, loadCatalogSummaries } from '../src/lib/content/catalog';
import { deepContentTermIds, loadContentProductionPlan } from '../src/lib/content/production';
import { loadValidatedProjectContent } from './lib/project';
import {
  buildPublishedCatalogRelations,
  buildPublishedCatalogTerms,
  serializeCatalogRelations,
  serializeCatalogTerm,
} from './lib/catalog-generation';

const root = process.cwd();
const [catalog, summaries, production, project] = await Promise.all([
  loadCatalogPlan(root),
  loadCatalogSummaries(root),
  loadContentProductionPlan(root),
  loadValidatedProjectContent(root),
]);
const protectedIds = deepContentTermIds(production);
const stale: string[] = [];

for (const { candidate, ...document } of buildPublishedCatalogTerms(catalog, summaries, project)) {
  if (protectedIds.has(candidate.id)) continue;
  const relativePath = `src/content/terms/${candidate.domain}/${candidate.id}.mdx`;
  try {
    const actual = await readFile(path.join(root, relativePath), 'utf8');
    if (actual !== serializeCatalogTerm({ candidate, ...document })) stale.push(relativePath);
  } catch {
    stale.push(relativePath);
  }
}

const relationsPath = 'src/data/catalog-relations.yml';
try {
  const actual = await readFile(path.join(root, relationsPath), 'utf8');
  const expected = serializeCatalogRelations(buildPublishedCatalogRelations(catalog));
  if (actual !== expected) stale.push(relationsPath);
} catch {
  stale.push(relationsPath);
}

if (stale.length > 0) {
  throw new Error(
    `Catalog output is missing or stale: ${stale.join(', ')}. Run pnpm sync:catalog.`,
  );
}

console.log('Generated published catalog terms and relations are current.');
