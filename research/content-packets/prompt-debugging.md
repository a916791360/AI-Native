---
termId: prompt-debugging
batch: collaboration-1
status: draft
accessedAt: '2026-07-30'
sourceIds:
  - openai-model-guidance
  - openai-evaluation-best-practices
timeBoundary: 复现问题、隔离变量和回归验证的调试方法相对稳定；模型专属提示建议、参数、默认行为与工具能力需要按当前版本复核。
claims:
  - id: reproduce-and-localize
    statement: 提示词调试应先固定失败输入和运行条件，再检查指令、上下文、示例、工具描述与输出，形成可以验证的原因假设。
    evidenceType: definition
    sourceIds:
      - openai-model-guidance
      - openai-evaluation-best-practices
  - id: isolate-one-variable
    statement: 一次只改变一组指令、示例或工具配置，并在同一代表性评测集上复测，才能区分局部改善与整体回归。
    evidenceType: mechanism
    sourceIds:
      - openai-model-guidance
      - openai-evaluation-best-practices
  - id: avoid-vibe-debugging
    statement: 单次输出变好不能证明问题已定位，因为生成具有随机性，失败还可能来自输入分布、模型版本、上下文或运行环境。
    evidenceType: boundary
    sourceIds:
      - openai-evaluation-best-practices
---

## 编辑说明

正文要使用可复现的失败案例，按“记录条件—提出假设—单变量修改—同集复测—检查回归”展开。不要把不断重写提示词或刷新到满意答案写成调试。
