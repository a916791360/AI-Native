import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { buildGraph, buildTermRegistry } from './lib/generate';
import { loadValidatedProjectContent } from './lib/project';
import { loadCaseStudies } from '../src/lib/cases/io';
import { buildCaseNavigation, buildCaseRegistry } from '../src/lib/cases/generate';
import { assertValidCaseStudies } from '../src/lib/cases/validation';

function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const project = await loadValidatedProjectContent();
const cases = await loadCaseStudies();
assertValidCaseStudies(cases, project);
const expected = new Map<string, string>([
  ['term-registry.json', serialize(buildTermRegistry(project))],
  ['graph.json', serialize(buildGraph(project))],
  ['case-registry.json', serialize(buildCaseRegistry(cases))],
  ['case-navigation.json', serialize(buildCaseNavigation(cases))],
]);
const staleFiles: string[] = [];

for (const [fileName, expectedContent] of expected) {
  const filePath = path.join(process.cwd(), 'src/generated', fileName);
  try {
    const actualContent = await readFile(filePath, 'utf8');
    if (actualContent !== expectedContent) staleFiles.push(fileName);
  } catch {
    staleFiles.push(fileName);
  }
}

if (staleFiles.length > 0) {
  throw new Error(
    `Generated content is missing or stale: ${staleFiles.join(', ')}. Run pnpm generate:data.`,
  );
}

console.log(`Generated content is current: ${[...expected.keys()].join(', ')}.`);
