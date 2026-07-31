# AI-Native 设计方向确认

## 已展示的三个真实方向

1. 方向 A「索引台」
   - HTML：design-demos/01-atlas-desk.html
   - 截图：design-demos/01-atlas-desk.png
   - 核心价值：分类、搜索、卡片索引和查找效率。
2. 方向 B「学习刊物」
   - HTML：design-demos/02-learning-journal.html
   - 截图：design-demos/02-learning-journal.png
   - 核心价值：由浅入深的学习引导与中文阅读体验。
3. 方向 C「关系场」
   - HTML：design-demos/03-relation-field.html
   - 截图：design-demos/03-relation-field.png
   - 核心价值：概念连接、知识图谱与独立品牌辨识度。

## 用户选择

在确认「C 的视觉身份 + A 的索引效率 + B 的学习路线」这一混合方案后，用户原话为：

> 好

## 后续设计约束

- 首页与品牌视觉：以 C「关系场」为母题。
- 知识图鉴和全局搜索：以 A「索引台」的效率为骨架。
- 学习路线和长内容阅读：以 B「学习刊物」的节奏为基础。
- 词条详情页：融合小白解释、来源证据、可视化示例和局部关系图。
- 不允许把整站简化成只有节点图，也不允许退化成 VibeHub 换皮卡片站。
- 当前记录只批准产品设计方向，不批准生产开发或技术实现。

## 正式视觉 Gate 状态

- 当前 C+A+B 记录是产品级视觉母题确认，不等同于生产视觉稿确认。
- 正式视觉工作必须在阶段 3 使用 `$huashu-design` skill。
- 必须基于相同真实内容产出三套完整 HTML 初稿和截图，展示后等待用户选择，不得自行决定。
- 三套方向必须在现有 C+A+B 约束内形成不同的生产级诠释，而不是重新改变产品定位。
- 用户选择后，在本文件追加三版文件、截图路径、方向说明和用户选择原话。
- 上述记录完成前，不得将阶段 1 烟雾测试页或任何单一探索稿升级为正式生产视觉。

## 2026-07-29 正式生产视觉 Gate

### 已展示方向与交付文件

1. 方向 1「深空知识展柜」
   - HTML：`design-demos/production-visual/01-dark-knowledge-gallery.html`
   - 桌面截图：`design-demos/production-visual/01-dark-knowledge-gallery-desktop.png`
   - 移动截图：`design-demos/production-visual/01-dark-knowledge-gallery-mobile.png`
   - 说明：以 Gallery Dark 为视觉逻辑，把真实 RAG 关系场作为知识展品；采用深黑负空间、克制衬线标题和按关系类型区分的线条。
2. 方向 2「关系索引报」
   - HTML：`design-demos/production-visual/02-relational-index-journal.html`
   - 桌面截图：`design-demos/production-visual/02-relational-index-journal-desktop.png`
   - 移动截图：`design-demos/production-visual/02-relational-index-journal-mobile.png`
   - 说明：以数据出版为逻辑，用问题、视觉证据与术语索引形成高密度编辑结构。
3. 方向 3「人文学习地图」
   - HTML：`design-demos/production-visual/03-humanist-learning-map.html`
   - 桌面截图：`design-demos/production-visual/03-humanist-learning-map-desktop.png`
   - 移动截图：`design-demos/production-visual/03-humanist-learning-map-mobile.png`
   - 说明：以 Data Humanism 为逻辑，把学习顺序、关系编号与解释组织成暖纸质感的可阅读地图。

### 用户选择原话

> 方向 1 吧

### 正式执行约束

- 正式生产视觉唯一主方向为方向 1「深空知识展柜」。
- 首页以暗场关系展柜为第一视觉信号；关系颜色只用于表达真实的前置、组成、比较和应用类型。
- 知识索引、路线与长文页面可以调整信息密度和阅读节奏，但必须继承同一颜色角色、字体层级、边框、焦点和暗场基底，不拼接方向 2 或方向 3 的视觉骨架。
- 本次选择批准将方向 1 转译为 Astro Token、Layout 和生产组件，不批准直接复制原型的单文件架构。

### 生产转译结果

- 共享 Token：`src/styles/tokens.css`
- 共享 Layout：`src/layouts/BaseLayout.astro`
- 正式首页：`src/pages/index.astro`
- 桌面验收截图：`design-demos/production-visual/production-home-desktop.png`
- 移动验收截图：`design-demos/production-visual/production-home-mobile.png`
- 图鉴抽查截图：`design-demos/production-visual/production-atlas-desktop.png`
- 词条抽查截图：`design-demos/production-visual/production-term-mobile.png`
- 验收结论：方向 1 已转译为六类页面和 404 的共享生产视觉系统；桌面、移动、无障碍和完整 CI 均通过。

## 2026-07-29 阶段 7 迭代说明

- 阶段 7 是已选定方向 1「深空知识展柜」的同项目页面扩展，不是新的视觉方向设计。
- 依据 `$huashu-design` 的「已选定方向后的迭代」豁免，本阶段不重新制作三方向初稿。
- 新增路线、方法、异常状态和元数据必须沿用现有 Token、边框、衬线层级、暗场基底与关系色角色，并通过桌面和移动端截图验收。
- 用户启动原话：`开始下一步阶段 7`。

## 2026-07-31 学习体验重构 Gate

### 已展示方向

1. 方向 A「课程脊柱」：以六个能力模块给出从基础到综合项目的完整顺序。
2. 方向 B「能力罗盘」：先选择当前目标，再生成能力学习组合。
3. 方向 C「案例工作台」：从真实产品问题进入判断步骤和可复用产出。

三版 HTML、共同规格和双端截图位于 `docs/product/learning-redesign/`。

### 用户选择原话

在建议采用“C 作为首页主方向、A 作为系统课程结构、B 暂不作为主入口”后，用户确认为：

> 好，按照你的思路来

### 生产执行约束

- 首页以方向 C「案例工作台」为主入口，让用户从真实业务判断开始，而不是先浏览词表。
- 学习中心采用方向 A「课程脊柱」，固定展示六个能力模块、每一模块的判断问题和学习产出。
- 词库、搜索、阅读路线和图谱继续作为学习中的知识基础设施，不再承担首页主任务。
- 首期不做登录、云端进度、付费、社区、证书或 AI 聊天老师；练习产出不得伪装为已保存进度。
- 所有生产页面继续继承方向 1「深空知识展柜」的 Token、排版、关系色、规则线和暗场视觉。

### 2026-07-31 交互修订

用户在查看生产页面后明确修订：不做要求用户输入文字的功能行为，学习应通过阅读情境、选择决策和查看即时反馈完成；同时案例数量需要扩展为循序渐进的 AI 题库。

- Huashu Design 的选定视觉方向保持不变，不重新开启视觉 Gate。
- 删除四段文本工作表、表单提交、页面内摘要和打印行为。
- 主学习内容调整为 6 个能力阶段、每阶段 4 题，共 24 道 AI 产品判断题。
- 每题固定提供情境、已知条件、三种可选决策、选择路径反馈、核心原则、检查清单和相关词条。
- 选择只用于当前页面即时反馈，不登录、不持久化、不伪装为学习进度。
