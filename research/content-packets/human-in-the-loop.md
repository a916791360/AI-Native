---
termId: human-in-the-loop
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - openai-agents-hitl
  - nist-ai-rmf-core
timeBoundary: 在关键决策点引入人工参与的治理原则相对稳定；审批 API、暂停与恢复机制、记录字段和法定监督要求需按具体系统与司法辖区复核。
claims:
  - id: human-decision-point
    statement: 人在回路是在 AI 工作流的特定判断、审批或异常节点让人员获得信息并作出决定，而不是要求人工重做整个流程。
    evidenceType: definition
    sourceIds:
      - openai-agents-hitl
      - nist-ai-rmf-core
  - id: pause-review-resume
    statement: 一种典型实现是在敏感工具调用前暂停运行，向人员展示待执行动作和参数，记录批准或拒绝后再恢复原工作流。
    evidenceType: mechanism
    sourceIds:
      - openai-agents-hitl
  - id: meaningful-oversight
    statement: 人工参与只有在角色、责任、所需信息、权限和响应流程明确时才构成有效控制，也不能自动消除人员偏差或系统风险。
    evidenceType: boundary
    sourceIds:
      - nist-ai-rmf-core
---

## 编辑说明

正文要强调有意义的人工控制点，不把“页面上有确认按钮”直接等同于人在回路。案例应选择高风险或不可逆动作，并说明审批人需要看到什么、能做什么以及超时如何处理。
