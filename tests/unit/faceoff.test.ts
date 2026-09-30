import { describe, expect, it } from 'vitest';
import { FACEOFF_PAIRS, getFaceoffPair } from '../../src/data/faceoff';
import { loadProjectContent } from '../../src/lib/content/io';

describe('Concept Faceoff Dataset', () => {
  it('curates exactly 12 high-frequency confusion pairs', () => {
    expect(FACEOFF_PAIRS).toHaveLength(12);
  });

  it('links every side of all pairs to an existing public verified term', async () => {
    const project = await loadProjectContent();
    const verifiedIds = new Set(project.terms.map((t) => t.data.id));

    FACEOFF_PAIRS.forEach((pair) => {
      expect(
        verifiedIds.has(pair.left.termId),
        `Pair ${pair.id} left term ${pair.left.termId} must exist in catalog`,
      ).toBe(true);
      expect(
        verifiedIds.has(pair.right.termId),
        `Pair ${pair.id} right term ${pair.right.termId} must exist in catalog`,
      ).toBe(true);
    });
  });

  it('provides structured metrics, decision rules, and scenario quizzes for every pair', () => {
    FACEOFF_PAIRS.forEach((pair) => {
      expect(pair.metrics.length).toBeGreaterThanOrEqual(2);
      expect(pair.decisionRules.chooseLeftWhen.length).toBeGreaterThan(0);
      expect(pair.decisionRules.chooseRightWhen.length).toBeGreaterThan(0);
      expect(pair.quiz.length).toBeGreaterThan(0);

      pair.quiz.forEach((q) => {
        expect(['left', 'right']).toContain(q.correctSide);
        expect(q.explanation).toBeTruthy();
      });
    });
  });

  it('allows looking up a pair by id', () => {
    const ragVsFt = getFaceoffPair('rag-vs-fine-tuning');
    expect(ragVsFt).toBeDefined();
    expect(ragVsFt?.left.termId).toBe('retrieval-augmented-generation');
    expect(ragVsFt?.right.termId).toBe('fine-tuning');
  });
});
