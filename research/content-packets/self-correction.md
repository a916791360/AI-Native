---
termId: self-correction
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - self-refine
  - llm-cannot-self-correct-reasoning
timeBoundary: 反馈驱动的迭代修正模式相对稳定；不同模型、任务、验证器和反馈来源下能否改善，以及最佳循环次数，仍是快速发展的实证问题。
claims:
  - id: feedback-driven-revision
    statement: 自我纠错是系统对先前输出生成或接收反馈，再据此修改答案或行动的推理时迭代过程，不等同于重新随机生成一次。
    evidenceType: definition
    sourceIds:
      - self-refine
      - llm-cannot-self-correct-reasoning
  - id: feedback-refine-loop
    statement: 一种典型实现按初始输出、反馈、修订和停止判断循环；反馈可以由同一模型产生，也可以来自验证器、工具结果或人员。
    evidenceType: mechanism
    sourceIds:
      - self-refine
      - llm-cannot-self-correct-reasoning
  - id: intrinsic-correction-limit
    statement: 缺少可靠外部反馈时，模型可能无法发现自身推理错误，甚至在修订后退化，因此需要验证信号、回归检查和停止规则。
    evidenceType: boundary
    sourceIds:
      - llm-cannot-self-correct-reasoning
---

## 编辑说明

正文要区分“有反馈的迭代修正”和“让模型再想一遍”。案例应明确反馈来自哪里、如何判断修订更好、何时停止，并同时呈现正面研究与无外部反馈时的失败证据。
