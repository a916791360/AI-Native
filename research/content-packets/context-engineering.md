---
termId: context-engineering
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - anthropic-effective-context-engineering
  - anthropic-context-editing
timeBoundary: 上下文工程作为推理时信息策展的方法相对稳定；具体上下文编辑、压缩、缓存与工具管理能力会随模型、API 和 SDK 版本变化。
claims:
  - id: holistic-context-curation
    statement: 上下文工程是在模型推理时选择并维护合适信息集合的实践，范围包括提示词、消息历史、工具、外部数据与运行状态。
    evidenceType: definition
    sourceIds:
      - anthropic-effective-context-engineering
  - id: iterative-selection
    statement: 上下文工程不是一次性写好提示词，而是在任务推进时持续检索、组织、保留或移除信息，使每轮输入保持高信号密度。
    evidenceType: mechanism
    sourceIds:
      - anthropic-effective-context-engineering
      - anthropic-context-editing
  - id: more-context-not-always-better
    statement: 上下文是有限资源，加入更多 Token 不会自动改善结果；无关或过时内容可能降低模型聚焦和召回能力。
    evidenceType: boundary
    sourceIds:
      - anthropic-effective-context-engineering
      - anthropic-context-editing
---

## 编辑说明

正文要把上下文工程写成贯穿多轮任务的信息管理过程，不缩减为“写更长的提示词”。案例应展示指令、工具结果、检索资料和进度状态如何按当前任务动态进入或退出上下文。
