---
termId: human-ai-collaboration
batch: product-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - microsoft-human-ai-interaction-guidelines
  - nist-ai-rmf-human-ai-interaction
timeBoundary: 按任务、能力、风险与责任分配人机角色的原则相对稳定；具体模型能力、组织职责、交互方式与自动化边界需按当前系统复核。
claims:
  - id: shared-operating-model
    statement: 人机协作是根据任务情境、双方能力、风险与责任，在 AI 辅助、人类判断、自动执行和人工接管之间明确分工的整体工作方式。
    evidenceType: definition
    sourceIds:
      - microsoft-human-ai-interaction-guidelines
      - nist-ai-rmf-human-ai-interaction
  - id: roles-flow-and-feedback
    statement: 有效协作需要定义角色、信息流、决定权、反馈与纠正方式、交接条件，并以人机团队的任务结果而非单独模型分数评估效果。
    evidenceType: mechanism
    sourceIds:
      - microsoft-human-ai-interaction-guidelines
      - nist-ai-rmf-human-ai-interaction
  - id: not-rubber-stamping
    statement: 让 AI 先给答案、人员只做形式确认不等于有效协作；人也会受偏差、疲劳和信息不足影响，最终责任不能因使用 AI 而消失。
    evidenceType: boundary
    sourceIds:
      - nist-ai-rmf-human-ai-interaction
---

## 编辑说明

正文要把人机协作写成整体运行模型，并与“人在回路”的特定控制点区分。案例应展示双方分别负责什么、何时交换信息、谁拥有最终决定权，以及如何用完整任务结果判断组合是否优于单独工作。
