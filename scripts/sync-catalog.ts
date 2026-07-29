import { mkdir, writeFile } from 'node:fs/promises';
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
const terms = buildBatchBTerms(catalog, summaries);

for (const { candidate, data } of terms) {
  const directory = path.join(root, 'src/content/terms', candidate.domain);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${candidate.id}.mdx`), serializeCatalogTerm(data), 'utf8');
}

const relations = buildBatchBRelations(catalog, summaries);
await writeFile(
  path.join(root, 'src/data/catalog-relations.yml'),
  serializeCatalogRelations(relations),
  'utf8',
);

console.log(`Synced ${terms.length} batch B terms and ${relations.length} catalog relations.`);
