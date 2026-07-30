---
termId: problem-solution-fit
batch: product-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - google-pair-user-needs
  - nist-ai-rmf-core
timeBoundary: 从用户问题和预期用途验证方案的原则相对稳定；用户需求、替代方案、成本、风险与部署条件会持续变化。
claims:
  - id: evidence-of-important-problem
    statement: 问题方案匹配是有证据表明目标用户存在重要问题，且拟议方案能在明确成功标准下实质改善该任务。
    evidenceType: definition
    sourceIds:
      - google-pair-user-needs
      - nist-ai-rmf-core
  - id: research-hypothesis-test
    statement: 团队应通过用户研究验证问题，写明方案与价值假设，定义可衡量的成功和失败成本，并在规模化前用代表性用户测试。
    evidenceType: mechanism
    sourceIds:
      - google-pair-user-needs
      - nist-ai-rmf-core
  - id: model-score-is-not-fit
    statement: 模型或评测分数提升不能单独证明问题方案匹配，还要检查真实用户结果、工作流成本、风险、采用情况和非 AI 替代方案。
    evidenceType: boundary
    sourceIds:
      - google-pair-user-needs
      - nist-ai-rmf-core
---

## 编辑说明

正文要区分问题重要性、方案有用性和后续的市场采用。案例应包含一个因用户结果、成本或风险不成立而被否决的方案。
