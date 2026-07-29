---
termId: tokenizer
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - sentencepiece-paper
  - bpe-subword-paper
timeBoundary: 子词分词的基本动机稳定；具体词表、规范化规则和特殊 Token 由模型版本决定，不应跨模型假设一致。
claims:
  - id: text-token-conversion
    statement: 分词器按固定模型与词表把原始文本切分并编码为 Token 序列，同时提供从 Token 序列还原文本的解码过程。
    evidenceType: definition
    sourceIds:
      - sentencepiece-paper
  - id: finite-vocabulary-subwords
    statement: 子词方法用有限词表组合常见片段与较小单位，使模型能够表示罕见词和未见过的词形，而不必为每个完整词建立词表项。
    evidenceType: mechanism
    sourceIds:
      - sentencepiece-paper
      - bpe-subword-paper
  - id: tokens-are-not-linguistic-words
    statement: Token 边界由训练算法、词表和文本规范化共同决定，不等同于自然语言中的词；同一文本在不同分词器下可能得到不同长度和切分。
    evidenceType: boundary
    sourceIds:
      - sentencepiece-paper
      - bpe-subword-paper
---

## 编辑说明

正文用中英文、标点和罕见名称展示“一段文本可能对应多个 Token”，但不承诺某个现成模型的固定切分结果。需要明确分词器是模型输入输出契约的一部分，不能随意替换。
