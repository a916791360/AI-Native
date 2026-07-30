---
termId: reflection
batch: collaboration-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - reflexion
  - anthropic-effective-agents
timeBoundary: 用执行轨迹和反馈生成反思以影响后续尝试的模式相对稳定；具体记忆结构、评价器、上下文保留方式与循环上限会随 Agent 架构变化。
claims:
  - id: trajectory-reflection
    statement: 反思机制让 Agent 根据一次尝试的执行轨迹和反馈生成文字化总结，并把它作为后续决策的输入，而不是直接更新模型权重。
    evidenceType: definition
    sourceIds:
      - reflexion
  - id: feedback-memory-next-trial
    statement: 一种典型循环是评价任务结果、形成反思、写入短期或情节记忆，再让下一次尝试读取这些经验；环境结果提供关键验证信号。
    evidenceType: mechanism
    sourceIds:
      - reflexion
      - anthropic-effective-agents
  - id: bounded-reflection-loop
    statement: 反思不能保证发现错误，反馈或记忆本身也可能误导后续行动，因此需要清晰标准、环境验证、记忆边界和最大迭代次数。
    evidenceType: boundary
    sourceIds:
      - reflexion
      - anthropic-effective-agents
---

## 编辑说明

正文要把反思写成基于轨迹和反馈的 Agent 控制机制，并与单次输出自我纠错区分。案例应展示反思记录如何改变下一次行动，同时说明错误反思、记忆污染和无限循环风险。
