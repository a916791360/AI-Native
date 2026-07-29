---
termId: training-data
batch: foundation-1
status: verified
accessedAt: '2026-07-29'
sourceIds:
  - google-dataset-characteristics
  - nist-industrial-ai-guide
timeBoundary: 数据质量原则稳定；规模经验值、采集条件和治理要求必须结合具体任务与当前制度复核。
claims:
  - id: examples-used-for-learning
    statement: 训练数据是提供给学习过程的一组样本，可包含数值、类别、文本、图像、音频或其他系统输出。
    evidenceType: definition
    sourceIds:
      - google-dataset-characteristics
  - id: quality-shapes-behavior
    statement: 模型会从训练样本中调整参数，因此样本覆盖、标签错误、噪声、缺失和重复都会影响所得行为。
    evidenceType: mechanism
    sourceIds:
      - google-dataset-characteristics
      - nist-industrial-ai-guide
  - id: representative-not-merely-large
    statement: 数据量大不等于适合任务，训练数据还需覆盖预期使用条件并检查偏差、不平衡和关键场景缺失。
    evidenceType: boundary
    sourceIds:
      - google-dataset-characteristics
      - nist-industrial-ai-guide
---

## 编辑说明

正文用“模型看到的练习材料”作直觉入口，但必须说明数据不是被动原料：采集范围、标签规则和过滤决策都会进入模型。避免复述固定规模经验值作为通用门槛。
