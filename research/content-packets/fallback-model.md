---
termId: fallback-model
batch: product-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - google-cloud-ai-ml-reliability
  - aws-bedrock-resilience-patterns
timeBoundary: 通过备用路径优雅降级的原则相对稳定；供应商、模型、配额、错误类别、接口兼容性和响应语义会持续变化。
claims:
  - id: alternate-on-primary-failure
    statement: 备用模型是在主模型不可用、受限流、超时或触发明确不可接受条件时，由系统切换使用的预先评测过的替代模型或配置。
    evidenceType: definition
    sourceIds:
      - google-cloud-ai-ml-reliability
      - aws-bedrock-resilience-patterns
  - id: trigger-switch-validate-recover
    statement: 系统应分类可重试错误、超时和质量触发条件，限制重试并在需要时打开熔断，切换到契约兼容且经过测试的备用路径，同时标记降级结果并监测主路径恢复。
    evidenceType: mechanism
    sourceIds:
      - google-cloud-ai-ml-reliability
      - aws-bedrock-resilience-patterns
  - id: availability-not-equivalence
    statement: 备用模型提高连续性但不保证语义等价；模型变化可能影响质量、安全、工具、上下文、成本和延迟，只应在批准的任务范围内使用并防止级联过载。
    evidenceType: boundary
    sourceIds:
      - google-cloud-ai-ml-reliability
      - aws-bedrock-resilience-patterns
---

## 编辑说明

正文应区分故障回退与日常模型路由。案例需明确触发条件、最大重试、用户可见降级、兼容性测试和恢复策略。
