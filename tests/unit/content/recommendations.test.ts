import { describe, expect, it } from 'vitest';

import { getLearningRecommendations } from '../../../src/lib/content/recommendations';
import type { ChainStation, Relation, Term } from '../../../src/lib/content/schema';

const term = (overrides: Partial<Term> = {}): Term => ({
  id: 'current-term',
  nameZh: '当前词条',
  nameEn: 'Current term',
  abbreviations: [],
  aliases: [],
  summary: '这是一个用于推荐契约测试的词条摘要。',
  domain: 'ai-foundations',
  difficulty: 'beginner',
  ring: 'core',
  status: 'verified',
  priority: 3,
  featured: false,
  sources: [],
  ...overrides,
});

const station = (order: number, coreTerms: string[]): ChainStation => ({
  id: `station-${order}`,
  order,
  nameZh: `第 ${order} 站`,
  question: '这是一条足够长的站点判断问题吗？',
  goal: '这是用于推荐测试的站点目标描述，长度满足数据契约。',
  coreTerms,
  action: '这是用于推荐测试的站点动作，长度满足数据契约。',
});

const relation = (overrides: Partial<Relation> = {}): Relation => ({
  id: 'current-to-related',
  source: 'current-term',
  target: 'related-term',
  type: 'comparison',
  explanation: '这两个概念容易一起出现，但解决的问题和运行位置并不相同。',
  ...overrides,
});

describe('learning recommendations', () => {
  it('prefers the next cognitive-chain station', () => {
    const current = term({ chain: 1, chainRole: 'intro' });
    const next = term({
      id: 'next-core',
      nameZh: '下一站核心概念',
      chain: 2,
      chainRole: 'core',
    });
    const fallback = term({ id: 'same-domain-fallback' });

    const result = getLearningRecommendations(
      current,
      [current, next, fallback],
      [relation()],
      [station(1, [current.id]), station(2, [next.id])],
    );

    expect(result?.source).toBe('chain');
    expect(result?.items.map((item) => item.termId)).toEqual(['next-core']);
  });

  it('uses a semantic relation when no next station is available', () => {
    const current = term({ chain: 8 });
    const related = term({ id: 'related-term', nameZh: '真实关系邻居' });

    const result = getLearningRecommendations(
      current,
      [current, related],
      [relation({ type: 'prerequisite' })],
      [station(8, [current.id])],
    );

    expect(result?.source).toBe('relation');
    expect(result?.items[0]).toMatchObject({
      termId: 'related-term',
      relationLabel: '前置概念',
    });
  });

  it('falls back to the same domain only after both stronger sources are absent', () => {
    const current = term({ chain: 8 });
    const sameDomain = term({ id: 'same-domain', nameZh: '同领域入口', priority: 5 });
    const otherDomain = term({ id: 'other-domain', domain: 'other-domain' });

    const result = getLearningRecommendations(
      current,
      [current, sameDomain, otherDomain],
      [],
      [station(8, [current.id])],
    );

    expect(result?.source).toBe('domain');
    expect(result?.items.map((item) => item.termId)).toEqual(['same-domain']);
  });

  it('returns no recommendation when every source is empty', () => {
    const current = term({ chain: 8 });

    expect(
      getLearningRecommendations(current, [current], [], [station(8, [current.id])]),
    ).toBeUndefined();
  });
});
