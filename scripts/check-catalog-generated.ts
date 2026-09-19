import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  loadCatalogPlan,
  loadCatalogSummaries,
  loadCatalogTermDetails,
} from '../src/lib/content/catalog';
import { loadHandWrittenTerms, protectedTermIds } from '../src/lib/content/authorship';
import { loadContentProductionPlan } from '../src/lib/content/production';
import { loadValidatedProjectContent } from './lib/project';
import {
  buildPublishedCatalogRelations,
  buildPublishedCatalogTerms,
  serializeCatalogRelations,
  serializeCatalogTerm,
} from './lib/catalog-generation';

const root = process.cwd();
const [catalog, summaries, production, project, details, handWritten] = await Promise.all([
  loadCatalogPlan(root),
  loadCatalogSummaries(root),
  loadContentProductionPlan(root),
  loadValidatedProjectContent(root),
  loadCatalogTermDetails(root),
  loadHandWrittenTerms(root),
]);
// 必须与 sync-catalog.ts 用同一个保护集合。只接一边的话，这里会拿「生成器视角」
// 的基线去比对「人手写的」产物，把正确内容判为过期——而它给的修复建议
//（重跑 sync:catalog）恰好是错的：重跑什么都不会变。
const protectedIds = protectedTermIds(production, handWritten);
const stale: string[] = [];

for (const { candidate, ...document } of buildPublishedCatalogTerms(
  catalog,
  summaries,
  project,
  details,
)) {
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
