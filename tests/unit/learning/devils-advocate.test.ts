import { describe, expect, it } from 'vitest';
import { getDevilsAdvocate } from '../../../src/lib/learning/devils-advocate';
import { LEARNING_QUESTIONS } from '../../../src/data/learning';

describe('getDevilsAdvocate', () => {
  it('generates sharp challenge questions for risky options', () => {
    const q1 = LEARNING_QUESTIONS[0]!;
    const riskyOption = q1.options.find((opt) => opt.assessment === 'risky')!;

    const insight = getDevilsAdvocate(q1, riskyOption);
    expect(insight.role).toContain('架构师');
    expect(insight.challenge.length).toBeGreaterThan(0);
    expect(insight.defenseKey).toContain('PM 审视');
  });

  it('generates conditions inquiry for conditional options', () => {
    const qWithConditional = LEARNING_QUESTIONS.find((q) =>
      q.options.some((opt) => opt.assessment === 'conditional'),
    )!;
    const conditionalOption = qWithConditional.options.find(
      (opt) => opt.assessment === 'conditional',
    )!;

    const insight = getDevilsAdvocate(qWithConditional, conditionalOption);
    expect(insight.role).toContain('Leader');
    expect(insight.challenge).toContain('理想条件');
    expect(insight.defenseKey).toContain('Runbook');
  });

  it('generates ROI confirmation for recommended options', () => {
    const q1 = LEARNING_QUESTIONS[0]!;
    const recOption = q1.options.find((opt) => opt.assessment === 'recommended')!;

    const insight = getDevilsAdvocate(q1, recOption);
    expect(insight.role).toContain('委员会');
    expect(insight.challenge).toContain('ROI');
  });
});
