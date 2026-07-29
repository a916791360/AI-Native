---
termId: evaluation
batch: sample-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - nist-ai-tevv
  - nist-aria-pilot
timeBoundary: 评估原则依据 NIST 公开资料；具体项目、指标和标准状态以 2026-07-29 为边界。
claims:
  - id: criteria-and-context
    statement: AI 评估依据明确任务、数据、标准和方法判断系统在特定上下文中的表现与限制。
    evidenceType: definition
    sourceIds:
      - nist-ai-tevv
      - nist-aria-pilot
  - id: multiple-testing-levels
    statement: 可靠评估需要结合模型测试、系统或对抗测试以及接近真实使用情境的测试。
    evidenceType: mechanism
    sourceIds:
      - nist-ai-tevv
      - nist-aria-pilot
  - id: metrics-need-interpretation
    statement: 单一平均分无法代表所有用户和场景，评估结果必须连同样本、条件和不确定性解释。
    evidenceType: boundary
    sourceIds:
      - nist-ai-tevv
      - nist-aria-pilot
---

## 编辑说明

用客服问答评测展示离线集、红队、人工评价和线上监测的分工。避免把测试、评估、验证和确认混成同义词。
