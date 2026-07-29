import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadProjectContent, type ProjectContent } from '../../src/lib/content/io';
import { assertValidProjectContent, normalizeLookupKey } from '../../src/lib/content/validation';

export async function loadValidatedProjectContent(root = process.cwd()): Promise<ProjectContent> {
  const project = await loadProjectContent(root);
  assertValidProjectContent(project);
  return project;
}

export async function writeGeneratedJson(
  fileName: string,
  value: unknown,
  root = process.cwd(),
): Promise<void> {
  const outputDirectory = path.join(root, 'src/generated');
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  );
}

export { normalizeLookupKey };
