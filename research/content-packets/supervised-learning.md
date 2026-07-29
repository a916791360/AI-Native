---
termId: supervised-learning
batch: foundation-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - google-supervised-learning
  - deep-learning-book-machine-learning
timeBoundary: 核心学习范式稳定；课程结构、示例和工具界面以 2026-07-29 访问版本为准。
claims:
  - id: labeled-examples
    statement: 监督学习使用同时包含输入特征和目标标签的样本，让模型学习从输入到目标输出的映射。
    evidenceType: definition
    sourceIds:
      - google-supervised-learning
      - deep-learning-book-machine-learning
  - id: loss-guides-training
    statement: 训练过程比较模型预测与真实标签，并依据两者差异形成的损失逐步调整模型参数。
    evidenceType: mechanism
    sourceIds:
      - google-supervised-learning
      - deep-learning-book-machine-learning
  - id: unseen-data-boundary
    statement: 训练集表现不能单独证明模型可用，仍需用未参与训练的数据检验对新样本的泛化能力。
    evidenceType: boundary
    sourceIds:
      - google-supervised-learning
      - deep-learning-book-machine-learning
---

## 编辑说明

正文先用“特征、标签、预测”建立最小闭环，再区分训练与评估。避免把监督学习缩写为“有人全程监督”，并明确标签质量与数据覆盖会限制结果。
