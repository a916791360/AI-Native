---
termId: inference
batch: foundation-1
status: draft
accessedAt: '2026-07-29'
sourceIds:
  - google-ml-glossary
  - hugging-face-generation-docs
  - vllm-paper
timeBoundary: 推理定义稳定；生成 API 参数、缓存实现、吞吐和延迟需按模型、运行时、硬件与服务版本复核。
claims:
  - id: apply-trained-model
    statement: 模型推理是把已训练模型应用于新输入以产生预测；对大语言模型而言，通常是根据输入提示生成响应。
    evidenceType: definition
    sourceIds:
      - google-ml-glossary
  - id: generation-is-configured-decoding
    statement: 文本生成在推理时根据模型输出的下一 Token 概率和解码配置选择 Token，并把生成结果继续作为后续计算的上下文。
    evidenceType: mechanism
    sourceIds:
      - google-ml-glossary
      - hugging-face-generation-docs
  - id: serving-costs-are-part-of-inference
    statement: 推理不只是模型给出内容，还受到缓存、批处理、序列长度、延迟、吞吐和内存管理约束；优化服务系统不会自动提升回答事实性。
    evidenceType: boundary
    sourceIds:
      - vllm-paper
---

## 编辑说明

正文要区分训练更新参数与推理使用固定模型，也要区分模型计算、解码和服务系统。吞吐提升只引用论文实验范围，不写成所有硬件与负载的固定倍数。
