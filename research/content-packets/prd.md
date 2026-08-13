---
termId: prd
batch: pm-basics-1
status: verified
accessedAt: '2026-08-13'
sourceIds:
  - svpg-inspired
  - atlassian-prd
timeBoundary: 产品文档方法为长期实践，具体模板与协作工具可能随团队而变化。
claims:
  - id: core-definition
    statement: PRD 是记录产品目标、用户、功能、验收标准与范围的文档，是跨角色协作的需求契约。
    evidenceType: definition
    sourceIds:
      - atlassian-prd
  - id: problem-solution-split
    statement: 好产品文档把「用户问题」与「解决方案」分开写，先讲清为谁解决什么，再讲怎么做。
    evidenceType: mechanism
    sourceIds:
      - svpg-inspired
  - id: acceptance-boundary
    statement: 验收标准必须可观察、可验证，用形容词替代验收条件会导致「完成」定义不清。
    evidenceType: boundary
    sourceIds:
      - atlassian-prd
---

## 编辑说明

正文把 PRD 定位为「共识契约」而非文档厚度，用 AI 客服助手说明「不做什么」与可观察验收标准。正文不把某一种模板写成唯一标准；关系上 prd 承接 requirement-analysis，并连接 acceptance-criteria 与 prioritization。
