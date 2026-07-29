---
termId: transformer
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - transformer-original-paper
  - hugging-face-transformers-docs
timeBoundary: 原始架构依据 2017 年论文；模型家族和实现生态以 2026-07-29 的文档为边界。
claims:
  - id: attention-architecture
    statement: Transformer 原始架构以注意力为核心处理序列关系，并移除了循环与卷积结构。
    evidenceType: definition
    sourceIds:
      - transformer-original-paper
  - id: parallel-sequence-processing
    statement: 自注意力让序列位置之间直接建立加权关系，并支持训练时并行处理多个位置。
    evidenceType: mechanism
    sourceIds:
      - transformer-original-paper
  - id: architecture-not-model
    statement: Transformer 是架构家族而不是某一个具体大语言模型，也已用于文本之外的多种模态。
    evidenceType: boundary
    sourceIds:
      - hugging-face-transformers-docs
---

## 编辑说明

正文只解释查询、键和值的直觉，不展开矩阵推导。明确现代模型可能在原始结构上加入不同位置编码、注意力实现和专家模块。
