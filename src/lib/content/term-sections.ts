/**
 * 决策页模板 v2 —— 词条正文的 9 段结构，唯一定义处。
 *
 * ---------------------------------------------------------------------------
 * 为什么必须只有一个定义处
 * ---------------------------------------------------------------------------
 * 这套结构在两个地方被用到，而它们以前是**各写一遍、没有任何机制保证一致**：
 *
 *   1. 词条正文里的 <h2 id="...">（写在 .mdx 里，内容作者维护）
 *   2. 词条页左侧的段落锚点导航（写在 src/pages/terms/[id].astro 的 sectionLinks）
 *
 * 改了一边忘了另一边，锚点导航就会少一项、或跳到错误位置，
 * **而构建不会报错**——死锚点是静默失败，只有读者点下去才知道。
 *
 * 现在两侧都从这里读：页面直接 map 出导航项；门禁（scripts/check-content-quality.ts
 * 的门禁 5）逐条比对「正文实际的 h2 序列」与 TERM_SECTION_IDS 是否相等。
 *
 * ---------------------------------------------------------------------------
 * v2 相对 v1 的唯一结构变化
 * ---------------------------------------------------------------------------
 * 在「它如何工作」之后、真实例子之前，插入第 4 段「必须澄清的误会」。
 *
 * 这是整份规范里最重要的一段，也是当前词库完全空白的一段：
 * 存量词条回答的是「它是什么」，而读者真正卡住的问题是「它和隔壁那个到底差在哪」。
 * 那段空白直接导致 MCP 被当成「梳理边界的方法」、Skill 被当成「长一点的提示词」。
 *
 * 段落骨架不变的部分（约束 4：模板结构可以留，模板句子必须清空）：
 * 8 段里质量尚可的「为什么需要它」「来源与修订」原样保留。
 *
 * 规格依据：《迭代开发说明书》第十二节「决策页内容规范」。
 */

export interface TermSection {
  /** 正文 <h2 id> 与锚点导航共用的 id。 */
  readonly id: string;
  /** 锚点导航上显示的短标签（可以比正文标题短）。 */
  readonly label: string;
  /**
   * 本段的硬要求。写在这里而不是只写在文档里，是为了让「改结构」和
   * 「改要求」发生在同一处——只改文档的话，脚本读不到，门禁也就无从校验。
   */
  readonly requirement: string;
}

export const TERM_SECTIONS: readonly TermSection[] = [
  {
    id: 'what-it-is',
    label: '它是什么',
    requirement: '必须含一句否定式边界：「它是一个 X，不是 Y」。',
  },
  {
    id: 'why-it-matters',
    label: '为什么需要它',
    requirement: '说清缺了它会怎样，而不是复述它是什么。',
  },
  {
    id: 'how-it-works',
    label: '它如何工作',
    requirement: '必须出现真实组件名与流程，禁止通用套话。',
  },
  {
    id: 'confusions',
    label: '必须澄清的误会',
    requirement: '2–3 组「甲 ≠ 乙」，且乙必须是真实存在的词条 id。',
  },
  {
    id: 'example',
    label: '真实例子',
    requirement: '必须是真的例子：有时间、有对象、有结果。',
  },
  {
    id: 'tradeoffs',
    label: '适合与不适合',
    requirement: '必须写出「不适用」的具体条件，不能只说「要看情况」。',
  },
  {
    id: 'try-it',
    label: '亲自试一下',
    requirement: '含时长与观察点。观察点比步骤重要——读者要带着问题动手。',
  },
  {
    id: 'next',
    label: '接下来学什么',
    requirement: '由链路邻站与真实关系驱动，不做模板分配。',
  },
  {
    id: 'sources-and-revisions',
    label: '来源与修订',
    requirement: '来源须是讲这个主题本身的权威源，不是相邻主题的博客。',
  },
] as const;

export const TERM_SECTION_IDS: readonly string[] = TERM_SECTIONS.map((section) => section.id);

/** 段落 id → 短标签，供锚点导航使用。 */
export const TERM_SECTION_LABEL_BY_ID: Readonly<Record<string, string>> = Object.fromEntries(
  TERM_SECTIONS.map((section) => [section.id, section.label]),
);

/** 新增/改名段落的唯一入口：在这里加一条，两侧自动跟上。 */
export const TERM_SECTION_CONFUSIONS_ID = 'confusions';

const H2_PATTERN = /<h2\b[^>]*\bid=["']([^"']+)["'][^>]*>/gu;

/** 按出现顺序取出正文里所有 <h2 id="...">。 */
export function extractSectionIds(body: string): string[] {
  return [...body.matchAll(H2_PATTERN)].map((match) => match[1] ?? '');
}

/**
 * 比对结果：为了让门禁能说清「哪一段不对」，不能只回一个布尔值。
 *   missing  —— 模板要求但正文没有（通常是新增段落忘了补）
 *   unexpected —— 正文有但模板没有（通常是段名拼错或旧模板残留）
 *   outOfOrder —— 段落齐全但顺序不对（顺序是学习路径的一部分，不能乱）
 */
export interface SectionStructureDiff {
  missing: string[];
  unexpected: string[];
  outOfOrder: boolean;
}

export function diffSectionStructure(body: string): SectionStructureDiff {
  const actual = extractSectionIds(body);
  const expected = [...TERM_SECTION_IDS];
  const actualSet = new Set(actual);

  const missing = expected.filter((id) => !actualSet.has(id));
  const unexpected = actual.filter((id) => !TERM_SECTION_IDS.includes(id));
  const outOfOrder =
    missing.length === 0 &&
    unexpected.length === 0 &&
    actual.join('\u0000') !== expected.join('\u0000');

  return { missing, unexpected, outOfOrder };
}

export const isSectionStructureValid = (diff: SectionStructureDiff): boolean =>
  diff.missing.length === 0 && diff.unexpected.length === 0 && !diff.outOfOrder;
