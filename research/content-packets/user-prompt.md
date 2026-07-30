---
termId: user-prompt
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - openai-model-spec-2025
  - anthropic-messages-api
timeBoundary: 用户消息作为交互输入的概念稳定；角色权限、消息合并、内容类型和多轮协议随具体 API 版本变化。
claims:
  - id: end-user-input
    statement: 用户提示词是终端用户提交给模型或应用的任务、问题、材料与约束，在角色化对话中通常以用户消息表示。
    evidenceType: definition
    sourceIds:
      - openai-model-spec-2025
      - anthropic-messages-api
  - id: role-and-content-turn
    statement: 消息 API 通常把用户输入组织为包含 role 与 content 的对话轮次，再与其他上下文共同组成模型本次处理的输入。
    evidenceType: mechanism
    sourceIds:
      - anthropic-messages-api
  - id: lower-authority-and-untrusted-content
    statement: 用户提示词不应默认覆盖更高层指令，其中引用的材料也不应自动取得指令权限；实际优先规则必须按具体系统协议判断。
    evidenceType: boundary
    sourceIds:
      - openai-model-spec-2025
---

## 编辑说明

正文要把用户提示词写成一次协作输入，而不是只写成一句提问。需要说明任务、材料和约束可以同时出现，并区分用户意图、引用数据与更高层产品规则。
