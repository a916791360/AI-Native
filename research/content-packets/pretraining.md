---
termId: pretraining
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - bert-original-paper
  - foundation-models-report
timeBoundary: 预训练再适配的范式稳定；训练目标、数据规模、能力表现和风险会随模型家族与版本变化。
claims:
  - id: learn-before-downstream-adaptation
    statement: 预训练先在大规模数据和通用训练目标上学习可复用表示或生成规律，再通过微调、提示等方式适配下游任务。
    evidenceType: definition
    sourceIds:
      - bert-original-paper
      - foundation-models-report
  - id: self-supervised-objectives
    statement: 语言模型可从未人工逐条标注的文本构造预测目标，例如 BERT 的遮盖语言建模，并通过这些目标调整模型参数。
    evidenceType: mechanism
    sourceIds:
      - bert-original-paper
  - id: objective-and-data-limit-capability
    statement: 预训练提供的是受数据、目标和模型结构约束的基础能力，下游系统仍会继承模型缺陷，不能把完成预训练等同于任务已经可用。
    evidenceType: boundary
    sourceIds:
      - foundation-models-report
---

## 编辑说明

正文要区分预训练、微调和后训练，不把所有训练统称为预训练。示例可解释遮盖预测或下一 Token 预测，但不得把训练目标直接描述为理解、事实记忆或业务验收。
