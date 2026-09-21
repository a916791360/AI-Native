import {
  flattenCatalogCandidates,
  loadCatalogPlan,
  PUBLISHED_CATALOG_BATCHES,
} from '../src/lib/content/catalog';
import { loadContentProductionPlan } from '../src/lib/content/production';
import { loadHandWrittenTerms, protectedTermIds } from '../src/lib/content/authorship';

/**
 * 查某条词条的「字段该写在哪一层」。
 *
 * ---------------------------------------------------------------------------
 * 为什么这个小工具值得存在
 * ---------------------------------------------------------------------------
 * 本仓库有**三条**写入路径，判断错了每一种错法都**不会报错**：
 *
 *   · 可生成词条（计划表 batch B/C/D）→ 字段写覆盖层 src/data/catalog-term-details.yml。
 *     写进它自己的 .mdx 会在下一次 generate:data 被静默抹掉。
 *   · 受保护词条（deep-content 批次 / hand-written-terms.yml）→ 字段写它自己的 .mdx。
 *     写进覆盖层完全无效（不经过 buildPublishedCatalogTerms，读不到）。
 *   · 计划表 batch A 的条目（12 条）→ 字段写它自己的 .mdx。
 *     它们**在计划表里**，但不属于 PUBLISHED_CATALOG_BATCHES，永远不参与生成，
 *     所以写进覆盖层同样完全无效。
 *
 * 后两条的错法都表现为「命令全绿、字段没落盘」，只有 diff 产物才看得出来。两次实测：
 *   · 2026-09-21 tool-use（受保护）的 boundaries 写进覆盖层 → 正文仍是 8 段；
 *   · 2026-09-21 retrieval（batch A）的 chain / boundaries 写进覆盖层 → .mdx 一个字没变。
 * 两次 validate:data 都全绿——schema 不要求这些字段必须存在。
 *
 * 运行：pnpm explain:authorship <id> [<id> ...]
 *       pnpm explain:authorship            # 不带参数则列出受保护与 batch A 词条
 */

const root = process.cwd();
const [production, handWritten, catalog] = await Promise.all([
  loadContentProductionPlan(root),
  loadHandWrittenTerms(root),
  loadCatalogPlan(root),
]);
const protectedIds = protectedTermIds(production, handWritten);

/** 计划表里 batch A 的条目 id —— 在计划表里，但不参与生成。 */
const batchAIds = new Set(
  flattenCatalogCandidates(catalog)
    .filter((candidate) => !PUBLISHED_CATALOG_BATCHES.includes(candidate.batch as 'B' | 'C' | 'D'))
    .map((candidate) => candidate.id),
);

const MDX_HINT =
  '→ chain / chainRole / boundaries / minAction 必须写在它自己的 .mdx frontmatter 里，' +
  '正文段落也直接写在 .mdx。写进 catalog-term-details.yml 完全无效。';
const OVERLAY_HINT =
  '→ chain / chainRole / boundaries / minAction 写在 src/data/catalog-term-details.yml（覆盖层）；' +
  '写进 .mdx 会在下次 generate:data 被抹掉。' +
  '若要升级为手写词条，先登记进 hand-written-terms.yml 并从覆盖层移除，两处不能并存。';

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
  console.log(`\n计划表 batch A（${batchAIds.size} 条，不参与生成，字段写在 .mdx）:`);
  for (const id of batchAIds) console.log(`  · ${id}`);
  console.log(
    '\n其余词条由计划表生成（batch B/C/D），字段写在 src/data/catalog-term-details.yml。',
  );
  process.exit(0);
}

for (const id of ids) {
  if (protectedIds.has(id)) {
    const isHandWritten = handWritten.terms.some((entry) => entry.id === id);
    console.log(
      `${id}：受保护（${isHandWritten ? 'hand-written-terms.yml' : '深度内容批次'}）${MDX_HINT}`,
    );
    continue;
  }
  if (batchAIds.has(id)) {
    console.log(`${id}：计划表 batch A（在计划表里但不参与生成）${MDX_HINT}`);
    continue;
  }
  console.log(`${id}：由计划表生成（batch B/C/D）${OVERLAY_HINT}`);
}
