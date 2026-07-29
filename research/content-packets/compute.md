---
termId: compute
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - google-tpu-architecture
  - stanford-ai-index-2026-economy
timeBoundary: 硬件架构与产业数字变化较快；正文不固化价格和代际参数，资料核验截至 2026-07-29。
claims:
  - id: resources-for-operations
    statement: AI 算力是完成训练和推理所需的计算处理能力，实际系统还依赖内存、互连、软件和能源。
    evidenceType: definition
    sourceIds:
      - google-tpu-architecture
      - stanford-ai-index-2026-economy
  - id: matrix-accelerators
    statement: GPU 和 TPU 等加速器通过并行矩阵运算提高机器学习工作负载的处理效率。
    evidenceType: mechanism
    sourceIds:
      - google-tpu-architecture
  - id: peak-not-delivered
    statement: 峰值运算次数不等于应用实际速度，模型结构、精度、内存带宽、通信和利用率都会限制结果。
    evidenceType: boundary
    sourceIds:
      - google-tpu-architecture
      - stanford-ai-index-2026-economy
---

## 编辑说明

文章不做芯片选购建议，不引用快速过时的价格。用训练与在线推理对照说明吞吐、延迟、内存和成本目标不同。
