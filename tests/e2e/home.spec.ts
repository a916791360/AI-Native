import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { SEARCH_CASES } from '../fixtures/search/queries';

test('renders the approved direction 1 identity and primary paths', async ({ page, isMobile }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('AI-Native');
  await expect(
    page.getByRole('heading', { level: 1, name: /从听懂 AI.*到判断与设计/ }),
  ).toBeVisible();
  await expect(page.getByText('判断业务场景并设计基础 AI 方案').first()).toBeVisible();
  await expect(page.getByRole('figure', { name: 'Fig. 06 / 数据、检索与 RAG' })).toBeVisible();

  if (isMobile) {
    await expect(page.locator('summary', { hasText: '菜单' })).toBeVisible();
  } else {
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: '知识图鉴' })).toHaveAttribute('href', '/atlas/');
    await expect(header.getByRole('link', { name: '搜索', exact: true })).toHaveAttribute(
      'href',
      '/search/',
    );
    await expect(header.getByRole('link', { name: '学习路线' })).toHaveAttribute(
      'href',
      '/routes/',
    );
    await expect(header.getByRole('link', { name: '概念图谱' })).toHaveAttribute('href', '/graph/');
  }
});

test('derives the homepage routes, domains and content scale from project data', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('.route-list .route-item')).toHaveCount(4);
  await expect(page.locator('.domain-list a')).toHaveCount(12);
  await expect(
    page.locator('.scope-heading dl div', { hasText: '已核验词条' }).locator('dd'),
  ).toHaveText('12');
  await expect(
    page.locator('.scope-heading dl div', { hasText: '概念关系' }).locator('dd'),
  ).toHaveText('308');
  await expect(page.locator('.featured-register a')).toHaveCount(6);
});

test('provides stable skeletons for all primary page types', async ({ page }) => {
  const pages = [
    ['/atlas/', '知识图鉴'],
    ['/search/', '搜索'],
    ['/routes/', '学习路线'],
    ['/routes/rag-from-zero/', 'RAG 从零到理解与应用'],
    ['/terms/retrieval-augmented-generation/', '检索增强生成'],
    ['/graph/', '概念图谱'],
    ['/methodology/', '内容方法'],
  ] as const;

  for (const [url, heading] of pages) {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
  }
});

test('keeps search, routes and domain browsing available from every core page', async ({
  page,
  isMobile,
}) => {
  for (const url of [
    '/',
    '/atlas/',
    '/routes/',
    '/graph/',
    '/methodology/',
    '/terms/retrieval-augmented-generation/',
  ]) {
    await page.goto(url);
    if (isMobile) await page.locator('summary', { hasText: '菜单' }).click();
    const navigation = page.getByRole('navigation', {
      name: isMobile ? '移动端主导航' : '主导航',
    });
    await expect(navigation.getByRole('link', { name: '知识图鉴' })).toHaveAttribute(
      'href',
      '/atlas/',
    );
    await expect(navigation.getByRole('link', { name: '搜索', exact: true })).toHaveAttribute(
      'href',
      '/search/',
    );
    await expect(navigation.getByRole('link', { name: '学习路线' })).toHaveAttribute(
      'href',
      '/routes/',
    );
  }
});

test('routes the homepage search into the shared search experience', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('searchbox', { name: '搜索词条' }).fill('RAG');
  await page.getByRole('button', { name: '搜索' }).click();

  await expect(page).toHaveURL(/\/search\/\?q=RAG$/);
  await expect(page.locator('[data-search-results] li').first()).toHaveAttribute(
    'data-result-id',
    'retrieval-augmented-generation',
  );
});

test('passes the fixed production search relevance gate', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the relevance gate is viewport-independent and runs once');
  test.setTimeout(120_000);
  await page.goto('/search/');

  const input = page.getByRole('searchbox', { name: '搜索词条' });
  const outcomes: { expected: string; actual: string | null; kind: string; query: string }[] = [];

  for (const searchCase of SEARCH_CASES) {
    await input.fill(searchCase.query);
    await input.press('Enter');
    await expect(page.locator('[data-search-output]')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('[data-search-index-state]')).toHaveText('词条索引 + 正文索引');
    const firstResult = page.locator('[data-search-results] li').first();
    outcomes.push({
      ...searchCase,
      expected: searchCase.expectedId,
      actual: (await firstResult.count()) ? await firstResult.getAttribute('data-result-id') : null,
    });
  }

  const exactFailures = outcomes.filter(
    (outcome) => ['exact', 'alias'].includes(outcome.kind) && outcome.actual !== outcome.expected,
  );
  const correct = outcomes.filter((outcome) => outcome.actual === outcome.expected).length;

  expect(exactFailures, 'all exact names, abbreviations and aliases must rank first').toEqual([]);
  expect(
    correct / outcomes.length,
    JSON.stringify(
      outcomes.filter((item) => item.actual !== item.expected),
      null,
      2,
    ),
  ).toBeGreaterThanOrEqual(0.9);
});

test('combines domain, difficulty and status filters', async ({ page }) => {
  await page.goto('/search/');

  await page.getByLabel('领域').selectOption('data-retrieval-rag');
  await page.getByLabel('难度').selectOption('advanced');
  await page.getByLabel('状态').selectOption('verified');

  await expect(page.getByText('显示 1 个词条')).toBeVisible();
  await expect(page.locator('[data-search-results] li')).toHaveCount(1);
  await expect(page.locator('[data-search-results] li')).toHaveAttribute(
    'data-result-id',
    'reranking',
  );
});

test('keeps metadata search available when the body index cannot load', async ({ page }) => {
  await page.route('**/pagefind/**', (route) => route.abort());
  await page.goto('/search/?q=RAG');

  await expect(page.locator('[data-search-index-state]')).toContainText('正文索引暂不可用');
  await expect(page.locator('[data-search-results] li').first()).toHaveAttribute(
    'data-result-id',
    'retrieval-augmented-generation',
  );
});

test('publishes the complete RAG route with twelve sequential terms', async ({ page }) => {
  await page.goto('/routes/rag-from-zero/');

  await expect(page.getByText('已发布', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '从第一篇开始阅读' })).toHaveAttribute(
    'href',
    '/terms/artificial-intelligence/',
  );
  await expect(page.locator('.chapter-terms a')).toHaveCount(12);
  await expect(page.locator('.chapter-terms span')).toHaveText([
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ]);
});

test('publishes all four ordered learning routes', async ({ page }) => {
  const routes = [
    ['ai-foundations', 'AI 零基础入门', 6],
    ['human-ai-collaboration', '高效人机协作', 6],
    ['ai-product-scenario-judgment', 'AI 产品与场景判断', 8],
    ['rag-from-zero', 'RAG 从零到理解与应用', 12],
  ] as const;

  await page.goto('/routes/');
  await expect(page.locator('.route-entry')).toHaveCount(4);
  for (const [id, title, termCount] of routes) {
    await page.goto('/routes/');
    await expect(page.getByRole('link', { name: title }).first()).toHaveAttribute(
      'href',
      `/routes/${id}/`,
    );
    await page.goto(`/routes/${id}/`);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.locator('.chapter-terms a')).toHaveCount(termCount);
  }
});

test('renders every representative term as a verified eight-section article', async ({ page }) => {
  const termIds = [
    'artificial-intelligence',
    'generative-ai',
    'token',
    'large-language-model',
    'context-window',
    'hallucination',
    'embedding',
    'document-chunking',
    'vector-database',
    'retrieval',
    'reranking',
    'retrieval-augmented-generation',
  ];

  for (const termId of termIds) {
    await page.goto(`/terms/${termId}/`);
    await expect(page.getByText('已核验', { exact: true }).first()).toBeVisible();
    await expect(page.locator('.term-content h2')).toHaveCount(8);
    await expect(page.locator('#what-it-is')).toHaveText('它是什么');
    await expect(page.locator('#sources-and-revisions')).toHaveText('来源与修订');
    await expect(page.locator('.source-register li')).toHaveCount(2);
  }
});

test('connects a term to its previous and next route entries', async ({ page }) => {
  await page.goto('/terms/context-window/');

  await expect(page.getByText('05 / 12', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /上一篇.*大语言模型/ })).toHaveAttribute(
    'href',
    '/terms/large-language-model/',
  );
  await expect(page.getByRole('link', { name: /下一篇.*幻觉/ })).toHaveAttribute(
    'href',
    '/terms/hallucination/',
  );
});

test('keeps the published reading path usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4321/routes/rag-from-zero/');
  await page.getByRole('link', { name: '从第一篇开始阅读' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '人工智能' })).toBeVisible();
  await expect(page.locator('#what-it-is')).toHaveText('它是什么');

  await context.close();
});

test('uses the shared search aggregator from the term atlas', async ({ page }) => {
  await page.goto('/atlas/?q=RAG');

  await expect(page.locator('[data-search-output]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#atlas-index')).toBeHidden();
  await expect(page.locator('[data-search-results] li').first()).toHaveAttribute(
    'data-result-id',
    'retrieval-augmented-generation',
  );

  await page.getByRole('searchbox', { name: '搜索词条' }).fill('Token');
  await page.getByRole('button', { name: '搜索' }).click();
  await expect(page.locator('[data-search-output]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-search-results] li').first()).toHaveAttribute(
    'data-result-id',
    'token',
  );

  await page.locator('[data-search-clear]').click();
  await expect(page.locator('#atlas-index')).toBeVisible();
});

test('filters and sorts the structured atlas index', async ({ page }) => {
  await page.goto('/atlas/');

  await expect(page.locator('[data-atlas-visible]')).toHaveText('300');
  await page.getByLabel('领域范围').selectOption('core');
  await expect(page.locator('[data-atlas-visible]')).toHaveText('225');
  await expect(page.locator('[data-atlas-domain]:visible')).toHaveCount(9);
  await page.getByLabel('排序方式').selectOption('name');
  await expect(page).toHaveURL(/ring=core/);
  await expect(page).toHaveURL(/sort=name/);
});

test('offers recovery and feedback when search has no result', async ({ page }) => {
  await page.goto('/search/?q=不存在的固定词条');

  await expect(page.locator('[data-search-empty]')).toBeVisible();
  await expect(page.getByRole('link', { name: '浏览全部领域' })).toHaveAttribute('href', '/atlas/');
  await expect(page.getByRole('link', { name: '建议收录词条' })).toHaveAttribute(
    'href',
    /github\.com\/a916791360\/AI-Native\/issues\/new/,
  );
});

test('documents all editorial states and the correction workflow', async ({ page }) => {
  await page.goto('/methodology/');

  for (const state of ['目录已收录', '草稿', '已核验', '需要复核', '已弃用']) {
    await expect(page.getByRole('heading', { level: 3, name: state })).toBeVisible();
  }
  const correction = page.getByRole('link', { name: '提交内容修订建议' });
  await expect(correction).toHaveAttribute(
    'href',
    /github\.com\/a916791360\/AI-Native\/issues\/new/,
  );
});

test('ships preview-safe metadata and crawl endpoints', async ({ page, request }) => {
  await page.goto('/terms/token/');

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Token/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);

  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /');
  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain('<urlset');
});

test('loads the full graph lazily and supports focus, filters and viewport controls', async ({
  page,
  isMobile,
}) => {
  const cytoscapeRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('cytoscape')) cytoscapeRequests.push(request.url());
  });
  await page.goto('/graph/?focus=token');

  const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
  if (isMobile) {
    await expect(graph).toHaveAttribute('data-graph-state', 'idle');
    expect(cytoscapeRequests).toEqual([]);
    await page.locator('[data-graph-load]').click();
  }
  await expect(graph).toHaveAttribute('data-graph-state', 'ready');
  await expect(graph).toHaveAttribute('data-graph-node-count', '300');
  await expect(graph).toHaveAttribute('data-graph-selected', 'token');
  await expect(graph.locator('[data-graph-detail-title]')).toHaveText('Token');
  expect(cytoscapeRequests).toHaveLength(1);

  const initialEdges = Number(await graph.getAttribute('data-graph-visible-edges'));
  await graph.locator('[data-graph-relation][value="comparison"]').uncheck();
  await expect
    .poll(async () => Number(await graph.getAttribute('data-graph-visible-edges')))
    .toBeLessThan(initialEdges);

  const initialZoom = await graph.getAttribute('data-graph-zoom');
  await graph.locator('[data-graph-action="zoom-in"]').click();
  await expect(graph).not.toHaveAttribute('data-graph-zoom', initialZoom ?? '');

  await graph.locator('[data-graph-focus-select]').selectOption('retrieval');
  await expect(graph).toHaveAttribute('data-graph-selected', 'retrieval');
  await expect(graph.locator('[data-graph-detail-title]')).toHaveText('检索');
});

test('keeps the structured graph usable when Cytoscape cannot initialize', async ({
  page,
  isMobile,
}) => {
  await page.goto('/graph/?graphError=1');
  const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
  if (isMobile) await page.locator('[data-graph-load]').click();

  await expect(graph).toHaveAttribute('data-graph-state', 'error');
  await expect(graph.getByText('交互图谱暂不可用')).toBeVisible();
  await expect(
    page.locator('#relations').getByRole('link', { name: '人工智能' }).first(),
  ).toBeVisible();
});

test('explains an empty graph filter without removing structured navigation', async ({
  page,
  isMobile,
}) => {
  await page.goto('/graph/');
  const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
  if (isMobile) await page.locator('[data-graph-load]').click();
  await expect(graph).toHaveAttribute('data-graph-state', 'ready');

  await graph.locator('[data-graph-domain]').selectOption('machine-learning-deep-learning');
  await graph.locator('[data-graph-relation][value="application"]').uncheck();
  await expect(graph).toHaveAttribute('data-graph-state', 'empty');
  await expect(graph.getByText('当前筛选没有可显示的词条关系')).toBeVisible();
  await expect(
    page.locator('#relations').getByRole('link', { name: '人工智能' }).first(),
  ).toBeVisible();
});

test('limits term pages to a one-hop local graph', async ({ page, isMobile }) => {
  await page.goto('/terms/retrieval-augmented-generation/');
  const graph = page.locator('[data-graph-explorer][data-graph-mode="local"]');
  await graph.scrollIntoViewIfNeeded();

  if (isMobile) {
    await expect(graph).toHaveAttribute('data-graph-state', 'idle');
    await graph.locator('[data-graph-load]').click();
  }
  await expect(graph).toHaveAttribute('data-graph-state', 'ready');
  await expect(graph).toHaveAttribute('data-graph-selected', 'retrieval-augmented-generation');
  const localNodeCount = Number(await graph.getAttribute('data-graph-node-count'));
  expect(localNodeCount).toBeLessThanOrEqual(20);
});

test('keeps Cytoscape out of the homepage initial load', async ({ page }) => {
  const cytoscapeRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('cytoscape')) cytoscapeRequests.push(request.url());
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(cytoscapeRequests).toEqual([]);
});

test('keeps a 500-node synthetic graph responsive in Chromium', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the 500-node performance gate targets the desktop graph experience');
  await page.goto('/graph/?benchmark=500');

  const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
  await expect(graph).toHaveAttribute('data-graph-state', 'ready', { timeout: 15_000 });
  await expect(graph).toHaveAttribute('data-graph-node-count', '500');
  expect(Number(await graph.getAttribute('data-graph-init-ms'))).toBeLessThan(5_000);

  await graph.locator('[data-graph-focus-select]').selectOption('synthetic-499');
  await expect(graph).toHaveAttribute('data-graph-selected', 'synthetic-499');
  await graph.locator('[data-graph-action="zoom-in"]').click();
  const timerDelay = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const startedAt = performance.now();
        window.setTimeout(() => resolve(performance.now() - startedAt), 50);
      }),
  );
  expect(timerDelay).toBeLessThan(500);
});

test('keeps key pages within the viewport without horizontal overflow', async ({ page }) => {
  for (const url of [
    '/',
    '/atlas/',
    '/search/?q=RAG',
    '/routes/',
    '/graph/',
    '/terms/retrieval-augmented-generation/',
  ]) {
    await page.goto(url);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test('exposes the navigation on narrow screens', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile navigation is only rendered as a control on narrow viewports');
  await page.goto('/');

  const menu = page.locator('summary', { hasText: '菜单' });
  await menu.click();
  await expect(page.getByRole('navigation', { name: '移动端主导航' })).toBeVisible();
  await page
    .getByRole('navigation', { name: '移动端主导航' })
    .getByRole('link', { name: '内容方法' })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: '内容方法' })).toBeVisible();
});

test('renders the designed 404 state', async ({ page }) => {
  const response = await page.goto('/not-a-real-concept/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('路径还没有连接');
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  for (const url of [
    '/',
    '/atlas/',
    '/search/?q=RAG',
    '/graph/',
    '/terms/retrieval-augmented-generation/',
  ]) {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blockingViolations = results.violations.filter(({ impact }) =>
      ['serious', 'critical'].includes(impact ?? ''),
    );

    expect(blockingViolations, `${url} has blocking axe violations`).toEqual([]);
  }
});
