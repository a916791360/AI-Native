export const PRIMARY_NAVIGATION = [
  { href: '/', label: '首页' },
  { href: '/learn/', label: '系统课程' },
  { href: '/learn/cases/', label: '案例库' },
  { href: '/atlas/', label: '知识图鉴' },
  { href: '/routes/', label: '阅读路线' },
  { href: '/graph/', label: '概念图谱' },
] as const;

export const NAVIGATION = [...PRIMARY_NAVIGATION, { href: '/search/', label: '搜索' }] as const;
