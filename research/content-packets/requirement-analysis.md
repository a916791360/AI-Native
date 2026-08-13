---
termId: requirement-analysis
batch: pm-basics-1
status: verified
accessedAt: '2026-08-13'
sourceIds:
  - ireb-requirements
  - wikipedia-requirements-analysis
timeBoundary: 需求工程流程为长期通用框架，不绑定具体工具或供应商产品。
claims:
  - id: core-definition
    statement: 需求分析是把模糊想法拆解为可验证的问题、目标、约束与验收条件的过程。
    evidenceType: definition
    sourceIds:
      - ireb-requirements
      - wikipedia-requirements-analysis
  - id: user-vs-product
    statement: 需要区分用户需求（问题）与产品需求（解决方案），避免把实现方式误当成需求本身。
    evidenceType: mechanism
    sourceIds:
      - ireb-requirements
  - id: verification-boundary
    statement: 需求必须能用可观察标准验证，否则会带来返工和「完成」定义不清的风险。
    evidenceType: boundary
    sourceIds:
      - wikipedia-requirements-analysis
---

## 编辑说明

正文强调「可验证」是需求分析的核心，用客服场景说明需求从模糊到可验收的转换。正文不把需求分析等同于写文档；关系上 requirement-analysis 承接 user-research，并作为 prd 的前置。
