import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

import { TERM_SECTION_IDS } from '../src/lib/content/term-sections';
import {
  analyzeContentQuality,
  loadTerms,
  normalizeSentence,
  splitSentences,
} from './lib/content-quality';

/**
 * 内容质量门禁。
 *
 * 五道规则（规格见《迭代开发说明书》第十一节）：
 *   1 · 模板复用   —— 正文句子与他条逐字重复 / 两两相似度超上限
 *   5 · 段落结构   —— 正文的 h2 序列是否等于决策页模板 v2（I3-01 新增）
 *   2 · 边界声明   —— 是否声明了站点归属（chain）与邻居差别（boundaries）
 *   3 · 上手动作   —— 「亲自试一下」是否真能上手
 *   4 · 配额与近义 —— 数量是否还被配额决定；同域是否还有近义碎片（永远只告警）
 *
 * 分级生效，不搞全库一刀切（整改总则约束 3）：
 *   A 档 fail / B 档 warn / C 档豁免。当前 325 条里有 220 条逐字复用模板句，
 *   若一上来全库 fail，CI 会立刻红，团队就会绕过它——这是能让门禁活下来的唯一路径。
 *
 * 档位来源：src/data/term-tiers.yml（由 scripts/build-term-tiers.ts 依据第十三节
 * 的机器预判信号生成，人工复核后入库）。该文件尚不存在时，全部词条按「未分档」处理，
 * 一律只告警，目的是先让全部问题可见，而不是先把 CI 打红。
 *
 * 运行：
 *   pnpm check:content-quality          警告模式：打印完整违规清单，退出码 0
 *   pnpm check:content-quality:strict   严格模式：有违规即退出码 1
 */

// ---------------------------------------------------------------------------
// 阈值与规则常量 —— 集中在此，便于 review（I6-04 用 A 档合规样本标定后再收紧）
// ---------------------------------------------------------------------------

/** 门禁 1a：一句 normalize 后的正文出现在 ≥N 条词条里，即判定为「复用句」 */
const MIN_REUSED_SENTENCE_HITS = 5;
/** 门禁 1b：两条词条正文句子集合的 Jaccard 相似度上限 */
const JACCARD_LIMIT = 0.8;
/** 门禁 3：空动作黑名单——命中的「亲自试一下」等于零上手 */
const EMPTY_ACTION_PATTERNS: readonly RegExp[] = [/写下三件事/u, /再在本站搜索相邻词条/u];
/** 门禁 3：可验证的完成标志——含时长（如「约 15 分钟」）或命令（反引号代码） */
const ACTION_PROOF_PATTERNS: readonly RegExp[] = [/约?\s*\d+\s*分钟/u, /`[^`]+`/u];
const DETAIL_LIMIT = 12;

type Tier = 'A' | 'B' | 'C';
type Scope = Tier | 'unranked';
type Severity = 'fail' | 'warn';
type RuleId = 'reuse' | 'structure' | 'boundary' | 'action' | 'quota';

const RULE_LABEL: Record<RuleId, string> = {
  reuse: '门禁 1 · 模板复用',
  structure: '门禁 5 · 段落结构',
  boundary: '门禁 2 · 边界声明',
  action: '门禁 3 · 上手动作',
  quota: '门禁 4 · 配额与近义',
};

const HINT = [
  '修复建议：',
  '  · 门禁 1 模板复用：正文要写这一条自己的机制、角色与流程；',
  '    模板结构可以留，模板句子必须清空（整改总则约束 4）。',
  '  · 门禁 5 段落结构：正文的 9 个 <h2 id> 必须与决策页模板 v2 完全一致；',
  '    段落定义在 src/lib/content/term-sections.ts，词条页锚点导航从同一处生成，',
  '    两侧不会各改一半——缺段、拼错段名、顺序颠倒都会被这条抓住。',
  '  · 门禁 2 边界声明：补 chain（理解路径第几站）与 boundaries',
  '    （solves / notSolves / confusions），见《迭代开发说明书》第十二节「决策页内容规范」。',
  '  · 门禁 3 上手动作：minAction 要能在 30 分钟内完成、且结果可观察；',
  '    「写下三件事」「再在本站搜索相邻词条」属于空动作，必被判不合格。',
  '  · 门禁 4 配额与近义：合并或降级近义碎片（用 status: deprecated + replacedBy），不要物理删文件。',
  '  · 档位表与完整清单：src/data/term-tiers.yml、reports/content-quality.json。',
].join('\n');

const root = process.cwd();
const STRICT = process.argv.includes('--strict');

// ---------------------------------------------------------------------------
// 档位
// ---------------------------------------------------------------------------

/**
 * 档位表读 src/data/term-tiers.yml（入库文件），不读 reports/term-tiers.csv。
 *
 * 为什么偏离说明书第十一节写的路径：reports/ 在本仓库是 .gitignore 的工具产物目录，
 * 而档位表是**人工判定结果**、不是构建产物。放在不入库的位置，门禁行为就会随机器而异
 * （CI 上读不到 → 全部按「未分档」处理 → 该 fail 的不 fail），
 * 而档位恰恰是「哪些词条必须合规」的唯一依据，必须随代码一起版本化。
 */
interface TermTier {
  tier: Tier;
  signals: string[];
  note?: string;
}

async function loadTermTiers(): Promise<Map<string, TermTier>> {
  const tiers = new Map<string, TermTier>();
  const source = await readFile(path.join(root, 'src/data/term-tiers.yml'), 'utf8').catch(() => '');
  if (!source.trim()) return tiers;

  const parsed = parseYaml(source) as
    { terms?: { id?: unknown; tier?: unknown; signals?: unknown; note?: unknown }[] } | undefined;

  for (const entry of parsed?.terms ?? []) {
    const id = typeof entry.id === 'string' ? entry.id : '';
    const tier = typeof entry.tier === 'string' ? entry.tier.toUpperCase() : '';
    if (!id || (tier !== 'A' && tier !== 'B' && tier !== 'C')) continue;
    tiers.set(id, {
      tier,
      signals: Array.isArray(entry.signals) ? entry.signals.map(String) : [],
      note: typeof entry.note === 'string' ? entry.note : undefined,
    });
  }
  return tiers;
}

const TIERS = await loadTermTiers();
const HAS_TIERS = TIERS.size > 0;
const scopeOf = (id: string): Scope => TIERS.get(id)?.tier ?? (HAS_TIERS ? 'C' : 'unranked');

function severityFor(scope: Scope, rule: RuleId): Severity | 'skip' {
  // 配额类是趋势，不是单条错误——永远只告警（第十一节）
  if (rule === 'quota') return 'warn';
  if (scope === 'C') return 'skip';
  if (scope === 'A') return 'fail';
  return 'warn';
}

// ---------------------------------------------------------------------------
// 收集问题
// ---------------------------------------------------------------------------

interface Issue {
  rule: RuleId;
  severity: Severity;
  subject: string;
  detail: string;
}

const issues: Issue[] = [];
const add = (rule: RuleId, severity: Severity, subject: string, detail: string): void => {
  issues.push({ rule, severity, subject, detail });
};

const clip = (text: string, max = 54): string =>
  [...text].length <= max ? text : `${[...text].slice(0, max).join('')}…`;

const terms = await loadTerms(root);
const report = await analyzeContentQuality(root, terms);

// ---- 门禁 1 · 模板复用 ----------------------------------------------------

const reuseSamples = new Map<string, string[]>();
for (const sentence of report.details.repeatedSentences) {
  if (sentence.termCount < MIN_REUSED_SENTENCE_HITS) continue;
  for (const id of sentence.termIds) {
    const list = reuseSamples.get(id) ?? [];
    list.push(sentence.sample);
    reuseSamples.set(id, list);
  }
}
for (const [id, samples] of [...reuseSamples].sort(
  (left, right) => right[1].length - left[1].length,
)) {
  const severity = severityFor(scopeOf(id), 'reuse');
  if (severity === 'skip') continue;
  add(
    'reuse',
    severity,
    id,
    `正文有 ${samples.length} 句与 ≥${MIN_REUSED_SENTENCE_HITS} 条词条逐字重复，例如「${clip(samples[0] ?? '')}」`,
  );
}

// 1b 两两相似度：用倒排索引只比较可能达标的词条对
const sentenceSets = new Map<string, Set<string>>();
for (const term of terms) {
  sentenceSets.set(term.id, new Set(splitSentences(term.body).map(normalizeSentence)));
}
const inverted = new Map<string, string[]>();
for (const [id, set] of sentenceSets) {
  for (const sentence of set) {
    if (!sentence) continue;
    const list = inverted.get(sentence) ?? [];
    list.push(id);
    inverted.set(sentence, list);
  }
}
const overlaps = new Map<string, number>();
for (const ids of inverted.values()) {
  if (ids.length < 2) continue;
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ids[i]!;
      const b = ids[j]!;
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      overlaps.set(key, (overlaps.get(key) ?? 0) + 1);
    }
  }
}
const similarPairs: { a: string; b: string; score: number }[] = [];
for (const [key, shared] of overlaps) {
  const [a, b] = key.split('|') as [string, string];
  const union = (sentenceSets.get(a)?.size ?? 0) + (sentenceSets.get(b)?.size ?? 0) - shared;
  if (union === 0) continue;
  const score = shared / union;
  if (score >= JACCARD_LIMIT) similarPairs.push({ a, b, score });
}
similarPairs.sort((left, right) => right.score - left.score);

const SCOPE_RANK: Record<Scope, number> = { A: 2, B: 1, unranked: 1, C: 0 };
for (const pair of similarPairs) {
  const strictest =
    SCOPE_RANK[scopeOf(pair.a)] >= SCOPE_RANK[scopeOf(pair.b)] ? scopeOf(pair.a) : scopeOf(pair.b);
  const severity = severityFor(strictest, 'reuse');
  if (severity === 'skip') continue;
  add(
    'reuse',
    severity,
    `${pair.a} ↔ ${pair.b}`,
    `正文相似度 ${(pair.score * 100).toFixed(0)}%，超过 ${JACCARD_LIMIT * 100}% 上限`,
  );
}

// ---- 门禁 5 · 段落结构 ----------------------------------------------------
// 正文的 h2 序列必须与决策页模板 v2 完全一致。这条同时替「词条页锚点导航」
// 兜底：导航项从同一份定义生成，所以正文一旦跑偏，锚点就会指向不存在的段落。
// 以前这两处是各写一遍、无人校验的，死锚点只能靠读者点下去才发现。

for (const term of terms) {
  const severity = severityFor(scopeOf(term.id), 'structure');
  if (severity === 'skip') continue;
  const { missing, unexpected, outOfOrder } = term.sectionDiff;
  if (missing.length === 0 && unexpected.length === 0 && !outOfOrder) continue;

  const parts: string[] = [];
  if (missing.length > 0) parts.push(`缺少 ${missing.join(' / ')}`);
  if (unexpected.length > 0) parts.push(`多出或拼错 ${unexpected.join(' / ')}`);
  if (outOfOrder) parts.push('顺序与模板不一致');
  add(
    'structure',
    severity,
    term.id,
    `${parts.join('；')}——模板 v2 共 ${TERM_SECTION_IDS.length} 段，当前正文 ${
      TERM_SECTION_IDS.length - missing.length + unexpected.length
    } 段`,
  );
}

// ---- 门禁 2 · 边界声明 ----------------------------------------------------

for (const term of terms) {
  const severity = severityFor(scopeOf(term.id), 'boundary');
  if (severity === 'skip') continue;
  if (typeof term.chain !== 'number') {
    add('boundary', severity, term.id, '缺少 chain——不知道该词条落在理解路径的第几站');
  }
  if (!term.hasBoundaries) {
    add(
      'boundary',
      severity,
      term.id,
      '缺少 boundaries——没有声明「它不解决什么」与「和邻居差在哪」',
    );
  }
}

// ---- 门禁 3 · 上手动作 ----------------------------------------------------

const tryItBlock = (body: string): string => {
  const match = body.match(/<h2\b[^>]*id="try-it"[^>]*>[\s\S]*?(?=<h2\b|$)/u);
  return match ? match[0].replace(/<[^>]+>/gu, ' ') : '';
};

for (const term of terms) {
  const severity = severityFor(scopeOf(term.id), 'action');
  if (severity === 'skip') continue;

  const block = tryItBlock(term.body);
  if (EMPTY_ACTION_PATTERNS.some((pattern) => pattern.test(block))) {
    add(
      'action',
      severity,
      term.id,
      '「亲自试一下」命中空动作黑名单（写下三件事 / 再在本站搜索相邻词条）',
    );
    continue;
  }
  // 存到局部变量，否则在闭包里会失去 undefined 窄化
  const action = term.minAction;
  if (!action) {
    add('action', severity, term.id, '缺少 minAction——「亲自试一下」没有结构化的上手动作');
    continue;
  }
  if (EMPTY_ACTION_PATTERNS.some((pattern) => pattern.test(action))) {
    add('action', severity, term.id, `minAction 命中空动作黑名单：「${clip(action)}」`);
    continue;
  }
  if (!ACTION_PROOF_PATTERNS.some((pattern) => pattern.test(action))) {
    add(
      'action',
      severity,
      term.id,
      `minAction 缺少可验证的完成标志（需含时长如「约 15 分钟」或命令如 \`code\`）：「${clip(action)}」`,
    );
  }
}

// ---- 门禁 4 · 配额与近义（永远只告警）--------------------------------------

const domainCounts = new Map<string, number>();
for (const term of terms) {
  domainCounts.set(term.domain, (domainCounts.get(term.domain) ?? 0) + 1);
}
const distinctCounts = new Set(domainCounts.values());
if (domainCounts.size >= 4 && distinctCounts.size === 1) {
  add(
    'quota',
    'warn',
    '(全库)',
    `${domainCounts.size} 个领域每个恰好 ${[...distinctCounts][0]} 条——这是「每域固定条数」配额仍在起作用的典型痕迹`,
  );
}

for (const cluster of report.details.synonymClusters) {
  add(
    'quota',
    'warn',
    cluster.members.join(', '),
    `[${cluster.domain}] 疑似近义/包含关系簇共 ${cluster.members.length} 条：` +
      `${cluster.pairs.slice(0, 3).join('；')}——需人工复核是真碎片还是真区分`,
  );
}

// ---------------------------------------------------------------------------
// 报告
// ---------------------------------------------------------------------------

const header = STRICT ? '内容质量门禁未通过' : '内容质量问题（警告模式，不阻断 CI）';

console.log(STRICT ? '内容质量门禁（严格模式）' : '内容质量门禁（警告模式）');
console.log('='.repeat(74));
if (!HAS_TIERS) {
  console.log(
    '档位说明：未找到 reports/term-tiers.csv（由 I6-01 产出），当前全部词条按「未分档」处理，一律只告警。',
  );
}
console.log(
  `词条 ${terms.length} 条 · 基线指标：模板复用率 ${(report.metrics.templateReuseRate * 100).toFixed(1)}%` +
    ` · 链路覆盖率 ${(report.metrics.chainCoverage * 100).toFixed(1)}%` +
    ` · 图谱语义比 ${(report.metrics.semanticEdgeRatio * 100).toFixed(1)}%`,
);
console.log('-'.repeat(74));

const byRule = new Map<RuleId, Issue[]>();
for (const issue of issues) {
  const list = byRule.get(issue.rule) ?? [];
  list.push(issue);
  byRule.set(issue.rule, list);
}

for (const rule of ['reuse', 'structure', 'boundary', 'action', 'quota'] as const) {
  const list = byRule.get(rule) ?? [];
  const failCount = list.filter((issue) => issue.severity === 'fail').length;
  console.log(
    `\n${RULE_LABEL[rule]}：${list.length} 条` +
      `（fail ${failCount} / warn ${list.length - failCount}）`,
  );
  for (const issue of list.slice(0, DETAIL_LIMIT)) {
    const mark = issue.severity === 'fail' ? '✗' : '·';
    console.log(`   ${mark} ${issue.subject}：${issue.detail}`);
  }
  if (list.length > DETAIL_LIMIT) {
    console.log(`   …… 其余 ${list.length - DETAIL_LIMIT} 条见 reports/content-quality.json`);
  }
}

const failTotal = issues.filter((issue) => issue.severity === 'fail').length;
console.log('\n' + '='.repeat(74));
console.log(`合计 ${issues.length} 条（fail ${failTotal} / warn ${issues.length - failTotal}）`);

if (issues.length > 0) {
  const message = `${header}：共 ${issues.length} 条（fail ${failTotal}）\n\n${HINT}`;
  if (STRICT) throw new Error(message);
  console.warn(`\n${message}`);
} else {
  console.log('全部规则通过。');
}
