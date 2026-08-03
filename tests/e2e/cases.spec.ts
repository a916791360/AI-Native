import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const caseUrl = '/learn/cases/user-feedback-analysis/';
const firstGateUrl = `${caseUrl}decide-ai-boundary/`;

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
  await expect(page.locator('textarea, input:not([type="hidden"])')).toHaveCount(0);
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

test('keeps the recommended path, material and sources readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4321${firstGateUrl}`);

  const recommended = page
    .locator('[data-case-options] details')
    .filter({ hasText: '规则优先的受限工作流' });
  await expect(recommended).toHaveAttribute('open', '');
  await expect(recommended).toContainText('推荐路径');
  await expect(
    page.getByText('在 AI 适用性判断卡中标出规则、模型和人工的初步边界。'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /AI 能力边界/ })).toBeVisible();

  await context.close();
});

test('passes accessibility checks on the case overview and evidence desk', async ({ page }) => {
  for (const url of [caseUrl, firstGateUrl]) {
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
