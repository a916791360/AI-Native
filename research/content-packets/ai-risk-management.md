---
termId: ai-risk-management
batch: product-1
status: verified
accessedAt: '2026-07-31'
sourceIds:
  - nist-ai-rmf-core
  - nist-ai-rmf-playbook
timeBoundary: 本文基于 NIST AI RMF 1.0；NIST 已声明框架和 Playbook 正在修订，实施时需核对当前版本，具体法律义务、风险容忍度、影响对象、控制措施和责任分工也需按组织与时间复核。
claims:
  - id: continuous-contextual-risk-cycle
    statement: AI 风险管理是在整个系统生命周期中持续治理责任、界定使用情境、识别和测量影响，并按优先级处置、监控和沟通风险的组织过程。
    evidenceType: definition
    sourceIds:
      - nist-ai-rmf-core
      - nist-ai-rmf-playbook
  - id: govern-map-measure-manage
    statement: 实施时以 Govern 建立政策、角色和风险容忍度，用 Map 记录场景、相关方和影响，用 Measure 形成可追溯证据，再由 Manage 确定优先级并安排继续、缓解、限制、停用、响应和持续改进。
    evidenceType: mechanism
    sourceIds:
      - nist-ai-rmf-core
      - nist-ai-rmf-playbook
  - id: not-a-static-checklist
    statement: 风险管理不是一次性合规清单，也没有脱离场景的统一控制组合；框架行动需要按资源、能力和风险容忍度取舍，并随系统、环境和新出现的影响反复执行。
    evidenceType: boundary
    sourceIds:
      - nist-ai-rmf-core
      - nist-ai-rmf-playbook
---

## 编辑说明

正文要把风险管理写成决策与责任闭环，而不是风险词汇列表。案例应明确风险所有者、受影响者、证据、容忍度、控制措施、残余风险、监测信号和停止条件，并与单项安全测试区分。
