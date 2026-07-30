---
termId: system-prompt
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - openai-model-spec-2025
  - anthropic-messages-api
timeBoundary: 系统级指令的产品作用相对稳定，但角色名称、传输位置、优先顺序和动态更新能力必须按具体模型 API 版本复核。
claims:
  - id: application-level-instruction
    statement: 系统提示词是由模型平台或应用提供的高层指令，用于设定整体行为、规则与边界，并与终端用户当轮提交的内容区分。
    evidenceType: definition
    sourceIds:
      - openai-model-spec-2025
      - anthropic-messages-api
  - id: provider-specific-transport
    statement: 不同供应商对系统指令的传输方式并不统一，例如可以使用有优先级的系统消息，也可以使用消息数组之外的顶层 system 参数。
    evidenceType: mechanism
    sourceIds:
      - openai-model-spec-2025
      - anthropic-messages-api
  - id: instruction-not-security-boundary
    statement: 系统提示词参与模型的指令解析，但不能替代权限控制、输入隔离、工具授权和输出验证等确定性安全措施。
    evidenceType: boundary
    sourceIds:
      - openai-model-spec-2025
---

## 编辑说明

正文要区分“产品层面的系统提示词”与某一家 API 的具体字段，不把角色名称写成跨供应商统一协议。案例应强调系统提示词可以约束行为，但不能作为访问控制或绝对防护边界。
