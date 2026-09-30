import type { CaseOption, CaseGate } from './schema';

export interface ImpactVector {
  /** 开发交付周期：0-100% 相对等级 (e.g. 20% 代表极快 1-2周, 85% 代表定制研发 2月+) */
  cycle: number;
  cycleLabel: string;
  /** 推理运行成本：0-100% 相对等级 (e.g. 15% 极低, 80% 高昂) */
  cost: number;
  costLabel: string;
  /** 确定性与准确度：0-100% (e.g. 95% 严格防幻觉, 80% 存在漂移) */
  accuracy: number;
  accuracyLabel: string;
  /** 人工兜底介入率：0-100% (e.g. 5% 自动化, 60% 高度依赖人工) */
  humanBurden: number;
  humanBurdenLabel: string;
  /** 决策代价与风险警示 */
  warning: string;
}

/**
 * 依据选项的评估属性、成立条件与后续影响，计算四维工程与业务影响矢量
 */
export function getOptionImpact(option: CaseOption, gate?: CaseGate): ImpactVector {
  void gate;
  const isRecommended = option.assessment === 'recommended';
  const isRisky = option.assessment === 'risky';

  // 基于文本特征与评估状态分析关键词
  const text = `${option.label} ${option.rationale} ${option.risks.join(' ')} ${option.consequences.join(' ')}`;

  // 1. 开发交付周期
  let cycle = 50;
  let cycleLabel = '中等 (3-4周)';
  if (/现成|纯 Prompt|直接调用|规则优先|现有/i.test(text)) {
    cycle = 25;
    cycleLabel = '快速上线 (1-2周)';
  } else if (/微调|多智能体|自建|端到端训练|大规模迁移/i.test(text)) {
    cycle = 85;
    cycleLabel = '深度研发 (2月+)';
  } else if (isRecommended) {
    cycle = 45;
    cycleLabel = '可控迭代 (2-3周)';
  }

  // 2. 推理运行成本
  let cost = 45;
  let costLabel = '可控常规';
  if (/高额 Token|多模型级联|持续重试|长上下文|多轮多 Agent/i.test(text)) {
    cost = 80;
    costLabel = '高昂 (并发敏感)';
  } else if (/缓存|规则校验|确定性逻辑|小模型|单次调用/i.test(text)) {
    cost = 20;
    costLabel = '低经济负担';
  } else if (isRisky) {
    cost = 65;
    costLabel = '波动隐患较大';
  }

  // 3. 确定性与准确度
  let accuracy = 88;
  let accuracyLabel = '88% (常规业务可用)';
  if (isRecommended) {
    accuracy = 96;
    accuracyLabel = '96% (防幻觉严格基准)';
  } else if (isRisky) {
    accuracy = 76;
    accuracyLabel = '76% (长尾显著失真风险)';
  } else if (/人工复核|双重校验|确定性规则/i.test(text)) {
    accuracy = 94;
    accuracyLabel = '94% (规则防线兜底)';
  }

  // 4. 人工兜底介入率
  let humanBurden = 35;
  let humanBurdenLabel = '35% (抽样或异常接管)';
  if (/人在回路|人工审核|人工接管|全量复核/i.test(text)) {
    humanBurden = 65;
    humanBurdenLabel = '65% (需组建专项服务班)';
  } else if (/自动化|确定性放行|免人工/i.test(text)) {
    humanBurden = 10;
    humanBurdenLabel = '10% (高自治低干预)';
  } else if (isRisky) {
    humanBurden = 55;
    humanBurdenLabel = '55% (故障易引发投诉挤兑)';
  }

  // 5. 决策代价一句话警示
  let warning = '';
  if (isRecommended) {
    warning = `平衡点：${option.consequences[0] || '以合理的工程复杂度换取确定性收益，符合立项演进基准。'}`;
  } else if (isRisky) {
    warning = `高代价警告：${option.risks[0] || '该路径极易引发连锁故障或成本失控，必须设置强力安全阀与人工熔断。'}`;
  } else {
    warning = `权衡前提：依赖于前置成立条件（${option.conditions[0] || '特定环境限制'}），适用阶段性过渡。`;
  }

  return {
    cycle,
    cycleLabel,
    cost,
    costLabel,
    accuracy,
    accuracyLabel,
    humanBurden,
    humanBurdenLabel,
    warning,
  };
}
