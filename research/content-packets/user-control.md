---
termId: user-control
batch: product-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - google-pair-feedback-control
  - microsoft-human-ai-interaction-guidelines
timeBoundary: 让用户理解并控制 AI 行为的交互原则相对稳定；具体权限、数据使用、个性化机制和可撤销范围需按产品与法规持续复核。
claims:
  - id: meaningful-action-over-ai
    statement: 用户控制权是让用户能够发起、调整、纠正、暂停或关闭 AI 行为，并管理相关偏好、反馈和数据设置的产品能力。
    evidenceType: definition
    sourceIds:
      - google-pair-feedback-control
      - microsoft-human-ai-interaction-guidelines
  - id: visible-state-and-recovery
    statement: 控制应在需要时出现，说明当前状态与操作后果，支持轻松纠正、退出、重置或回到可行的手动路径，并明确反馈会如何以及何时影响体验。
    evidenceType: mechanism
    sourceIds:
      - google-pair-feedback-control
      - microsoft-human-ai-interaction-guidelines
  - id: controls-must-work
    statement: 控件数量多不代表控制充分；用户必须理解并能有效改变结果，高风险或不可逆动作还需要更强的确认、授权和恢复机制。
    evidenceType: boundary
    sourceIds:
      - google-pair-feedback-control
      - microsoft-human-ai-interaction-guidelines
---

## 编辑说明

正文不要把点赞或一个开关直接等同于用户控制。需要说明控制对象、作用范围、生效时间、撤销方法和失败后的手动路径，并区分用户反馈、数据许可与业务授权。
