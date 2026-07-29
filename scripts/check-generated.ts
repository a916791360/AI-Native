import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { buildGraph, buildTermRegistry } from './lib/generate';
import { loadValidatedProjectContent } from './lib/project';

function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const project = await loadValidatedProjectContent();
const expected = new Map<string, string>([
  ['term-registry.json', serialize(buildTermRegistry(project))],
  ['graph.json', serialize(buildGraph(project))],
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
