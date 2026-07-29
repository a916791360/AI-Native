---
termId: prompt
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - google-intro-prompting
  - aws-prompt-engineering
timeBoundary: 提示组成原则相对稳定；不同模型支持的角色、长度和格式能力以 2026-07-29 产品文档为准。
claims:
  - id: prompt-components
    statement: 提示词可以包含任务、上下文、示例和输出约束，用于表达模型当前需要完成的工作。
    evidenceType: definition
    sourceIds:
      - google-intro-prompting
      - aws-prompt-engineering
  - id: test-driven-iteration
    statement: 提示设计应以明确成功标准和固定样例反复评测，而不是只凭一次满意输出判断质量。
    evidenceType: practice
    sourceIds:
      - google-intro-prompting
      - aws-prompt-engineering
  - id: prompt-not-guarantee
    statement: 更详细的提示词可以减少歧义，但不能保证事实正确、安全合规或稳定执行。
    evidenceType: boundary
    sourceIds:
      - aws-prompt-engineering
---

## 编辑说明

避免把提示词描述为魔法指令。示例用客服摘要任务展示目标、材料、约束和验收标准四个组成部分。
