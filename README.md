# AI-Native

AI-Native 是面向中文 AI 初学者与产品人的渐进式 AI 知识图鉴，帮助用户从听懂术语，逐步进阶到判断业务场景并设计基础 AI 方案。

## 当前阶段

产品规格和详细实施计划已于 2026-07-29 书面批准，当前已经完成：

- 阶段 0：仓库与产品资料整理。
- 阶段 1：Astro 工程骨架、本地质量命令和持续集成。
- 阶段 2：内容 Schema、12 个领域、12 个代表词条、关系规则、RAG 草稿路线与确定性生成管线。

下一步是阶段 3 的视觉基础与页面骨架。业务页面、搜索、交互图谱和批量内容仍未实施，项目尚未部署。

正式视觉将在阶段 3 使用 `$huashu-design` 完成三套真实 HTML 方向稿和截图；用户选定并记录 Gate 后，才进入 Astro 生产实现。当前首页仅用于工程烟雾测试。

## 关键文档

- [产品与技术设计规格](docs/superpowers/specs/2026-07-29-ai-native-design.md)
- [详细实施计划](docs/superpowers/plans/2026-07-29-ai-native-implementation-plan.md)
- [设计方向确认](docs/product/direction-approved.md)
- [品牌上下文](docs/product/brand-spec.md)
- [决策日志](docs/product/decision-log.md)
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

## 首版边界

首版采用静态内容架构，不包含账号、后端 CMS、AI 问答、资讯流、付费或社区。推送、创建 Pull Request 和部署均需用户明确授权。
