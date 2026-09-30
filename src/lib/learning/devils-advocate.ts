import type { LearningQuestion, LearningOption } from '@/data/learning/types';

export interface DevilsAdvocateInsight {
  role: string;
  roleIcon: string;
  challenge: string;
  defenseKey: string;
}

/**
 * 模拟评审会质询 (Devil's Advocate)：
 * 针对不同选项提供真实研发架构师、业务主管或风控专家的质询挑战与抗辩要点。
 */
export function getDevilsAdvocate(
  question: LearningQuestion,
  option: LearningOption,
): DevilsAdvocateInsight {
  const assessment = option.assessment;
  const label = option.label;
  const feedback = option.feedback;
  const questionTitle = question.question;

  if (assessment === 'risky') {
    // 研发架构师 / 技术审查人
    let challenge =
      '「该方案明显引入了不可控的不确定性、调用延迟与接口成本。一旦长尾样本发生幻觉或服务超时，由谁对业务资损与客诉担责？」';

    if (/规则|确定性|金额|计算/i.test(label + questionTitle)) {
      challenge =
        '「已有确定性代码与正则能够 100% 校验的逻辑，为何要引入概率型大模型？模型偶发幻觉造成的账目差错由谁兜底？」';
    } else if (/微调|重训/i.test(label)) {
      challenge =
        '「在未验证提示词与 RAG 边界前就贸然启动微调，数据清洗和显卡集群开销谁来买单？后期业务变更是重新训练还是作废？」';
    } else if (/直接|无审核|全自动|自由发挥/i.test(label + feedback)) {
      challenge =
        '「完全缺少人机协同与内容安全过滤，若模型吐出敏感数据或被 Prompt 注入攻击越狱，安全防线在哪里？」';
    }

    return {
      role: '技术架构师 / 风控评审人',
      roleIcon: '⚡',
      challenge,
      defenseKey:
        'PM 审视：切忌盲目“为 AI 而 AI”，确定性问题坚持规则优先，高风险链路必须设置安全熔断阀。',
    };
  }

  if (assessment === 'conditional') {
    return {
      role: '业务运维 Leader',
      roleIcon: '⚖️',
      challenge:
        '「这套方案只在特定理想条件下成立。如果前置依赖（如网络质量、向量切片准确度或并发负载）发生波动，降级预案是什么？」',
      defenseKey:
        'PM 审视：不可把假设当成事实。必须在前置方案中明确定量成立指标，并随附故障回退 Runbook。',
    };
  }

  // recommended 路径：立项委员会的最终论证
  return {
    role: '项目立项评审委员会',
    roleIcon: '🎯',
    challenge:
      '「该推荐路径在保证业务确定性的同时，把大模型用在了最具杠杆价值的核心环节。如何量化并向管理层证明 ROI？」',
    defenseKey:
      'PM 论据：以最小的工程研发复杂度锁定 90%+ 的核心诉求，风险完全隔绝在可控沙箱内，交付确定性最高。',
  };
}
