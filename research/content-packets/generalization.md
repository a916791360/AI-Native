---
termId: generalization
batch: foundation-1
status: research
accessedAt: '2026-07-29'
sourceIds:
  - google-overfitting
  - deep-learning-book-machine-learning
timeBoundary: 泛化的统计学习定义稳定；现实表现仍受数据漂移、反馈回路和部署环境变化影响。
claims:
  - id: performance-on-unseen-inputs
    statement: 泛化能力是模型在未参与训练、但来自预期使用分布的新输入上保持有效表现的能力。
    evidenceType: definition
    sourceIds:
      - google-overfitting
      - deep-learning-book-machine-learning
  - id: estimate-with-held-out-data
    statement: 团队通常用独立验证集或测试集估计泛化误差，并把它与训练误差对照以发现过拟合或欠拟合迹象。
    evidenceType: mechanism
    sourceIds:
      - google-overfitting
      - deep-learning-book-machine-learning
  - id: test-is-a-proxy
    statement: 测试集只是现实条件的代理；若数据分布、时间环境或用户行为改变，测试表现良好也不能保证部署后继续有效。
    evidenceType: boundary
    sourceIds:
      - google-overfitting
      - deep-learning-book-machine-learning
---

## 编辑说明

正文把泛化写成对预期分布中新样本的表现，不使用“适应任何未知情况”的夸张表述。示例需区分同分布测试、场景迁移与部署后漂移，并说明测试集反复使用也会削弱其独立性。
