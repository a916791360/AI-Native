import type { LearningTier } from './types';

/**
 * 三层递进。每一层都把六个阶段完整走一遍，但判断的深度不同：
 * 第一层认得出概念，第二层在真实约束下判断边界，第三层在两个都对的目标之间取舍。
 *
 * 契约里的数字不是装饰——`scripts/check-learning-bank.ts` 会逐题校验，
 * 任何一层出现「形态不达标」的题都会让构建失败。
 */
export const LEARNING_TIERS: LearningTier[] = [
  {
    id: 't1-recognize',
    code: 'T1',
    index: '01',
    title: '概念识别',
    summary: '先把概念认准：这个场景属于哪一类问题，该用哪一类方案。',
    goal: '能在单点场景里认出正确方案，并说清另外两个为什么不行。',
    prompt: '这个场景属于哪一类问题？',
    contract: {
      factCount: [2, 3],
      optionCount: [3, 3],
      minConditional: 0,
      maxConditional: 1,
      minRisky: 1,
    },
  },
  {
    id: 't2-judge',
    code: 'T2',
    index: '02',
    title: '场景判断',
    summary: '加入真实约束：数据不全、成本有限、错误不可逆，边界开始变模糊。',
    goal: '能在带约束的场景里判断方案的适用边界，而不是套用结论。',
    prompt: '在这个约束下，哪种方案还站得住？',
    contract: {
      factCount: [3, 4],
      optionCount: [3, 4],
      minConditional: 1,
      maxConditional: 2,
      minRisky: 1,
    },
  },
  {
    id: 't3-tradeoff',
    code: 'T3',
    index: '03',
    title: '权衡取舍',
    summary: '两个目标同时成立且互相冲突，必须放弃一个，并说清放弃的代价。',
    goal: '能在冲突目标之间做取舍，并为取舍结果写下可评审的理由。',
    prompt: '两个目标冲突时，你放弃哪一个，代价是什么？',
    contract: {
      factCount: [4, 5],
      optionCount: [4, 4],
      minConditional: 2,
      maxConditional: 3,
      minRisky: 1,
    },
  },
];

export function getLearningTier(id: string): LearningTier | undefined {
  return LEARNING_TIERS.find((tier) => tier.id === id);
}
