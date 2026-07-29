---
termId: foundation-model
batch: foundation-1
status: draft
accessedAt: '2026-07-29'
sourceIds:
  - foundation-models-report
  - bert-original-paper
timeBoundary: 基础模型术语以 2021 年 Stanford CRFM 报告为定义基线；具体模型能力、风险与适配方式需按模型版本和部署场景复核。
claims:
  - id: broad-data-adaptable-model
    statement: 基础模型是在广泛数据上进行大规模训练，并能通过适配支持多种下游任务的模型类别。
    evidenceType: definition
    sourceIds:
      - foundation-models-report
  - id: reuse-through-adaptation
    statement: 预训练所得表示可以通过微调等方式复用于不同任务，使同一模型成为多个应用的共同能力底座。
    evidenceType: mechanism
    sourceIds:
      - foundation-models-report
      - bert-original-paper
  - id: shared-foundation-shares-failures
    statement: 基础模型带来复用效率，也会让其偏差、缺陷和风险被多个下游系统共同继承，因此不能把通用适配能力等同于通用可靠。
    evidenceType: boundary
    sourceIds:
      - foundation-models-report
---

## 编辑说明

正文要突出“foundation”描述的是被多个下游系统复用的功能位置，而不是模型已经具备完整知识或通用智能。示例需同时说明复用收益和共同故障面，避免只用参数规模定义基础模型。
