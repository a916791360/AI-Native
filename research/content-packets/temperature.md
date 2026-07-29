---
termId: temperature
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - hugging-face-generation-docs
  - google-vertex-generation-parameters
  - neural-text-degeneration-paper
timeBoundary: 温度缩放的原理稳定；有效范围、默认值、零值行为及其与 top-p、top-k 的组合规则以具体模型服务文档为准。
claims:
  - id: sampling-probability-control
    statement: 温度是生成阶段调节下一 Token 概率并影响采样随机性的参数，不会修改模型训练数据或参数。
    evidenceType: definition
    sourceIds:
      - hugging-face-generation-docs
      - google-vertex-generation-parameters
  - id: lower-concentrated-higher-diverse
    statement: 在支持温度采样的实现中，较低温度通常让选择更集中和可预测，较高温度通常增加候选多样性与随机性。
    evidenceType: mechanism
    sourceIds:
      - google-vertex-generation-parameters
  - id: decoding-control-not-quality-guarantee
    statement: 温度只影响解码选择，不能保证创造力、事实性或安全性；不同解码策略即使使用同一模型也会显著改变文本质量。
    evidenceType: boundary
    sourceIds:
      - neural-text-degeneration-paper
      - google-vertex-generation-parameters
---

## 编辑说明

正文不得把温度写成“创造力旋钮”或通用事实性控制。明确温度只在相应采样流程中生效，`0` 的含义和允许范围以具体 API 为准。
