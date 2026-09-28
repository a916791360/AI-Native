import { describe, expect, it } from 'vitest';
import {
  COMPETENCY_DIMENSIONS,
  COMPETENCY_RANKS,
  evaluateCompetency,
} from '../../../src/lib/learning/competency';
import { LEARNING_QUESTIONS, getQuestionsForModule } from '../../../src/data/learning';

describe('AI PM Competency Evaluation System', () => {
  it('defines 6 core dimensions matching the 6 modules exactly', () => {
    expect(COMPETENCY_DIMENSIONS).toHaveLength(6);
    expect(COMPETENCY_DIMENSIONS.map((d) => d.id)).toEqual([
      'model-boundaries',
      'opportunity-judgment',
      'solution-choice',
      'product-experience',
      'quality-constraints',
      'capstone',
    ]);
    expect(COMPETENCY_RANKS).toHaveLength(5);
  });

  it('starts at L1 Observer rank with zero answers', () => {
    const profile = evaluateCompetency();
    expect(profile.totalAnswered).toBe(0);
    expect(profile.totalQuestions).toBe(LEARNING_QUESTIONS.length);
    expect(profile.overallScore).toBe(0);
    expect(profile.rank.level).toBe('observer');
    expect(profile.dimensions).toHaveLength(6);
    expect(profile.dimensions.every((d) => d.score === 0)).toBe(true);
    expect(profile.recommendation.type).toBe('question');
    expect(profile.recommendation.targetId).toBe(LEARNING_QUESTIONS[0]!.id);
  });

  it('calculates dimension score and recommends the first unanswered question in weakest area', () => {
    // 假设阶段 01（model-boundaries）回答了全部 15 题，且全对
    const m1Questions = getQuestionsForModule('model-boundaries');
    const answered = m1Questions.map((q) => q.id);

    const profile = evaluateCompetency({ answered, missed: [] });
    const m1 = profile.dimensions.find((d) => d.id === 'model-boundaries')!;

    // 覆盖率 40 + 正确率 35 = 75（无案例决策）
    expect(m1.score).toBe(75);
    expect(m1.answeredCount).toBe(m1Questions.length);
    expect(m1.correctCount).toBe(m1Questions.length);

    // 阶段 02 未答，薄弱项应该推荐阶段 02 的第 1 题
    const m2Questions = getQuestionsForModule('opportunity-judgment');
    expect(profile.recommendation.targetId).toBe(m2Questions[0]!.id);
  });

  it('incorporates case decisions into dimension scores and advances rank to Principal when fully mastered', () => {
    const allQuestionIds = LEARNING_QUESTIONS.map((q) => q.id);
    const caseDecisions: Record<string, { optionId: string; stageId: string }> = {};

    // 6 cases * 6 stages
    for (const dim of COMPETENCY_DIMENSIONS) {
      for (let i = 1; i <= 6; i++) {
        caseDecisions[`case-${i}:${dim.id}`] = {
          optionId: 'opt-rec',
          stageId: dim.id,
        };
      }
    }

    const profile = evaluateCompetency({
      answered: allQuestionIds,
      missed: [],
      caseDecisions,
    });

    expect(profile.overallScore).toBe(100);
    expect(profile.rank.level).toBe('principal');
    expect(profile.recommendation.type).toBe('case');
  });

  it('penalizes score when questions are missed', () => {
    const m1Questions = getQuestionsForModule('model-boundaries');
    const answered = m1Questions.map((q) => q.id);
    // 全部做错
    const missed = answered;

    const profile = evaluateCompetency({ answered, missed });
    const m1 = profile.dimensions.find((d) => d.id === 'model-boundaries')!;

    // 只有覆盖率 40 分，正确率 0 分
    expect(m1.score).toBe(40);
    expect(m1.correctCount).toBe(0);
    expect(m1.missedCount).toBe(15);
  });
});
