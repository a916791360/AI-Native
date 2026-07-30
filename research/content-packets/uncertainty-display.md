---
termId: uncertainty-display
batch: product-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - google-pair-explainability-trust
  - microsoft-human-ai-interaction-guidelines
timeBoundary: 面向决定呈现能力限制与证据缺口的原则相对稳定；置信度含义、校准质量、用户理解和最合适的表现形式必须按具体模型与场景验证。
claims:
  - id: decision-relevant-limits
    statement: 不确定性呈现是在用户需要作出判断时，说明结果所依赖的证据、缺失信息、适用条件、可能替代项或需要人工复核之处。
    evidenceType: definition
    sourceIds:
      - google-pair-explainability-trust
      - microsoft-human-ai-interaction-guidelines
  - id: actionable-communication
    statement: 设计时应先确定用户面临的决定与可采取动作，再选择能帮助判断的文字或视觉形式，并通过用户测试验证理解和信任校准。
    evidenceType: mechanism
    sourceIds:
      - google-pair-explainability-trust
      - microsoft-human-ai-interaction-guidelines
  - id: score-is-not-correctness
    statement: 模型置信分数若未经校准，不能直接当成答案正确概率；过细数值也可能让用户困惑或产生虚假精确感，因此不应为“透明”而机械展示。
    evidenceType: boundary
    sourceIds:
      - google-pair-explainability-trust
---

## 编辑说明

正文应从用户决定出发，而不是从模型能输出什么分数出发。案例需要同时给出证据缺口、可采取动作和升级条件，并把置信度、概率、校准和笼统免责声明区分开。
