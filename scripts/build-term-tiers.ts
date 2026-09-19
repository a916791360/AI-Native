import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { loadTerms, type TermRecord } from './lib/content-quality';

/**
 * A/B/C 档位表生成器（《迭代开发说明书》第十三节）。
 *
 * ---------------------------------------------------------------------------
 * 这张表是干什么的
 * ---------------------------------------------------------------------------
 * 内容质量门禁是**分级生效**的：A 档 fail / B 档 warn / C 档豁免（整改总则约束 3）。
 * 所以「哪些词条属于 A 档」不是分类癖好，而是决定 CI 会红在哪里的输入。
 * 没有这张表，`pnpm check:content-quality:strict` 会把全库 325 条都算成违规，
 * 门禁立刻失去指示作用——这正是约束 3 要防的事。
 *
 * ---------------------------------------------------------------------------
 * 机器预判 + 人工复核
 * ---------------------------------------------------------------------------
 * 判据（第十三节）：命中 ≥3 个正向信号 → 预判 A；1–2 个 → B；0 个 → C。
 * 共六个正向信号，按可信度从高到低：
 *
 *   1. 在 8 站 coreTerms 里      —— 强信号：「缺了它就讲不通下一站」
 *   2. 被题目 references 引用     —— 它在真实判断场景里被需要
 *   3. 被案例 referenceIds 引用   —— 同上（term- 前缀）
 *   4. 在 relations.yml 的人工边里 —— 有人认真对待过它
 *   5. 出现在某条阅读路线里        —— 已有顺序归属
 *   6. priority ≤ 2 或 featured    —— 弱信号，只作参考，不计入得分
 *
 * 反向信号：同域内与另一条存在名称包含关系 → 极可能预判为 C（近义碎片）。
 *
 * **人工决定优先于机器**：产物里每条都有 `reviewed` 字段。人工把某条定为终判后
 * 置 `reviewed: true`，本脚本从此不再改动它的 tier——机器只负责把 325 条压到
 * 需要人工看的规模，不负责替人拍板。
 *
 * 运行：pnpm build:term-tiers
 */

const root = process.cwd();

interface TiersFileEntry {
  id: string;
  tier: 'A' | 'B' | 'C';
  signals: string[];
  reviewed: boolean;
  note?: string;
}

const TERMS_PATH = 'src/data/term-tiers.yml';

async function loadExisting(): Promise<Map<string, TiersFileEntry>> {
  const source = await readFile(path.join(root, TERMS_PATH), 'utf8').catch(() => '');
  const existing = new Map<string, TiersFileEntry>();
  if (!source.trim()) return existing;
  const parsed = parseYaml(source) as { terms?: TiersFileEntry[] } | undefined;
  for (const entry of parsed?.terms ?? []) {
    if (entry && typeof entry.id === 'string') existing.set(entry.id, entry);
  }
  return existing;
}

async function readYaml<T>(relativePath: string): Promise<T | undefined> {
  const source = await readFile(path.join(root, relativePath), 'utf8').catch(() => '');
  if (!source.trim()) return undefined;
  return parseYaml(source) as T;
}

async function listFiles(relativeDirectory: string, extension: string): Promise<string[]> {
  const directory = path.join(root, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true, recursive: true }).catch(
    () => [],
  );
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.join(entry.parentPath ?? directory, entry.name))
    .sort();
}

/**
 * 阅读路线是 .mdx（frontmatter + 正文），不是 .yml。
 * 这里直接读 frontmatter 而不是走 io.ts 的 loadDocuments：本脚本只要章节里的词条 id，
 * 不需要把路线校验一遍——校验是 validate:data 的职责，重复一遍只会让两处规则分叉。
 */
async function loadRouteTermIds(knownTermIds: ReadonlySet<string>): Promise<Map<string, number>> {
  const hits = new Map<string, number>();
  for (const file of await listFiles('src/content/routes', '.mdx')) {
    const source = await readFile(file, 'utf8');
    const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/u);
    if (!match) continue;
    const data = parseYaml(match[1] ?? '') as {
      chapters?: { terms?: { id?: string }[] }[];
    };
    const ids = new Set(
      (data?.chapters ?? []).flatMap((chapter) =>
        (chapter.terms ?? []).map((step) => step.id).filter((id): id is string => Boolean(id)),
      ),
    );
    for (const id of ids) {
      if (!knownTermIds.has(id)) continue;
      hits.set(id, (hits.get(id) ?? 0) + 1);
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// 采集六个正向信号
// ---------------------------------------------------------------------------

const terms = await loadTerms(root);
const termIds = new Set(terms.map((term) => term.id));

const chain =
  (await readYaml<{ order: number; coreTerms: string[] }[]>('src/data/chain.yml')) ?? [];
const chainCoreIds = new Set(chain.flatMap((station) => station.coreTerms ?? []));

const { LEARNING_QUESTIONS } = await import('../src/data/learning/index');

const questionHits = new Map<string, number>();
for (const question of LEARNING_QUESTIONS) {
  for (const reference of question.references ?? []) {
    if (!termIds.has(reference.id)) continue;
    questionHits.set(reference.id, (questionHits.get(reference.id) ?? 0) + 1);
  }
}

const caseFiles = await listFiles('src/content/cases', '.yml');
const caseHits = new Map<string, number>();
for (const file of caseFiles) {
  const source = await readFile(file, 'utf8').catch(() => '');
  for (const match of source.matchAll(/^\s*-\s*term-([a-z0-9-]+)\s*$/gmu)) {
    const id = match[1] ?? '';
    if (!termIds.has(id)) continue;
    caseHits.set(id, (caseHits.get(id) ?? 0) + 1);
  }
}

// 只取人工关系（src/data/relations.yml）。catalog-relations.yml 是生成出来的填充边，
// 拿它当信号等于「因为它被机器挂上了所以它重要」，是循环论证。
const manualRelations =
  (await readYaml<{ source: string; target: string }[]>('src/data/relations.yml')) ?? [];
const relationHits = new Map<string, number>();
for (const relation of manualRelations) {
  for (const id of [relation.source, relation.target]) {
    if (!termIds.has(id)) continue;
    relationHits.set(id, (relationHits.get(id) ?? 0) + 1);
  }
}

const routeHits = await loadRouteTermIds(termIds);

// ---------------------------------------------------------------------------
// 反向信号：同域名称包含
// ---------------------------------------------------------------------------

const byDomain = new Map<string, TermRecord[]>();
for (const term of terms) {
  const bucket = byDomain.get(term.domain) ?? [];
  bucket.push(term);
  byDomain.set(term.domain, bucket);
}

const containment = new Map<string, string[]>();
for (const bucket of byDomain.values()) {
  for (const outer of bucket) {
    for (const inner of bucket) {
      if (outer.id === inner.id) continue;
      const names = [inner.nameZh, inner.nameEn].filter((name) => name.length >= 2);
      const contains = names.some(
        (name) =>
          outer.nameZh.includes(name) || outer.nameEn.toLowerCase().includes(name.toLowerCase()),
      );
      if (!contains) continue;
      const list = containment.get(outer.id) ?? [];
      list.push(inner.id);
      containment.set(outer.id, list);
    }
  }
}

// ---------------------------------------------------------------------------
// 判定
// ---------------------------------------------------------------------------

const computeTier = (term: TermRecord): { tier: 'A' | 'B' | 'C'; signals: string[] } => {
  const signals: string[] = [];
  let score = 0;

  if (chainCoreIds.has(term.id)) {
    signals.push('chain-core');
    score += 1;
  }
  const questions = questionHits.get(term.id) ?? 0;
  if (questions > 0) {
    signals.push(`questions:${questions}`);
    score += 1;
  }
  const cases = caseHits.get(term.id) ?? 0;
  if (cases > 0) {
    signals.push(`cases:${cases}`);
    score += 1;
  }
  const relations = relationHits.get(term.id) ?? 0;
  if (relations > 0) {
    signals.push(`relations:${relations}`);
    score += 1;
  }
  const routes = routeHits.get(term.id) ?? 0;
  if (routes > 0) {
    signals.push(`routes:${routes}`);
    score += 1;
  }

  const fragmented = containment.get(term.id) ?? [];
  if (fragmented.length > 0) signals.push(`containment:${fragmented.length}`);

  const tier: 'A' | 'B' | 'C' = score >= 3 ? 'A' : score >= 1 ? 'B' : 'C';
  return { tier, signals };
};

const existing = await loadExisting();
const entries: TiersFileEntry[] = terms
  .map((term) => {
    const previous = existing.get(term.id);
    // 人工已终判的条目原样保留——机器不覆盖人的决定。
    if (previous?.reviewed) return { ...previous };
    const { tier, signals } = computeTier(term);
    return { id: term.id, tier, signals, reviewed: false };
  })
  .sort((left, right) => left.id.localeCompare(right.id));

const counts = { A: 0, B: 0, C: 0 };
for (const entry of entries) counts[entry.tier] += 1;

const header = [
  '# A/B/C 档位表 —— 内容质量门禁分级生效的依据（《迭代开发说明书》第十三节）。',
  '#',
  '# 由 pnpm build:term-tiers 依据机器预判信号生成：命中 ≥3 个正向信号 → A，',
  '# 1–2 个 → B，0 个 → C。反向信号（同域名称包含，即近义碎片）记在 signals 里但',
  '# 不计分，只作人工复核时的提示。',
  '#',
  '# 人工终判请把 reviewed 改成 true，此后本脚本不再改动该条的 tier ——',
  '# 机器负责把 325 条压到需要人工看的规模，不负责替人拍板。',
  '#',
  `# 当前分布：A ${counts.A} / B ${counts.B} / C ${counts.C}（共 ${entries.length} 条）。`,
  '',
].join('\n');

// 与 catalog-generation.ts 用同一组序列化选项：生成出来的 YAML 必须能直接过
// `prettier --check`，否则每次重新生成档位表都会把 CI 的格式门禁打红。
const body = stringifyYaml({ version: 1, terms: entries }, { lineWidth: 0, singleQuote: true });

await writeFile(path.join(root, TERMS_PATH), `${header}${body}`, 'utf8');

console.log(`档位表已写入 ${TERMS_PATH}：A ${counts.A} / B ${counts.B} / C ${counts.C}。`);
console.log(
  `信号覆盖：chain-core ${chainCoreIds.size} · 题目 ${questionHits.size} · 案例 ${caseHits.size} · ` +
    `人工关系 ${relationHits.size} · 阅读路线 ${routeHits.size} · 名称包含 ${containment.size}`,
);
console.log(
  `其中 ${entries.filter((entry) => entry.reviewed).length} 条为人工终判（脚本不会改动）。`,
);
