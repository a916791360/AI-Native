---
termId: tool-use
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - anthropic-tool-use-loop
  - toolformer-paper
timeBoundary: 模型借助外部 API 获取信息或执行动作的基本循环相对稳定；工具类型、Schema、并行调用、执行位置和安全控制会随平台版本变化。
claims:
  - id: external-capability-bridge
    statement: 工具调用让模型选择外部能力并生成调用请求，以访问训练数据之外的信息或完成文本生成本身不能执行的动作。
    evidenceType: definition
    sourceIds:
      - anthropic-tool-use-loop
      - toolformer-paper
  - id: request-execute-return-loop
    statement: 对客户端工具，模型输出工具名和结构化参数，应用执行操作并返回结果，模型再依据结果继续生成或决定下一步。
    evidenceType: mechanism
    sourceIds:
      - anthropic-tool-use-loop
  - id: model-does-not-execute
    statement: 模型提出调用不等于动作已经执行；运行环境仍需负责参数验证、权限、超时、错误处理和副作用控制。
    evidenceType: boundary
    sourceIds:
      - anthropic-tool-use-loop
---

## 编辑说明

正文要区分模型选择工具、应用执行工具和模型读取结果三个责任边界。例子应展示失败结果与重试判断，不能把工具调用写成模型天然拥有外部权限。
