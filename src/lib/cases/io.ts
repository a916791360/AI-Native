import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

import { caseStudySchema, type CaseStudy } from './schema';

export interface CaseStudyDocument {
  filePath: string;
  data: CaseStudy;
}

export class CaseStudyParseError extends Error {
  constructor(
    readonly filePath: string,
    message: string,
  ) {
    super(`[CASE_SCHEMA] ${filePath}: ${message}`);
    this.name = 'CaseStudyParseError';
  }
}

export async function loadCaseStudies(root = process.cwd()): Promise<CaseStudyDocument[]> {
  const directory = path.join(root, 'src/content/cases');
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const files = entries
    .filter(
      (entry) => entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')),
    )
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();

  return Promise.all(
    files.map(async (absolutePath) => {
      const filePath = path.relative(root, absolutePath);
      const source = await readFile(absolutePath, 'utf8');
      let parsed: unknown;
      try {
        parsed = parseYaml(source);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid YAML';
        throw new CaseStudyParseError(filePath, message);
      }

      const result = caseStudySchema.safeParse(parsed);
      if (!result.success) {
        const message = result.error.issues
          .map((issue) => `${issue.path.map(String).join('.') || '$'}: ${issue.message}`)
          .join('; ');
        throw new CaseStudyParseError(filePath, message);
      }

      return { filePath, data: result.data };
    }),
  );
}
