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
  await expect(
    page.getByRole('heading', { level: 1, name: '从看懂 AI，到做出可上线的 AI 产品' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '直接做第 01 题' })).toHaveAttribute(
    'href',
    '/learn/questions/q01-rules-or-ai/',
  );
  // 首屏三个入口：主 CTA 用强调色指向学习起点，题目与搜索都是 ghost。
  // 零基础用户不该被直接丢进判断题——他还没有做判断所需的词汇量。
  // 这里不断言主 CTA 的具体路径：I2 建好 /map/ 后它会从 /routes/ 切过去。
  const heroCtas = page.locator('.hero .cta-row > a');
  await expect(heroCtas).toHaveCount(3);
  await expect(heroCtas.nth(0)).toHaveClass(/cta-primary/);
  await expect(heroCtas.nth(0)).not.toHaveAttribute('href', /^\/learn\/questions\//);
  await expect(heroCtas.nth(1)).toHaveClass(/cta-ghost/);
  await expect(heroCtas.nth(2)).toHaveClass(/cta-ghost/);
  await expect(heroCtas.nth(2)).toHaveAttribute('href', '/search/');
  const header = page.getByRole('banner');
  await revealMobileHeaderPanel(page, isMobile, '菜单');
  await expect(header.getByRole('link', { name: '开始学习' })).toHaveAttribute('href', '/learn/');
  await expect(header.getByRole('link', { name: '案例库' })).toHaveAttribute(
    'href',
    '/learn/cases/',
  );
  await expect(header.getByRole('link', { name: '知识库' })).toHaveAttribute('href', '/atlas/');
  await revealMobileHeaderPanel(page, isMobile, '搜索');
  await expect(header.getByRole('searchbox', { name: '搜索案例、问题或术语' })).toBeVisible();
});

test('derives the homepage learning structure and knowledge scale from project data', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');

  await expect(page.locator('.level-list li')).toHaveCount(3);
  await expect(page.locator('.outcome-list li')).toHaveCount(6);
  await expect(page.getByText(`${PUBLIC_TERM_COUNT} 词条`)).toBeVisible();
  await expect(page.getByText(`${PUBLIC_RELATION_COUNT} 关系`)).toBeVisible();
  if (isMobile) {
    await expect(page.locator('.level-list li').first()).toBeVisible();
  }
});

test('keeps the homepage oriented around positioning instead of a selected question', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('group', { name: '精选判断题' })).toHaveCount(0);
  await expect(page.locator('.learning-card')).toHaveCount(0);
  await expect(page.getByText('发票金额校验，需要引入大模型吗？')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { level: 1, name: '从看懂 AI，到做出可上线的 AI 产品' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '直接做第 01 题' })).toHaveAttribute(
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
    ['/learn/questions/q01-rules-or-ai/', '发票金额校验，需要引入大模型吗？'],
    ['/learn/questions/q31-long-doc-source/', '制度文档持续增长，还把全文拼进提示词吗？'],
    ['/atlas/', '知识库'],
    ['/search/', '搜索'],
    ['/routes/', '阅读路线'],
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

test('keeps the primary learning navigation consistent on every core page', async ({
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
    await expect(navigation.getByRole('link', { name: '开始学习' })).toHaveAttribute(
      'href',
      '/learn/',
    );
    await expect(navigation.getByRole('link', { name: '案例库' })).toHaveAttribute(
      'href',
      '/learn/cases/',
    );
    await expect(navigation.getByRole('link', { name: '知识库' })).toHaveAttribute(
      'href',
      '/atlas/',
    );
    await expect(navigation.getByRole('link')).toHaveCount(3);
    await expect(page.getByRole('navigation', { name: '知识工具' })).toHaveCount(0);
  }
});

test('answers in place with immediate per-option feedback instead of jumping to a panel', async ({
  page,
}) => {
  await page.goto('/learn/questions/q01-rules-or-ai/');

  // 一题一屏：不要求学习者打字。
  await expect(
    page.locator('#main-content textarea, #main-content input:not([type="hidden"])'),
  ).toHaveCount(0);

  // 作答前：所有反馈都是折叠的，核心原则也是折叠的（先判断，再看解释）。
  await expect(page.locator('[data-option-feedback][open]')).toHaveCount(0);
  await expect(page.locator('[data-principle]')).not.toHaveAttribute('open', '');

  const riskyOption = page.getByRole('button', { name: /让大模型读取发票后判断/ });
  const riskyItem = page.locator('[data-option-item]').filter({ has: riskyOption });
  await riskyOption.click();

  // 反馈就在被点的那一条里展开，不需要跳到页面下方的独立面板。
  await expect(riskyOption).toHaveAttribute('aria-pressed', 'true');
  await expect(riskyItem).toHaveAttribute('data-state', 'chosen');
  const riskyFeedback = riskyItem.locator('[data-option-feedback]');
  await expect(riskyFeedback).toHaveAttribute('open', '');
  await expect(riskyFeedback.locator('.option-verdict')).toHaveText('高风险路径');
  await expect(riskyFeedback.locator('.option-why')).toContainText('增加延迟、成本与不确定性');

  // 同一题的所有路径判断一起展开，方便横向比较。
  const opened = await page.locator('[data-option-feedback][open]').count();
  expect(opened).toBe(3);

  // 答完即记录：进度条与结业状态同步更新。
  await expect(page.locator('[data-progress-answered]')).toHaveText('已答 1 / 90');
  await expect(page.locator('[data-progress-missed]')).toHaveText('错 1');
  await expect(page.locator('[data-principle]')).toHaveAttribute('open', '');

  // 已作答后不接受二次改答，避免「试到对为止」。
  const recommended = page.getByRole('button', { name: /使用确定性规则计算并校验/ });
  await recommended.click();
  await expect(recommended).toHaveAttribute('aria-pressed', 'false');
});

test('supports keyboard answering and keeps the continuation link explicit', async ({ page }) => {
  await page.goto('/learn/questions/q01-rules-or-ai/');

  // 数字键作答：2 是本题的推荐路径。
  await page.keyboard.press('2');
  await expect(page.locator('[data-progress-answered]')).toHaveText('已答 1 / 90');
  await expect(page.locator('[data-progress-missed]')).toHaveText('错 0');

  // 答完后 → 才推进，避免误触跳过。
  const nextStep = page.locator('[data-next-step]');
  await expect(nextStep).toHaveAttribute('href', '/learn/questions/q02-classify-or-generate/');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/learn\/questions\/q02-classify-or-generate\/$/);
});

test('answers every referenced term inside the question instead of sending the reader away', async ({
  page,
}) => {
  // 「题内即时查」：被引用的词条要在答题页就地给出中文名与解释，
  // 读者为了一个名词不必离开当前这题去知识库。空解释 = 退化成裸链接，视为失败。
  for (const questionPath of [
    '/learn/questions/q01-rules-or-ai/',
    '/learn/questions/q61-accuracy-or-explain/',
    '/learn/questions/q90-pilot-or-scale/',
  ]) {
    await page.goto(questionPath);

    const refs = page.getByRole('navigation', { name: '相关知识库条目' });
    const entries = refs.locator('a');
    const count = await entries.count();
    expect(count, `${questionPath} 的题内引用条数`).toBeGreaterThanOrEqual(2);

    for (let index = 0; index < count; index += 1) {
      const entry = entries.nth(index);
      await expect(entry, `${questionPath} 第 ${index + 1} 条引用`).toBeVisible();

      const href = await entry.getAttribute('href');
      expect(href, `${questionPath} 第 ${index + 1} 条引用的链接`).toMatch(
        /^\/terms\/[a-z0-9-]+\/$/,
      );

      const name = (await entry.locator('strong').textContent())?.trim() ?? '';
      const definition = (await entry.locator('span').textContent())?.trim() ?? '';
      expect(name.length, `${questionPath} 第 ${index + 1} 条引用的词条名`).toBeGreaterThan(0);
      expect(definition.length, `${questionPath} 中「${name}」的题内解释`).toBeGreaterThanOrEqual(
        10,
      );
    }
  }
});

test('marks tier and module boundaries on the question page', async ({ page }) => {
  // 阶段边界：第 01 阶段的最后一题指向阶段 02。
  await page.goto('/learn/questions/q05-context-overflow-retrieval/');
  const head = page.locator('.q-head .meta-label');
  await expect(head).toContainText('T1 · 第 5 / 30 题');
  await expect(head).toContainText('阶段 01 第 5 / 5 题');
  const moduleStep = page.locator('[data-next-step]');
  await expect(moduleStep).toContainText('进入阶段 02');
  await expect(moduleStep).toContainText('场景与机会判断');
  await expect(moduleStep).toHaveAttribute('href', '/learn/questions/q06-demo-or-opportunity/');

  // 层级边界：T1 最后一题指向 T2 第一题，并说明进入的是哪一层。
  await page.goto('/learn/questions/q30-missing-rollback/');
  const tierStep = page.locator('[data-next-step]');
  await expect(tierStep).toContainText('进入 T2 场景判断');
  await expect(tierStep).toHaveAttribute('href', '/learn/questions/q31-long-doc-source/');

  // 三层终点：最后一题指向结业页，而不是再回到学习中心。
  await page.goto('/learn/questions/q90-pilot-or-scale/');
  const finalStep = page.locator('[data-next-step]');
  await expect(finalStep).toContainText('三层训练完成');
  await expect(finalStep).toHaveAttribute('href', '/learn/complete/');
});

test('keeps the course as one three-tier, ninety-card catalog', async ({ page, isMobile }) => {
  await page.goto('/learn/');

  await expect(page.locator('.tier-block')).toHaveCount(3);
  await expect(page.locator('.module-block')).toHaveCount(18);
  await expect(page.locator('.learning-card')).toHaveCount(90);
  await expect(page.locator('.learning-card > a').first()).toHaveAttribute(
    'href',
    '/learn/questions/q01-rules-or-ai/',
  );
  // 目录页顶部只有一层导航——全站「内容分类条」已删除，不再与顶栏并列。
  await expect(page.locator('nav[aria-label="内容类型"]')).toHaveCount(0);
  await revealMobileHeaderPanel(page, isMobile, '菜单');
  await expect(
    page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '案例库' }),
  ).toBeVisible();
  await expect(page.locator('.task-list, .learning-levels, .course-summary')).toHaveCount(0);
});

test('folds the catalog by tier and only expands the tier the learner is on', async ({
  page,
  isMobile,
}) => {
  await page.goto('/learn/');

  const tiers = page.locator('[data-tier-disclosure]');

  // 默认只展开第一层，其余两层收起——90 张卡片不再一次性铺满。
  await expect(tiers.nth(0)).toHaveJSProperty('open', true);
  await expect(tiers.nth(1)).toHaveJSProperty('open', false);
  await expect(tiers.nth(2)).toHaveJSProperty('open', false);

  // 收起的层只剩一个层头的高度；展开的层要高得多。
  // 只量 <details> 自身——它内部处于 content-visibility 子树里，子元素尺寸不可靠。
  const measure = () =>
    tiers.evaluateAll((nodes) =>
      nodes.map((node) => Math.round(node.getBoundingClientRect().height)),
    );
  const collapsed = await measure();
  const headHeight = await page
    .locator('.tier-head')
    .first()
    .evaluate((node) => Math.round(node.getBoundingClientRect().height));

  expect(collapsed[0]).toBeGreaterThan(headHeight * 5);
  expect(collapsed[1]).toBeLessThan(headHeight * 1.5);
  expect(collapsed[2]).toBeLessThan(headHeight * 1.5);

  // 收起的层仍然报得出状态，不展开也能判断哪一层值得进。
  // 题量由 .tier-count 承担，状态位只报进度，不重复数字。
  await expect(page.locator('[data-tier-state-label]').nth(0)).toHaveText('未开始');
  await expect(page.locator('[data-tier-state-label]').nth(1)).toHaveText('未开始');
  await expect(page.locator('.tier-count').nth(0)).toContainText('30');

  // 点开第二层。
  await page.locator('.tier-head').nth(1).click();
  await expect(tiers.nth(1)).toHaveJSProperty('open', true);
  await expect.poll(async () => (await measure())[1] ?? 0).toBeGreaterThan(headHeight * 5);

  if (isMobile) {
    // 移动端侧栏隐藏，靠「跳到某一层」选择器进入收起层。
    await page.locator('[data-course-stage]').selectOption('tier-T3');
    await expect(tiers.nth(2)).toHaveJSProperty('open', true);
  } else {
    // 桌面侧栏只列「当前层」——最后被打开的那一层，任何时候都只有一层。
    // 三层共用同一组六个阶段名，一旦同时列出，就退化成 18 行里 6 个名字各三遍的菜单。
    await expect(page.locator('[data-tier-nav="t1-recognize"]')).toHaveAttribute(
      'data-open',
      'false',
    );
    await expect(page.locator('[data-tier-nav="t2-judge"]')).toHaveAttribute('data-open', 'true');
    await expect(page.locator('[data-tier-nav="t3-tradeoff"]')).toHaveAttribute(
      'data-open',
      'false',
    );
    await expect(page.locator('.catalog-sidebar .tier-nav ul a:visible')).toHaveCount(6);

    // 侧栏的层标题始终可见，点它要能把目标层变成当前层。
    await page.locator('[data-tier-jump="t3-tradeoff"]').click();
    await expect(tiers.nth(2)).toHaveJSProperty('open', true);
    await expect(page.locator('[data-tier-nav="t3-tradeoff"]')).toHaveAttribute(
      'data-open',
      'true',
    );
    await expect(page.locator('[data-tier-nav="t2-judge"]')).toHaveAttribute('data-open', 'false');
    await expect(page.locator('.catalog-sidebar .tier-nav ul a:visible')).toHaveCount(6);
  }
});

test('keeps the question and decision logic readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(`${PLAYWRIGHT_BASE_URL}/`);
  // 无 JS 时 data-hero-start 不会被改写成「继续学习」，但它指向的题目必须是可进的。
  await page.getByRole('link', { name: '直接做第 01 题' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: '发票金额校验，需要引入大模型吗？' }),
  ).toBeVisible();
  await expect(page.getByText('能被稳定规则完整描述的问题，优先使用确定性系统。')).toBeVisible();

  // 面包屑是服务端渲染的，无 JS 也必须完整可用（中间层可点、末项不带链接）。
  const breadcrumbs = page.getByRole('navigation', { name: '面包屑' });
  await expect(breadcrumbs).toBeVisible();
  await expect(breadcrumbs.getByRole('link', { name: '开始学习' })).toHaveAttribute(
    'href',
    '/learn/',
  );
  await expect(breadcrumbs.locator('[aria-current="page"]')).toHaveText('规则优先判断');

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

  const results = page.locator('[data-search-results] li');
  await expect(page.locator('[data-search-status]')).toHaveText('显示 5 / 5 个词条');
  await expect(results).toHaveCount(5);
  await expect(results.first()).toHaveAttribute('data-result-id', 'reranking');
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

test('publishes all five ordered learning routes', async ({ page }) => {
  const routes = [
    ['ai-foundations', 'AI 零基础入门', 6],
    ['human-ai-collaboration', '高效人机协作', 6],
    ['ai-product-scenario-judgment', 'AI 产品与场景判断', 8],
    ['rag-from-zero', 'RAG 从零到理解与应用', 12],
    ['ai-pm-career', '转岗 AI 产品经理', 23],
  ] as const;

  await page.goto('/routes/');
  await expect(page.locator('.route-entry')).toHaveCount(5);
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
  test.setTimeout(120_000);
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
    '/learn/questions/q61-accuracy-or-explain/',
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
  await primaryNavigation.getByRole('link', { name: '知识库' }).click();
  await expect(page).toHaveURL(/\/atlas\/$/);
});

test('unlocks each tier only after the previous tier is fully answered', async ({ page }) => {
  await page.goto('/');

  const tierState = (tierId: string) => page.locator(`[data-level="${tierId}"] [data-level-state]`);
  const tierItem = (tierId: string) => page.locator(`[data-level="${tierId}"]`);

  // 起点：只有第一层可进入，后两层明确说明解锁条件。
  await expect(tierItem('t1-recognize')).toHaveAttribute('data-unlocked', 'true');
  await expect(tierState('t1-recognize')).toContainText('起点 · 30 道题');
  await expect(tierItem('t2-judge')).toHaveAttribute('data-unlocked', 'false');
  await expect(tierItem('t3-tradeoff')).toHaveAttribute('data-unlocked', 'false');
  await expect(tierState('t2-judge')).toHaveText('完成上一层后开启');
  await expect(tierState('t3-tradeoff')).toHaveText('完成上一层后开启');
  await expect(page.locator('.level-list')).not.toHaveAttribute('data-unlocked', 'true');

  const orderRaw = await page.locator('[data-question-order]').getAttribute('data-question-order');
  const order: string[] = JSON.parse(orderRaw ?? '[]');
  expect(order).toHaveLength(90);

  const tierIds = async (tierId: string) =>
    JSON.parse((await tierItem(tierId).getAttribute('data-level-ids')) ?? '[]') as string[];
  const t1 = await tierIds('t1-recognize');
  const t2 = await tierIds('t2-judge');
  const t3 = await tierIds('t3-tradeoff');
  expect(t1).toHaveLength(30);
  expect(t2).toHaveLength(30);
  expect(t3).toHaveLength(30);

  // 答完 T1：T2 解锁，但 T3 仍然锁着——解锁是逐层推进，不是一次全开。
  await page.evaluate((answered) => {
    localStorage.setItem('ai-native.progress', JSON.stringify({ answered, lastVisited: null }));
  }, t1);
  await page.reload();

  await expect(tierState('t1-recognize')).toHaveText('已完成 · 30 / 30');
  await expect(tierItem('t2-judge')).toHaveAttribute('data-unlocked', 'true');
  await expect(tierState('t2-judge')).toHaveText('起点 · 30 道题');
  await expect(tierItem('t3-tradeoff')).toHaveAttribute('data-unlocked', 'false');
  await expect(page.locator('[data-hero-start]')).toHaveAttribute(
    'href',
    '/learn/questions/q31-long-doc-source/',
  );

  // 答完三层：路径全开，主 CTA 指向结业页。
  await page.evaluate((answered) => {
    localStorage.setItem('ai-native.progress', JSON.stringify({ answered, lastVisited: null }));
  }, order);
  await page.reload();

  await expect(page.locator('.level-list')).toHaveAttribute('data-unlocked', 'true');
  await expect(tierState('t1-recognize')).toHaveText('已完成 · 30 / 30');
  await expect(tierState('t2-judge')).toHaveText('已完成 · 30 / 30');
  await expect(tierState('t3-tradeoff')).toHaveText('已完成 · 30 / 30');
  await expect(page.locator('[data-hero-start]')).toHaveAttribute('href', '/learn/complete/');
});

test('records three-tier graduation and points to the case library', async ({ page }) => {
  await page.goto('/learn/complete/');

  await expect(page.locator('[data-complete-count]')).toHaveText('0');
  await expect(page.locator('.complete-page')).not.toHaveAttribute('data-complete-state', 'done');
  await expect(page.locator('[data-tier-ids]')).toHaveCount(3);
  await expect(page.locator('[data-cell-ids]')).toHaveCount(18);

  const orderRaw = await page.locator('[data-complete]').getAttribute('data-question-order');
  const order: string[] = JSON.parse(orderRaw ?? '[]');
  expect(order).toHaveLength(90);

  // 只答完 T1：进度可见，但还不算结业。
  await page.evaluate(
    (answered) => {
      localStorage.setItem('ai-native.progress', JSON.stringify({ answered, lastVisited: null }));
    },
    order.slice(0, 30),
  );
  await page.reload();

  await expect(page.locator('[data-complete-count]')).toHaveText('30');
  await expect(page.locator('.complete-page')).not.toHaveAttribute('data-complete-state', 'done');
  await expect(page.locator('[data-tier-done="true"]')).toHaveCount(1);
  await expect(page.locator('[data-cell-done="true"]')).toHaveCount(6);
  await expect(page.locator('[data-tier-progress]').first()).toHaveText('30 / 30');

  // 答满 90：结业状态、18 个阶段格、3 层全部标记完成。
  await page.evaluate((answered) => {
    localStorage.setItem('ai-native.progress', JSON.stringify({ answered, lastVisited: null }));
  }, order);
  await page.reload();

  await expect(page.locator('[data-complete-count]')).toHaveText('90');
  await expect(page.locator('.complete-page')).toHaveAttribute('data-complete-state', 'done');
  await expect(page.locator('[data-tier-done="true"]')).toHaveCount(3);
  await expect(page.locator('[data-cell-done="true"]')).toHaveCount(18);
  await expect(page.locator('[data-complete-next]')).toHaveAttribute('href', '/learn/cases/');
  await expect(page.locator('[data-complete-next]')).toContainText('进入连续案例');
});

test('renders the designed 404 state', async ({ page }) => {
  const response = await page.goto('/not-a-real-concept/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('路径还没有连接');
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  test.setTimeout(90_000);
  for (const url of [
    '/',
    '/learn/',
    '/learn/questions/',
    '/learn/questions/q61-accuracy-or-explain/',
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
