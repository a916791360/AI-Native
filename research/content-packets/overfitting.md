---
termId: overfitting
batch: foundation-1
status: draft
accessedAt: '2026-07-29'
sourceIds:
  - google-overfitting
  - deep-learning-book-machine-learning
timeBoundary: 过拟合与模型容量的基础关系稳定；诊断阈值和缓解方法需按数据分布、任务与模型复核。
claims:
  - id: training-fit-unseen-failure
    statement: 过拟合指模型在训练数据上表现很好，却未能把所得规律推广到新的、未参与训练的样本。
    evidenceType: definition
    sourceIds:
      - google-overfitting
      - deep-learning-book-machine-learning
  - id: capacity-and-data-interact
    statement: 模型容量相对数据不足或训练数据不能代表预期条件时，模型更容易学习偶然细节而不是可迁移规律。
    evidenceType: mechanism
    sourceIds:
      - google-overfitting
      - deep-learning-book-machine-learning
  - id: low-training-loss-is-insufficient
    statement: 较低训练误差不能证明没有过拟合，需要比较独立验证或测试表现，并检查数据与真实使用条件是否一致。
    evidenceType: boundary
    sourceIds:
      - google-overfitting
      - deep-learning-book-machine-learning
---

## 编辑说明

正文以训练表现与未见样本表现的差距解释现象，不把“模型大”直接判为过拟合。缓解部分应同时覆盖数据、容量、正则化和评估设计，避免承诺某一种技术可以自动解决。
