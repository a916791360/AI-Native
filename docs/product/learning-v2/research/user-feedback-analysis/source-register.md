# “每日用户反馈分析与产品改进”来源登记

- 状态：阶段 12A 来源核验完成
- 核验日期：2026-08-03
- 选源原则：优先标准机构、官方设计指南、官方工程文档和原始研究；供应商文档只支持通用工程方法，不证明具体产品或模型最优

## 1. 来源与主张边界

| ID                   | 来源                                                                                                                                                           | 本案例采用的主张                                                                                                     | 不支持的外推                                                    | 稳定性                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| `SRC-NIST-RMF-CORE`  | [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)                                                                                    | 先记录预期用途和使用情境；明确人机角色、监督、风险、监测与是否继续部署的决定                                         | 不证明本案例安全、合规或已经建立治理                            | 框架方法稳定；AI RMF 1.0 正在修订    |
| `SRC-NIST-HUMAN-AI`  | [NIST AI RMF Appendix C](https://airc.nist.gov/airmf-resources/airmf/appendices/app-c-ai-risk-management-and-human-ai-interaction/)                            | 人类角色与责任需要明确；把复杂现象量化可能丢失重要语境                                                               | 不证明所有 AI 系统都必须采用同一种人工审核方式                  | 原则稳定；随框架修订复核             |
| `SRC-PAIR-FEEDBACK`  | [Google PAIR: Feedback + Control](https://pair.withgoogle.com/guidebook-v2/chapter/feedback-controls/)                                                         | 反馈必须有明确含义与用途；自动化与用户控制需要平衡；保留手动路径并说明反馈如何使用                                   | 不证明收集越多反馈越好，也不构成数据许可                        | 交互原则稳定                         |
| `SRC-PAIR-FAILURE`   | [Google PAIR: Errors + Graceful Failure](https://pair.withgoogle.com/chapter/errors-failing/)                                                                  | 错误要按用户任务和影响定义；识别来源；提供继续路径；系统无法检测的错误需要反馈和手动接管                             | 不提供本案例的具体错误率或恢复阈值                              | 交互原则稳定                         |
| `SRC-PAIR-MENTAL`    | [Google PAIR: Mental Models](https://pair.withgoogle.com/guidebook-v2/chapter/mental-models/)                                                                  | 说明反馈对系统的影响；提供默认非 AI 路径；避免错误后无路可走                                                         | 不证明解释界面本身可以消除自动化偏差                            | 交互原则稳定                         |
| `SRC-MS-HAX`         | [Microsoft Research: Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/)           | 经多轮研究形成的 18 条指南支持纠正、范围控制、反馈和人工控制                                                         | 不保证逐条应用就能形成良好产品，也不替代情境研究                | 原始研究稳定                         |
| `SRC-OPENAI-EVALS`   | [OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)                                                   | 评测应任务化、尽早建立、覆盖真实分布与边界样本、记录日志并持续运行；自动指标需与人工判断校准；工作流各步骤应分别评估 | 不使用文档示例阈值；不证明 OpenAI 模型或 Evals 平台最适合本案例 | 方法较稳定；平台与产品生命周期会变化 |
| `SRC-GOOGLE-METRICS` | [Google ML Crash Course: Accuracy, precision and recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall) | 指标选择取决于错误成本；类别不平衡或错误代价不同场景不应只看 accuracy；高代价假阴性应重点观察 recall                 | 不提供本案例可接受的 precision、recall 或阈值                   | 数学定义稳定                         |
| `SRC-OPENAI-LATENCY` | [OpenAI: Latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization)                                                             | 减少输出、请求和不必要模型调用；较小模型通常更快更便宜，但必须用任务评测验证；不要默认使用 LLM                       | 不把经验比例当作跨模型承诺；不证明某型号最优                    | 原则较稳定，产品细节易变化           |
| `SRC-OPENAI-COST`    | [OpenAI: Cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization)                                                                   | 成本与延迟相关；减少请求和 Token、选择满足质量的较小模型、对适合的批处理使用异步方案                                 | 不使用当前价格，不绑定供应商，不把调用成本当总成本              | 原则较稳定，价格与功能易变化         |

## 2. 来源组合如何进入案例

| 案例部分         | 主要来源                         | 研究包中的落点                               |
| ---------------- | -------------------------------- | -------------------------------------------- |
| 预期用途与责任   | NIST AI RMF                      | 案例边界、角色、六个 Gate、上线决定          |
| 反馈、控制与恢复 | Google PAIR、Microsoft HAX       | 人工接管、纠正、失败矩阵、非 AI 路径         |
| 评测设计         | OpenAI 评测指南、Google 分类指标 | 分步评测、黄金集、错误切片、precision/recall |
| 成本与延迟       | OpenAI 成本与延迟指南            | 删除无价值调用、规则优先、请求与模型选择     |
| 项目内容契约     | AI-Native V2 已批准规格          | 六阶段、三层学习、无文本输入、材料演进       |

## 3. 未采用为事实的材料

- 用户转述文章中的“90%”“80%”和薪资区间没有独立统计证据，只用于发现课程覆盖问题，不进入案例事实。
- 厂商案例、营销博客和二手文章可以提供检索线索，但本轮没有用来证明收益、准确率或行业普遍性。
- OpenAI 文档中的示例阈值只说明评测写法，不迁移为本案例目标。
- Google、Microsoft 和 NIST 的通用原则不能替代真实组织的数据许可、风险、预算和人工容量调查。

## 4. 复核触发条件

出现以下情况时重新核验来源和结论：

1. 进入真实组织试点并获得业务数据。
2. 修改任务范围、自动化权限、数据来源或输出使用者。
3. 引入自主 Agent、自动发布或外部动作权限。
4. 采用具体供应商、模型、定价或托管方案。
5. NIST AI RMF 新版本正式替代 1.0。
6. 评测、成本或数据处理文档发生实质更新。
