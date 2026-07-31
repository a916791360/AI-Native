import { describe, expect, it } from 'vitest';

import {
  evaluatePerformanceBudget,
  moduleReferences,
  type PerformanceBaseline,
  type PerformanceMetrics,
} from '../../scripts/lib/performance-budget';

const baseline: PerformanceBaseline = {
  version: 1,
  capturedAt: '2026-07-31',
  regressionThreshold: 0.15,
  absoluteLimits: { largestImageBytes: 300 * 1024 },
  metrics: {
    homeInitialJavaScriptBytes: 0,
    homeCssBytes: 1000,
    pagefindBytes: 2000,
    graphJavaScriptBytes: 3000,
    largestImageBytes: 1000,
  },
};

function metrics(overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics {
  return { ...baseline.metrics, ...overrides };
}

describe('release performance budget', () => {
  it('finds static and template-string dynamic module imports', () => {
    expect(
      moduleReferences(
        'import { helper } from "./helper.js"; const graph = import(`./graph.chunk.js`);',
      ),
    ).toEqual(['./helper.js', './graph.chunk.js']);
  });

  it('accepts the recorded baseline and changes within fifteen percent', () => {
    expect(
      evaluatePerformanceBudget(metrics({ homeCssBytes: 1150, pagefindBytes: 2300 }), baseline),
    ).toEqual([]);
  });

  it('rejects new homepage JavaScript and regressions over fifteen percent', () => {
    const issues = evaluatePerformanceBudget(
      metrics({ homeInitialJavaScriptBytes: 1, graphJavaScriptBytes: 3451 }),
      baseline,
    );

    expect(issues).toHaveLength(2);
    expect(issues.join('\n')).toContain('首页首屏 JavaScript');
    expect(issues.join('\n')).toContain('图谱 JavaScript');
  });

  it('enforces the absolute image limit independently of the baseline', () => {
    expect(
      evaluatePerformanceBudget(metrics({ largestImageBytes: 300 * 1024 + 1 }), baseline),
    ).toContainEqual(expect.stringContaining('absolute limit'));
  });
});
