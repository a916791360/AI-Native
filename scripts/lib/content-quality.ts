import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

/**
 * 内容质量分析：把「内容质量」从主观话题变成一组可以打印出来的数字。
 *
 * 这个模块被两个脚本共用，是同一条切句规则的唯一定义处：
 *   · scripts/report-content-quality.ts —— 输出人类可读摘要 + 机器可读 JSON（只读）
 *   · scripts/check-content-quality.ts  —— 按档位判定违规（门禁）
 *
 * ---------------------------------------------------------------------------
 * 切句规则 —— 一旦冻结，不得调整
 * ---------------------------------------------------------------------------
 * 为什么必须冻结：这个规则直接决定「模板复用率」这个数字。规则一改，历史数字
 * 就不可比，团队会开始怀疑指标本身，而不是去修内容。若确实需要调整，请在
 * 《迭代开发说明书》里记录一次显式的口径变更，并同步更新基线数字——不要静默修改。
 *
 * 规则：
 *   1. 先剥掉标记：h1–h6 标题整块移除（标题不是正文句子）、剥 HTML 标签、
 *      去掉 markdown 图片、保留 markdown 链接文字、去掉 markdown 记号。
 *      注：标题必须排除。否则「什么时候适合与不适合」这类固定小节名会在
 *      325 条词条里各命中一次，把模板复用率虚报成 100%。
 *   2. 按句末标点与换行切分：。！？!?；;
 *   3. normalize：NFKC 归一 → 去掉全部空白 → 去掉全部标点与符号 → 转小写。
 *   4. 丢弃 normalize 后短于 MIN_SENTENCE_LENGTH 的片段，避免短句噪声污染统计。
 *
 * 「模板复用」的判定：一句 normalize 后的文本若出现在 ≥2 条不同词条里，
 * 即记为一条「复用句」。这是最朴素的做法，不引第三方 NLP 库——
 * 本项目的性能预算卡得很紧，且朴素方法足以让重复率浮出来。
 */

const SENTENCE_SPLIT = /[。！？!?；;\n]+/u;
const MIN_SENTENCE_LENGTH = 8;

/** 剥掉标记：标题整块移除、剥 HTML 标签、保留 markdown 链接文字。 */
export function stripMarkup(input: string): string {
  return input
    .replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gu, '')
    .replace(/<[^>]+>/gu, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/[`*_>#]/gu, '');
}

export function normalizeSentence(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/\s+/gu, '')
    .replace(/[\p{P}\p{S}]/gu, '')
    .toLowerCase();
}

export function splitSentences(body: string): string[] {
  return stripMarkup(body)
    .split(SENTENCE_SPLIT)
    .map((sentence) => sentence.trim())
    .filter((sentence) => normalizeSentence(sentence).length >= MIN_SENTENCE_LENGTH);
}

// ---------------------------------------------------------------------------
// 词条语料
// ---------------------------------------------------------------------------

export interface TermRecord {
  id: string;
  nameZh: string;
  nameEn: string;
  domain: string;
  filePath: string;
  body: string;
  chain?: number;
  chainRole?: string;
  hasBoundaries: boolean;
  minAction?: string;
}

export async function loadTerms(root = process.cwd()): Promise<TermRecord[]> {
  const directory = path.join(root, 'src/content/terms');
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();

  const terms: TermRecord[] = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/u);
    if (!match) continue;

    let frontmatter: Record<string, unknown>;
    try {
      frontmatter = (parseYaml(match[1] ?? '') ?? {}) as Record<string, unknown>;
    } catch {
      continue;
    }

    terms.push({
      id: String(frontmatter.id ?? path.basename(file, '.mdx')),
      nameZh: String(frontmatter.nameZh ?? ''),
      nameEn: String(frontmatter.nameEn ?? ''),
      domain: String(frontmatter.domain ?? ''),
      filePath: path.relative(root, file),
      body: (match[2] ?? '').trim(),
      chain: typeof frontmatter.chain === 'number' ? frontmatter.chain : undefined,
      chainRole: typeof frontmatter.chainRole === 'string' ? frontmatter.chainRole : undefined,
      hasBoundaries: Boolean(frontmatter.boundaries),
      minAction: typeof frontmatter.minAction === 'string' ? frontmatter.minAction : undefined,
    });
  }
  return terms;
}

// ---------------------------------------------------------------------------
// 各指标
// ---------------------------------------------------------------------------

export interface RepeatedSentence {
  /** 去掉标点空白后的句子指纹（用于比对，不直接展示） */
  normalized: string;
  /** 一句有代表性的原文写法 */
  sample: string;
  /** 出现该句的词条数 */
  termCount: number;
  /** 出现该句的全部词条 id（门禁依赖它逐条定位，故不截断） */
  termIds: string[];
}

export interface StructureGroup {
  /** h2 小节标题序列的签名 */
  signature: string;
  sections: string[];
  termCount: number;
  share: number;
}

export interface SynonymCluster {
  domain: string;
  members: string[];
  /** 触发归并的包含关系，样例形式：`retrieval ⊂ context-retrieval` */
  pairs: string[];
}

export interface MetricSet {
  totalTerms: number;
  /** 1. 含 ≥1 句复用句的词条占比 */
  templateReuseRate: number;
  templateReuseTerms: number;
  repeatedSentenceCount: number;
  sentenceCount: number;
  /** 2. 共用同一组 h2 的词条占比（取最大分组） */
  structureUniformity: number;
  /** 3. 已打 chain 的词条占比 */
  chainCoverage: number;
  chainTerms: number;
  /** 4. 被 ≥1 道题 references 引用的词条占比 */
  questionLinkRate: number;
  questionLinkedTerms: number;
  /** 5. 被 ≥1 个案例 referenceIds 引用的词条占比 */
  caseLinkRate: number;
  caseLinkedTerms: number;
  /** 6. 人工关系边 / 全部边 */
  semanticEdgeRatio: number;
  humanEdges: number;
  fillerEdges: number;
  totalEdges: number;
  /** 7. 图谱中度为 0 的词条数（含填充边口径） */
  orphanTerms: number;
  /** 7b. 只保留人工关系边时的孤立词条数 —— 这才是真实的连接度 */
  orphanTermsHumanOnly: number;
}

export interface ContentQualityReport {
  generatedAt: string;
  metrics: MetricSet;
  details: {
    repeatedSentences: RepeatedSentence[];
    structureGroups: StructureGroup[];
    synonymClusters: SynonymCluster[];
    orphanTermsHumanOnly: string[];
    termsMissingChain: string[];
    termsMissingBoundaries: string[];
    termsMissingMinAction: string[];
    termsNotReferencedByQuestions: string[];
    termsNotReferencedByCases: string[];
  };
}

function extractSections(body: string): string[] {
  return [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gu)].map((match) =>
    stripMarkup(match[1] ?? '')
      .replace(/\s+/gu, ' ')
      .trim(),
  );
}

function extractH2Ids(body: string): string[] {
  return [...body.matchAll(/<h2\b[^>]*\bid="([^"]+)"/gu)].map((match) => match[1] ?? '');
}

/** 中文名：直接子串判定（中文无词边界，长度下限 2 字） */
function nameZhContains(short: string, long: string): boolean {
  const a = short.trim();
  const b = long.trim();
  if (!a || !b || a === b) return false;
  if (a.length < 2) return false;
  return b.includes(a);
}

/** 英文名：按连字符分词后判定词序列包含关系（长度下限 4，避开 AI / CUDA 这类缩写噪声） */
function nameEnContains(short: string, long: string): boolean {
  const a = short.toLowerCase().trim();
  const b = long.toLowerCase().trim();
  if (!a || !b || a === b) return false;
  if (a.length < 4) return false;
  if (b.includes(a)) return true;

  const aWords = a.split(/[^a-z0-9]+/u).filter(Boolean);
  const bWords = b.split(/[^a-z0-9]+/u).filter(Boolean);
  if (aWords.length === 0) return false;
  for (let start = 0; start + aWords.length <= bWords.length; start += 1) {
    if (aWords.every((word, offset) => word === bWords[start + offset])) return true;
  }
  return false;
}

/** 用并查集把同域内存在包含关系的词条聚成簇 */
function findSynonymClusters(terms: TermRecord[]): SynonymCluster[] {
  const byDomain = new Map<string, TermRecord[]>();
  for (const term of terms) {
    const list = byDomain.get(term.domain) ?? [];
    list.push(term);
    byDomain.set(term.domain, list);
  }

  const clusters: SynonymCluster[] = [];
  for (const [domain, list] of byDomain) {
    const parent = new Map<string, string>(list.map((term) => [term.id, term.id]));
    const find = (id: string): string => {
      let current = id;
      while (parent.get(current) !== current) current = parent.get(current)!;
      return current;
    };
    const union = (left: string, right: string): void => {
      const a = find(left);
      const b = find(right);
      if (a !== b) parent.set(a, b);
    };

    const pairLabels = new Map<string, string[]>();
    for (const a of list) {
      for (const b of list) {
        if (a.id === b.id) continue;
        const zhHit = nameZhContains(a.nameZh, b.nameZh);
        const enHit = nameEnContains(a.nameEn, b.nameEn);
        if (!zhHit && !enHit) continue;
        union(a.id, b.id);
        const root = find(a.id);
        const labels = pairLabels.get(root) ?? [];
        labels.push(zhHit ? `${a.nameZh} ⊂ ${b.nameZh}` : `${a.nameEn} ⊂ ${b.nameEn}`);
        pairLabels.set(root, labels);
      }
    }

    const grouped = new Map<string, string[]>();
    for (const term of list) {
      const root = find(term.id);
      const members = grouped.get(root) ?? [];
      members.push(term.id);
      grouped.set(root, members);
    }

    for (const [root, members] of grouped) {
      if (members.length < 2) continue;
      clusters.push({
        domain,
        members: members.sort(),
        pairs: [...new Set(pairLabels.get(root) ?? [])].sort().slice(0, 12),
      });
    }
  }

  return clusters.sort((left, right) => right.members.length - left.members.length);
}

interface RelationEdge {
  source: string;
  target: string;
  type?: string;
}

async function loadYamlArray<T>(file: string): Promise<T[]> {
  try {
    const source = await readFile(file, 'utf8');
    const parsed = parseYaml(source);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** 题目 → 词条的引用：数据层早就存在（题库的 references 字段） */
async function loadQuestionTermIds(root: string): Promise<Set<string>> {
  const ids = new Set<string>();
  const directory = path.join(root, 'src/data/learning/questions');
  for (const file of ['tier1.ts', 'tier2.ts', 'tier3.ts']) {
    const source = await readFile(path.join(directory, file), 'utf8').catch(() => '');
    for (const block of source.matchAll(/references:\s*\[([\s\S]*?)\]/gu)) {
      for (const id of (block[1] ?? '').matchAll(/id:\s*'([^']+)'/gu)) {
        ids.add(id[1] ?? '');
      }
    }
  }
  return ids;
}

/** 案例 → 词条的引用：当前 referenceIds 指向的是章节与来源，不是词条 id */
async function loadCaseReferencedIds(root: string): Promise<string[]> {
  const directory = path.join(root, 'src/content/cases');
  const files = await readdir(directory).catch(() => [] as string[]);
  const ids: string[] = [];
  for (const file of files) {
    if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
    const source = await readFile(path.join(directory, file), 'utf8').catch(() => '');
    for (const block of source.matchAll(/referenceIds:\s*\[([^\]]*)\]/gu)) {
      for (const item of (block[1] ?? '').split(',')) {
        const value = item.trim().replace(/^['"]|['"]$/gu, '');
        if (value) ids.push(value);
      }
    }
    for (const block of source.matchAll(/referenceIds:\s*\n((?:\s+-\s+.*\n)+)/gu)) {
      for (const item of (block[1] ?? '').matchAll(/-\s+(\S+)/gu)) {
        ids.push((item[1] ?? '').replace(/^['"]|['"]$/gu, ''));
      }
    }
  }
  return ids;
}

export async function analyzeContentQuality(
  root = process.cwd(),
  providedTerms?: TermRecord[],
): Promise<ContentQualityReport> {
  const terms = providedTerms ?? (await loadTerms(root));
  const termIds = new Set(terms.map((term) => term.id));

  // ---- 1. 模板复用 --------------------------------------------------------
  const sentenceOwners = new Map<string, { sample: string; owners: Set<string> }>();
  let sentenceCount = 0;
  for (const term of terms) {
    for (const raw of new Set(splitSentences(term.body))) {
      const key = normalizeSentence(raw);
      if (!key) continue;
      sentenceCount += 1;
      const entry = sentenceOwners.get(key) ?? { sample: raw, owners: new Set<string>() };
      entry.owners.add(term.id);
      sentenceOwners.set(key, entry);
    }
  }

  const repeatedSentences: RepeatedSentence[] = [];
  const termsWithReuse = new Set<string>();
  for (const [key, entry] of sentenceOwners) {
    if (entry.owners.size < 2) continue;
    const owners = [...entry.owners].sort();
    repeatedSentences.push({
      normalized: key,
      sample: entry.sample,
      termCount: entry.owners.size,
      termIds: owners,
    });
    for (const id of owners) termsWithReuse.add(id);
  }
  repeatedSentences.sort((left, right) => right.termCount - left.termCount);

  // ---- 2. 小节结构一致度 --------------------------------------------------
  const structureBuckets = new Map<string, { sections: string[]; ids: string[] }>();
  for (const term of terms) {
    const sections = extractSections(term.body);
    const signature = sections.join(' | ');
    const bucket = structureBuckets.get(signature) ?? { sections, ids: [] };
    bucket.ids.push(term.id);
    structureBuckets.set(signature, bucket);
  }
  const structureGroups: StructureGroup[] = [...structureBuckets.entries()]
    .map(([signature, bucket]) => ({
      signature,
      sections: bucket.sections,
      termCount: bucket.ids.length,
      share: terms.length === 0 ? 0 : bucket.ids.length / terms.length,
    }))
    .sort((left, right) => right.termCount - left.termCount);
  const structureUniformity = structureGroups[0]?.share ?? 0;

  // ---- 3. 链路覆盖率 ------------------------------------------------------
  const chainedTerms = terms.filter((term) => typeof term.chain === 'number');
  const termsMissingChain = terms
    .filter((term) => typeof term.chain !== 'number')
    .map((term) => term.id);

  // ---- 4/5. 题目与案例的引用 ----------------------------------------------
  const questionTermIds = await loadQuestionTermIds(root);
  const questionLinked = new Set([...questionTermIds].filter((id) => termIds.has(id)));
  const caseReferenced = await loadCaseReferencedIds(root);
  const caseLinked = new Set(caseReferenced.filter((id) => termIds.has(id)));

  // ---- 6/7. 图谱 ----------------------------------------------------------
  const humanEdges = await loadYamlArray<RelationEdge>(path.join(root, 'src/data/relations.yml'));
  const fillerEdges = await loadYamlArray<RelationEdge>(
    path.join(root, 'src/data/catalog-relations.yml'),
  );
  const totalEdges = humanEdges.length + fillerEdges.length;

  const humanDegree = new Map<string, number>();
  for (const edge of humanEdges) {
    for (const node of [edge.source, edge.target]) {
      if (!node) continue;
      humanDegree.set(node, (humanDegree.get(node) ?? 0) + 1);
    }
  }
  const orphanTermsHumanOnly = terms
    .filter((term) => (humanDegree.get(term.id) ?? 0) === 0)
    .map((term) => term.id);

  // 含填充边时，度几乎不可能为 0（填充边把每个词条都挂到领域锚点上）。
  // 这个「0 孤立」正是诊断报告里指出的假象，所以两个口径都要报出来。
  const allDegree = new Map<string, number>();
  for (const edge of [...humanEdges, ...fillerEdges]) {
    for (const node of [edge.source, edge.target]) {
      if (!node) continue;
      allDegree.set(node, (allDegree.get(node) ?? 0) + 1);
    }
  }
  const orphanTerms = terms.filter((term) => (allDegree.get(term.id) ?? 0) === 0).length;

  // ---- 8. 近义碎片簇 ------------------------------------------------------
  const synonymClusters = findSynonymClusters(terms);

  const metrics: MetricSet = {
    totalTerms: terms.length,

    templateReuseRate: terms.length === 0 ? 0 : termsWithReuse.size / terms.length,
    templateReuseTerms: termsWithReuse.size,
    repeatedSentenceCount: repeatedSentences.length,
    sentenceCount,

    structureUniformity,
    chainCoverage: terms.length === 0 ? 0 : chainedTerms.length / terms.length,
    chainTerms: chainedTerms.length,
    questionLinkRate: terms.length === 0 ? 0 : questionLinked.size / terms.length,
    questionLinkedTerms: questionLinked.size,
    caseLinkRate: terms.length === 0 ? 0 : caseLinked.size / terms.length,
    caseLinkedTerms: caseLinked.size,

    semanticEdgeRatio: totalEdges === 0 ? 0 : humanEdges.length / totalEdges,
    humanEdges: humanEdges.length,
    fillerEdges: fillerEdges.length,
    totalEdges,

    orphanTerms,
    orphanTermsHumanOnly: orphanTermsHumanOnly.length,
  };

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    details: {
      repeatedSentences,
      structureGroups,
      synonymClusters,
      orphanTermsHumanOnly,
      termsMissingChain,
      termsMissingBoundaries: terms.filter((term) => !term.hasBoundaries).map((term) => term.id),
      termsMissingMinAction: terms.filter((term) => !term.minAction).map((term) => term.id),
      termsNotReferencedByQuestions: terms
        .filter((term) => !questionLinked.has(term.id))
        .map((term) => term.id),
      termsNotReferencedByCases: terms
        .filter((term) => !caseLinked.has(term.id))
        .map((term) => term.id),
    },
  };
}

/** 供门禁复用的辅助：词条正文里的 h2 锚点与顺序（用于「模板骨架」判定） */
export function termSectionIds(term: TermRecord): string[] {
  return extractH2Ids(term.body);
}
