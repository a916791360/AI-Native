import { describe, expect, it } from 'vitest';

import type { Term } from '../../../src/lib/content/schema';
import {
  isDeprecatedTerm,
  isDraftTerm,
  isSelectableTerm,
  selectableTerms,
} from '../../../src/lib/content/visibility';

/**
 * 可见性是「哪些词条出现在目录 / 搜索 / 图谱里」的唯一定义处（I6-03）。
 *
 * 这些用例守的不是实现，而是三条语义边界——它们各自都被踩过：
 *   · draft 整页不对外（连 URL 都不该被索引）；
 *   · deprecated 的 URL **要**能打开（外部链接不该 404），但不进任何入口层；
 *   · needs-review 仍然是入口，只是提示读者谨慎引用。
 */
const term = (status: Term['status']): Term =>
  ({
    id: 'sample',
    nameZh: '样例',
    nameEn: 'Sample',
    abbreviations: [],
    aliases: [],
    summary: '用于验证可见性判定的样例词条。',
    domain: 'ai-foundations-history',
    difficulty: 'beginner',
    ring: 'core',
    status,
    priority: 3,
    featured: false,
    sources: [],
  }) as Term;

describe('term visibility', () => {
  it('treats deprecated as non-selectable but keeps it out of the draft bucket', () => {
    const deprecated = term('deprecated');

    expect(isDeprecatedTerm(deprecated)).toBe(true);
    expect(isDraftTerm(deprecated)).toBe(false);
    expect(isSelectableTerm(deprecated)).toBe(false);
  });

  it('keeps needs-review selectable', () => {
    const needsReview = term('needs-review');

    expect(isSelectableTerm(needsReview)).toBe(true);
    expect(isSelectableTerm(term('catalogued'))).toBe(true);
    expect(isSelectableTerm(term('verified'))).toBe(true);
  });

  it('keeps drafts out of the selectable set', () => {
    expect(isDraftTerm(term('draft'))).toBe(true);
    expect(isSelectableTerm(term('draft'))).toBe(false);
  });

  it('filters entries while preserving input order', () => {
    const entries = [
      { data: term('draft') },
      { data: { ...term('verified'), id: 'first' } },
      { data: { ...term('deprecated'), id: 'gone' } },
      { data: { ...term('needs-review'), id: 'second' } },
    ];

    expect(selectableTerms(entries).map((entry) => entry.data.id)).toEqual(['first', 'second']);
  });
});
