/**
 * 板块名册 —— 全站唯一的「一个板块一个名字」事实源。
 *
 * 为什么要有这个文件：这个站出过一次典型的信息架构事故——顶栏用一套名词
 * （开始学习 / 案例库 / 知识库），页面顶部还有一条「内容分类条」用另一套名词
 * （系统课程 / 案例实战 / 知识词条 / 阅读路线 / 概念关系）。同一批内容两套叫法、
 * 两组平级入口同时可见，用户点进任一板块都会看到一份自己刚学过的分类法被推翻。
 *
 * 现在的约定：
 *   1. 一个板块只允许有一个名字，写在这里，不允许在页面里另起别名。
 *   2. `navLabel` 是导航里的字（顶栏或页脚），`pageTitle` 是页面 <title> 与 H1 的字。
 *      两者必须能互相指认——通常是包含关系（例：案例库 ⊂ AI 产品案例库）。
 *   3. `surface` 决定它出现在哪一层：`primary` 进顶栏，`support` 进页脚。
 *      支撑层不允许再在页面顶部出现，否则「下沉」等于没做。
 */

export type SectionId = 'map' | 'learn' | 'cases' | 'knowledge' | 'routes' | 'graph';

export interface Section {
  id: SectionId;
  href: string;
  /** 导航里显示的名字 */
  navLabel: string;
  /** 页面标题与 H1 用的名字，必须包含 navLabel 的核心词 */
  pageTitle: string;
  /** 出现在哪一层 */
  surface: 'primary' | 'support';
  /** 一句话说清这个板块解决什么（给页头用） */
  purpose: string;
  /**
   * 读者带着什么问题来找这个板块——用读者的第一人称写，不要写成板块自述。
   * 首页的「四个入口」直接把这个字段摆给读者看：这里写什么、首页就显示什么，
   * 不存在「首页再翻译一遍」的第二处文案。
   */
  question: string;
}

export const SECTIONS: readonly Section[] = [
  {
    // 排在首位不是排版偏好：学习入口的答案是「我不知道该先学什么」，
    // 而认知链路是唯一直接回答这个问题的板块——`question` 就是那句话本身。
    // 学习库回答「我来练判断」，案例库回答「我要看一个完整场景」，
    // 知识库回答「我知道要找什么」——三者都预设了读者已经知道自己要做什么。
    id: 'map',
    href: '/map/',
    navLabel: '认知链路',
    pageTitle: 'AI 认知链路',
    surface: 'primary',
    purpose: '模型缺什么、每一层补什么——8 站递进路径，从第 1 站开始读。',
    question: '我不知道该先学什么',
  },
  {
    id: 'learn',
    href: '/learn/',
    navLabel: '开始学习',
    pageTitle: 'AI 产品判断学习库',
    surface: 'primary',
    purpose: '90 道判断题分三层递进，每层把六个阶段完整走一遍。',
    question: '我来练判断',
  },
  {
    id: 'cases',
    href: '/learn/cases/',
    navLabel: '案例库',
    pageTitle: 'AI 产品案例库',
    surface: 'primary',
    purpose: '在完整业务场景里连续查看证据、方案选择、风险与上线条件。',
    question: '我要看一个完整场景',
  },
  {
    id: 'knowledge',
    href: '/atlas/',
    navLabel: '知识库',
    pageTitle: '知识库',
    surface: 'primary',
    purpose: '按领域查找已收录的中文 AI 词条，再沿概念关系继续阅读。',
    question: '我知道要找什么',
  },
  {
    id: 'routes',
    href: '/routes/',
    navLabel: '阅读路线',
    pageTitle: '阅读路线',
    surface: 'support',
    purpose: '认知链路的展开阅读清单：按顺序读完一组词条，适合有明确目标时按需查阅。',
    question: '我想按顺序读完一组词条',
  },
  {
    id: 'graph',
    href: '/graph/',
    navLabel: '概念图谱',
    pageTitle: '概念图谱',
    surface: 'support',
    purpose: '查看词条之间的真实关系，适合在已知两个概念时确认它们如何相连。',
    question: '我想确认两个概念怎么相连',
  },
] as const;

export const sectionById = (id: SectionId): Section => {
  const section = SECTIONS.find((candidate) => candidate.id === id);
  if (!section) throw new Error(`未知板块：${id}`);
  return section;
};

/**
 * 顶栏：首页 + 认知链路 + 学习主线三项。
 *
 * 首页排在最前是站级约定，**不参与「板块顺序」那条契约**——本文件里
 * 「认知链路排在首位」说的是**内容板块**：链路回答的是其余板块都预设了的问题
 * （「我不知道该先学什么」）。首页回答的是更前面那个问题（「这个站是什么」），
 * 所以它排在板块之前，而不是插在板块队列里争第一。
 *
 * 首页进导航这件事本身是补一次缺口：此前它只在左上角 logo 上有入口，
 * 于是读者只能用位置描述它（「点左上角 logo 还有的那个页面」）——
 * 一个只能用位置指认、在导航里看不见的页面，等于在信息架构里不存在。
 *
 * `exact` 是必需的，不是保险：`'/'` 是每个路径的前缀，用 `startsWith` 判当前页会让
 * **所有**页面都把「首页」标成所在页。反过来，旧逻辑在 `/` 时匹配不到任何一项、
 * 顶栏零高亮——两个方向都要靠这个标记对齐。
 */
export const PRIMARY_NAVIGATION = [
  { href: '/', label: '首页', exact: true },
  ...SECTIONS.filter(({ surface }) => surface === 'primary').map(({ href, navLabel }) => ({
    href,
    label: navLabel,
    exact: false,
  })),
];

/** 页脚支撑层：阅读路线、概念图谱。搜索与「内容方法」由页脚自己补。 */
export const SUPPORT_NAVIGATION = SECTIONS.filter(({ surface }) => surface === 'support').map(
  ({ href, navLabel }) => ({ href, label: navLabel }),
);

/**
 * 这里曾经有一个 `NAVIGATION = [...PRIMARY_NAVIGATION, ...SUPPORT_NAVIGATION, 搜索]`，
 * 页脚直接把它整条铺出来，于是顶栏那三项在页脚又出现了一遍——「下沉」等于没做。
 * 已删除：需要顶栏就用 PRIMARY_NAVIGATION，需要页脚就用 SUPPORT_NAVIGATION，
 * 不要再造一个把两层混在一起的常量。
 */
