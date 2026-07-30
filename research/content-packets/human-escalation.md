---
termId: human-escalation
batch: product-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - google-pair-errors-graceful-failure
  - nist-ai-rmf-core
timeBoundary: 在失败、高风险和超出能力边界时保留人工路径的原则相对稳定；触发阈值、人员能力、服务时间与事件响应流程需按业务持续验证。
claims:
  - id: event-driven-transfer
    statement: 人工升级处理是在不确定、失败、异常或风险超过自动化边界时，将任务、必要上下文和决定权转交给具备权限人员的事件驱动流程。
    evidenceType: definition
    sourceIds:
      - google-pair-errors-graceful-failure
      - nist-ai-rmf-core
  - id: trigger-route-context-close
    statement: 有效升级需要预先定义触发条件和接收角色，保留输入、系统状态、证据与已执行动作，告知用户进度，并在人员处理后关闭反馈与恢复循环。
    evidenceType: mechanism
    sourceIds:
      - google-pair-errors-graceful-failure
      - nist-ai-rmf-core
  - id: link-is-not-escalation
    statement: 一个“联系客服”链接不等于可用的人工升级；没有明确责任人、可接受响应时间和完整上下文会形成死路，而把所有异常都升级又会造成队列过载。
    evidenceType: boundary
    sourceIds:
      - google-pair-errors-graceful-failure
      - nist-ai-rmf-core
---

## 编辑说明

正文应突出从自动处理到人工处理的完整交接，而不是泛泛写客服兜底。案例要包含触发、路由、上下文、等待状态、人员决定和闭环，并与持续性的人工监督区分。
