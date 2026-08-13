---
termId: acceptance-criteria
batch: pm-basics-1
status: verified
accessedAt: '2026-08-13'
sourceIds:
  - atlassian-acceptance-criteria
  - wikipedia-acceptance-testing
timeBoundary: 验收标准为长期稳定的工程实践，不绑定具体团队工具或流程。
claims:
  - id: core-definition
    statement: 验收标准是用可观察、可验证的条件描述功能完成标准，用于对齐开发、测试与业务。
    evidenceType: definition
    sourceIds:
      - atlassian-acceptance-criteria
  - id: coverage-principle
    statement: 验收标准应覆盖正常路径、边界与失败情况，并且只描述「完成时会发生什么」而不写实现细节。
    evidenceType: mechanism
    sourceIds:
      - atlassian-acceptance-criteria
      - wikipedia-acceptance-testing
  - id: verification-boundary
    statement: 无法观察到真假的验收标准（如「体验更好」）无法用于验收，会带来返工和歧义。
    evidenceType: boundary
    sourceIds:
      - atlassian-acceptance-criteria
---

## 编辑说明

正文用 AI 客服助手说明可验证验收标准与「回答准确」这类模糊表述的区别。正文明确验收标准不是测试用例，也不规定实现方式；关系上 acceptance-criteria 从属于 prd 并承接 requirement-analysis。
