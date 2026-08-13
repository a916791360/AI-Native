---
termId: ab-testing
batch: pm-basics-1
status: verified
accessedAt: '2026-08-13'
sourceIds:
  - wikipedia-ab-testing
  - exp-platform
timeBoundary: A/B 测试方法为长期稳定的实验实践，样本与统计要求随场景变化。
claims:
  - id: core-definition
    statement: A/B 测试是把用户随机分组比较不同方案，以判断改动是否带来因果改善的在线实验方法。
    evidenceType: definition
    sourceIds:
      - wikipedia-ab-testing
      - exp-platform
  - id: randomization-mechanism
    statement: 随机化排除用户差异等干扰，先定指标与样本量，只改变一个变量，再用统计检验判断显著性。
    evidenceType: mechanism
    sourceIds:
      - exp-platform
  - id: causality-boundary
    statement: 样本不足会得出假显著，同时改多个变量无法归因，高风险场景要谨慎设计。
    evidenceType: boundary
    sourceIds:
      - wikipedia-ab-testing
      - exp-platform
---

## 编辑说明

正文用 AI 客服助手测试「默认展开引用」说明单变量、随机化与关键指标。正文明确 A/B 测试不是唯一决策手段；关系上 ab-testing 连接 north-star-metric 与 product-analytics。
