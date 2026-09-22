import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

/**
 * 发版记录门禁。
 *
 * ---------------------------------------------------------------------------
 * 为什么版本表需要一道门禁
 * ---------------------------------------------------------------------------
 * 版本号在这个仓库里写在**四处**，而且没有任何一处会因另一处没改而报错：
 *
 *   · `package.json#version`       —— 机器读的口径；
 *   · README「当前版本」一行        —— 读者看到的当前状态；
 *   · README 版本历史表             —— 溯源（表里刻意不写 commit hash，
 *     因为「改 README → amend → hash 又变」会自指循环，溯源交给 git tag）；
 *   · `git tag -a vX.Y.Z`          —— 发版仪式的最后一环。
 *
 * 这几处一旦不一致，症状是静默的：CI 全绿、站点正常，只有翻 README 的人
 * 才发现「最新一版没写进去」。本脚本存在的直接原因是一次真实事故——
 * 追加 v0.9.0 那一行时把 v0.8.0 那一行覆盖掉了，而当时**没有任何门禁变红**。
 *
 * ---------------------------------------------------------------------------
 * 六条判据（前五条只看文件，第六条要 git tag）
 * ---------------------------------------------------------------------------
 *   1 · README「当前版本：vX.Y.Z」与 package.json 一致；
 *   2 · 版本历史表存在且非空（表被删空了也算「一致」，所以要单独判）；
 *   3 · 表格行版本号无重复（复制上一行忘了改版本号的典型形态）；
 *   4 · 表格行版本号严格递增（插错位置会让时间线与事实背离）；
 *   5 · 表格最后一行就是当前版本（防「历史追加了、当前版本行忘记更新」及其反向）；
 *   6 · 每个 git tag 都能在表格里找到对应行 —— **只有这条能抓到「漏了一行」**。
 *       前五条在「0.7.0 → 0.9.0、0.8.0 整行消失」的情况下全部通过，
 *       因为去掉一行既不重复、也不破坏递增、更不影响表尾。
 *
 * 第 6 条是单向的（tag ⊆ 表格，不是相等）：发版仪式是先改 README 再 commit、
 * 最后才打 tag，所以「表格里有、tag 还没有」是正常中间态。反过来则不成立——
 * 已经打出去的 tag 一定对应一次已发布的改动，表格里必须留痕。
 *
 * 浅克隆（GitHub Actions 默认 fetch-depth: 1）下拿不到 tag，此时第 6 条降级为
 * 提示而不是错误：宁可明说「这项没查」，也不要在没有证据时判定通过或失败。
 *
 * 运行：pnpm check:release-notes
 */

const README_PATH = 'README.md';
const PACKAGE_PATH = 'package.json';

/** 只认 `**当前版本：vX.Y.Z**` 这种写法，避免匹配到正文里随手提到的版本号。 */
const CURRENT_VERSION_PATTERN = /^\*\*当前版本：(v\d+\.\d+\.\d+)\*\*/mu;
/** 版本历史表的行：`| vX.Y.Z | YYYY-MM-DD | 说明 |`。 */
const TABLE_ROW_PATTERN = /^\|\s*(v\d+\.\d+\.\d+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/gmu;

const problems: string[] = [];
const notes: string[] = [];

interface Semver {
  major: number;
  minor: number;
  patch: number;
}

function parseSemver(version: string): Semver {
  const [major, minor, patch] = version.replace(/^v/u, '').split('.').map(Number);
  return { major: major ?? 0, minor: minor ?? 0, patch: patch ?? 0 };
}

/** 返回正数表示 left 更晚。只比三段数字，不处理预发布后缀（本仓库不用）。 */
function compareVersions(left: string, right: string): number {
  const a = parseSemver(left);
  const b = parseSemver(right);
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

/**
 * 读本地 tag。拿不到时返回**原因字符串**而不是空数组——
 * 「一个 tag 也没有」和「压根读不到 tag」必须区分：前者是首次发版前的正常状态，
 * 后者是浅克隆。混为一谈会让浅克隆被当成「没有 tag 要查」而静默通过。
 */
function readVersionTags(): string[] | string {
  try {
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
    if (shallow === 'true') {
      return '当前是浅克隆，本地没有 tag（CI 侧给 actions/checkout 加 fetch-depth: 0 即可开启此项）';
    }
    return execFileSync('git', ['tag', '-l', 'v*'], { cwd: process.cwd(), encoding: 'utf8' })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return '当前目录不是 git 仓库，或未安装 git';
  }
}

const readme = await readFile(README_PATH, 'utf8');
const packageVersion = `v${(JSON.parse(await readFile(PACKAGE_PATH, 'utf8')) as { version: string }).version}`;
const currentVersion = readme.match(CURRENT_VERSION_PATTERN)?.[1];
const tableRows = [...readme.matchAll(TABLE_ROW_PATTERN)].map((match) => ({
  version: match[1] ?? '',
  date: match[2] ?? '',
}));
const latestRow = tableRows.at(-1);

// ---- 1 · 当前版本行与 package.json 一致 ------------------------------------

if (!currentVersion) {
  problems.push(
    'README 里找不到「**当前版本：vX.Y.Z**」这一行。版本号写在 package.json 与 README 两处，' +
      '缺少这一行就没有「读者看到的版本」这个口径。',
  );
} else if (currentVersion !== packageVersion) {
  problems.push(
    `README 当前版本是 ${currentVersion}，package.json 是 ${packageVersion}。` +
      '两者必须一致——不一致时无法判断哪个才是要发的版本。',
  );
}

// ---- 2 · 版本历史表非空 ----------------------------------------------------

if (tableRows.length === 0) {
  problems.push('README 版本历史表是空的（或表格格式已被改到无法解析）。请恢复表格。');
}

// ---- 3 · 无重复 ------------------------------------------------------------

const occurrences = new Map<string, number>();
for (const row of tableRows) {
  occurrences.set(row.version, (occurrences.get(row.version) ?? 0) + 1);
}
for (const [version, count] of occurrences) {
  if (count > 1) {
    problems.push(`版本表里 ${version} 出现 ${count} 次。常见成因是复制上一行后忘了改版本号。`);
  }
}

// ---- 4 · 严格递增 ----------------------------------------------------------

for (let index = 1; index < tableRows.length; index += 1) {
  const previous = tableRows[index - 1]?.version ?? '';
  const current = tableRows[index]?.version ?? '';
  if (compareVersions(previous, current) > 0) {
    problems.push(
      `版本表顺序颠倒：第 ${index} 行 ${previous} 排在第 ${index + 1} 行 ${current} 之前。` +
        '表格按时间线阅读，乱序会让「哪一版更晚」这件事只能说不能看。',
    );
  }
}

// ---- 5 · 最后一行是当前版本 ------------------------------------------------

if (latestRow && currentVersion && latestRow.version !== currentVersion) {
  problems.push(
    `版本表最后一行是 ${latestRow.version}，但当前版本是 ${currentVersion}。` +
      '当前版本必须排在表尾——它是这条时间线的末端。',
  );
}

// ---- 6 · 每个 tag 都有对应表格行（唯一能抓到「漏行」的判据）----------------

const tags = readVersionTags();
if (typeof tags === 'string') {
  notes.push(`未校验「tag 是否都有表格行」：${tags}`);
} else if (tags.length === 0) {
  notes.push('未校验「tag 是否都有表格行」：本地没有任何 v* tag（首次发版前属正常）。');
} else {
  const tracked = new Set(tableRows.map((row) => row.version));
  const missing = tags.filter((tag) => !tracked.has(tag)).sort(compareVersions);
  if (missing.length > 0) {
    problems.push(
      `有 ${missing.length} 个已发布的 tag 在版本历史表里没有对应行：${missing.join('、')}。` +
        '表格是唯一的版本溯源（表里刻意不写 commit hash），缺一行就是这段历史在文档里不存在。' +
        '注意：这种缺失**不违反前五条判据**——少一行既不重复也不破坏递增，只能靠这一条发现。',
    );
  }
}

// ---- 报告 ------------------------------------------------------------------

console.log('发版记录门禁');
console.log('='.repeat(74));
console.log(
  `package.json ${packageVersion} · README 当前版本 ${currentVersion ?? '（缺失）'} · ` +
    `版本表 ${tableRows.length} 行` +
    (tableRows.length > 0 ? `（${tableRows[0]?.version} → ${latestRow?.version}）` : '') +
    ` · 已发布 tag ${typeof tags === 'string' ? '未读取' : `${tags.length} 个`}`,
);
for (const note of notes) console.log(`\n[提示] ${note}`);
for (const problem of problems) console.log(`\n[错误] ${problem}`);

if (problems.length > 0) {
  console.log('\n' + '='.repeat(74));
  console.log(`发版记录门禁未通过：${problems.length} 项。`);
  process.exit(1);
}
console.log('\n发版记录门禁通过：版本号四处一致，版本表完整且有序。');
