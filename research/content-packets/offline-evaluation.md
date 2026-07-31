---
termId: offline-evaluation
batch: product-1
status: verified
accessedAt: '2026-07-31'
sourceIds:
  - openai-evaluation-best-practices
  - google-rules-of-ml
timeBoundary: 在固定数据和条件下重复比较的原则相对稳定；具体评测平台可能更名、迁移或停止服务，数据分布、评分器、模型版本、提示词、工具链和生产流量也会持续变化。
claims:
  - id: repeatable-evaluation-outside-live-traffic
    statement: 离线评估是在不把候选版本直接暴露给实时用户的条件下，使用固定或可重放的数据、任务和评分规则重复测量模型或完整系统表现。
    evidenceType: definition
    sourceIds:
      - openai-evaluation-best-practices
      - google-rules-of-ml
  - id: objective-data-metrics-comparison
    statement: 实施时先定义成功标准，再建立包含典型、边界和对抗案例的代表性评测集，校准自动评分与人工判断，并在一致条件下比较候选版本、切片和失败类型。
    evidenceType: mechanism
    sourceIds:
      - openai-evaluation-best-practices
      - google-rules-of-ml
  - id: offline-does-not-prove-production-impact
    statement: 离线结果受样本代表性、标签泄漏、评分器偏差和训练测试污染影响，不能单独证明真实用户影响、线上因果效果或部署后的长期稳定性。
    evidenceType: boundary
    sourceIds:
      - openai-evaluation-best-practices
      - google-rules-of-ml
---

## 编辑说明

正文应把离线评估与训练指标、通用基准和线上评估分开。案例需固定模型、提示词、工具、数据和评分器版本，并展示至少一个总分之外的关键切片或失败类型。
