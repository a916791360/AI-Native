---
termId: classification
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - google-classification
  - deep-learning-book-machine-learning
timeBoundary: 分类任务的基础定义稳定；阈值、指标和部署决策需按具体类别分布与错误代价复核。
claims:
  - id: predicts-discrete-classes
    statement: 分类任务把输入映射到离散类别，可包括二分类、多分类和一个样本对应多个标签的多标签分类。
    evidenceType: definition
    sourceIds:
      - google-classification
      - deep-learning-book-machine-learning
  - id: scores-become-decisions
    statement: 分类模型常先产生分数或概率，再通过阈值或类别选择规则转成最终标签，规则变化会改变错误分布。
    evidenceType: mechanism
    sourceIds:
      - google-classification
  - id: accuracy-is-not-universal
    statement: 类别不平衡或不同错误代价悬殊时，单看准确率可能掩盖失败，指标与阈值必须结合任务后果选择。
    evidenceType: boundary
    sourceIds:
      - google-classification
---

## 编辑说明

正文先区分离散类别与连续数值，再说明模型分数不等于业务决策。示例需要同时写出误报和漏报的代价，避免把 0.5 阈值或准确率当作所有分类任务的默认答案。
