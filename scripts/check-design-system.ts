import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 设计系统门禁（design.md）。
 *
 * 只强制两条可以机器判定的硬约定，不做审美判断：
 *   1. 禁用中间字重。层级只能由 400 与 800 的落差承担——400 旁边放 600 读作
 *      「没调过」，400 旁边放 800 才读作「选过」。一旦允许 500–700，
 *      这套两级层级会悄悄退化回「哪儿都有一点粗」。
 *   2. 两级字重必须至少差 300，否则标题在中文里立不起来（见 tokens.css 注释）。
 */

const root = process.cwd();
const SOURCE_ROOT = path.join(root, 'src');
const SCAN_EXTENSIONS = new Set(['.css', '.astro']);
const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', '.astro']);

const BANNED_WEIGHTS = new Set(['500', '600', '650', '700', '750']);
const BANNED_KEYWORDS = new Set(['bold', 'bolder']);
const MIN_WEIGHT_GAP = 300;

const issues: string[] = [];
const fail = (message: string) => issues.push(message);

const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      files.push(...(await walk(full)));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
};

// ---- 1. 禁用中间字重 -------------------------------------------------------

const FONT_WEIGHT = /font-weight:\s*([^;{}]+)/g;
const files = (await walk(SOURCE_ROOT)).sort();

let declarations = 0;
let tokenised = 0;
const offenders: string[] = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(FONT_WEIGHT)) {
      declarations += 1;
      const value = (match[1] ?? '').trim().toLowerCase();
      const relative = `${path.relative(root, file)}:${index + 1}`;
      if (value.startsWith('var(--weight-')) tokenised += 1;
      if (BANNED_WEIGHTS.has(value) || BANNED_KEYWORDS.has(value)) {
        offenders.push(`${relative} 用了 font-weight: ${value}`);
      }
    }
  });
}

for (const offender of offenders) fail(offender);

// ---- 2. 两级字重必须拉开差距 ----------------------------------------------

const tokens = await readFile(path.join(SOURCE_ROOT, 'styles/tokens.css'), 'utf8');
const weightTokens = new Map(
  [...tokens.matchAll(/--weight-(body|display):\s*(\d+)/g)].map((match) => [
    match[1]!,
    Number(match[2]),
  ]),
);

const bodyWeight = weightTokens.get('body');
const displayWeight = weightTokens.get('display');

if (bodyWeight === undefined || displayWeight === undefined) {
  fail('tokens.css 必须同时定义 --weight-body 与 --weight-display');
} else {
  if (BANNED_WEIGHTS.has(String(bodyWeight)) || BANNED_WEIGHTS.has(String(displayWeight))) {
    fail(
      `--weight-body / --weight-display 不得取中间字重（当前 ${bodyWeight} / ${displayWeight}）`,
    );
  }
  if (displayWeight - bodyWeight < MIN_WEIGHT_GAP) {
    fail(
      `--weight-display(${displayWeight}) 与 --weight-body(${bodyWeight}) 只差 ${displayWeight - bodyWeight}，至少要有 ${MIN_WEIGHT_GAP}`,
    );
  }
}

// ---- 报告 ------------------------------------------------------------------

if (issues.length > 0) {
  throw new Error(`Design system invalid:\n- ${issues.join('\n- ')}`);
}

console.log(
  `Design system valid: 扫描 ${files.length} 个文件、${declarations} 处 font-weight（其中 ${tokenised} 处走设计令牌）；字重档位 ${bodyWeight} / ${displayWeight}，无中间字重。`,
);
