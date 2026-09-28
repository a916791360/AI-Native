import { LEARNING_MODULES, LEARNING_QUESTIONS, getQuestionsForModule } from '../../data/learning';

export interface CompetencyDimensionConfig {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  summary: string;
  readingHref: string;
  readingLabel: string;
}

export const COMPETENCY_DIMENSIONS: CompetencyDimensionConfig[] = LEARNING_MODULES.map(
  (module) => ({
    id: module.id,
    index: module.index,
    title: module.title,
    shortTitle: module.title.replace(/^AI\s*/, ''),
    summary: module.summary,
    readingHref: module.reading.href,
    readingLabel: module.reading.label,
  }),
);

export type CompetencyRankLevel =
  'observer' | 'explorer' | 'practitioner' | 'architect' | 'principal';

export interface CompetencyRank {
  level: CompetencyRankLevel;
  title: string;
  badge: string;
  description: string;
  minScore: number;
}

export const COMPETENCY_RANKS: CompetencyRank[] = [
  {
    level: 'principal',
    title: '资深 AI 业务掌舵人',
    badge: 'L5 · Principal',
    description: '在复杂非确定性场景下具备卓越的商业取舍、架构选型与安全合规把控力。',
    minScore: 85,
  },
  {
    level: 'architect',
    title: '架构级 AI PM',
    badge: 'L4 · Architect',
    description: '精通人机协作控制权分配、Eval 评测集构建与端到端系统容错工程兜底。',
    minScore: 60,
  },
  {
    level: 'practitioner',
    title: '实战 AI PM',
    badge: 'L3 · Practitioner',
    description: '能够准确识别真实需求场景，在 Prompt/RAG/Workflow 间做出清晰的技术权衡。',
    minScore: 35,
  },
  {
    level: 'explorer',
    title: 'AI 探索者',
    badge: 'L2 · Explorer',
    description: '初具模型能力边界认知，开始摆脱技术崇拜，以客观视角审视 AI 交付物。',
    minScore: 15,
  },
  {
    level: 'observer',
    title: 'AI 观察者',
    badge: 'L1 · Observer',
    description: '正在建立对大模型基础概念与工作机理的第一手认知，准备开始实操判断。',
    minScore: 0,
  },
];

export interface DimensionMetric {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  summary: string;
  readingHref: string;
  score: number; // 0 - 100
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  missedCount: number;
  caseDecisionsCount: number;
  totalCaseGates: number;
  firstUnansweredQuestionId?: string;
  suggestedAction: string;
}

export interface NextRecommendation {
  type: 'question' | 'case' | 'review';
  title: string;
  targetId: string;
  reason: string;
  href: string;
  actionText: string;
}

export interface CompetencyProfile {
  totalAnswered: number;
  totalQuestions: number;
  totalMissed: number;
  totalCaseDecisions: number;
  totalCaseGates: number;
  overallScore: number;
  rank: CompetencyRank;
  dimensions: DimensionMetric[];
  recommendation: NextRecommendation;
}

export interface EvaluationInput {
  answered?: string[];
  missed?: string[];
  caseDecisions?: Record<string, { optionId?: string; stageId?: string }>;
}

export function evaluateCompetency(input: EvaluationInput = {}): CompetencyProfile {
  const answeredSet = new Set(input.answered ?? []);
  const missedSet = new Set(input.missed ?? []);
  const caseDecisions = input.caseDecisions ?? {};

  const totalQuestions = LEARNING_QUESTIONS.length;
  const totalAnswered = answeredSet.size;
  const totalMissed = missedSet.size;
  const totalCaseGates = 36; // 6 cases * 6 gates

  // 按 stageId 统计各案例 Gate 决策数
  const stageDecisionCounts: Record<string, number> = {};
  for (const decision of Object.values(caseDecisions)) {
    if (decision?.stageId) {
      stageDecisionCounts[decision.stageId] = (stageDecisionCounts[decision.stageId] ?? 0) + 1;
    }
  }

  const dimensions: DimensionMetric[] = COMPETENCY_DIMENSIONS.map((dim) => {
    const questions = getQuestionsForModule(dim.id);
    const totalModuleQuestions = questions.length;
    let answeredCount = 0;
    let missedCount = 0;
    let firstUnanswered: string | undefined;

    for (const q of questions) {
      if (answeredSet.has(q.id)) {
        answeredCount++;
        if (missedSet.has(q.id)) {
          missedCount++;
        }
      } else if (!firstUnanswered) {
        firstUnanswered = q.id;
      }
    }

    const correctCount = Math.max(0, answeredCount - missedCount);
    const caseDecisionsCount = Math.min(6, stageDecisionCounts[dim.id] ?? 0);

    // 计算维度得分：
    // 答题覆盖度 40 分，正确率 35 分，案例决策覆盖度 25 分
    let score = 0;
    if (totalModuleQuestions > 0) {
      const coverageRatio = answeredCount / totalModuleQuestions;
      const accuracyRatio = answeredCount > 0 ? correctCount / answeredCount : 0;
      const caseRatio = caseDecisionsCount / 6;

      score = Math.round(coverageRatio * 40 + accuracyRatio * 35 + caseRatio * 25);
    }

    let suggestedAction = '进入基础判断练习';
    if (answeredCount === totalModuleQuestions && caseDecisionsCount < 6) {
      suggestedAction = '进入实战案例演练取舍';
    } else if (answeredCount > 0) {
      suggestedAction = `继续攻克本阶段剩余 ${totalModuleQuestions - answeredCount} 题`;
    }

    return {
      id: dim.id,
      index: dim.index,
      title: dim.title,
      shortTitle: dim.shortTitle,
      summary: dim.summary,
      readingHref: dim.readingHref,
      score: Math.min(100, Math.max(0, score)),
      totalQuestions: totalModuleQuestions,
      answeredCount,
      correctCount,
      missedCount,
      caseDecisionsCount,
      totalCaseGates: 6,
      firstUnansweredQuestionId: firstUnanswered,
      suggestedAction,
    };
  });

  // 计算综合得分（各维度平均）
  const overallScore = Math.round(
    dimensions.reduce((acc, curr) => acc + curr.score, 0) / (dimensions.length || 1),
  );

  // 判定段位
  const rank =
    COMPETENCY_RANKS.find((r) => overallScore >= r.minScore) ??
    COMPETENCY_RANKS[COMPETENCY_RANKS.length - 1]!;

  // 推荐下一步动作：
  // 1. 优先找完成度最低或存在未答题目的维度
  const lowestDim = [...dimensions].sort((a, b) => a.score - b.score)[0];
  let recommendation: NextRecommendation;

  if (lowestDim && lowestDim.firstUnansweredQuestionId) {
    const targetQ = LEARNING_QUESTIONS.find((q) => q.id === lowestDim.firstUnansweredQuestionId);
    recommendation = {
      type: 'question',
      title: targetQ?.shortTitle ?? '关键判断题',
      targetId: lowestDim.firstUnansweredQuestionId,
      reason: `补强薄弱项「${lowestDim.title}」，该维度当前掌握度 ${lowestDim.score}%`,
      href: `/learn/questions/${lowestDim.firstUnansweredQuestionId}/`,
      actionText: '立即攻坚这道题 →',
    };
  } else if (totalAnswered < totalQuestions) {
    const nextQ = LEARNING_QUESTIONS.find((q) => !answeredSet.has(q.id));
    recommendation = {
      type: 'question',
      title: nextQ?.shortTitle ?? '下一题',
      targetId: nextQ?.id ?? '',
      reason: '保持连胜节奏，继续推进题库',
      href: nextQ ? `/learn/questions/${nextQ.id}/` : '/learn/',
      actionText: '继续下一题 →',
    };
  } else {
    // 题目全答完，推荐案例库实操或结业
    recommendation = {
      type: 'case',
      title: '业务案例实操演练',
      targetId: 'case-library',
      reason: '已完成全套题库，前往案例库验证端到端方案决策',
      href: '/learn/cases/',
      actionText: '前往案例库决策台 →',
    };
  }

  return {
    totalAnswered,
    totalQuestions,
    totalMissed,
    totalCaseDecisions: Object.keys(caseDecisions).length,
    totalCaseGates,
    overallScore,
    rank,
    dimensions,
    recommendation,
  };
}
