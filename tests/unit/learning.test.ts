import { describe, expect, it } from 'vitest';

import {
  LEARNING_MODULES,
  LEARNING_QUESTIONS,
  getQuestionsForModule,
} from '../../src/data/learning';
import { loadProjectContent } from '../../src/lib/content/io';

describe('learning experience', () => {
  it('defines six progressive modules with four questions each', () => {
    expect(LEARNING_MODULES).toHaveLength(6);
    expect(LEARNING_QUESTIONS).toHaveLength(24);
    expect(LEARNING_MODULES.map(({ index }) => index)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
    expect(LEARNING_MODULES.every(({ id }) => getQuestionsForModule(id).length === 4)).toBe(true);
    expect(LEARNING_QUESTIONS.map(({ index }) => index)).toEqual(
      Array.from({ length: 24 }, (_, index) => String(index + 1).padStart(2, '0')),
    );
  });

  it('links every question reference to an existing public term', async () => {
    const project = await loadProjectContent();
    const publicTermIds = new Set(project.terms.map(({ data }) => data.id));
    const references = LEARNING_QUESTIONS.flatMap(({ references }) => references);

    expect(references.filter(({ id }) => !publicTermIds.has(id))).toEqual([]);
  });

  it('keeps identifiers unique and every question decision complete', () => {
    const moduleIds = LEARNING_MODULES.map(({ id }) => id);
    const questionIds = LEARNING_QUESTIONS.map(({ id }) => id);

    expect(new Set(moduleIds).size).toBe(moduleIds.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    for (const question of LEARNING_QUESTIONS) {
      expect(question.options).toHaveLength(3);
      expect(
        question.options.filter(({ assessment }) => assessment === 'recommended'),
      ).toHaveLength(1);
      expect(question.checks).toHaveLength(3);
    }
  });
});
