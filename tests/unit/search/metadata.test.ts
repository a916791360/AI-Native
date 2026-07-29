import { describe, expect, it } from 'vitest';

import registry from '../../../src/generated/term-registry.json';
import { searchMetadata, type TermSearchRecord } from '../../../src/lib/search/metadata';
import { searchCasesForTerms } from '../../fixtures/search/queries';

const records = registry.terms as TermSearchRecord[];
const metadataCases = searchCasesForTerms(records.map(({ id }) => id)).filter(
  ({ kind }) => kind !== 'body',
);

describe('metadata search', () => {
  it.each(metadataCases)('ranks $expectedId first for "$query"', ({ query, expectedId }) => {
    expect(searchMetadata(records, query)[0]?.record.id).toBe(expectedId);
  });

  it.each([
    'foundation-model',
    'attention-mechanism',
    'self-attention',
    'tokenizer',
    'pretraining',
  ])('excludes draft term %s from the public gate', (id) => {
    expect(metadataCases.some(({ expectedId }) => expectedId === id)).toBe(false);
  });

  it('applies domain, difficulty and status filters together', () => {
    const results = searchMetadata(records, '', {
      domain: 'data-retrieval-rag',
      difficulty: 'advanced',
      status: 'verified',
    });

    expect(results.map(({ record }) => record.id)).toEqual(['reranking']);
  });

  it('returns featured terms first for an empty query', () => {
    const results = searchMetadata(records, '');

    expect(results[0]?.record.featured).toBe(true);
    expect(results.at(-1)?.record.featured).toBe(false);
  });
});
