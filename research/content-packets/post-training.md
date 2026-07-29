---
termId: post-training
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - instructgpt-paper
  - llama-3-herd-paper
timeBoundary: 后训练方法和配方随模型家族快速变化；本文以 2026-07-29 前公开论文中的监督微调、偏好优化与安全调整为边界。
claims:
  - id: training-after-pretraining
    statement: 后训练是预训练之后继续调整模型行为的阶段，目标可包括指令遵循、偏好对齐、安全性和特定能力，而不是重新定义一种固定算法。
    evidenceType: definition
    sourceIds:
      - instructgpt-paper
      - llama-3-herd-paper
  - id: multiple-adjustment-stages
    statement: 一个后训练流程可以组合监督微调、偏好数据、奖励模型和强化学习等环节，但具体组合取决于模型目标，不是所有模型都采用同一配方。
    evidenceType: mechanism
    sourceIds:
      - instructgpt-paper
      - llama-3-herd-paper
  - id: behavior-improvement-not-guarantee
    statement: 后训练可以改善特定评估中的有用性、安全性或指令遵循，但不能保证事实正确、消除所有有害输出或覆盖分布外任务。
    evidenceType: boundary
    sourceIds:
      - instructgpt-paper
      - llama-3-herd-paper
---

## 编辑说明

正文要把后训练写成阶段集合，不能等同于 RLHF、指令微调或某一家模型的专有流程。例子应展示目标、数据、优化方法和独立评估之间的关系。
