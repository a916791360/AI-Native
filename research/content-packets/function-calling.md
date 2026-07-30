---
termId: function-calling
batch: collaboration-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - openai-function-calling
  - anthropic-tool-use-loop
timeBoundary: 函数调用的请求、执行和结果回传循环相对稳定；字段名称、Schema 方言、严格模式、并行调用与消息格式必须按具体 API 版本复核。
claims:
  - id: structured-tool-protocol
    statement: 函数调用是工具调用的一种结构化接口，应用向模型提供函数描述与参数 Schema，模型返回函数选择和参数请求。
    evidenceType: definition
    sourceIds:
      - openai-function-calling
      - anthropic-tool-use-loop
  - id: application-executes-function
    statement: 应用收到调用请求后执行对应函数，再把带有关联标识的结果返回模型，模型据此继续回答或发起下一次调用。
    evidenceType: mechanism
    sourceIds:
      - openai-function-calling
      - anthropic-tool-use-loop
  - id: schema-is-not-authorization
    statement: 结构化参数只是调用协议，不代表请求已获授权、字段值符合业务规则或副作用可以直接执行，应用仍需独立校验。
    evidenceType: boundary
    sourceIds:
      - openai-function-calling
      - anthropic-tool-use-loop
---

## 编辑说明

正文要把函数调用放在更广义的工具调用之下，并区分“模型生成参数”和“应用真正执行”。案例需包含 Schema 校验、业务授权与调用结果回传。
