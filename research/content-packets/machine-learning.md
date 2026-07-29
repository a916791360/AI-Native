---
termId: machine-learning
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - nist-machine-learning
  - google-ml-crash-course
timeBoundary: 基础定义稳定；具体工具、课程模块和工程界面以 2026-07-29 访问版本为准。
claims:
  - id: learns-from-data
    statement: 机器学习系统通过数据学习并调整任务表现，而不是只依赖逐条手写规则。
    evidenceType: definition
    sourceIds:
      - nist-machine-learning
      - google-ml-crash-course
  - id: training-and-evaluation
    statement: 一个可用的机器学习流程需要训练数据、目标、模型训练和独立评估，而不只是选择算法。
    evidenceType: mechanism
    sourceIds:
      - google-ml-crash-course
  - id: task-specific-evidence
    statement: 机器学习是否适用取决于任务、可用数据和可验证目标，不能把它当作所有问题的通用答案。
    evidenceType: boundary
    sourceIds:
      - google-ml-crash-course
---

## 编辑说明

面向初学者区分“从数据学习规律”和“系统自动拥有理解力”。例子采用垃圾邮件分类，避免从单一演示推导普遍能力。
