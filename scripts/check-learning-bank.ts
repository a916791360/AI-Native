import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { LEARNING_QUESTIONS, PM_ACTIONS } from '../src/data/learning/index';
import { LEARNING_MODULES } from '../src/data/learning/modules';
import { TIER1_QUESTIONS } from '../src/data/learning/questions/tier1';
import { TIER2_QUESTIONS } from '../src/data/learning/questions/tier2';
import { TIER3_QUESTIONS } from '../src/data/learning/questions/tier3';
import { LEARNING_TIERS } from '../src/data/learning/tiers';

const root = process.cwd();
const AUTHORED_BY_TIER = [TIER1_QUESTIONS, TIER2_QUESTIONS, TIER3_QUESTIONS];

const QUESTIONS_PER_TIER = 30;
const QUESTIONS_PER_MODULE = 5;
const POSITION_TOLERANCE = 0.4;

const issues: string[] = [];
const fail = (message: string) => issues.push(message);

interface TermRecord {
  id: string;
  nameZh: string;
}
const registry = JSON.parse(
  await readFile(path.join(root, 'src/generated/term-registry.json'), 'utf8'),
) as { terms: TermRecord[] };
const termsById = new Map(registry.terms.map((term) => [term.id, term]));

const EMOJI = /\p{Extended_Pictographic}/u;
const MARKDOWN = /(\*\*|^#\s|\[[^\]]+\]\([^)]+\)|`)/m;

// ---- 1. 规模与编号 ---------------------------------------------------------

if (LEARNING_TIERS.length !== 3) fail(`应有 3 层，实际 ${LEARNING_TIERS.length} 层`);
if (LEARNING_MODULES.length !== 6) fail(`应有 6 个阶段，实际 ${LEARNING_MODULES.length} 个`);
if (LEARNING_QUESTIONS.length !== QUESTIONS_PER_TIER * 3) {
  fail(`题库应有 ${QUESTIONS_PER_TIER * 3} 题，实际 ${LEARNING_QUESTIONS.length} 题`);
}

AUTHORED_BY_TIER.forEach((questions, tierIndex) => {
  const tier = LEARNING_TIERS[tierIndex]!;
  if (questions.length !== QUESTIONS_PER_TIER) {
    fail(`${tier.id} 应有 ${QUESTIONS_PER_TIER} 题，实际 ${questions.length} 题`);
  }
  questions.forEach((question, position) => {
    if (question.tierId !== tier.id) {
      fail(`${question.id} 的 tierId 是 ${question.tierId}，应属于 ${tier.id}`);
    }
    const expectedIndex = String(tierIndex * QUESTIONS_PER_TIER + position + 1).padStart(2, '0');
    if (question.index !== expectedIndex) {
      fail(`${question.id} 的 index 是 ${question.index}，应为 ${expectedIndex}`);
    }
    // 作者顺序：正确项必须在第一位，否则打散逻辑的前提不成立。
    if (question.options[0]?.assessment !== 'recommended') {
      fail(`${question.id} 作者顺序里第一个选项不是 recommended（打散逻辑依赖这个前提）`);
    }
  });
  // 每层内：6 个阶段各 5 题，且按阶段顺序排列
  LEARNING_MODULES.forEach((module, moduleIndex) => {
    const slice = questions.slice(
      moduleIndex * QUESTIONS_PER_MODULE,
      (moduleIndex + 1) * QUESTIONS_PER_MODULE,
    );
    if (slice.length !== QUESTIONS_PER_MODULE) {
      fail(`${tier.id} / ${module.id} 应有 ${QUESTIONS_PER_MODULE} 题`);
      return;
    }
    if (slice.some((question) => question.moduleId !== module.id)) {
      fail(`${tier.id} 第 ${moduleIndex + 1} 段应全部属于 ${module.id}`);
    }
  });
});

const indexes = LEARNING_QUESTIONS.map(({ index }) => index);
const expectedIndexes = Array.from({ length: LEARNING_QUESTIONS.length }, (_, position) =>
  String(position + 1).padStart(2, '0'),
);
if (indexes.join(',') !== expectedIndexes.join(',')) {
  fail('装配后的题目 index 不是从 01 开始的连续序列');
}

// ---- 2. 难度契约 -----------------------------------------------------------

const tierById = new Map(LEARNING_TIERS.map((tier) => [tier.id, tier]));

for (const question of LEARNING_QUESTIONS) {
  const tier = tierById.get(question.tierId);
  if (!tier) {
    fail(`${question.id} 的 tierId ${question.tierId} 不存在`);
    continue;
  }
  const { contract } = tier;
  const [minFacts, maxFacts] = contract.factCount;
  const [minOptions, maxOptions] = contract.optionCount;
  const recommended = question.options.filter(({ assessment }) => assessment === 'recommended');
  const conditional = question.options.filter(({ assessment }) => assessment === 'conditional');
  const risky = question.options.filter(({ assessment }) => assessment === 'risky');

  if (question.facts.length < minFacts || question.facts.length > maxFacts) {
    fail(
      `${question.id}（${tier.code}）facts 有 ${question.facts.length} 条，契约要求 ${minFacts}–${maxFacts} 条`,
    );
  }
  if (question.options.length < minOptions || question.options.length > maxOptions) {
    fail(
      `${question.id}（${tier.code}）有 ${question.options.length} 个选项，契约要求 ${minOptions}–${maxOptions} 个`,
    );
  }
  if (recommended.length !== 1) {
    fail(`${question.id} 有 ${recommended.length} 个 recommended 选项，应恰好 1 个`);
  }
  if (
    conditional.length < contract.minConditional ||
    conditional.length > contract.maxConditional
  ) {
    fail(
      `${question.id}（${tier.code}）有 ${conditional.length} 个 conditional 选项，契约要求 ${contract.minConditional}–${contract.maxConditional} 个`,
    );
  }
  if (risky.length < contract.minRisky) {
    fail(
      `${question.id}（${tier.code}）只有 ${risky.length} 个 risky 选项，契约要求至少 ${contract.minRisky} 个`,
    );
  }
  if (question.checks.length !== 3) {
    fail(`${question.id} 有 ${question.checks.length} 条 checks，应恰好 3 条`);
  }
}

// ---- 3. 引用可解析 ---------------------------------------------------------

for (const question of LEARNING_QUESTIONS) {
  if (question.references.length < 2) {
    fail(`${question.id} 只有 ${question.references.length} 条引用，至少 2 条`);
  }
  for (const reference of question.references) {
    const term = termsById.get(reference.id);
    if (!term) {
      fail(`${question.id} 引用了不存在的词条 ${reference.id}`);
    } else if (term.nameZh !== reference.label) {
      fail(
        `${question.id} 引用 ${reference.id} 的 label 是「${reference.label}」，应为「${term.nameZh}」`,
      );
    }
  }
}

// ---- 4. 唯一性与文案规范 ---------------------------------------------------

const unique = (values: string[], label: string) => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(`${label} 重复：${value}`);
    seen.add(value);
  }
};
unique(
  LEARNING_QUESTIONS.map(({ id }) => id),
  '题目 id',
);
unique(
  LEARNING_QUESTIONS.map(({ shortTitle }) => shortTitle),
  'shortTitle',
);
unique(
  LEARNING_QUESTIONS.map(({ scenario }) => scenario),
  'scenario',
);

for (const question of LEARNING_QUESTIONS) {
  const texts: Array<[string, string]> = [
    ['question', question.question],
    ['scenario', question.scenario],
    ['principle', question.principle],
    ...question.facts.map((fact, index) => [`facts[${index}]`, fact] as [string, string]),
    ...question.checks.map((check, index) => [`checks[${index}]`, check] as [string, string]),
    ...question.options.map(
      (option, index) => [`options[${index}].feedback`, option.feedback] as [string, string],
    ),
  ];
  for (const [field, value] of texts) {
    if (EMOJI.test(value)) fail(`${question.id} 的 ${field} 含 emoji`);
    if (MARKDOWN.test(value)) fail(`${question.id} 的 ${field} 含 markdown 语法`);
  }
}

// ---- 5. 答案位置分布（这次改造的核心） -------------------------------------

const positionCounts = new Array(Math.max(...LEARNING_QUESTIONS.map((q) => q.options.length))).fill(
  0,
);
for (const question of LEARNING_QUESTIONS) {
  const position = question.options.findIndex(({ assessment }) => assessment === 'recommended');
  positionCounts[position] += 1;
}
const total = LEARNING_QUESTIONS.length;
positionCounts.forEach((count, position) => {
  const share = count / total;
  if (share > POSITION_TOLERANCE) {
    fail(
      `正确项有 ${count} / ${total}（${Math.round(share * 100)}%）落在第 ${position + 1} 位，超过 ${POSITION_TOLERANCE * 100}% 上限`,
    );
  }
  if (count === 0) {
    fail(`没有任何一道题的正确答案落在第 ${position + 1} 位，打散失效`);
  }
});

// ---- 6. 知识覆盖与落地动作 -------------------------------------------------

// 主线必须真正连到词条库，否则「学习点很乱」会以另一种形式回来。
const referencedTermIds = new Set(LEARNING_QUESTIONS.flatMap((q) => q.references.map((r) => r.id)));
const MIN_TERM_COVERAGE = 100;
if (referencedTermIds.size < MIN_TERM_COVERAGE) {
  fail(
    `主线只引用到 ${referencedTermIds.size} 个词条，低于 ${MIN_TERM_COVERAGE} 个下限（词条库共 ${registry.terms.length} 个）`,
  );
}

// 每道题都要有「如果你是 PM，下一步做什么」，且不能是占位符。
const actionIds = Object.keys(PM_ACTIONS);
const questionIds = new Set(LEARNING_QUESTIONS.map(({ id }) => id));
for (const question of LEARNING_QUESTIONS) {
  const action = PM_ACTIONS[question.id];
  if (!action) {
    fail(`${question.id} 缺少 PM_ACTIONS 落地动作`);
    continue;
  }
  if (action.trim().length < 12) {
    fail(`${question.id} 的 PM_ACTIONS 只有 ${action.trim().length} 字，疑似占位符`);
  }
  if (EMOJI.test(action) || MARKDOWN.test(action)) {
    fail(`${question.id} 的 PM_ACTIONS 含 emoji 或 markdown 语法`);
  }
}
for (const id of actionIds) {
  if (!questionIds.has(id)) fail(`PM_ACTIONS 里的 ${id} 没有对应题目`);
}

// ---- 报告 ------------------------------------------------------------------

if (issues.length > 0) {
  throw new Error(`Learning bank invalid:\n- ${issues.join('\n- ')}`);
}

const label = (position: number) => String.fromCharCode(65 + position);
const distribution = positionCounts
  .map((count, position) => `${label(position)} ${count}`)
  .join(' · ');

console.log(
  `Learning bank valid: ${LEARNING_QUESTIONS.length} questions across ${LEARNING_TIERS.length} tiers × ${LEARNING_MODULES.length} modules; 答案位置 ${distribution}; 引用词条 ${new Set(LEARNING_QUESTIONS.flatMap((q) => q.references.map((r) => r.id))).size} 个。`,
);
