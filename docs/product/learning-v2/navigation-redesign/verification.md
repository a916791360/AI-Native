# AI-Native 入口与案例发现三方向验收

- 日期：2026-08-04
- 范围：3 个独立 HTML 方向
- 视口：1440x900、390x844、320x800
- 结论：通过设计 Gate 展示条件，等待方向选择

## 自动检查

- 3 个页面在 3 档视口均无页面级横向溢出。
- 3 个页面在桌面与移动视口均存在直接命名为“案例库”的全局入口。
- Playwright 未记录控制台错误或页面脚本错误。
- 生成 6 张展示截图：每个方向各一张桌面截图与一张移动截图。

## 人工检查

### 方向 A：任务闯关台

- 案例库同时出现在顶栏、三任务轨道和案例条带中，发现性最强。
- 桌面三轨道可直接比较内容规模与适用场景；移动端按任务顺序纵向展开。
- 视觉个性最强，但硬边、编号和高对比状态会比现有站点更活跃。

### 方向 B：清晰内容台

- 顶栏直达、搜索、内容域切换、案例筛选和案例结果同时可见，结构最接近参考站。
- 桌面信息密度最高；移动端核心导航、搜索和案例筛选仍在首屏，不依赖折叠菜单。
- 适合扩展更多案例，但后续生产实现需要约束双层导航，避免重复标签。

### 方向 C：学习路线牌

- 通过“从零系统学习 / 用案例练完整判断 / 遇到概念就查”直接表达用户任务。
- 案例入口在顶栏、页面索引和第二条路径中重复出现，层级清楚且没有卡片堆叠。
- 移动端首屏先完成去向判断，案例条目本身需要继续向下滚动查看。

## 截图

- `screenshots/01-task-quest-desktop.png`
- `screenshots/01-task-quest-mobile.png`
- `screenshots/02-clear-content-hub-desktop.png`
- `screenshots/02-clear-content-hub-mobile.png`
- `screenshots/03-learning-signpost-desktop.png`
- `screenshots/03-learning-signpost-mobile.png`

本轮仅新增设计规格、独立原型、截图与验收脚本；未将任一方向写入 Astro 生产页面。

## 方向 B 生产转译

- 选择记录：`direction-approved.md`
- 生产范围：首页、系统课程、案例库、全局导航与站内搜索入口
- 参考结构：按 VibeHub 的宏观布局固定为“单层顶栏 + 水平内容范围 + 左侧目录 + 右侧卡片网格”，不复制品牌资产和文案
- 直接入口：全局导航在桌面与移动端均显示“首页 / 系统课程 / 案例库 / 知识图鉴”；搜索常驻顶栏，首页与系统课程直接展示六阶段、24 题目录
- 案例库：沿用同一目录和卡片网格骨架，已核验案例和黄金案例草案均可从卡片直达 Gate 01
- 移动端：搜索改为独立一行；内容范围与阶段目录横向滚动；卡片网格收敛为单列
- 已移除：第二层全局导航、三任务首页、Level 说明带和长行式案例列表
- 内容边界：本轮没有改变术语生命周期、案例 YAML 或生成图谱

### 生产验证

- ESLint：通过
- Vitest：13 个测试文件、223 项断言通过
- Astro Check：97 个文件，0 error、0 warning、0 hint
- Astro Build：352 个页面生成成功
- Pagefind：300 个页面、4,380 个词完成索引
- Playwright：77 项通过、5 项按预期跳过，覆盖桌面与移动端导航、搜索、键盘、无障碍与页面溢出
- 视觉回归：主页、系统课程、案例库和案例概览共 8 张截图；1440x900、390x844、320x800 共 12 个页面视口组合无页面级横向溢出、控制台错误或缺失核心导航

### 生产截图

- `production-screenshots/home-desktop.png`
- `production-screenshots/home-mobile.png`
- `production-screenshots/course-desktop.png`
- `production-screenshots/course-mobile.png`
- `production-screenshots/case-library-desktop.png`
- `production-screenshots/case-library-mobile.png`
- `production-screenshots/case-overview-desktop.png`
- `production-screenshots/case-overview-mobile.png`

## 全站简约风格扩展验证

- 覆盖页面：首页、课程目录、判断题、案例库、案例概览、案例 Gate、图鉴、词条、路线目录、路线详情、搜索、图谱、内容方法与 404。
- 共享导航：所有正常内页显示内容分类条并正确高亮；阅读路线数量从 4 个 `.mdx` 事实源派生；404 不显示无关分类条。
- 视觉门禁：代表页桌面一级标题不超过 48px，移动端不超过 40px；5 档视口的全页面矩阵无横向溢出。
- 静态门禁：Prettier 通过；ESLint 通过；Astro Check 检查 98 个文件，0 error、0 warning、0 hint。
- 单元测试：13 个测试文件、223 项通过。
- 生产构建：352 个静态页面生成成功；Pagefind 索引 300 个页面、4,380 个词和 3 组筛选字段。
- 性能预算：通过；详情页统一样式改为按页面家族加载后，首页 CSS 为 13.4 KiB，低于 20.9 KiB 上限。
- 浏览器回归：80 项通过，6 项按设备条件跳过；覆盖搜索、筛选、图谱、键盘、无 JavaScript 阅读、无障碍、标题层级和页面溢出。
- 视觉档案：20 张全站发布候选截图、10 张课程截图和 12 张阶段 14 案例截图全部重新生成，未记录控制台错误、脚本错误或页面级横向溢出。
- 内容边界：本轮没有修改词条、关系或案例生命周期，因此未重生成 `term-registry.json` 和 `graph.json`。

### 新增路线详情截图

- `../../release-candidate/stage-10-screenshots/route-detail-1280x800.png`
- `../../release-candidate/stage-10-screenshots/route-detail-390x844.png`
