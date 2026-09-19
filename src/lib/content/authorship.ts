import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

import type { ContentProductionPlan } from './production';
import { deepContentTermIds } from './production';
import { stableIdSchema } from './schema';

/**
 * 词条署名（authorship）—— 「这一条是谁写的」这件事的唯一定义处。
 *
 * ---------------------------------------------------------------------------
 * 为什么需要这个模块
 * ---------------------------------------------------------------------------
 * 这个仓库里的词条有两个来源，而它们在构建管线里的待遇完全不同：
 *
 *   1. 生成词条（catalog）
 *      `scripts/sync-catalog.ts` 会按 src/data/catalog-plan.yml **整份重写** 220 个
 *      目录词条的 .mdx —— frontmatter 与正文都是从计划重新序列化出来的。
 *      只写进 .mdx 而不写进计划的内容，会在下一次 `pnpm generate:data` 被静默清空。
 *
 *   2. 手写词条（authored）
 *      由人逐字撰写，生成器必须**完全不碰**。改完就是改完了。
 *
 * 目前手写词条有两个来源，本模块把它们合并成一个保护集合：
 *
 *   · 深度内容批次（src/data/content-production.yml 里 status ≠ planned 的批次）
 *     —— 原有的 93 条，它们另有 research/content-packets 研究包机制。
 *   · 手写清单（src/data/hand-written-terms.yml）
 *     —— I3「决策页重写」改造的词条。这条路径**不要求研究包**，
 *        因为决策页的验收标准是「读者能复述出它的边界」，
 *        靠的是正文里的真实机制与真实来源，不是一套额外的声索表。
 *
 * ---------------------------------------------------------------------------
 * 为什么必须有一个显式清单，而不是「改过的就自动保护」
 * ---------------------------------------------------------------------------
 * 「自动保护」做不到：生成器无法从文件内容反推它是人写的还是机器写的。
 * 而一旦漏保护，症状是**静默内容丢失**——文件被重写回模板句，
 * 构建、类型检查、schema 校验全部照常通过（重写后的文件完全合法）。
 * 所以保护必须是正向声明的：要手写，就先登记。
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

const handWrittenTermSchema = z
  .object({
    id: stableIdSchema,
    /** 为什么要保护它——写清属于哪一批，便于日后判断能否收编回生成管线。 */
    reason: z.string().min(10),
    rewrittenAt: z.string().regex(DATE_PATTERN, 'must use YYYY-MM-DD'),
  })
  .strict();

export const handWrittenTermsSchema = z
  .object({
    version: z.literal(1),
    terms: z.array(handWrittenTermSchema).min(1),
  })
  .strict();

export type HandWrittenTerm = z.infer<typeof handWrittenTermSchema>;
export type HandWrittenTerms = z.infer<typeof handWrittenTermsSchema>;

export const HAND_WRITTEN_TERMS_PATH = 'src/data/hand-written-terms.yml';

export async function loadHandWrittenTerms(root = process.cwd()): Promise<HandWrittenTerms> {
  const filePath = path.join(root, HAND_WRITTEN_TERMS_PATH);
  const source = await readFile(filePath, 'utf8');
  return handWrittenTermsSchema.parse(parseYaml(source));
}

/**
 * 生成器不得覆盖的词条 id 集合。
 *
 * 两个来源合并后必须**互不重叠**：同一条同时出现在深度内容批次与手写清单里，
 * 说明有人对「谁拥有这条词条」产生了分歧，此时应当报错而不是静默取并集
 * ——并集会让两边都以为自己在保护它，实际上谁都没在管它的内容标准。
 */
export function protectedTermIds(
  plan: ContentProductionPlan,
  handWritten: HandWrittenTerms,
): Set<string> {
  const deep = deepContentTermIds(plan);
  const overlap: string[] = [];
  const ids = new Set(deep);

  const seen = new Set<string>();
  for (const term of handWritten.terms) {
    if (seen.has(term.id)) {
      throw new Error(
        `[AUTHORSHIP] ${HAND_WRITTEN_TERMS_PATH}：${term.id} 列了不止一次——同一条词条只应有一个人负责。`,
      );
    }
    seen.add(term.id);
    if (deep.has(term.id)) overlap.push(term.id);
    ids.add(term.id);
  }

  if (overlap.length > 0) {
    throw new Error(
      `[AUTHORSHIP] 以下词条同时被「深度内容批次」与「手写清单」保护：${overlap.join(', ')}。\n` +
        '深度内容批次已自带研究包机制，手写清单不要重复登记——请从其中一处移除。',
    );
  }

  return ids;
}

/** 手写清单里引用了不存在的词条，是拼写错误，必须报错而不是忽略。 */
export function validateHandWrittenTerms(
  handWritten: HandWrittenTerms,
  knownTermIds: ReadonlySet<string>,
): string[] {
  return handWritten.terms
    .filter((term) => !knownTermIds.has(term.id))
    .map(
      (term) =>
        `[AUTHORSHIP] ${HAND_WRITTEN_TERMS_PATH}：${term.id} 不是已发布的词条 id` +
        `（原因栏写的是「${term.reason}」）。`,
    );
}
