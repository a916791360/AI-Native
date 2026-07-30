---
termId: model-api
batch: product-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - anthropic-api-overview
  - google-cloud-ai-ml-reliability
timeBoundary: API 契约原则相对稳定；端点、字段、鉴权、限额、模型标识、版本与 SDK 行为会持续变化。
claims:
  - id: network-service-contract
    statement: 模型 API 是应用通过文档化网络契约访问模型推理能力的接口，契约通常定义端点与方法、鉴权、输入与配置、响应与错误结构以及版本规则。
    evidenceType: definition
    sourceIds:
      - anthropic-api-overview
      - google-cloud-ai-ml-reliability
  - id: request-response-observability
    statement: 客户端应按契约构造并鉴权请求，处理同步或流式响应、错误、超时与限流，并记录请求标识、用量和延迟以支持追踪。
    evidenceType: mechanism
    sourceIds:
      - anthropic-api-overview
      - google-cloud-ai-ml-reliability
  - id: api-is-not-model-portability
    statement: 共同使用 HTTP 与 JSON 不代表不同供应商或模型语义等价；消息、工具、错误、版本和限制仍需适配器与契约测试，密钥也不应暴露给不受信任客户端。
    evidenceType: boundary
    sourceIds:
      - anthropic-api-overview
      - google-cloud-ai-ml-reliability
---

## 编辑说明

正文应区分模型 API、模型本身和 SDK。案例需覆盖成功响应、流式响应、错误与请求追踪，不硬编码会快速变化的端点和限额。
