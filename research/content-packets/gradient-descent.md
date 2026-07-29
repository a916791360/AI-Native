---
termId: gradient-descent
batch: foundation-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - google-gradient-descent
  - deep-learning-book-optimization
timeBoundary: 梯度下降的基本更新机制稳定；优化器变体、收敛条件和工程建议需结合模型与目标函数复核。
claims:
  - id: iterative-gradient-optimization
    statement: 梯度下降是反复计算目标函数对参数的梯度，并沿降低目标的方向更新参数的迭代优化方法。
    evidenceType: definition
    sourceIds:
      - google-gradient-descent
      - deep-learning-book-optimization
  - id: learning-rate-scales-step
    statement: 每次参数更新的幅度由梯度与学习率共同决定，学习率过小会拖慢训练，过大可能导致震荡或无法收敛。
    evidenceType: mechanism
    sourceIds:
      - google-gradient-descent
      - deep-learning-book-optimization
  - id: optimization-is-not-generalization
    statement: 降低训练目标只说明优化过程取得进展，不保证找到全局最优，也不保证模型在未见数据或业务场景中表现更好。
    evidenceType: boundary
    sourceIds:
      - google-gradient-descent
      - deep-learning-book-optimization
---

## 编辑说明

正文用“坡度指方向、学习率定步长”建立直觉，但要明确真实模型通常位于高维参数空间。避免把梯度下降写成必然走到唯一最低点，也不要把训练损失下降等同于模型已经可用。
