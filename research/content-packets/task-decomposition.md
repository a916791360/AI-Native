---
termId: task-decomposition
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - least-to-most-prompting
  - anthropic-effective-agents
timeBoundary: 把复杂任务分成子任务的原则相对稳定；由模型动态规划、固定工作流或多智能体执行，以及具体检查方式，会随模型能力和系统架构变化。
claims:
  - id: executable-subtasks
    statement: 任务拆解是把复杂目标分成范围更明确、可以逐步解决的子问题，并利用已完成子问题的结果推进后续步骤。
    evidenceType: definition
    sourceIds:
      - least-to-most-prompting
  - id: dependency-and-checkpoints
    statement: 有效拆解需要表达子任务之间的依赖、输入输出和检查点；可预测步骤适合固定工作流，无法预先确定的步骤才需要动态编排。
    evidenceType: mechanism
    sourceIds:
      - least-to-most-prompting
      - anthropic-effective-agents
  - id: decomposition-cost
    statement: 拆解会增加调用次数、状态传递和协调成本，边界不清或依赖错误还可能让局部正确的步骤组合成错误结果。
    evidenceType: boundary
    sourceIds:
      - anthropic-effective-agents
---

## 编辑说明

正文要区分“拆成可执行子任务”与“机械切成更多步骤”。案例应展示依赖顺序、输入输出、完成标准和失败回退，并说明简单任务通常不需要额外编排。
