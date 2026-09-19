/**
 * 导航从 `src/config/sections.ts` 派生——不要在页面里硬编码板块名，
 * 也不要在导航里另起别名（改名的成本应该只有一处）。
 *
 * 顶栏只放 `PRIMARY_NAVIGATION`，页脚只放 `SUPPORT_NAVIGATION`：
 * 两层各取所需，不再导出把它们混在一起的常量（混在一起就会有人整条铺到某一层上）。
 */
export { PRIMARY_NAVIGATION, SECTIONS, SUPPORT_NAVIGATION, sectionById } from './sections';
