---
termId: confidence-calibration
batch: product-1
status: draft
accessedAt: '2026-07-31'
sourceIds:
  - guo-modern-neural-network-calibration
  - nist-ai-rmf-core
timeBoundary: 置信度与经验正确率对齐的统计定义相对稳定；模型架构、分数语义、校准数据、后处理方法和部署分布变化后都需重新验证。
claims:
  - id: confidence-frequency-alignment
    statement: 置信度校准要求一组预测表达的概率与该组实际正确频率相符，例如标为 0.8 的预测在对应条件下应约有 80% 正确。
    evidenceType: definition
    sourceIds:
      - guo-modern-neural-network-calibration
  - id: measure-fit-and-recheck
    statement: 实施时需先明确分数代表的事件，在独立且有代表性的数据上比较分数与结果，必要时拟合温度缩放等后处理，并在模型、数据或场景变化后重新测量。
    evidenceType: mechanism
    sourceIds:
      - guo-modern-neural-network-calibration
      - nist-ai-rmf-core
  - id: calibrated-is-not-correct
    statement: 校准衡量的是分数与经验频率的对应关系，不等于模型准确、单次预测可信或在未测试分布上仍有效；具体方法的有效性受数据和模型条件限制。
    evidenceType: boundary
    sourceIds:
      - guo-modern-neural-network-calibration
      - nist-ai-rmf-core
---

## 编辑说明

正文要先定义“分数对应什么事件”，再区分校准、准确率和界面上的不确定性呈现。案例应展示校准前后可靠性分组、独立校准集以及模型或数据变化后的重新验证条件。
