---
termId: prompt-evaluation
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - openai-evaluation-best-practices
  - anthropic-develop-tests
timeBoundary: 用固定目标、样本和标准比较提示词的原则相对稳定；具体评测平台、评分器、模型能力、API 和服务生命周期会持续变化。
claims:
  - id: repeatable-comparison
    statement: 提示词评测是围绕明确目标、固定样本和预先定义的成功标准，对提示词或系统版本进行可重复比较的过程。
    evidenceType: definition
    sourceIds:
      - openai-evaluation-best-practices
      - anthropic-develop-tests
  - id: representative-eval-suite
    statement: 有效评测应覆盖真实任务分布和边界案例，并按任务性质组合代码评分、人工判断或经过校准的模型评分。
    evidenceType: mechanism
    sourceIds:
      - openai-evaluation-best-practices
      - anthropic-develop-tests
  - id: scoped-score
    statement: 单个评测分数只说明系统在既定样本、标准、评分器和运行配置下的表现，不能替代持续监控、人工反馈与评测集更新。
    evidenceType: boundary
    sourceIds:
      - openai-evaluation-best-practices
      - anthropic-develop-tests
---

## 编辑说明

正文要把提示词评测写成“目标—样本—标准—比较—持续更新”的闭环，不缩减为主观挑选几个好答案。案例应同时展示典型、边界和失败样本，并说明评分器也需要校准。
