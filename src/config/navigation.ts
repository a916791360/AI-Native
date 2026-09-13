/**
 * 头部主导航只保留学习主线:开始学习 → 案例库,加一个知识库入口。
 * 支撑层(阅读路线 / 概念图谱 / 搜索)下沉到页脚,见 NAVIGATION。
 * 首页由左上角 wordmark 承担,不再占用导航位。
 */
export const PRIMARY_NAVIGATION = [
  { href: '/learn/', label: '开始学习' },
  { href: '/learn/cases/', label: '案例库' },
  { href: '/atlas/', label: '知识库' },
] as const;

export const NAVIGATION = [
  ...PRIMARY_NAVIGATION,
  { href: '/routes/', label: '阅读路线' },
  { href: '/graph/', label: '概念图谱' },
  { href: '/search/', label: '搜索' },
] as const;
