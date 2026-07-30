---
termId: context-compression
batch: collaboration-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - llmlingua-paper
  - anthropic-context-editing
timeBoundary: 通过删除、摘要或 Token 级压缩减少上下文的思路稳定；具体压缩算法、触发阈值、服务端行为和 SDK 参数随实现与版本变化。
claims:
  - id: shorter-task-context
    statement: 上下文压缩是在保留当前任务关键信息的前提下，通过摘要、筛除或更紧凑表示减少模型需要处理的上下文 Token。
    evidenceType: definition
    sourceIds:
      - llmlingua-paper
      - anthropic-context-editing
  - id: multiple-compression-mechanisms
    statement: 压缩可以用摘要替换完整历史、选择性清除过时工具结果，也可以使用算法在预算约束下删除低信息 Token。
    evidenceType: mechanism
    sourceIds:
      - llmlingua-paper
      - anthropic-context-editing
  - id: compression-is-lossy
    statement: 压缩可能丢失早期细节、变量状态、引用关系或精确措辞，不能仅按压缩率判断效果，必须在目标任务上验证质量与可恢复性。
    evidenceType: boundary
    sourceIds:
      - llmlingua-paper
      - anthropic-context-editing
---

## 编辑说明

正文要区分摘要式压缩、选择性删除和 Token 级压缩，不把缓存误写成减少窗口占用。现实例子应保留决策、未完成事项、约束和证据出处，并设计压缩前后任务结果对照。
