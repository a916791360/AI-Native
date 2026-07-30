---
termId: prompt-template
batch: collaboration-1
status: verified
accessedAt: '2026-07-30'
sourceIds:
  - prompting-methods-survey
  - hugging-face-chat-templates
timeBoundary: 固定结构加变量的模板思想稳定；聊天模板的标记、角色、特殊 Token 与渲染 API 必须匹配具体模型和工具版本。
claims:
  - id: reusable-prompt-function
    statement: 提示词模板把固定指令结构与可替换输入组合成实际提示，使同类任务能够使用一致的构造方式。
    evidenceType: definition
    sourceIds:
      - prompting-methods-survey
  - id: render-to-model-format
    statement: 对聊天模型而言，模板可以把角色化消息渲染为模型训练时所期望的可分词文本与特殊标记序列。
    evidenceType: mechanism
    sourceIds:
      - hugging-face-chat-templates
  - id: template-must-match-model
    statement: 模板不是只影响代码整洁度，错误的角色标记、空白或特殊 Token 可能改变模型输入并损害效果，因此不能跨模型盲目复用。
    evidenceType: boundary
    sourceIds:
      - hugging-face-chat-templates
---

## 编辑说明

正文应从业务模板和模型聊天模板两个层次解释复用，但不能把两者混为一谈。实践任务应要求读者识别变量、默认值、输入转义和版本依赖。
