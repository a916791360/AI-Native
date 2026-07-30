---
termId: prompt-versioning
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - openai-prompt-engineering
  - openai-api-backward-compatibility
  - openai-evaluation-best-practices
timeBoundary: 截至 2026-07-30，OpenAI 建议新项目把生产提示词放入代码，并正在弃用可复用 Prompt 对象；具体迁移与关闭时间、模型快照和部署能力需持续复核。
claims:
  - id: versioned-execution-config
    statement: 提示词版本管理应记录提示词构建代码或模板、动态输入结构、模型标识与关键运行配置，使一次行为变更可以被定位和复现。
    evidenceType: definition
    sourceIds:
      - openai-prompt-engineering
      - openai-api-backward-compatibility
  - id: review-test-rollout
    statement: 生产提示词变更应经过代码评审、代表性测试和评测，并通过常规部署、配置或特性开关分阶段发布。
    evidenceType: mechanism
    sourceIds:
      - openai-prompt-engineering
      - openai-evaluation-best-practices
  - id: label-is-not-reproducibility
    statement: 只有版本号但没有输入结构、模型快照、工具配置和评测基线，仍无法可靠解释差异或安全回退。
    evidenceType: boundary
    sourceIds:
      - openai-api-backward-compatibility
      - openai-evaluation-best-practices
---

## 编辑说明

正文要把版本管理写成完整运行配置的变更记录，而不是给一段文字加 `v2`。案例应展示变更说明、评测差异、发布范围和回退条件，并提示供应商 Prompt 对象的生命周期会变化。
