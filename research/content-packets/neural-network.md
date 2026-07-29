---
termId: neural-network
batch: foundation-1
status: draft
accessedAt: '2026-07-29'
sourceIds:
  - google-neural-network-activation
  - deep-learning-book-feedforward-networks
timeBoundary: 基础结构和训练机制稳定；具体激活函数与工程建议以 2026-07-29 访问版本为准。
claims:
  - id: layered-parameterized-model
    statement: 神经网络由分层计算单元及其连接组成，连接中的权重和偏置是在训练过程中学习的参数。
    evidenceType: definition
    sourceIds:
      - google-neural-network-activation
      - deep-learning-book-feedforward-networks
  - id: nonlinear-composition
    statement: 非线性激活函数让多层网络不只是重复线性变换，从而能够组合出更复杂的输入输出关系。
    evidenceType: mechanism
    sourceIds:
      - google-neural-network-activation
      - deep-learning-book-feedforward-networks
  - id: capacity-is-not-quality
    statement: 增加层数或参数只会提高表达容量，并不自动保证训练收敛、泛化更好或适合当前任务。
    evidenceType: boundary
    sourceIds:
      - google-neural-network-activation
      - deep-learning-book-feedforward-networks
---

## 编辑说明

避免把人工神经元写成生物神经元的精确复制。正文应以加权输入、偏置、激活和分层组合解释结构，并把优化与泛化留给后续词条展开。
