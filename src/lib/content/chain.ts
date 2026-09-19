import type { ChainStation, Route, Term } from './schema';

/**
 * 认知链路（第二坐标轴）的读取层。
 *
 * 为什么单独抽一个文件：链路的「谁在第几站」这件事要同时被三个地方读到——
 *   · /map/ 主入口（按站渲染，站内按 chainRole 排序）
 *   · 词条页的「链路定位」行（本词条在第几站、上一站 / 下一站是谁）
 *   · /routes/ 列表页（每条阅读路线属于第几站）
 * 三处各写一遍排序规则，迟早会出现「同一站在两个页面里顺序不同」的分叉。
 * 事实源仍然只有一个：src/data/chain.yml。
 */

export const CHAIN_ROLE_ORDER = ['intro', 'core', 'advanced'] as const;
export type ChainRole = (typeof CHAIN_ROLE_ORDER)[number];

/** 角色文案：说人话，不用 intro / core / advanced。 */
export const CHAIN_ROLE_LABELS: Record<ChainRole, string> = {
  intro: '先读这个',
  core: '主干',
  advanced: '深入',
};

const roleRank = (role: ChainRole | undefined): number => {
  if (!role) return CHAIN_ROLE_ORDER.length;
  const index = CHAIN_ROLE_ORDER.indexOf(role);
  return index === -1 ? CHAIN_ROLE_ORDER.length : index;
};

/**
 * 按 chainRole 排序：intro → core → advanced → 未标注。
 * 同角色内保持传入顺序（调用方通常已按 priority / 名称排好），
 * 因此这里是稳定排序，不会把内容顺序打乱。
 */
export const sortByChainRole = <T extends { chainRole?: ChainRole }>(items: readonly T[]): T[] =>
  [...items].sort((left, right) => roleRank(left.chainRole) - roleRank(right.chainRole));

export interface ChainStationView extends ChainStation {
  /** 上一站 / 下一站，首尾各缺一个。 */
  previous?: ChainStation;
  next?: ChainStation;
}

/** 按 order 排好并补齐前后站引用。 */
export const buildStationViews = (stations: readonly ChainStation[]): ChainStationView[] => {
  const sorted = [...stations].sort((left, right) => left.order - right.order);
  return sorted.map((station, index) => ({
    ...station,
    previous: sorted[index - 1],
    next: sorted[index + 1],
  }));
};

/** 按站号取词条，站内已按 chainRole 排好序。 */
export const groupTermsByStation = (terms: readonly Term[]): Map<number, Term[]> => {
  const grouped = new Map<number, Term[]>();
  for (const term of terms) {
    if (typeof term.chain !== 'number') continue;
    const bucket = grouped.get(term.chain);
    if (bucket) bucket.push(term);
    else grouped.set(term.chain, [term]);
  }
  for (const [order, bucket] of grouped) {
    grouped.set(order, sortByChainRole(bucket));
  }
  return grouped;
};

/** 词条 → 它在链路里的位置。未打 chain 的词条返回 undefined。 */
export interface TermChainPosition {
  order: number;
  role?: ChainRole;
  station: ChainStation;
  previous?: ChainStation;
  next?: ChainStation;
}

export const resolveTermChainPosition = (
  term: Pick<Term, 'chain' | 'chainRole'>,
  stations: readonly ChainStation[],
): TermChainPosition | undefined => {
  if (typeof term.chain !== 'number') return undefined;
  const views = buildStationViews(stations);
  const index = views.findIndex((station) => station.order === term.chain);
  if (index === -1) return undefined;
  const station = views[index]!;
  return {
    order: station.order,
    role: term.chainRole as ChainRole | undefined,
    station,
    previous: station.previous,
    next: station.next,
  };
};

/**
 * 每条阅读路线归属哪一站：取「该路线章节里的词条落点最多的那一站」。
 *
 * 不要求一条路线只属于一站（一条路线经常会横跨两三站），
 * 所以返回全部命中站号并排序，由调用方决定展示方式。
 * 这条映射是 I2-05 的关键——路线是「展开清单」，链路是主路径，
 * 两者必须能互相指认，否则 /routes/ 就还是埋在页脚的一张孤立清单。
 */
export const resolveRouteStations = (
  route: Route,
  termsById: ReadonlyMap<string, Term>,
): number[] => {
  const tally = new Map<number, number>();
  for (const chapter of route.chapters) {
    for (const step of chapter.terms) {
      const chain = termsById.get(step.id)?.chain;
      if (typeof chain !== 'number') continue;
      tally.set(chain, (tally.get(chain) ?? 0) + 1);
    }
  }
  return [...tally.entries()].sort((left, right) => right[1] - left[1]).map(([order]) => order);
};

/** 覆盖率口径与 scripts/lib/content-quality.ts 的「链路覆盖率」保持同源。 */
export const chainCoverage = (terms: readonly Term[]): { covered: number; total: number } => ({
  covered: terms.filter((term) => typeof term.chain === 'number').length,
  total: terms.length,
});
