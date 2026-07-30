---
termId: model-routing
batch: product-1
status: research
accessedAt: '2026-07-30'
sourceIds:
  - routellm
  - frugalgpt
timeBoundary: 按约束选择模型的目标相对稳定；模型池、价格、延迟、质量分布、训练数据与路由阈值会持续漂移。
claims:
  - id: policy-based-model-selection
    statement: 模型路由根据每次请求的任务信号与质量、成本、延迟、安全和可用性约束，从候选模型或推理配置中选择执行路径。
    evidenceType: definition
    sourceIds:
      - routellm
      - frugalgpt
  - id: score-route-evaluate
    statement: 实施时先定义候选模型与质量底线，再用规则、分类器、学习式路由器或级联选择与升级，并记录决策和结果，与固定使用强模型或弱模型的基线持续比较。
    evidenceType: mechanism
    sourceIds:
      - routellm
      - frugalgpt
  - id: router-adds-failure-mode
    statement: 路由收益只对对应数据、模型池、价格和评测成立；误路由会损害质量，路由本身还增加延迟与运维复杂度，因此需要护栏、回退和持续监测。
    evidenceType: boundary
    sourceIds:
      - routellm
      - frugalgpt
---

## 编辑说明

正文应区分应用层请求路由、负载均衡和模型内部的混合专家路由。案例需展示决策表、升级条件、评测基线与回滚条件。
