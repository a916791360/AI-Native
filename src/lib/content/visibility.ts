/**
 * 词条可见性 —— 「哪些词条可以作为独立入口出现」的唯一定义处（I6-03）。
 *
 * ---------------------------------------------------------------------------
 * 为什么需要它
 * ---------------------------------------------------------------------------
 * 词条有三种「不对外」的状态，但它们的处理方式不同，混在一起写就会出现
 * 「加了机制但漏了一处」——症状是静默的：目录里少一条没人发现，搜索里多一条
 * 也没人发现。所以判断逻辑只写一次，所有消费方都从这里取。
 *
 *   · draft（草稿）：正文没写完，**整页不对外**——不进 sitemap、不被搜索索引、
 *     不出现在目录与图谱里。
 *   · deprecated（已废弃）：正文还在、URL 还能打开（外部链接不该 404），
 *     但**不再作为独立入口**出现在领域目录、搜索、图谱、站点地图与站点指标中。
 *     它只在宿主词条页的「相关名词」里留一行，读者要找它时能被导向宿主页。
 *   · needs-review（待复核）：仍然对外，只是提示读者谨慎引用。
 *
 * 「不再单独成页」和「删掉」是两件事。诊断报告对 C 档给的处置是前者：
 * 文件保留，`replacedBy` 把流量导向正确的位置。
 */

/**
 * 判据只关心 status 一个字段，所以签名故意不绑死成 Astro 的 `Term`：
 * 脚本层读的是 frontmatter 原文，用的是自己的 `TermRecord`（`status: string`）。
 * 若签名写死 `Term`，脚本就只能复制一份 `status !== 'deprecated' && status !== 'draft'`——
 * 而「判据被复制成两份」正是本模块存在的理由。
 */
export interface TermStatusCarrier {
  status?: string;
}

export function isDraftTerm(term: TermStatusCarrier): boolean {
  return term.status === 'draft';
}

export function isDeprecatedTerm(term: TermStatusCarrier): boolean {
  return term.status === 'deprecated';
}

/**
 * 可独立选择的入口：既不是草稿，也不是已废弃。
 *
 * 这个词刻意不叫 isPublicTerm——「公开」在词条页那里已经被用成了
 * 「不是草稿」（deprecated 词条的 URL 也确实是对外可访问的）。
 * 目录/搜索/图谱要问的问题更窄：**它能被读者当入口选吗**。
 */
export function isSelectableTerm(term: TermStatusCarrier): boolean {
  return !isDraftTerm(term) && !isDeprecatedTerm(term);
}

/** 过滤出可独立选择的词条（保持入参顺序）。 */
export function selectableTerms<T extends { data: TermStatusCarrier }>(terms: readonly T[]): T[] {
  return terms.filter((entry) => isSelectableTerm(entry.data));
}
