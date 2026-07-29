import { describe, expect, it } from 'vitest';

import { relationSchema, routeSchema, termSchema } from '../../../src/lib/content/schema';

describe('content schemas', () => {
  it('rejects unstable term IDs and non-HTTPS sources', () => {
    const result = termSchema.safeParse({
      id: 'Not Stable',
      nameZh: '测试词条',
      nameEn: 'Test Term',
      summary: '这是一条长度足够的数据契约测试摘要。',
      domain: 'domain-1',
      difficulty: 'beginner',
      ring: 'core',
      status: 'verified',
      sources: [
        {
          id: 'source-one',
          type: 'official-doc',
          title: 'Test source',
          url: 'http://example.com/source',
          publisher: 'Example',
          accessedAt: '2026-07-29',
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(
        expect.arrayContaining(['id', 'sources.0.url']),
      );
    }
  });

  it('rejects invalid dates and relation types', () => {
    expect(
      termSchema.safeParse({
        id: 'valid-id',
        nameZh: '测试词条',
        nameEn: 'Test Term',
        summary: '这是一条长度足够的数据契约测试摘要。',
        domain: 'domain-1',
        difficulty: 'beginner',
        ring: 'core',
        status: 'catalogued',
        updatedAt: '2026-02-31',
      }).success,
    ).toBe(false);

    expect(
      relationSchema.safeParse({
        id: 'invalid-relation',
        source: 'alpha-term',
        target: 'beta-term',
        type: 'related',
        explanation: '这段关系说明足够长，但关系类型不在受控枚举之中。',
      }).success,
    ).toBe(false);
  });

  it('requires a structured route with at least one chapter', () => {
    const result = routeSchema.safeParse({
      id: 'empty-route',
      nameZh: '空路线',
      summary: '这是一条没有章节、因而不符合路线结构的数据。',
      audience: ['测试人员'],
      learningGoals: ['验证路线结构规则'],
      estimatedTerms: 1,
      chapters: [],
      outcomes: ['理解规则'],
      status: 'draft',
    });

    expect(result.success).toBe(false);
  });
});
