---
termId: ai-product
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - google-pair-user-needs
  - google-ml-problem-framing
timeBoundary: 人本设计与问题定义原则相对稳定；产品实例和工具选型以 2026-07-29 为时间边界。
claims:
  - id: user-problem-first
    statement: AI 产品首先需要解决真实用户问题，并确认 AI 能力相较简单方案能够提供独特价值。
    evidenceType: definition
    sourceIds:
      - google-pair-user-needs
      - google-ml-problem-framing
  - id: system-not-model
    statement: 产品结果由模型、数据、交互、流程和运营共同产生，模型指标不能替代用户任务成功标准。
    evidenceType: mechanism
    sourceIds:
      - google-pair-user-needs
      - google-ml-problem-framing
  - id: compare-simple-baseline
    statement: 在采用 AI 前应建立非 AI 或更简单方案作为基线，并比较质量、成本、维护和错误后果。
    evidenceType: boundary
    sourceIds:
      - google-ml-problem-framing
---

## 编辑说明

文章面向产品人，不把接入模型等同于完成产品。例子以知识客服为背景，同时呈现用户控制、失败恢复和运营责任。
