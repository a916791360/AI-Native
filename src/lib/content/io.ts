import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import type { ZodType } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

import {
  chainSchema,
  domainsSchema,
  relationsSchema,
  routeSchema,
  termSchema,
  type ChainStation,
  type Domain,
  type Relation,
  type Route,
  type Term,
} from './schema';

export interface ContentDocument<T> {
  filePath: string;
  data: T;
  body: string;
}

export interface ProjectContent {
  domains: Domain[];
  /** 认知链路：8 站，词条的第二坐标轴（用于学习顺序），与 domains 并用不互相替代。 */
  chain: ChainStation[];
  /** 手工维护的语义关系；不含 catalog-relations.yml 的批量邻接边。 */
  semanticRelations: Relation[];
  /** 完整关系集合，供图谱与关系区块使用。 */
  relations: Relation[];
  terms: ContentDocument<Term>[];
  routes: ContentDocument<Route>[];
}

export class ContentParseError extends Error {
  constructor(
    readonly filePath: string,
    readonly fieldPath: string,
    message: string,
  ) {
    super(`[SCHEMA] ${filePath}#${fieldPath}: ${message}`);
    this.name = 'ContentParseError';
  }
}

function formatIssuePath(pathParts: PropertyKey[]): string {
  return pathParts.length === 0 ? '$' : pathParts.map(String).join('.');
}

function parseWithSchema<T>(value: unknown, schema: ZodType<T>, filePath: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
    .join('; ');
  throw new ContentParseError(filePath, '$', details);
}

export function parseFrontmatter(
  source: string,
  filePath: string,
): { data: unknown; body: string } {
  const normalized = source.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match) {
    throw new ContentParseError(filePath, '$', 'missing valid YAML frontmatter delimiters');
  }

  try {
    return {
      data: parseYaml(match[1] ?? ''),
      body: (match[2] ?? '').trim(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid YAML';
    throw new ContentParseError(filePath, '$', message);
  }
}

async function listFiles(directory: string, extension: string): Promise<string[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
}

async function loadDocuments<T>(
  root: string,
  relativeDirectory: string,
  schema: ZodType<T>,
): Promise<ContentDocument<T>[]> {
  const directory = path.join(root, relativeDirectory);
  const files = await listFiles(directory, '.mdx');

  return Promise.all(
    files.map(async (absolutePath) => {
      const filePath = path.relative(root, absolutePath);
      const source = await readFile(absolutePath, 'utf8');
      const parsed = parseFrontmatter(source, filePath);
      return {
        filePath,
        data: parseWithSchema(parsed.data, schema, filePath),
        body: parsed.body,
      };
    }),
  );
}

async function loadYaml<T>(root: string, filePath: string, schema: ZodType<T>): Promise<T> {
  const source = await readFile(path.join(root, filePath), 'utf8');
  try {
    return parseWithSchema(parseYaml(source), schema, filePath);
  } catch (error) {
    if (error instanceof ContentParseError) throw error;
    const message = error instanceof Error ? error.message : 'invalid YAML';
    throw new ContentParseError(filePath, '$', message);
  }
}

export async function loadProjectContent(root = process.cwd()): Promise<ProjectContent> {
  const [domains, chain, relations, catalogRelations, terms, routes] = await Promise.all([
    loadYaml(root, 'src/data/domains.yml', domainsSchema),
    loadYaml(root, 'src/data/chain.yml', chainSchema),
    loadYaml(root, 'src/data/relations.yml', relationsSchema),
    loadYaml(root, 'src/data/catalog-relations.yml', relationsSchema),
    loadDocuments(root, 'src/content/terms', termSchema),
    loadDocuments(root, 'src/content/routes', routeSchema),
  ]);

  return {
    domains,
    chain,
    semanticRelations: relations,
    relations: [...relations, ...catalogRelations],
    terms,
    routes,
  };
}
