---
termId: few-shot-prompting
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - gpt-3-paper
  - google-prompt-design-strategies
timeBoundary: 在上下文中提供少量示例的定义稳定；有效示例数量、顺序、格式和收益取决于模型、任务与版本，必须用目标样本评测。
claims:
  - id: demonstrations-in-context
    statement: 少样本提示是在模型输入中放入少量任务示例或输入输出对，再提交新输入让模型沿示例模式完成任务。
    evidenceType: definition
    sourceIds:
      - gpt-3-paper
      - google-prompt-design-strategies
  - id: no-parameter-update
    statement: GPT-3 论文中的少样本设置通过文本交互提供任务和示范，推理时不执行梯度更新或任务微调。
    evidenceType: mechanism
    sourceIds:
      - gpt-3-paper
  - id: examples-do-not-guarantee-improvement
    statement: 少量示例可以展示模式与输出格式，但效果会随任务、示例选择和模型变化，不能假定示例越多或任意示例都一定更好。
    evidenceType: boundary
    sourceIds:
      - gpt-3-paper
      - google-prompt-design-strategies
---

## 编辑说明

正文要明确“少样本”指推理上下文中的示例，不等于少量样本微调。现实例子应比较零样本和少样本结果，并用固定评测集判断示例是否真正改善目标表现。
