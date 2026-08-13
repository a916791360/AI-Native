import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const caseUrl = '/learn/cases/user-feedback-analysis/';
const firstGateUrl = `${caseUrl}decide-ai-boundary/`;
const caseLibraryUrl = '/learn/cases/';
const supportCaseUrl = '/learn/cases/customer-support-knowledge-base/';
const supportFirstGateUrl = `${supportCaseUrl}decide-ai-boundary/`;
const PLAYWRIGHT_BASE_URL = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4321'}`;

test('offers a first-class case library from the learning workspace', async ({
  page,
  isMobile,
}) => {
  await page.goto('/learn/');
  await expect(page.locator('.learning-card > a').first()).toHaveAttribute(
    'href',
    '/learn/questions/q01-rules-or-ai/',
  );
  if (isMobile) {
    await page.getByRole('button', { name: '菜单', exact: true }).click();
    await expect(
      page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '案例库' }),
    ).toHaveAttribute('href', caseLibraryUrl);
  } else {
    await expect(page.getByRole('link', { name: /案例实战 6/ })).toHaveAttribute(
      'href',
      caseLibraryUrl,
    );
  }

  await page.goto(caseLibraryUrl);
  await expect(page.getByRole('heading', { level: 1, name: 'AI 产品案例库' })).toBeVisible();
  const entries = page.locator('.case-catalog-card');
  await expect(entries).toHaveCount(6);
  await expect(entries.first()).toContainText('已核验');
  await expect(entries.first()).toContainText('客服知识库与回答辅助');
  await expect(page.getByRole('link', { name: '客服知识库与回答辅助' })).toHaveAttribute(
    'href',
    supportCaseUrl,
  );
});

test('presents one clear start and a six-gate project archive', async ({ page }) => {
  await page.goto(caseUrl);

  await expect(
    page.getByRole('heading', { level: 1, name: '每日用户反馈分析与产品改进' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '从 Gate 01 开始案例' })).toHaveAttribute(
    'href',
    firstGateUrl,
  );
  const caseSummary = page.getByRole('complementary');
  await expect(caseSummary.getByText('内容草稿', { exact: true })).toBeVisible();
  await expect(caseSummary).toContainText('阈值待真实基线');
  await expect(page.locator('.case-directory > ol > li')).toHaveCount(6);
  await expect(page.locator('.case-archive > ol > li')).toHaveCount(6);
  await expect(
    page.locator('#main-content textarea, #main-content input:not([type="hidden"])'),
  ).toHaveCount(0);
});

test('compares decisions and exposes the complete evidence contract', async ({ page }) => {
  await page.goto(firstGateUrl);

  await expect(page.getByRole('region', { name: '案例位置' })).toContainText('Gate 01 / 06');
  const options = page.locator('[data-case-options] details');
  await expect(options).toHaveCount(3);
  await expect(options.filter({ hasText: '规则优先的受限工作流' })).toHaveAttribute('open', '');

  const conditional = options.filter({ hasText: '全部使用固定规则' });
  await conditional.locator('summary').click();
  await expect(conditional).toHaveAttribute('open', '');
  await expect(conditional).toContainText('有条件成立');
  await expect(conditional).toContainText('成立条件');
  await expect(conditional).toContainText('主要风险');
  await expect(conditional).toContainText('后续影响');
  await expect(options.filter({ hasText: '规则优先的受限工作流' })).not.toHaveAttribute('open', '');

  await expect(page.getByRole('heading', { name: 'AI 适用性判断卡' })).toBeVisible();
  await expect(page.getByRole('region', { name: '失败与恢复' })).toBeVisible();
  await expect(page.getByRole('region', { name: '指标与真实基线' })).toBeVisible();
  await expect(page.getByRole('region', { name: '按需知识支持' })).toBeVisible();
  await expect(page.getByRole('link', { name: /AI 能力边界/ })).toHaveAttribute(
    'href',
    '/terms/ai-capability-boundary/',
  );
});

test('renders the support case through the shared production contract', async ({ page }) => {
  await page.goto(supportCaseUrl);

  await expect(page.getByRole('heading', { level: 1, name: '客服知识库与回答辅助' })).toBeVisible();
  await expect(page.getByRole('complementary').getByText('已核验', { exact: true })).toBeVisible();
  await expect(page.locator('.case-directory > ol > li')).toHaveCount(6);

  await page.goto(supportFirstGateUrl);
  await expect(page.locator('[data-case-options] details')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Retrieval-Augmented Generation/ })).toHaveAttribute(
    'href',
    'https://papers.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html',
  );
});

test('keeps the recommended path, material and sources readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  for (const [url, optionLabel] of [
    [firstGateUrl, '规则优先的受限工作流'],
    [supportFirstGateUrl, '治理优先的检索辅助'],
  ] as const) {
    await page.goto(`${PLAYWRIGHT_BASE_URL}${url}`);
    const recommended = page
      .locator('[data-case-options] details')
      .filter({ hasText: optionLabel });
    await expect(recommended).toHaveAttribute('open', '');
    await expect(recommended).toContainText('推荐路径');
    await expect(page.getByRole('region', { name: '按需知识支持' })).toBeVisible();
  }

  await context.close();
});

test('passes accessibility checks on the case overview and evidence desk', async ({ page }) => {
  for (const url of [caseLibraryUrl, caseUrl, firstGateUrl, supportCaseUrl, supportFirstGateUrl]) {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(({ impact }) =>
      ['serious', 'critical'].includes(impact ?? ''),
    );
    expect(blocking, `${url} has blocking accessibility violations`).toEqual([]);
  }
});
