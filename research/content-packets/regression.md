---
termId: regression
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - google-linear-regression
  - deep-learning-book-machine-learning
timeBoundary: 回归任务的输出与误差框架稳定；具体模型、损失函数和数值范围需按业务数据另行确定。
claims:
  - id: predicts-numeric-values
    statement: 回归任务根据输入特征预测数值型目标，输出通常位于连续尺度上，而不是从有限类别中选一个标签。
    evidenceType: definition
    sourceIds:
      - google-linear-regression
      - deep-learning-book-machine-learning
  - id: loss-measures-distance
    statement: 训练会用损失函数衡量预测值与真实值的差异，并调整模型参数以降低所选误差度量。
    evidenceType: mechanism
    sourceIds:
      - google-linear-regression
      - deep-learning-book-machine-learning
  - id: loss-choice-shapes-behavior
    statement: 不同回归损失对大误差和异常值的敏感程度不同，较低平均误差也不能单独证明预测在关键区间可用。
    evidenceType: boundary
    sourceIds:
      - google-linear-regression
      - deep-learning-book-machine-learning
---

## 编辑说明

正文以处理时长或需求量解释连续数值输出，但不把回归任务缩成线性回归。需要说明单位、误差方向和关键区间，避免只报一个平均误差而隐藏业务上不可接受的大偏差。
