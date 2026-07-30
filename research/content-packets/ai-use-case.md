---
termId: ai-use-case
batch: product-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - google-pair-user-needs
  - nist-ai-rmf-core
timeBoundary: 以用户任务、预期用途和运行情境界定场景的原则相对稳定；用户需要、模型能力、法规、成本与实际部署条件会持续变化。
claims:
  - id: specific-user-task-and-context
    statement: AI 应用场景把明确的用户问题或任务、预期用户与使用情境、AI 能力或方法，以及可衡量结果组合成一个候选应用。
    evidenceType: definition
    sourceIds:
      - google-pair-user-needs
      - nist-ai-rmf-core
  - id: map-value-risk-and-alternatives
    statement: 在决定投入前，应记录预期用途、用户、情境、收益、错误成本和成功标准，并与可行的非 AI 方案比较。
    evidenceType: mechanism
    sourceIds:
      - google-pair-user-needs
      - nist-ai-rmf-core
  - id: candidate-not-proof
    statement: 一个应用场景只是待验证假设；如果 AI 没有带来独特用户价值，或错误成本与风险超过收益，就应采用更简单方案或停止。
    evidenceType: boundary
    sourceIds:
      - google-pair-user-needs
      - nist-ai-rmf-core
---

## 编辑说明

正文应具体写出用户、任务、数据、AI 贡献、成功标准和风险，不能只给出行业标签。案例需要同时展示候选场景及其停止条件。
