---
termId: structured-output
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - google-structured-output
  - json-schema-overview
timeBoundary: 使用 Schema 描述结构与约束的原则稳定；供应商支持的 JSON Schema 子集、配置字段、模型范围和错误行为随 API 版本变化。
claims:
  - id: machine-readable-shape
    statement: 结构化输出要求模型结果符合预先定义的字段、类型或层级，以便应用程序稳定解析和继续处理。
    evidenceType: definition
    sourceIds:
      - google-structured-output
      - json-schema-overview
  - id: schema-constrained-generation
    statement: 支持结构化输出的模型 API 可以接收 JSON Schema 或其受支持子集，并约束最终响应的语法和数据形状。
    evidenceType: mechanism
    sourceIds:
      - google-structured-output
      - json-schema-overview
  - id: syntax-not-semantic-truth
    statement: 符合 Schema 只说明输出结构满足协议，不能保证字段值真实、业务规则成立或操作安全，应用仍需执行语义校验与错误处理。
    evidenceType: boundary
    sourceIds:
      - google-structured-output
---

## 编辑说明

正文要区分“提示模型返回 JSON”和“API 按 Schema 约束输出”，也要区分结构有效与业务正确。练习应包含类型校验、枚举范围和语义复核三层判断。
