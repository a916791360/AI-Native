---
termId: latency-budget
batch: product-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - openai-latency-optimization
  - google-cloud-ai-ml-reliability
timeBoundary: 把端到端目标分配到各阶段的原则相对稳定；模型与供应商速度、网络、负载、工具链和用户预期会持续变化。
claims:
  - id: end-to-end-time-allowance
    statement: 延迟预算是一次交互可接受的端到端时间上限，可分别规定首个可见结果与完整结果，并分配给预处理、检索或工具、模型、后处理和网络阶段。
    evidenceType: definition
    sourceIds:
      - openai-latency-optimization
      - google-cloud-ai-ml-reliability
  - id: allocate-measure-control
    statement: 应从用户需要和服务目标推导百分位目标，为各阶段分配子预算与截止时间，通过分布式追踪测量，再用减少或并行调用、缩短输出、流式呈现、超时取消或回退控制超支。
    evidenceType: mechanism
    sourceIds:
      - openai-latency-optimization
      - google-cloud-ai-ml-reliability
  - id: average-is-not-budget
    statement: 平均延迟会掩盖尾部等待，流式输出降低感知等待但不等于缩短完整生成；预算必须声明百分位、工作负载和超时行为，并记录质量、成本与可靠性权衡。
    evidenceType: boundary
    sourceIds:
      - openai-latency-optimization
      - google-cloud-ai-ml-reliability
---

## 编辑说明

正文应区分目标预算、服务目标与实际测量值。案例需展示 P95、首字延迟、阶段预算之和、超时行为和至少一个权衡。
