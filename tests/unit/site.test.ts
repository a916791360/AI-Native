import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import { absoluteSiteUrl, resolvePublicOrigin, SITE } from '../../src/config/site';
import { loadProjectContent } from '../../src/lib/content/io';
import { buildContentIssueUrl } from '../../src/lib/site/github';
import { deriveSiteMetrics } from '../../src/lib/site/metrics';

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

  it('derives the public content scale from the project facts', async () => {
    const metrics = deriveSiteMetrics(await loadProjectContent());

    expect(metrics).toMatchObject({
      domainCount: 13,
      termCount: 327,
      verifiedTermCount: 327,
      routeCount: 5,
      publishedRouteCount: 5,
      relationCount: 123,
      latestVerifiedAt: '2026-09-19',
    });
  });

  it('resolves deployment URLs without discarding a repository base path', () => {
    const origin = resolvePublicOrigin('https://example.com/AI-Native/');

    expect(origin).toBe('https://example.com/AI-Native');
    expect(absoluteSiteUrl('/terms/token/', origin!)).toBe(
      'https://example.com/AI-Native/terms/token/',
    );
    expect(() => resolvePublicOrigin('http://example.com')).toThrow('must use HTTPS');
  });

  it('prefills content correction reports and provides a structured issue form', () => {
    const issueUrl = new URL(
      buildContentIssueUrl({
        title: '词条修订：Token',
        pagePath: '/terms/token/',
        context: '具体问题：',
      }),
    );
    const issueForm = readFileSync('.github/ISSUE_TEMPLATE/content-correction.yml', 'utf8');

    expect(issueUrl.searchParams.get('body')).toContain('页面 URL：/terms/token/');
    expect(issueUrl.searchParams.get('body')).toContain('证据或建议来源：');
    expect(issueForm).toContain('id: page-url');
    expect(issueForm).toContain('id: issue-type');
    expect(issueForm).toContain('id: evidence');
  });

  it('ships a raster Open Graph image derived from the approved production page', () => {
    const signature = readFileSync('public/og-default.png').subarray(0, 8);

    expect([...signature]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });
});
