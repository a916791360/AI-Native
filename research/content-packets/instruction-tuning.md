---
termId: instruction-tuning
batch: foundation-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - flan-paper
  - instructgpt-paper
timeBoundary: 定义以 FLAN 和 InstructGPT 论文为基线；任务混合、数据生成方式和训练配方会随模型与数据版本变化。
claims:
  - id: fine-tune-on-instructions
    statement: 指令微调是在包含自然语言指令及期望输出的任务数据上继续训练模型，使模型更能按任务描述作答。
    evidenceType: definition
    sourceIds:
      - flan-paper
      - instructgpt-paper
  - id: task-mixtures-support-transfer
    statement: FLAN 通过把多种任务改写为自然语言指令模板并联合微调，提升了模型在未参与训练任务类型上的零样本表现。
    evidenceType: mechanism
    sourceIds:
      - flan-paper
  - id: subset-not-all-alignment
    statement: 指令微调属于微调和后训练的一种做法，不等于提示工程，也不自动包含偏好排序、强化学习或完整安全对齐。
    evidenceType: boundary
    sourceIds:
      - flan-paper
      - instructgpt-paper
---

## 编辑说明

正文要用“指令、输入、期望输出”解释训练样本，并区分训练时更新参数与使用时只写提示。不要把单篇论文的零样本提升外推为所有任务都提升。
