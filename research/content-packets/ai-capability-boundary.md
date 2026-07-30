---
termId: ai-capability-boundary
batch: product-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - nist-ai-rmf-core
  - helm
timeBoundary: 用情境和作用域界定能力边界的原则相对稳定；具体模型与系统能力、基准覆盖和部署条件会快速变化。
claims:
  - id: reliable-range-and-failures
    statement: AI 能力边界是系统在已指明任务、输入、用户群、部署条件和指标下展示可接受表现的范围，以及范围外已知的失败方式。
    evidenceType: definition
    sourceIds:
      - nist-ai-rmf-core
      - helm
  - id: scope-test-document
    statement: 团队应定义预期范围与运行条件，在接近部署的代表性场景中用相关多指标评测，并记录知识限制、泛化限制和人工监督要求。
    evidenceType: mechanism
    sourceIds:
      - nist-ai-rmf-core
      - helm
  - id: benchmark-is-not-universal-boundary
    statement: 单一基准或模型排名不能建立通用能力边界，结果只适用于对应场景、指标和配置，完整系统还受到数据、工具与人员流程影响。
    evidenceType: boundary
    sourceIds:
      - nist-ai-rmf-core
      - helm
---

## 编辑说明

正文要把能力边界写成有证据的范围图，而不是笼统免责声明。案例应分别展示边界内、边界外和未知区域，并给出退路。
