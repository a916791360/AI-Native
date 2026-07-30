---
termId: fine-tuning
batch: foundation-1
status: draft
accessedAt: '2026-07-29'
sourceIds:
  - bert-original-paper
  - foundation-models-report
timeBoundary: 预训练模型再适配的基本范式稳定；全量、轻量和提示式适配的成本收益需按模型、任务和工具版本复核。
claims:
  - id: continue-training-for-adaptation
    statement: 微调是在已有预训练模型基础上，用下游任务或领域数据继续优化参数，使模型适配具体目标。
    evidenceType: definition
    sourceIds:
      - bert-original-paper
      - foundation-models-report
  - id: downstream-objective-updates-model
    statement: 微调通过下游数据和目标计算损失并更新模型参数，BERT 展示了同一预训练表示可经任务微调用于问答与语言推断等任务。
    evidenceType: mechanism
    sourceIds:
      - bert-original-paper
  - id: one-adaptation-option
    statement: 微调只是适配基础模型的一种方式；提示式和轻量方法可能有更好的准确率、成本与访问权衡，选择前必须用任务数据比较。
    evidenceType: boundary
    sourceIds:
      - foundation-models-report
---

## 编辑说明

正文先解释“继续训练并更新参数”，再说明全量微调不是唯一适配方式。没有新增来源前，不展开 LoRA、灾难性遗忘或具体超参数结论。
