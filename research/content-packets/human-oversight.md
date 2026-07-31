---
termId: human-oversight
batch: product-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - nist-ai-rmf-core
  - nist-ai-rmf-human-ai-interaction
timeBoundary: 按风险建立有权限人工监督的治理原则相对稳定；具体法定义务、角色、阈值、记录与停止机制需按行业、司法辖区和系统用途复核。
claims:
  - id: empowered-organizational-control
    statement: 人工监督是由职责明确且具备权限、信息和能力的人员监测、质疑、干预、推翻、暂停或停用 AI 系统的组织控制安排。
    evidenceType: definition
    sourceIds:
      - nist-ai-rmf-core
      - nist-ai-rmf-human-ai-interaction
  - id: risk-based-oversight-process
    statement: 组织应依据用途与风险确定需要监督的环节，分配角色与决定权，规定信息、触发阈值、记录和响应流程，并持续评估监督是否实际有效。
    evidenceType: mechanism
    sourceIds:
      - nist-ai-rmf-core
      - nist-ai-rmf-human-ai-interaction
  - id: presence-is-not-effectiveness
    statement: 不同系统不需要相同强度的监督；仅有人员在场不能保证安全，缺少授权、上下文、时间或训练的监督只是名义控制，人本身也可能带入偏差。
    evidenceType: boundary
    sourceIds:
      - nist-ai-rmf-human-ai-interaction
---

## 编辑说明

正文要把人工监督与用户控制、人在回路和事件触发的人工升级区分开。案例应明确监督主体、持续或抽查方式、干预权限、停用条件和审计记录，避免使用“最终由人负责”这类空泛表述。
