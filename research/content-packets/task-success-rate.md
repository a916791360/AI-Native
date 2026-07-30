---
termId: task-success-rate
batch: product-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - openai-evaluation-best-practices
  - anthropic-agent-evals
timeBoundary: 成功试验数除以有效试验数的计算相对稳定；成功定义、评分器、任务分布、模型版本和产品目标会持续变化。
claims:
  - id: passed-trials-over-total
    statement: 任务成功率是在已定义评测设置中，满足预先声明成功标准的成功试验数除以全部有效试验数。
    evidenceType: definition
    sourceIds:
      - openai-evaluation-best-practices
      - anthropic-agent-evals
  - id: task-trial-grader-outcome
    statement: 测量时应先定义任务输入、预期结果和评分器，对非确定性系统运行多次试验，并报告分子、分母和失败类别。
    evidenceType: mechanism
    sourceIds:
      - openai-evaluation-best-practices
      - anthropic-agent-evals
  - id: scoped-aggregate-metric
    statement: 成功率只适用于对应任务集、配置、试验次数和评分器，聚合百分比还可能掩盖失败严重度、部分成功、群体差异和业务影响。
    evidenceType: boundary
    sourceIds:
      - openai-evaluation-best-practices
      - anthropic-agent-evals
---

## 编辑说明

正文应展示分子、分母、无效试验处理和重复试验，不允许只给一个百分比。案例还要按失败类型拆解结果。
