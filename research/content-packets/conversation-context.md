---
termId: conversation-context
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - anthropic-messages-api
  - anthropic-context-windows
timeBoundary: 对话历史进入当前推理输入的原则稳定；消息角色、服务端会话状态、历史传递方式、Token 计数和自动裁剪行为必须按具体 API 版本复核。
claims:
  - id: current-conversation-state
    statement: 对话上下文是当前请求中可供模型参考的历史消息、当前输入、系统规则、工具结果和其他会话状态，而不是模型永久保存的个人记忆。
    evidenceType: definition
    sourceIds:
      - anthropic-messages-api
      - anthropic-context-windows
  - id: turns-accumulate-in-input
    statement: 多轮交互通常把先前用户与助手轮次连同当前消息组织为新的输入，历史内容随轮次增加并共同占用上下文窗口。
    evidenceType: mechanism
    sourceIds:
      - anthropic-messages-api
      - anthropic-context-windows
  - id: history-is-application-controlled
    statement: API 接口不应被假定为自动记住全部对话；应用需要明确保存和回传哪些历史，并处理窗口上限、裁剪、隐私与状态一致性。
    evidenceType: boundary
    sourceIds:
      - anthropic-messages-api
      - anthropic-context-windows
---

## 编辑说明

正文要区分“应用保存的会话记录”“本次请求实际传入的上下文”和“模型训练形成的参数知识”。现实例子应说明删掉、摘要或错误排序历史会如何改变模型本轮可见状态。
