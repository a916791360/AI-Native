---
termId: instruction-hierarchy
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - instruction-hierarchy-paper
  - openai-model-spec-2025
timeBoundary: 按来源权限解决冲突的原则相对稳定；角色名称、层级数量、工具输出处理和冲突规则由模型规范与产品协议决定，并会随版本更新。
claims:
  - id: conflict-priority
    statement: 指令层级为不同来源的指令分配优先级，使模型在指令冲突时优先遵循更高权限来源，而不是简单服从最后出现的文本。
    evidenceType: definition
    sourceIds:
      - instruction-hierarchy-paper
      - openai-model-spec-2025
  - id: conditionally-follow-lower-level
    statement: 较低层指令在不冲突时仍应被执行；层级机制的目标是有条件地忽略冲突内容，而不是一概拒绝用户或第三方输入。
    evidenceType: mechanism
    sourceIds:
      - instruction-hierarchy-paper
      - openai-model-spec-2025
  - id: hierarchy-not-complete-defense
    statement: 指令层级训练能够提升提示注入鲁棒性，但不能替代数据隔离、工具授权、输入标记和输出验证等系统级控制。
    evidenceType: boundary
    sourceIds:
      - instruction-hierarchy-paper
      - openai-model-spec-2025
---

## 编辑说明

正文应使用“来源权限与冲突”解释层级，不把网页、文档或工具结果中的文字自动视为用户指令。练习应同时包含冲突、无冲突和看似攻击但允许执行的边界案例，避免把层级写成机械拒绝规则。
