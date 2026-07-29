---
termId: attention-mechanism
batch: foundation-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - bahdanau-attention-paper
  - transformer-original-paper
timeBoundary: 注意力的加权选择思想稳定；打分函数、稀疏方式和计算代价会随架构变化，正文不绑定单一实现。
claims:
  - id: dynamically-weight-relevant-information
    statement: 注意力机制根据当前计算目标为候选信息分配不同权重，再聚合出与当前任务相关的表示。
    evidenceType: definition
    sourceIds:
      - bahdanau-attention-paper
      - transformer-original-paper
  - id: score-normalize-aggregate
    statement: 常见实现先计算查询与候选键的匹配分数，将分数归一化为权重，再对对应值进行加权汇总。
    evidenceType: mechanism
    sourceIds:
      - transformer-original-paper
  - id: attention-is-broader-than-self-attention
    statement: 注意力不只发生在同一序列内部；早期编码器解码器注意力会让解码状态选择源序列位置，自注意力只是其中一种结构。
    evidenceType: boundary
    sourceIds:
      - bahdanau-attention-paper
      - transformer-original-paper
---

## 编辑说明

正文先用“当前问题决定看哪里”建立直觉，再解释打分、归一化和加权汇总。不得把注意力权重直接写成人类注意力或因果解释，也不要提前把注意力机制等同于自注意力。
