---
termId: model-capability
batch: product-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - helm
  - openai-evaluation-best-practices
timeBoundary: 场景化评测原则相对稳定；具体模型强项、版本、基准结果、提示配置和 API 会持续变化。
claims:
  - id: scenario-specific-ability
    statement: 模型能力是在指定任务或场景、输入、提示与运行配置和指标下可测量的表现，不是脱离条件的通用智能标签。
    evidenceType: definition
    sourceIds:
      - helm
      - openai-evaluation-best-practices
  - id: representative-multimetric-evaluation
    statement: 应在标准化配置下，用覆盖典型、边界与对抗情况的代表性样本和多个相关指标测量模型能力，并比较指标之间的取舍。
    evidenceType: mechanism
    sourceIds:
      - helm
      - openai-evaluation-best-practices
  - id: model-to-system-gap
    statement: 基准分数不能直接预测产品结果，因为评测覆盖可能不完整，系统表现还取决于使用情境、数据、工具和工作流。
    evidenceType: boundary
    sourceIds:
      - helm
      - openai-evaluation-best-practices
---

## 编辑说明

正文要区分单个模型的可测能力与完整 AI 系统的能力边界，不做供应商排行榜。示例必须写明任务、样本、配置和指标。
