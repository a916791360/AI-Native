---
termId: long-context
batch: collaboration-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - anthropic-context-windows
  - lost-in-the-middle
timeBoundary: 长上下文的容量与有效利用必须分开描述；具体 Token 上限、输出占用、溢出行为和各位置召回表现随模型与服务版本变化。
claims:
  - id: extended-working-input
    statement: 长上下文指模型在一次推理中接收并处理较长消息历史、文档、工具结果与输出预算的能力，其容量通常以 Token 范围表示。
    evidenceType: definition
    sourceIds:
      - anthropic-context-windows
  - id: capacity-and-use-differ
    statement: 支持更长输入只扩大可提交的信息范围，不代表模型能在所有长度和位置上同等可靠地检索、关联和使用内容。
    evidenceType: mechanism
    sourceIds:
      - anthropic-context-windows
      - lost-in-the-middle
  - id: position-sensitive-recall
    statement: 长上下文实验显示相关信息位置会影响表现，部分模型在输入中部的检索与问答性能明显下降，因此窗口标称值不能直接当作有效召回保证。
    evidenceType: boundary
    sourceIds:
      - lost-in-the-middle
---

## 编辑说明

正文不固化任何当前模型的窗口数字，重点区分“装得下”和“用得好”。实践任务应改变关键证据的位置、无关材料数量和输入长度，用固定问题与答案指标观察有效利用率。
