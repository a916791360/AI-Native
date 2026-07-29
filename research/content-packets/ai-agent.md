---
termId: ai-agent
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - anthropic-effective-agents
  - anthropic-trustworthy-agents
timeBoundary: Agent 产品和框架变化迅速；本文只陈述截至 2026-07-29 仍通用的控制循环与风险边界。
claims:
  - id: self-directed-loop
    statement: AI Agent 围绕目标自行选择步骤和工具，并依据执行结果继续调整后续行动。
    evidenceType: definition
    sourceIds:
      - anthropic-effective-agents
      - anthropic-trustworthy-agents
  - id: observe-and-adjust
    statement: 典型 Agent 循环包含规划或选择、执行工具、观察结果、更新状态与判断是否继续。
    evidenceType: mechanism
    sourceIds:
      - anthropic-trustworthy-agents
  - id: simplest-sufficient-pattern
    statement: 并非所有任务都需要 Agent，固定流程能够可靠解决时通常更容易测试、控制和维护。
    evidenceType: boundary
    sourceIds:
      - anthropic-effective-agents
---

## 编辑说明

严格区分 Agent 与固定工作流。风险段必须覆盖权限最小化、沙箱、人工确认、停止条件和可追踪执行记录。
