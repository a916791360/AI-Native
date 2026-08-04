import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

import { searchCasesForTerms } from '../fixtures/search/queries';

const registry = JSON.parse(
  readFileSync(new URL('../../src/generated/term-registry.json', import.meta.url), 'utf8'),
) as { terms: { id: string; domain: string; status: string }[] };
const graphData = JSON.parse(
  readFileSync(new URL('../../src/generated/graph.json', import.meta.url), 'utf8'),
) as { nodes: unknown[]; edges: unknown[] };
const domains = parseYaml(
  readFileSync(new URL('../../src/data/domains.yml', import.meta.url), 'utf8'),
) as { id: string; ring: 'core' | 'extended' }[];
const coreDomainIds = new Set(domains.filter(({ ring }) => ring === 'core').map(({ id }) => id));
const PUBLIC_TERM_COUNT = String(registry.terms.length);
const PUBLIC_CORE_TERM_COUNT = String(
  registry.terms.filter(({ domain }) => coreDomainIds.has(domain)).length,
);
const PUBLIC_RELATION_COUNT = String(graphData.edges.length);
const PUBLIC_SEARCH_CASES = searchCasesForTerms(registry.terms.map(({ id }) => id));
const PLAYWRIGHT_BASE_URL = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4321'}`;

async function revealMobileHeaderPanel(page: Page, isMobile: boolean, panel: '菜单' | '搜索') {
  if (isMobile) await page.getByRole('button', { name: panel, exact: true }).click();
}

async function revealMobileSearchFilters(page: Page, isMobile: boolean) {
  if (isMobile) await page.locator('[data-search-filter-panel] > summary').click();
}

test('renders the content-catalog shell and a direct case-library entry', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');

  await expect(page).toHaveTitle('AI-Native');
  const brand = page.getByRole('link', { name: 'AI-Native 首页' });
  await expect(brand).toBeVisible();
  await expect(brand.locator('[data-logo-mark]')).toBeVisible();
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  );
  await expect(page.getByRole('heading', { level: 1, name: 'AI 产品判断学习库' })).toBeVisible();
  await expect(page.locator('.learning-card > a').first()).toHaveAttribute(
    'href',
    '/learn/questions/q01-rules-or-ai/',
  );
  if (isMobile) {
    await expect(page.locator('nav[aria-label="内容类型"]')).toBeHidden();
  } else {
    await expect(page.getByRole('link', { name: /案例实战 2/ })).toHaveAttribute(
      'href',
      '/learn/cases/',
    );
  }
  const header = page.getByRole('banner');
  await revealMobileHeaderPanel(page, isMobile, '菜单');
  await expect(header.getByRole('link', { name: '首页', exact: true })).toHaveAttribute(
    'href',
    '/',
  );
  await expect(header.getByRole('link', { name: '系统课程' })).toHaveAttribute('href', '/learn/');
  await expect(header.getByRole('link', { name: '案例库' })).toHaveAttribute(
    'href',
    '/learn/cases/',
  );
  await expect(header.getByRole('link', { name: '知识图鉴' })).toHaveAttribute('href', '/atlas/');
  await expect(header.getByRole('link', { name: '阅读路线' })).toHaveAttribute('href', '/routes/');
  await expect(header.getByRole('link', { name: '概念图谱' })).toHaveAttribute('href', '/graph/');
  await revealMobileHeaderPanel(page, isMobile, '搜索');
  await expect(header.getByRole('searchbox', { name: '搜索案例、问题或术语' })).toBeVisible();
});

test('derives the homepage learning structure and knowledge scale from project data', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');

  await expect(page.locator('[data-case-tab]')).toHaveCount(0);
  await expect(page.locator('.catalog-section')).toHaveCount(6);
  await expect(page.locator('.learning-card')).toHaveCount(24);
  if (isMobile) {
    await expect(page.getByRole('combobox', { name: '课程阶段' }).locator('option')).toHaveCount(6);
    await expect(page.locator('nav[aria-label="内容类型"]')).toBeHidden();
  } else {
    await expect(
      page.getByRole('navigation', { name: '课程阶段目录' }).getByRole('link'),
    ).toHaveCount(6);
    await expect(page.getByRole('navigation', { name: '内容类型' })).toContainText(
      `概念关系 ${PUBLIC_RELATION_COUNT}`,
    );
  }
});

test('keeps the homepage oriented around the course instead of a selected question', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('group', { name: '精选判断题' })).toHaveCount(0);
  await expect(page.getByText('发票金额校验，需要上大模型吗？')).toBeVisible();
  await expect(page.getByRole('link', { name: /规则还是 AI.*Q01/ })).toHaveAttribute(
    'href',
    '/learn/questions/q01-rules-or-ai/',
  );
});

test('provides stable skeletons for all primary page types', async ({ page }) => {
  const pages = [
    ['/learn/', 'AI 产品判断学习库'],
    ['/learn/questions/', 'AI 产品判断学习库'],
    ['/learn/cases/', 'AI 产品案例库'],
    ['/learn/cases/user-feedback-analysis/', '每日用户反馈分析与产品改进'],
    ['/learn/cases/user-feedback-analysis/decide-ai-boundary/', '判断 AI 边界'],
    ['/learn/questions/q01-rules-or-ai/', '发票金额校验，需要上大模型吗？'],
    ['/learn/questions/q21-support-rag/', '客服知识库的第一版，应该直接自动回复客户吗？'],
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

test('keeps all peer destinations in one navigation on every core page', async ({
  page,
  isMobile,
}) => {
  for (const url of [
    '/',
    '/learn/',
    '/learn/questions/q01-rules-or-ai/',
    '/learn/cases/',
    '/learn/cases/user-feedback-analysis/',
    '/learn/cases/user-feedback-analysis/decide-ai-boundary/',
    '/atlas/',
    '/routes/',
    '/graph/',
    '/methodology/',
    '/terms/retrieval-augmented-generation/',
  ]) {
    await page.goto(url);
    await revealMobileHeaderPanel(page, isMobile, '菜单');
    const navigation = page.getByRole('navigation', { name: '主导航' });
    const homeLink = navigation.getByRole('link', { name: '首页', exact: true });
    await expect(homeLink).toHaveAttribute('href', '/');
    if (url === '/') {
      await expect(homeLink).toHaveAttribute('aria-current', 'page');
    } else {
      await expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    }
    await expect(navigation.getByRole('link', { name: '系统课程' })).toHaveAttribute(
      'href',
      '/learn/',
    );
    await expect(navigation.getByRole('link', { name: '案例库' })).toHaveAttribute(
      'href',
      '/learn/cases/',
    );
    await expect(navigation.getByRole('link', { name: '知识图鉴' })).toHaveAttribute(
      'href',
      '/atlas/',
    );
    await expect(navigation.getByRole('link', { name: '阅读路线' })).toHaveAttribute(
      'href',
      '/routes/',
    );
    await expect(navigation.getByRole('link', { name: '概念图谱' })).toHaveAttribute(
      'href',
      '/graph/',
    );
    await expect(navigation.getByRole('link')).toHaveCount(6);
    await expect(page.getByRole('navigation', { name: '知识工具' })).toHaveCount(0);
  }
});

test('reveals immediate reasoning without asking the learner to type', async ({ page }) => {
  await page.goto('/learn/questions/q01-rules-or-ai/');

  await expect(
    page.locator('#main-content textarea, #main-content input:not([type="hidden"])'),
  ).toHaveCount(0);
  const riskyOption = page.getByRole('button', { name: /让大模型读取发票后判断/ });
  await riskyOption.click();

  await expect(riskyOption).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-feedback-panel]')).toBeVisible();
  await expect(page.locator('[data-feedback-kicker]')).toHaveText('高风险路径');
  await expect(page.locator('[data-feedback-copy]')).toContainText('增加延迟、成本与不确定性');
});

test('makes stage progress and cross-stage continuation explicit', async ({ page }) => {
  await page.goto('/learn/questions/q04-high-stakes-answer/');

  const location = page.getByRole('region', { name: 'Level 1 · 基础判断位置' });
  await expect(location).toContainText('阶段 01 / 06');
  await expect(location).toContainText('AI 基础与模型边界');
  await expect(location).toContainText('本阶段4 / 4');
  await expect(location).toContainText('基础题04 / 24');
  await expect(location.getByRole('link')).toHaveCount(1);
  await expect(location.getByRole('link', { name: '返回三层学习中心' })).toHaveAttribute(
    'href',
    '/learn/',
  );
  await expect(page.getByRole('navigation', { name: '六阶段学习路线' })).toHaveCount(0);

  await page.getByRole('button', { name: /限定为信息辅助/ }).click();
  const nextStep = page.locator('[data-next-step]');
  await expect(nextStep).toContainText('进入阶段 02');
  await expect(nextStep).toContainText('场景与机会判断');
  await expect(nextStep).toHaveAttribute('href', '/learn/questions/q05-demo-or-value/');

  await page.goto('/learn/questions/q24-launch-decision/');
  await page.getByRole('button', { name: /补齐监控、预算、护栏和接管/ }).click();
  await expect(page.locator('[data-next-step]')).toContainText('完成 Level 1');
  await expect(page.locator('[data-next-step]')).toHaveAttribute('href', '/learn/');
});

test('keeps the course as one six-stage, twenty-four-card catalog', async ({ page, isMobile }) => {
  await page.goto('/learn/');

  await expect(page.locator('.catalog-section')).toHaveCount(6);
  await expect(page.locator('.learning-card')).toHaveCount(24);
  await expect(page.locator('.learning-card > a').first()).toHaveAttribute(
    'href',
    '/learn/questions/q01-rules-or-ai/',
  );
  if (isMobile) {
    await expect(page.locator('nav[aria-label="内容类型"]')).toBeHidden();
    await revealMobileHeaderPanel(page, isMobile, '菜单');
    await expect(
      page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '案例库' }),
    ).toBeVisible();
  } else {
    await expect(page.getByRole('navigation', { name: '内容类型' })).toContainText('案例实战 2');
  }
  await expect(page.locator('.task-list, .learning-levels, .course-summary')).toHaveCount(0);
});

test('keeps the question and decision logic readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(`${PLAYWRIGHT_BASE_URL}/`);
  await page.locator('.learning-card > a').first().click();
  await expect(
    page.getByRole('heading', { level: 1, name: '发票金额校验，需要上大模型吗？' }),
  ).toBeVisible();
  await expect(page.getByText('能被稳定规则完整描述的问题，优先使用确定性系统。')).toBeVisible();

  await context.close();
});

test('routes the persistent header search into the shared search experience', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await revealMobileHeaderPanel(page, isMobile, '搜索');

  const homeSearch = page.locator('form[role="search"]').filter({
    has: page.getByRole('searchbox', { name: '搜索案例、问题或术语' }),
  });
  await homeSearch.getByRole('searchbox').fill('RAG');
  await homeSearch.getByRole('button', { name: '搜索' }).click();

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

  for (const searchCase of PUBLIC_SEARCH_CASES) {
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

test('combines domain, difficulty and status filters', async ({ page, isMobile }) => {
  await page.goto('/search/');
  await revealMobileSearchFilters(page, isMobile);

  await page.locator('[data-search-filter="domain"]').selectOption('data-retrieval-rag');
  await page.locator('[data-search-filter="difficulty"]').selectOption('advanced');
  await page.locator('[data-search-filter="status"]').selectOption('verified');

  await expect(page.locator('[data-search-status]')).toHaveText('显示 1 / 1 个词条');
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

test('renders every verified term as an eight-section article', async ({ page }) => {
  const termIds = registry.terms.filter(({ status }) => status === 'verified').map(({ id }) => id);

  for (const termId of termIds) {
    await page.goto(`/terms/${termId}/`);
    await expect(page.getByText('已核验', { exact: true }).first()).toBeVisible();
    await expect(page.locator('.term-content h2')).toHaveCount(8);
    await expect(page.locator('#what-it-is')).toHaveText('它是什么');
    await expect(page.locator('#sources-and-revisions')).toHaveText('来源与修订');
    expect(await page.locator('.source-register li').count()).toBeGreaterThanOrEqual(2);
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

  await page.goto(`${PLAYWRIGHT_BASE_URL}/routes/rag-from-zero/`);
  await page.getByRole('link', { name: '从第一篇开始阅读' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '人工智能' })).toBeVisible();
  await expect(page.locator('#what-it-is')).toHaveText('它是什么');

  await context.close();
});

test('uses the shared search aggregator from the term atlas', async ({ page, isMobile }) => {
  await page.goto('/atlas/?q=RAG');

  await expect(page.locator('[data-search-output]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#atlas-index')).toBeHidden();
  await expect(page.locator('[data-search-results] li').first()).toHaveAttribute(
    'data-result-id',
    'retrieval-augmented-generation',
  );

  const atlasSearch = page.locator('form[role="search"]').filter({
    has: page.getByRole('searchbox', { name: '搜索词条' }),
  });
  await atlasSearch.getByRole('searchbox').fill('Token');
  await atlasSearch.getByRole('button', { name: '搜索' }).click();
  await expect(page.locator('[data-search-output]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-search-results] li').first()).toHaveAttribute(
    'data-result-id',
    'token',
  );

  await revealMobileSearchFilters(page, isMobile);
  await page.locator('[data-search-clear]').click();
  await expect(page.locator('#atlas-index')).toBeVisible();
});

test('filters and sorts the structured atlas index', async ({ page, isMobile }) => {
  await page.goto('/atlas/');

  if (isMobile) {
    await expect(page.locator('[data-atlas-domain]:visible')).toHaveCount(1);
    await page.locator('[data-atlas-domain-mobile]').selectOption({ label: '机器学习' });
    await expect(page.locator('[data-atlas-domain]:visible')).toHaveCount(1);
    await expect(page).toHaveURL(/domain=machine-learning/);
  } else {
    await expect(page.locator('[data-atlas-visible]')).toHaveText(PUBLIC_TERM_COUNT);
    await page.getByLabel('领域范围').selectOption('core');
    await expect(page.locator('[data-atlas-visible]')).toHaveText(PUBLIC_CORE_TERM_COUNT);
    await expect(page.locator('[data-atlas-domain]:visible')).toHaveCount(9);
  }
  await page.getByLabel('排序方式').selectOption('name');
  if (!isMobile) await expect(page).toHaveURL(/ring=core/);
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
  await expect(graph).toHaveAttribute('data-graph-node-count', String(graphData.nodes.length));
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
    '/learn/',
    '/learn/questions/',
    '/learn/questions/q21-support-rag/',
    '/learn/cases/user-feedback-analysis/',
    '/learn/cases/user-feedback-analysis/decide-ai-boundary/',
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
  test.skip(!isMobile, 'the direct mobile navigation is only checked on narrow viewports');
  await page.goto('/learn/');

  await page.getByRole('button', { name: '菜单', exact: true }).click();
  const primaryNavigation = page.getByRole('navigation', { name: '主导航' });
  await expect(primaryNavigation.getByRole('link', { name: '案例库' })).toBeVisible();
  await primaryNavigation.getByRole('link', { name: '首页', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'AI 产品判断学习库' })).toBeVisible();
});

test('renders the designed 404 state', async ({ page }) => {
  const response = await page.goto('/not-a-real-concept/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('路径还没有连接');
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  for (const url of [
    '/',
    '/learn/',
    '/learn/questions/',
    '/learn/questions/q21-support-rag/',
    '/learn/cases/user-feedback-analysis/',
    '/learn/cases/user-feedback-analysis/decide-ai-boundary/',
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
