import { describe, expect, it } from 'vitest';

import {
  LEARNING_MODULES,
  LEARNING_QUESTIONS,
  LEARNING_TIERS,
  PM_ACTIONS,
  getLearningQuestionContext,
  getQuestionsForModule,
  getQuestionsForTier,
} from '../../src/data/learning';
import { loadProjectContent } from '../../src/lib/content/io';

const QUESTIONS_PER_TIER = 30;
const QUESTIONS_PER_MODULE = 5;

describe('learning experience', () => {
  it('defines three tiers that each walk the six modules', () => {
    expect(LEARNING_TIERS.map(({ id }) => id)).toEqual(['t1-recognize', 't2-judge', 't3-tradeoff']);
    expect(LEARNING_MODULES).toHaveLength(6);
    expect(LEARNING_MODULES.map(({ index }) => index)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
    expect(LEARNING_QUESTIONS).toHaveLength(QUESTIONS_PER_TIER * LEARNING_TIERS.length);
    expect(LEARNING_QUESTIONS.map(({ index }) => index)).toEqual(
      Array.from({ length: LEARNING_QUESTIONS.length }, (_, index) =>
        String(index + 1).padStart(2, '0'),
      ),
    );

    for (const tier of LEARNING_TIERS) {
      expect(getQuestionsForTier(tier.id)).toHaveLength(QUESTIONS_PER_TIER);
      for (const module of LEARNING_MODULES) {
        expect(getQuestionsForModule(module.id, tier.id)).toHaveLength(QUESTIONS_PER_MODULE);
      }
    }
  });

  it('enforces a measurable depth gradient instead of a topic-only ordering', () => {
    // 「由浅入深」不能只是标题换词：每一层的题面负担必须真的更重。
    const [t1, t2, t3] = LEARNING_TIERS;

    for (const tier of LEARNING_TIERS) {
      const questions = getQuestionsForTier(tier.id);
      const [minFacts, maxFacts] = tier.contract.factCount;
      const [minOptions, maxOptions] = tier.contract.optionCount;

      for (const question of questions) {
        expect(question.facts.length).toBeGreaterThanOrEqual(minFacts);
        expect(question.facts.length).toBeLessThanOrEqual(maxFacts);
        expect(question.options.length).toBeGreaterThanOrEqual(minOptions);
        expect(question.options.length).toBeLessThanOrEqual(maxOptions);
      }
    }

    const average = (values: number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;
    const factsFor = (tierId: string) => getQuestionsForTier(tierId).map((q) => q.facts.length);
    const optionsFor = (tierId: string) => getQuestionsForTier(tierId).map((q) => q.options.length);

    expect(average(factsFor(t2!.id))).toBeGreaterThan(average(factsFor(t1!.id)));
    expect(average(factsFor(t3!.id))).toBeGreaterThan(average(factsFor(t2!.id)));
    expect(average(optionsFor(t3!.id))).toBeGreaterThan(average(optionsFor(t1!.id)));
  });

  it('spreads correct answers across every option position', () => {
    const positions = LEARNING_QUESTIONS.map((question) =>
      question.options.findIndex(({ assessment }) => assessment === 'recommended'),
    );
    const optionCount = Math.max(...LEARNING_QUESTIONS.map((q) => q.options.length));

    for (let position = 0; position < optionCount; position += 1) {
      const count = positions.filter((value) => value === position).length;
      expect(count, `第 ${position + 1} 位一个正确答案都没有`).toBeGreaterThan(0);
      expect(count / positions.length).toBeLessThanOrEqual(0.4);
    }
  });

  it('links every question reference to an existing public term', async () => {
    const project = await loadProjectContent();
    const publicTermIds = new Set(project.terms.map(({ data }) => data.id));
    const references = LEARNING_QUESTIONS.flatMap(({ references }) => references);

    expect(references.filter(({ id }) => !publicTermIds.has(id))).toEqual([]);

    // 主线必须真的连到词条库，否则学习点会再次散开。
    expect(new Set(references.map(({ id }) => id)).size).toBeGreaterThanOrEqual(100);
  });

  it('keeps identifiers unique and every question decision complete', () => {
    const moduleIds = LEARNING_MODULES.map(({ id }) => id);
    const questionIds = LEARNING_QUESTIONS.map(({ id }) => id);
    const shortTitles = LEARNING_QUESTIONS.map(({ shortTitle }) => shortTitle);

    expect(new Set(moduleIds).size).toBe(moduleIds.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    expect(new Set(shortTitles).size).toBe(shortTitles.length);
    for (const question of LEARNING_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(3);
      expect(
        question.options.filter(({ assessment }) => assessment === 'recommended'),
      ).toHaveLength(1);
      expect(question.checks).toHaveLength(3);
      expect(question.references.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('gives every question a PM follow-up action', () => {
    for (const question of LEARNING_QUESTIONS) {
      expect(PM_ACTIONS[question.id], `${question.id} 缺少落地动作`).toBeTruthy();
    }
    const questionIds = new Set(LEARNING_QUESTIONS.map(({ id }) => id));
    for (const id of Object.keys(PM_ACTIONS)) {
      expect(questionIds.has(id), `PM_ACTIONS 里的 ${id} 没有对应题目`).toBe(true);
    }
  });

  it('derives continuous navigation and tier/module boundaries from the question order', () => {
    const first = getLearningQuestionContext('q01-rules-or-ai');
    const moduleBoundary = getLearningQuestionContext('q05-context-overflow-retrieval');
    const nextModuleStart = getLearningQuestionContext('q06-demo-or-opportunity');
    const tierBoundary = getLearningQuestionContext('q30-missing-rollback');
    const nextTierStart = getLearningQuestionContext('q31-long-doc-source');
    const last = getLearningQuestionContext('q90-pilot-or-scale');

    expect(first).toMatchObject({
      modulePosition: 0,
      tierPosition: 0,
      isModuleStart: true,
      isModuleEnd: false,
      isTierStart: true,
    });
    expect(first?.previous).toBeUndefined();

    expect(moduleBoundary).toMatchObject({
      modulePosition: QUESTIONS_PER_MODULE - 1,
      isModuleEnd: true,
      next: { id: 'q06-demo-or-opportunity' },
      nextModule: { id: 'opportunity-judgment' },
    });
    expect(moduleBoundary?.nextTier).toBeUndefined();

    expect(nextModuleStart).toMatchObject({
      modulePosition: 0,
      isModuleStart: true,
      previous: { id: 'q05-context-overflow-retrieval' },
    });

    // 跨层边界：上一层最后一题指向下一层第一题，并且标出进入的新层。
    expect(tierBoundary).toMatchObject({
      tierPosition: QUESTIONS_PER_TIER - 1,
      isTierEnd: true,
      next: { id: 'q31-long-doc-source' },
      nextTier: { id: 't2-judge' },
    });
    expect(nextTierStart).toMatchObject({
      tierPosition: 0,
      isTierStart: true,
      previous: { id: 'q30-missing-rollback' },
    });

    expect(last).toMatchObject({
      tierPosition: QUESTIONS_PER_TIER - 1,
      isTierEnd: true,
      isModuleEnd: true,
    });
    expect(last?.next).toBeUndefined();
    expect(last?.nextTier).toBeUndefined();
    expect(getLearningQuestionContext('missing-question')).toBeUndefined();
  });
});
