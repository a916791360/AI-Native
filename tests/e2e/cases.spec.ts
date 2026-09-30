import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const caseUrl = '/learn/cases/user-feedback-analysis/';
const firstGateUrl = `${caseUrl}decide-ai-boundary/`;
const caseLibraryUrl = '/learn/cases/';
const supportCaseUrl = '/learn/cases/customer-support-knowledge-base/';
const supportFirstGateUrl = `${supportCaseUrl}decide-ai-boundary/`;
const PLAYWRIGHT_BASE_URL = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4329'}`;

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
  }
  // 案例库是顶栏一级入口，不再依赖页内的平行内容分类条。
  await expect(
    page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '案例库' }),
  ).toHaveAttribute('href', caseLibraryUrl);

  await page.goto(caseLibraryUrl);
  await expect(page.getByRole('heading', { level: 1, name: 'AI 产品案例库' })).toBeVisible();
  const entries = page.locator('.case-catalog-card');
  await expect(entries).toHaveCount(6);
  await expect(entries.first()).toContainText('已核验');
  await expect(entries.filter({ hasText: '客服知识库与回答辅助' })).toContainText('已核验');
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
  await expect(caseSummary.getByText('已核验', { exact: true })).toBeVisible();
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

test('supports interactive PM decision making, condition checks and debrief panel', async ({
  page,
}) => {
  await page.goto(firstGateUrl);

  // 1. 验证条件核验 checkbox
  const firstCheckbox = page.locator('[data-case-options] input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeVisible();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();

  // 2. 验证采纳决策与复盘面板
  const debrief = page.locator('[data-decision-debrief]');
  await expect(debrief).toBeHidden();

  const adoptBtn = page.locator('[data-adopt-decision]').first();
  await adoptBtn.click();

  await expect(adoptBtn).toContainText('当前已采纳此方案');
  await expect(debrief).toBeVisible();
  await expect(debrief).toContainText('你的方案与团队基准对比');
  await expect(debrief).toContainText('重选决策路径');
});

test('displays competency radar in learning center and scenario matrix in case library', async ({
  page,
}) => {
  // 1. 学习中心首页能力雷达
  await page.goto('/learn/');
  const radar = page.locator('[data-competency-dashboard]');
  await expect(radar).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AI PM 实战能力雷达' })).toBeVisible();
  await expect(radar.locator('[data-radar-polygon]')).toBeVisible();
  await expect(radar.locator('[data-rec-link]')).toBeVisible();

  // 2. 案例库全景矩阵
  await page.goto(caseLibraryUrl);
  const matrix = page.locator('#case-matrix');
  await expect(matrix).toBeVisible();
  await expect(page.getByRole('heading', { name: '业务场景 × 阶段决策矩阵' })).toBeVisible();
  await expect(matrix.locator('.case-matrix-table')).toBeVisible();
  await expect(matrix.locator('[data-matrix-cell]').first()).toBeVisible();
});

test('assembles and exports AI product PRD modal from case overview and gate 06', async ({
  page,
}) => {
  // 1. 从案例主页打开 PRD 组装导出弹窗
  await page.goto(caseUrl);
  const openPrdBtn = page.locator('[data-open-prd-modal]').first();
  await expect(openPrdBtn).toBeVisible();
  await openPrdBtn.click();

  const dialog = page.locator('[data-prd-dialog]');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('heading', { name: /AI 产品立项 PRD/ })).toBeVisible();

  const codePreview = dialog.locator('[data-prd-code]');
  await expect(codePreview).toBeVisible();
  await expect(codePreview).toContainText('【AI 产品立项 PRD / 方案评审材料】');
  await expect(codePreview).toContainText('一、 项目背景与立项核心目标');
  await expect(codePreview).toContainText('二、 六阶段方案选型与决策推演');
  await expect(codePreview).toContainText('四、 核心评估指标与真实基线');
  await expect(codePreview).toContainText('五、 故障模式与应急恢复手册');

  // 关闭弹窗
  const closeBtn = dialog.locator('[data-close-prd]');
  await closeBtn.click();
  await expect(dialog).not.toBeVisible();

  // 2. 从 Gate 06 访问，检查六阶段推演成果闭环卡片
  const gate6Url = `${caseUrl}govern-launch-and-iteration/`;
  await page.goto(gate6Url);
  const capstoneExport = page.locator('.gate-capstone-export');
  await expect(capstoneExport).toBeVisible();
  await expect(capstoneExport).toContainText('已完成全部 6 关！组装你的《AI 产品立项 PRD》');
  await capstoneExport.locator('[data-open-prd-modal]').click();
  await expect(dialog).toBeVisible();
});

test('displays impact meter with 4-dimensional tradeoffs on case gate options', async ({
  page,
}) => {
  await page.goto(firstGateUrl);
  const impactMeter = page.locator('.impact-meter-panel').first();
  await expect(impactMeter).toBeVisible();
  await expect(impactMeter).toContainText('决策影响天平');
  await expect(impactMeter).toContainText('开发周期');
  await expect(impactMeter).toContainText('推理成本');
  await expect(impactMeter).toContainText('准确度');
  await expect(impactMeter).toContainText('人工兜底率');

  const warning = page.locator('.impact-warning-card').first();
  await expect(warning).toBeVisible();

  // 切换选项时天平保持并可更新
  const secondOption = page.locator('[data-option-item]').nth(1);
  if (await secondOption.count()) {
    await secondOption.click();
    await expect(warning).toBeVisible();
  }
});

test('presents devils advocate confrontation on question option feedback', async ({ page }) => {
  await page.goto('/learn/questions/q01-rules-or-ai/');

  // 点击第一个选项
  const firstOption = page.locator('[data-option]').first();
  await firstOption.click();

  const advocateCard = page.locator('[data-devils-advocate]').first();
  await expect(advocateCard).toBeVisible();
  await expect(advocateCard).toContainText('评审反诘');
  await expect(advocateCard.locator('.advocate-challenge')).toBeVisible();
  await expect(advocateCard.locator('.advocate-defense')).toBeVisible();
});

test('supports dedicated mistake hub workflow and syncs with learning center and complete page', async ({
  page,
}) => {
  // 注入包含错题的初始进度
  await page.addInitScript(() => {
    localStorage.setItem(
      'ai-native.progress',
      JSON.stringify({
        answered: ['q01-rules-or-ai'],
        missed: ['q01-rules-or-ai'],
        choices: { 'q01-rules-or-ai': 2 },
      }),
    );
  });

  // 1. 学习中心展示错题入口
  await page.goto('/learn/');
  const mistakesEntry = page.locator('[data-catalog-mistakes]');
  await expect(mistakesEntry).toBeVisible();
  await expect(mistakesEntry).toContainText('1');

  // 2. 结业页展示错题警告与快捷跳转
  await page.goto('/learn/complete/');
  const completeAlert = page.locator('[data-complete-mistakes]');
  await expect(completeAlert).toBeVisible();
  await expect(completeAlert).toContainText('1');

  // 3. 进入错题专区重练
  await page.goto('/learn/mistakes/');
  const arena = page.locator('[data-arena-view]');
  await expect(arena).toBeVisible();
  await expect(page.locator('[data-active-count]')).toHaveText('1');

  // 找到 recommended 选项点击并成功销项
  const recommendedBtn = page.locator('.option-item[data-assessment="recommended"] button');
  await recommendedBtn.click();

  const feedback = page.locator('[data-feedback-section]');
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText('已从错题本消灭');
  await expect(page.locator('[data-active-count]')).toHaveText('0');

  // 点击下一步，进入空状态
  const nextBtn = page.locator('[data-next-question]');
  await nextBtn.click();

  const emptyView = page.locator('[data-empty-view]');
  await expect(emptyView).toBeVisible();
  await expect(emptyView).toContainText('暂无待攻坚的错题');
});
