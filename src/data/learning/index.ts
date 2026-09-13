import { LEARNING_MODULES, getLearningModule } from './modules';
import { orderOptions } from './ordering';
import { TIER1_PM_ACTIONS, TIER1_QUESTIONS } from './questions/tier1';
import { TIER2_PM_ACTIONS, TIER2_QUESTIONS } from './questions/tier2';
import { TIER3_PM_ACTIONS, TIER3_QUESTIONS } from './questions/tier3';
import { getLearningTier } from './tiers';
import type { LearningQuestion, LearningQuestionContext } from './types';

export * from './types';
export { LEARNING_MODULES, getLearningModule } from './modules';
export { LEARNING_TIERS, getLearningTier } from './tiers';

/**
 * 作者按「自然顺序」写题（正确项通常在最前，便于审阅）。
 * 装配时按题目 id 稳定旋转，学习者看到的正确项位置被打散。
 */
const AUTHORED_QUESTIONS: LearningQuestion[] = [
  ...TIER1_QUESTIONS,
  ...TIER2_QUESTIONS,
  ...TIER3_QUESTIONS,
];

export const LEARNING_QUESTIONS: LearningQuestion[] = AUTHORED_QUESTIONS.map((question) => ({
  ...question,
  options: orderOptions(question.id, question.options),
}));

/** 首页与学习中心展示的精选题，三层各取一道。 */
export const FEATURED_QUESTION_IDS = [
  TIER1_QUESTIONS[0]!.id,
  TIER2_QUESTIONS[0]!.id,
  TIER3_QUESTIONS[0]!.id,
] as const;

export function getLearningQuestion(id: string): LearningQuestion | undefined {
  return LEARNING_QUESTIONS.find((item) => item.id === id);
}

export function getQuestionsForTier(tierId: string): LearningQuestion[] {
  return LEARNING_QUESTIONS.filter((item) => item.tierId === tierId);
}

/** 不传 tierId 时返回该阶段在三层里的全部题目（用于跨层统计）。 */
export function getQuestionsForModule(moduleId: string, tierId?: string): LearningQuestion[] {
  return LEARNING_QUESTIONS.filter(
    (item) => item.moduleId === moduleId && (tierId === undefined || item.tierId === tierId),
  );
}

export interface LearningTierProgress {
  tierId: string;
  questionIds: string[];
}

export function getLearningQuestionContext(id: string): LearningQuestionContext | undefined {
  const position = LEARNING_QUESTIONS.findIndex((item) => item.id === id);
  if (position === -1) return undefined;

  const question = LEARNING_QUESTIONS[position]!;
  const tier = getLearningTier(question.tierId);
  const module = getLearningModule(question.moduleId);
  if (!tier || !module) return undefined;

  const tierQuestions = getQuestionsForTier(tier.id);
  const moduleQuestions = getQuestionsForModule(module.id, tier.id);
  const tierPosition = tierQuestions.findIndex((item) => item.id === question.id);
  const modulePosition = moduleQuestions.findIndex((item) => item.id === question.id);
  const next = LEARNING_QUESTIONS[position + 1];

  return {
    question,
    tier,
    module,
    moduleQuestions,
    tierPosition,
    modulePosition,
    previous: LEARNING_QUESTIONS[position - 1],
    next,
    nextModule:
      modulePosition === moduleQuestions.length - 1
        ? LEARNING_MODULES[LEARNING_MODULES.findIndex((item) => item.id === module.id) + 1]
        : undefined,
    nextTier: next && next.tierId !== tier.id ? getLearningTier(next.tierId) : undefined,
    isTierStart: tierPosition === 0,
    isTierEnd: tierPosition === tierQuestions.length - 1,
    isModuleStart: modulePosition === 0,
    isModuleEnd: modulePosition === moduleQuestions.length - 1,
  };
}

/** 每一层的题量与题目 id，供进度与结业页使用。 */
export function getTierQuestionIds(tierId: string): string[] {
  return getQuestionsForTier(tierId).map(({ id }) => id);
}

// 每道判断题对应的「如果你是 PM，下一步做什么」落地动作。
// 目标：把判断从「结论」落到「产品经理交付物」，并链接到相关词条深挖。
export const PM_ACTIONS: Record<string, string> = {
  ...TIER1_PM_ACTIONS,
  ...TIER2_PM_ACTIONS,
  ...TIER3_PM_ACTIONS,
};
