---
termId: unsupervised-learning
batch: foundation-1
status: draft
accessedAt: '2026-07-29'
sourceIds:
  - google-machine-learning-types
  - deep-learning-book-representation-learning
timeBoundary: 基础定义与表示学习边界稳定；课程分类和示例以 2026-07-29 访问版本为准。
claims:
  - id: patterns-without-targets
    statement: 无监督学习不依赖预先给定的正确目标标签，而是尝试从数据中发现结构、分组或有用表示。
    evidenceType: definition
    sourceIds:
      - google-machine-learning-types
      - deep-learning-book-representation-learning
  - id: similarity-drives-clusters
    statement: 聚类等无监督方法依据选定的特征和相似度规则把相近样本组织成组，结果会随表示和度量改变。
    evidenceType: mechanism
    sourceIds:
      - google-machine-learning-types
      - deep-learning-book-representation-learning
  - id: clusters-need-interpretation
    statement: 算法得到的簇不自动带有业务含义或正确名称，仍需要结合任务背景解释并验证其是否有用。
    evidenceType: boundary
    sourceIds:
      - google-machine-learning-types
---

## 编辑说明

用“整理一批没有分类标签的反馈”解释发现结构，随后说明聚类只是无监督学习的一类方法。避免声称无监督结果天然客观，突出特征选择和人工解释的影响。
