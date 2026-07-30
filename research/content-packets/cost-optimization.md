---
termId: cost-optimization
batch: product-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - openai-cost-optimization
  - frugalgpt
timeBoundary: 先测量再在质量约束下优化的原则相对稳定；模型效率、供应商价格、折扣方案和计费维度会快速变化。
claims:
  - id: minimum-cost-at-quality-floor
    statement: AI 成本优化是在满足质量、延迟、安全和可靠性约束的前提下，降低每个成功任务或完整生命周期的总成本，而不是单纯选择单价最低的调用。
    evidenceType: definition
    sourceIds:
      - openai-cost-optimization
      - frugalgpt
  - id: measure-then-reduce
    statement: 应先按任务基线记录令牌、请求、工具、重试、存储和运维成本，再减少无效调用与输入输出，对合适任务使用更小模型、级联、缓存或批处理，并重新运行质量评测。
    evidenceType: mechanism
    sourceIds:
      - openai-cost-optimization
      - frugalgpt
  - id: unit-price-is-not-total-cost
    statement: 更低令牌单价或更短提示可能导致质量下降、重试增加、延迟变化与维护成本上升；任何优化都必须以成功任务为分母，并记录折扣方案带来的时效和可用性权衡。
    evidenceType: boundary
    sourceIds:
      - openai-cost-optimization
      - frugalgpt
---

## 编辑说明

正文应使用“总成本除以成功任务数”的口径，不制作会迅速过期的供应商价格表。案例需保留基线、质量门槛和至少一个被拒绝的优化方案。
