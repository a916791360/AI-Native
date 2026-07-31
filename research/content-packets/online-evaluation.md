---
termId: online-evaluation
batch: product-1
status: verified
accessedAt: '2026-07-31'
sourceIds:
  - microsoft-online-experimentation
  - google-production-ml-monitoring
  - microsoft-safe-velocity
timeBoundary: 用真实流量观察产品结果和以随机实验估计因果影响的原则相对稳定；流量结构、用户行为、产品指标、实验平台和风险护栏需持续复核。
claims:
  - id: evaluate-in-production-context
    statement: 在线评估是在真实或受控生产流量中观察候选系统的任务效果、用户结果和运行风险；随机对照实验可在设计成立时估计改动造成的因果影响。
    evidenceType: definition
    sourceIds:
      - microsoft-online-experimentation
      - google-production-ml-monitoring
      - microsoft-safe-velocity
  - id: hypothesis-randomization-guardrails
    statement: 实施时需预先声明假设、分流单位、主要指标和护栏指标，稳定记录版本与曝光，在小比例流量上比较对照和处理，并设置停止、回滚和逐步放量条件。
    evidenceType: mechanism
    sourceIds:
      - microsoft-online-experimentation
      - google-production-ml-monitoring
      - microsoft-safe-velocity
  - id: exposure-and-causality-boundaries
    statement: 线上评估会真实影响用户；没有随机化或可信对照的监测只能说明相关变化，标签延迟、样本偏差、干扰效应和短期新奇效应也可能误导结论。
    evidenceType: boundary
    sourceIds:
      - microsoft-online-experimentation
      - google-production-ml-monitoring
---

## 编辑说明

正文要区分线上监测、灰度发布和随机对照实验。案例应同时展示产品结果、质量与安全护栏、曝光单位、最小流量、停止条件和回滚责任，不能把“上线看看”写成完整在线评估。
