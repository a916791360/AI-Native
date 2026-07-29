import { describe, expect, it } from 'vitest';

import { SITE } from '../../src/config/site';

describe('site metadata', () => {
  it('uses the approved product name and promise', () => {
    expect(SITE.name).toBe('AI-Native');
    expect(SITE.promise).toContain('判断业务场景');
  });
});
