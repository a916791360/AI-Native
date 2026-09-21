import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

import { loadTerms } from './lib/content-quality';

/**
 * A/B/C 档位表门禁（《迭代开发说明书》I6-01 验收）。
 *
 * ---------------------------------------------------------------------------
 * 这道门禁检查三件事
 * ---------------------------------------------------------------------------
 *   1 · 结构完整 —— 每条词条都有档位判定，没有「待定」，没有指向不存在词条的孤立判定；
 *   2 · 复核留痕 —— reviewed: true 的条目必须写 note，否则「人工复核」会退化成「人工随意」；
 *   3 · 骨架在 A —— src/data/chain.yml 的 site coreTerms 必须都是 A 档（见下方「骨架规则」）。
 *
 * ---------------------------------------------------------------------------
 * 为什么档位表本身需要一道门禁
 * ---------------------------------------------------------------------------
 * 这张表不是「内容清单」，而是**门禁的输入**：A 档违规会让 CI 红、B 档只警告、
 * C 档豁免（整改总则约束 3）。所以它一旦出错，后果不是「表格不好看」，而是：
 *
 *   · 漏一条  → 该 fail 的词条被静默豁免，问题永远浮不出来；
 *   · 多一条  → 未达标的词条被判 fail，CI 常红，团队开始绕过门禁；
 *   · 人工改了档位却不写原因 → 三个月后没人知道为什么它是 A 而不是 B，
 *     下一个人只能照着现状继续猜——「人工复核」就退化成「人工随意」。
 *
 * 最后一条是本脚本存在的主要理由：**改动原因必须留痕**，否则复核不可追溯。
 *
 * 运行：pnpm check:term-tiers
 */

const root = process.cwd();
const TIERS_PATH = 'src/data/term-tiers.yml';
/** 说明书 I6-01 给出的 A 档规模区间：显著超出说明标准太松，显著不足说明漏判。 */
const A_TIER_EXPECTED_MIN = 40;
const A_TIER_EXPECTED_MAX = 60;

interface TiersFileEntry {
  id: string;
  tier: string;
  signals?: string[];
  reviewed?: boolean;
  note?: string;
}

const problems: string[] = [];
const warnings: string[] = [];

const terms = await loadTerms(root);
const knownIds = new Set(terms.map((term) => term.id));

const source = await readFile(path.join(root, TIERS_PATH), 'utf8').catch(() => '');
if (!source.trim()) {
  problems.push(
    `缺少 ${TIERS_PATH}——没有档位表，门禁无法按档位生效（全部词条会被判为 C 档豁免）。`,
  );
}

const parsed = parseYaml(source) as { terms?: TiersFileEntry[] } | undefined;
const entries = parsed?.terms ?? [];

const seen = new Map<string, number>();
const counts = { A: 0, B: 0, C: 0 };
const reviewedWithoutNote: string[] = [];

entries.forEach((entry, index) => {
  const id = typeof entry.id === 'string' ? entry.id : '';
  const tier = typeof entry.tier === 'string' ? entry.tier.toUpperCase() : '';

  if (!id) {
    problems.push(`第 ${index} 条缺少 id。`);
    return;
  }
  const previous = seen.get(id);
  if (previous !== undefined)
    problems.push(`${id}：重复判定（第 ${previous} 条与第 ${index} 条）。`);
  seen.set(id, index);

  if (!knownIds.has(id)) {
    problems.push(`${id}：不是真实词条 id——档位表指向不存在的词条，说明改名或删除后没有同步。`);
    return;
  }
  if (tier !== 'A' && tier !== 'B' && tier !== 'C') {
    problems.push(`${id}：档位是「${entry.tier}」，只能是 A / B / C，不允许「待定」。`);
    return;
  }

  counts[tier] += 1;

  // 人工终判必须留痕：只改 tier 不写 note，等于把判断依据丢给下一个人去猜。
  if (entry.reviewed === true && (typeof entry.note !== 'string' || entry.note.trim().length < 4)) {
    reviewedWithoutNote.push(id);
  }
});

const missing = [...knownIds].filter((id) => !seen.has(id)).sort();
if (missing.length > 0) {
  problems.push(
    `${missing.length} 条词条没有档位判定：${missing.slice(0, 8).join('、')}` +
      `${missing.length > 8 ? ' 等' : ''}——跑 pnpm build:term-tiers 补齐后再复核。`,
  );
}
if (reviewedWithoutNote.length > 0) {
  problems.push(
    `${reviewedWithoutNote.length} 条人工终判没有写改动原因（note）：` +
      `${reviewedWithoutNote.slice(0, 8).join('、')}${reviewedWithoutNote.length > 8 ? ' 等' : ''}` +
      '——reviewed: true 的条目必须写清「为什么它是这一档」，否则复核不可追溯。',
  );
}

// ---------------------------------------------------------------------------
// 骨架规则：站点 coreTerms 必须是 A 档（I6-01 人工复核的结论，写成可执行的检查）
// ---------------------------------------------------------------------------
//
// 为什么这条要单独成规：第十三节把「在 8 站 coreTerms 里」列为可信度最高的正向信号
// （原话是「缺了它就讲不通下一站」），但机器打分只给它 1 分，于是 threshold(≥3) 会把
// 真正的骨架词条判成 B。2026-09-21 实测：35 条 coreTerms 里有 19 条被机器判为 B。
//
// 这不是打分阈值调一调就能解决的：阈值一松，一堆只是「被引用得多」的词条也会涌入 A 档，
// 而 A 档是要真按决策页规范写完的。所以规则写在这里——**重要性由 chain.yml 决定，
// 达标度由门禁决定**，两件事分开管：coreTerms 一律 A 档，写不完就过不了门禁。
const chainPath = path.join(root, 'src/data/chain.yml');
const chainSource = await readFile(chainPath, 'utf8').catch(() => '');
const chainStations =
  (parseYaml(chainSource) as
    { order: number; nameZh: string; coreTerms?: string[] }[] | undefined) ?? [];
const coreTermsNotA: string[] = [];
for (const station of chainStations) {
  for (const id of station.coreTerms ?? []) {
    const entry = entries.find((item) => item.id === id);
    if (!entry) continue;
    if (entry.tier.toUpperCase() !== 'A')
      coreTermsNotA.push(`${id}（第 ${station.order} 站，当前 ${entry.tier}）`);
  }
}
if (coreTermsNotA.length > 0) {
  problems.push(
    `${coreTermsNotA.length} 条站点 coreTerms 不在 A 档：${coreTermsNotA.slice(0, 6).join('、')}` +
      `${coreTermsNotA.length > 6 ? ' 等' : ''}——骨架词条是「缺了它就讲不通下一站」的那些，` +
      '必须受 A 档门禁约束。若是有意降档（正文尚未按决策页规范重写），请把 tier 改回 A ' +
      '并让内容达标；把 reviewed 设为 true 却留在 B 档不算通过。',
  );
}

if (counts.A < A_TIER_EXPECTED_MIN || counts.A > A_TIER_EXPECTED_MAX) {
  warnings.push(
    `A 档 ${counts.A} 条，落在说明书建议区间 ${A_TIER_EXPECTED_MIN}–${A_TIER_EXPECTED_MAX} 之外。` +
      '档位是门禁强弱的开关：A 越多、CI 越难绿；A 越少、越多问题被静默放过。' +
      '请确认这是有意的判定，而不是信号漏采。',
  );
}

const reviewed = entries.filter((entry) => entry.reviewed === true).length;
console.log('档位表门禁');
console.log('='.repeat(74));
console.log(
  `档位表 ${entries.length} 条 · A ${counts.A} / B ${counts.B} / C ${counts.C} · ` +
    `人工终判 ${reviewed} 条 · 词条总数 ${knownIds.size}`,
);
for (const warning of warnings) console.log(`\n[提示] ${warning}`);
for (const problem of problems) console.log(`\n[错误] ${problem}`);

if (problems.length > 0) {
  console.log('\n' + '='.repeat(74));
  console.log(`档位表门禁未通过：${problems.length} 项。`);
  process.exit(1);
}
console.log('\n档位表门禁通过：无待定、无孤立判定、人工终判均留有原因。');
