import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadCatalogPlan, loadCatalogSummaries } from '../src/lib/content/catalog';
import {
  buildBatchBRelations,
  buildBatchBTerms,
  serializeCatalogRelations,
  serializeCatalogTerm,
} from './lib/catalog-generation';

const root = process.cwd();
const [catalog, summaries] = await Promise.all([loadCatalogPlan(root), loadCatalogSummaries(root)]);
const stale: string[] = [];

for (const { candidate, data } of buildBatchBTerms(catalog, summaries)) {
  const relativePath = `src/content/terms/${candidate.domain}/${candidate.id}.mdx`;
  try {
    const actual = await readFile(path.join(root, relativePath), 'utf8');
    if (actual !== serializeCatalogTerm(data)) stale.push(relativePath);
  } catch {
    stale.push(relativePath);
  }
}

const relationsPath = 'src/data/catalog-relations.yml';
try {
  const actual = await readFile(path.join(root, relationsPath), 'utf8');
  const expected = serializeCatalogRelations(buildBatchBRelations(catalog, summaries));
  if (actual !== expected) stale.push(relationsPath);
} catch {
  stale.push(relationsPath);
}

if (stale.length > 0) {
  throw new Error(
    `Catalog output is missing or stale: ${stale.join(', ')}. Run pnpm sync:catalog.`,
  );
}

console.log('Generated batch B catalog terms and relations are current.');
