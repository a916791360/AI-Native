import { loadContentProductionPlan } from '../src/lib/content/production';
import { loadHandWrittenTerms, protectedTermIds } from '../src/lib/content/authorship';

/**
 * 查某条词条的「字段该写在哪一层」。
 *
 * ---------------------------------------------------------------------------
 * 为什么这个小工具值得存在
 * ---------------------------------------------------------------------------
 * 本仓库有两条互斥的写入路径，判断错了**两种错法都不会报错**：
 *
 *   · 把覆盖层的字段写进受保护词条的 .mdx → 下一次 generate:data 被静默抹掉；
 *   · 把受保护词条的字段写进覆盖层        → 生成器根本读不到它，改动完全无效。
 *
 * 第二种错法 2026-09-21 真实发生过：把 tool-use 的 boundaries 写进
 * src/data/catalog-term-details.yml，跑完 generate:data 后正文仍是 8 段，
 * 而 validate:data 全绿——因为 schema 不要求 boundaries 必须存在。
 * 当时靠逐个 digest 比对才发现，成本远高于跑一次这个脚本。
 *
 * 运行：pnpm explain:authorship <id> [<id> ...]
 *       pnpm explain:authorship            # 不带参数则列出全部手写词条
 */

const root = process.cwd();
const production = await loadContentProductionPlan(root);
const handWritten = await loadHandWrittenTerms(root);
const protectedIds = protectedTermIds(production, handWritten);

const ids = process.argv.slice(2);

if (ids.length === 0) {
  const deep = [...protectedIds].filter(
    (id) => !handWritten.terms.some((entry) => entry.id === id),
  );
  console.log('手写词条（src/data/hand-written-terms.yml，字段写在 .mdx）:');
  for (const entry of handWritten.terms) console.log(`  · ${entry.id}`);
  console.log(
    `\n深度内容批次（src/data/content-production.yml，字段写在 .mdx）共 ${deep.length} 条。`,
  );
  console.log('其余词条由计划表生成，字段写在 src/data/catalog-term-details.yml。');
  process.exit(0);
}

for (const id of ids) {
  if (protectedIds.has(id)) {
    const isHandWritten = handWritten.terms.some((entry) => entry.id === id);
    console.log(
      `${id}：受保护（${isHandWritten ? 'hand-written-terms.yml' : '深度内容批次'}）` +
        '→ chain / chainRole / boundaries / minAction 必须写在它自己的 .mdx frontmatter 里，' +
        '正文段落也直接写在 .mdx。写进 catalog-term-details.yml 完全无效。',
    );
    continue;
  }
  console.log(
    `${id}：由计划表生成 → chain / chainRole / boundaries / minAction 写在 ` +
      'src/data/catalog-term-details.yml（覆盖层）；写进 .mdx 会在下次 generate:data 被抹掉。' +
      '若要升级为手写词条，先登记进 hand-written-terms.yml 并从覆盖层移除，两处不能并存。',
  );
}
