import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import { SITE } from '../../src/config/site';

describe('site metadata', () => {
  it('uses the approved product name and promise', () => {
    expect(SITE.name).toBe('AI-Native');
    expect(SITE.promise).toContain('判断业务场景');
  });

  it('keeps the GitHub README aligned with the implementation plan stage', () => {
    const readme = readFileSync('README.md', 'utf8');
    const plan = readFileSync(
      'docs/superpowers/plans/2026-07-29-ai-native-implementation-plan.md',
      'utf8',
    );
    const completedStage = (content: string) => content.match(/阶段 0-(\d+) 已完成/)?.[1];

    expect(completedStage(readme)).toBeDefined();
    expect(completedStage(readme)).toBe(completedStage(plan));
  });
});
