---
termId: prompt-chaining
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - anthropic-effective-agents
  - least-to-most-prompting
timeBoundary: 提示链作为固定多步工作流的模式相对稳定；模型调用格式、上下文传递、并行能力和成本应按具体供应商与版本复核。
claims:
  - id: sequential-model-calls
    statement: 提示链把任务组织为一系列模型调用，每一步处理前一步的输出，并把中间结果传给下一步。
    evidenceType: definition
    sourceIds:
      - anthropic-effective-agents
  - id: intermediate-gates
    statement: 固定链路可以在中间步骤加入程序化检查，使大任务变成更容易验证的局部任务，并在偏离时提前停止或返工。
    evidenceType: mechanism
    sourceIds:
      - anthropic-effective-agents
      - least-to-most-prompting
  - id: fixed-flow-tradeoff
    statement: 提示链适合能清晰预分解的任务，会以更多调用、延迟和上下文传递换取可检查性；流程高度动态时固定链路可能过于僵硬。
    evidenceType: boundary
    sourceIds:
      - anthropic-effective-agents
---

## 编辑说明

正文要把提示链写成应用编排的多次调用，不与单次提示中的思维步骤混为一谈。案例应包含中间产物、检查 Gate 和失败处理，并明确额外延迟与成本。
