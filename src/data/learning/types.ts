export interface LearningReference {
  id: string;
  label: string;
}

export type LearningAssessment = 'recommended' | 'conditional' | 'risky';

export interface LearningOption {
  id: string;
  label: string;
  assessment: LearningAssessment;
  feedback: string;
}

/** 三层由浅入深：先认得出概念，再判断得了边界，最后做得了取舍。 */
export type LearningTierId = 't1-recognize' | 't2-judge' | 't3-tradeoff';

export interface LearningQuestion {
  id: string;
  index: string;
  tierId: LearningTierId;
  moduleId: string;
  shortTitle: string;
  question: string;
  scenario: string;
  facts: string[];
  options: LearningOption[];
  principle: string;
  checks: string[];
  references: LearningReference[];
}

/**
 * 每层的形态契约。这些数字是「由浅入深」的可度量定义，
 * 由 `scripts/check-learning-bank.ts` 强制校验，不靠人工感觉。
 */
export interface LearningTierContract {
  /** 已知条件条数区间 */
  factCount: readonly [number, number];
  /** 选项个数区间 */
  optionCount: readonly [number, number];
  /** 至少要有几个「看起来也行」的选项 */
  minConditional: number;
  /** 最多允许几个「看起来也行」的选项 */
  maxConditional: number;
  /** 至少要有几个明确错误的选项 */
  minRisky: number;
}

export interface LearningTier {
  id: LearningTierId;
  code: string;
  index: string;
  title: string;
  summary: string;
  /** 这一层练成什么 */
  goal: string;
  /** 这一层反复回答的那个问题 */
  prompt: string;
  contract: LearningTierContract;
}

export interface LearningModule {
  id: string;
  index: string;
  title: string;
  summary: string;
  decision: string;
  outcome: string;
  accent: 'prerequisite' | 'component' | 'comparison' | 'application';
  reading: { href: string; label: string };
}

export interface LearningQuestionContext {
  question: LearningQuestion;
  tier: LearningTier;
  module: LearningModule;
  moduleQuestions: LearningQuestion[];
  tierPosition: number;
  modulePosition: number;
  previous?: LearningQuestion;
  next?: LearningQuestion;
  nextModule?: LearningModule;
  nextTier?: LearningTier;
  isTierStart: boolean;
  isTierEnd: boolean;
  isModuleStart: boolean;
  isModuleEnd: boolean;
}
