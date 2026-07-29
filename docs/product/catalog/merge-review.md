# 阶段 8 名称归并评审

- 状态：首版 ID 冻结前评审基线
- 日期：2026-07-29
- 结构化记录：`src/data/catalog-plan.yml#mergeReviews`

## 决策规则

1. 中文名、英文名、缩写和常见译名表达同一概念时，保留一个规范词条，其余作为别名或缩写。
2. 上下位概念、组成关系或应用关系不能因为名称接近而合并。
3. 产品语境和技术语境确有不同学习目标时可以拆分，但必须使用不同中文名、英文名和稳定 ID。
4. 规范 ID 一经进入公开目录不重命名；需要替换时使用 `deprecated` 与 `replacedBy`。

## 重点裁决

- `AI`、`人工智能技术` 归入 `artificial-intelligence`，不建立独立词条。
- `GenAI`、`AIGC` 归入 `generative-ai`；“AI 生成内容”视为常见用语而非另一个机制。
- `LLM`、`大型语言模型` 归入 `large-language-model`。
- `向量嵌入`、`Embeddings` 归入 `embedding`；`dense-vector` 保留为数据表示类型，不与嵌入过程合并。
- `文档分块`、`Chunking` 归入 `document-chunking`。
- `向量库`、`VDB` 归入 `vector-database`。
- `Agent` 归入 `ai-agent`；`agentic-workflow` 保留，因为它描述受控工作流而不是自主实体。
- `Function Calling` 归入 `tool-use` 的同族概念但不合并：前者是调用接口机制，后者是更宽的能力范畴。
- `可解释人工智能` 归入 `explainable-ai`；产品页面如何呈现解释属于 `explanation-interface`，两者不合并。
- `延迟`、`延迟预算` 和 `感知延迟` 分别描述系统指标、产品约束和用户体验，不合并。

结构化归并记录由自动校验保证目标存在，且同一个规范化别名不会分配给两个词条。
