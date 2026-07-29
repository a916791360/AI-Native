---
termId: self-attention
batch: foundation-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - transformer-original-paper
  - bert-original-paper
timeBoundary: 自注意力的查询、键和值机制稳定；位置编码、掩码、稀疏策略与高效实现需按具体架构复核。
claims:
  - id: same-sequence-contextualization
    statement: 自注意力让同一序列中的每个位置与该序列其他位置建立加权关系，从而形成包含上下文的信息表示。
    evidenceType: definition
    sourceIds:
      - transformer-original-paper
      - bert-original-paper
  - id: query-key-value-and-heads
    statement: Transformer 自注意力把输入映射为查询、键和值，按匹配权重汇总信息，并可用多个注意力头并行表示不同关系。
    evidenceType: mechanism
    sourceIds:
      - transformer-original-paper
  - id: pairwise-cost-and-position
    statement: 标准全自注意力需要比较序列位置之间的成对关系，计算和内存开销会随长度快速增长，而且仍需额外位置表示保留顺序信息。
    evidenceType: boundary
    sourceIds:
      - transformer-original-paper
---

## 编辑说明

正文要把自注意力与更广义的注意力、完整 Transformer 架构分开。查询、键和值只解释信息流，不展开矩阵推导；边界需同时覆盖位置顺序与长序列成本。
