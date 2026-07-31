# AI-Native

AI-Native 是面向中文 AI 初学者与产品人的渐进式 AI 知识图鉴，帮助用户从听懂术语，逐步进阶到判断业务场景并设计基础 AI 方案。

## 当前阶段

产品规格和详细实施计划已于 2026-07-29 书面批准，阶段 0-9 已完成，阶段 10 技术发布候选已建立，5 人任务型验收待执行：

- 阶段 0-2：完成仓库整理、Astro 工程、内容 Schema、12 个领域、关系规则和确定性生成管线。
- 阶段 3：使用 `$huashu-design` 完成三方向正式视觉 Gate，并将选定的「深空知识展柜」转译为生产页面系统。
- 阶段 4：完成 12 个已核验词条和一条包含 12 个顺序节点的 RAG 学习路线。
- 阶段 5：完成 Pagefind 中文生产索引、共享搜索体验、组合筛选、降级状态和 61 条固定查询门禁。
- 阶段 6：完成 Cytoscape 概念图谱、词条局部图、四类关系筛选、确定性布局、按需加载和结构化降级。
- 阶段 7：完成四条学习路线、十二领域首页、图鉴排序、内容方法、纠错入口、异常状态和发布元数据骨架。
- 阶段 8：已完成批次 B、C、D，目录事实源达到 300 个规范词条和 308 条关系。
- 阶段 9：完成首个 8 篇样板批、基础批 20 篇、协作批 20 篇和产品批 20 篇核验，达到 80 篇深度内容目标下限；其余 220 个词条保持目录状态。
- 阶段 10：完成五个固定视口、键盘关键路径、无障碍、无 JavaScript、异常状态、性能基线和视觉专家审查；真实目标用户任务测试尚未完成。
- 协作批：第一波“提示结构”、第二波“上下文管理”、第三波“任务执行”和第四波“复盘改进”均进入 `verified`，批次整体完成核验。
- 产品批：第一波“场景匹配”、第二波“方案选择”、第三波“人机控制”和第四波“质量风险”均进入 `verified`，批次整体完成核验。
- 发布边界：300 个词条全部进入默认公开面，公开图谱为 308 条关系，其中 80 个词条为深度核验内容。

下一步邀请至少 5 名目标用户完成任务型验收，记录完成率、卡点与误解并处理严重问题。项目尚未部署到公开站点；阶段 11 必须获得新的明确部署授权。

## 关键文档

- [产品与技术设计规格](docs/superpowers/specs/2026-07-29-ai-native-design.md)
- [详细实施计划](docs/superpowers/plans/2026-07-29-ai-native-implementation-plan.md)
- [设计方向确认](docs/product/direction-approved.md)
- [品牌上下文](docs/product/brand-spec.md)
- [决策日志](docs/product/decision-log.md)
- [阶段 10 发布候选审查](docs/product/release-candidate/stage-10-audit.md)
- [阶段 8 领域边界](docs/product/catalog/domain-boundaries.md)
- [阶段 8 名称归并评审](docs/product/catalog/merge-review.md)
- [方向演示](docs/product/design-demos/)

## 本地环境

- Node.js 24 LTS
- pnpm（以 `package.json#packageManager` 为准）

工程初始化完成后，统一使用以下命令：

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm validate:data
pnpm generate:data
pnpm run ci
```

`pnpm run ci` 是本地与 GitHub Actions 共用的质量入口，必须在合并前通过。不要省略 `run`；`pnpm ci` 是 pnpm 自身的冻结安装别名。

`src/generated/` 是由事实源生成并提交审查的文件。修改词条、路线、领域或关系后必须运行 `pnpm generate:data`；CI 会同时执行内容校验、生成物一致性检查和 Git 漂移检查。

canonical、Open Graph URL、结构化数据、公开 sitemap 和 robots 索引由 `PUBLIC_SITE_URL` 启用。未配置正式 HTTPS 地址时，预览构建保持 `noindex`，不会假装已经部署。

## 首版边界

首版采用静态内容架构，不包含账号、后端 CMS、AI 问答、资讯流、付费或社区。推送、创建 Pull Request 和部署均需用户明确授权。
