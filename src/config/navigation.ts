/**
 * 导航从 `src/config/sections.ts` 派生——不要在页面里硬编码板块名，
 * 也不要在导航里另起别名（改名的成本应该只有一处）。
 *
 * 顶栏只放学习主线三项；阅读路线、概念图谱与搜索下沉到页脚，作为「按需查阅」的支撑层。
 */
export {
  NAVIGATION,
  PRIMARY_NAVIGATION,
  SECTIONS,
  SUPPORT_NAVIGATION,
  sectionById,
} from './sections';
