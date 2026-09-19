import { expect, type Locator, type Page, test } from '@playwright/test';

async function tabTo(page: Page, target: Locator, maximumTabs = 30) {
  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(
    `Keyboard focus did not reach ${await target.evaluate((element) => element.outerHTML)}`,
  );
}

test('fits every primary page in all approved release viewports', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the viewport matrix runs once with explicit release-candidate dimensions');
  test.setTimeout(150_000);
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ];
  const paths = [
    '/',
    '/learn/',
    '/learn/questions/',
    '/learn/cases/',
    '/learn/questions/q61-accuracy-or-explain/',
    '/learn/cases/customer-support-knowledge-base/',
    '/learn/cases/customer-support-knowledge-base/decide-ai-boundary/',
    '/atlas/',
    '/search/?q=RAG',
    '/map/',
    '/routes/',
    '/routes/rag-from-zero/',
    '/graph/',
    '/methodology/',
    '/terms/retrieval-augmented-generation/',
    '/not-a-real-concept/',
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const pagePath of paths) {
      await page.goto(pagePath);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${pagePath} at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(dimensions.clientWidth);
      await expect(page.locator('#main-content')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  }
});

test('keeps every page family within the compact visual hierarchy', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the explicit viewport matrix covers desktop and mobile once');
  const paths = [
    '/',
    '/learn/',
    '/learn/questions/q61-accuracy-or-explain/',
    '/learn/cases/',
    '/learn/cases/customer-support-knowledge-base/',
    '/learn/cases/customer-support-knowledge-base/decide-ai-boundary/',
    '/atlas/',
    '/map/',
    '/terms/retrieval-augmented-generation/',
    '/routes/',
    '/routes/rag-from-zero/',
    '/graph/',
    '/search/?q=RAG',
    '/methodology/',
    '/not-a-real-concept/',
  ];

  for (const viewport of [
    { width: 1440, height: 900, maximumHeadingSize: 48 },
    { width: 390, height: 844, maximumHeadingSize: 40 },
  ]) {
    await page.setViewportSize(viewport);
    for (const pagePath of paths) {
      await page.goto(pagePath);
      const headingSize = await page
        .getByRole('heading', { level: 1 })
        .evaluate((heading) => Number.parseFloat(getComputedStyle(heading).fontSize));
      expect(headingSize, `${pagePath} at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.maximumHeadingSize,
      );
    }
  }
});

test('stacks exactly one navigation layer above the page body', async ({ page }) => {
  // 曾经每个内页顶部都叠着两组平行入口：顶栏（开始学习 / 案例库 / 知识库）和一条用另一套
  // 名词的全站「内容分类条」（系统课程 / 案例实战 / 知识词条 / 阅读路线 / 概念关系）。
  // 现在页面正文之上只允许一层导航，支撑层只出现在页脚。
  for (const pagePath of [
    '/learn/',
    '/learn/questions/q61-accuracy-or-explain/',
    '/learn/cases/customer-support-knowledge-base/',
    '/atlas/',
    '/map/',
    '/terms/retrieval-augmented-generation/',
    '/routes/rag-from-zero/',
    '/graph/',
    '/methodology/',
  ]) {
    await page.goto(pagePath);

    const shellNavigation = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return null;
      return [...document.querySelectorAll('nav')]
        .filter((element) => !main.contains(element))
        .filter(
          (element) => element.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
        )
        .map((element) => element.getAttribute('aria-label'));
    });

    expect(shellNavigation, `${pagePath} 正文之上的导航层`).toEqual(['主导航']);
    await expect(page.locator('nav[aria-label="内容类型"]')).toHaveCount(0);
  }

  // 支撑层下沉到页脚，仍然可达。
  await page.goto('/atlas/');
  const footerNavigation = page.getByRole('navigation', { name: '页脚导航' });
  await expect(footerNavigation.getByRole('link', { name: '阅读路线' })).toHaveAttribute(
    'href',
    '/routes/',
  );
  await expect(footerNavigation.getByRole('link', { name: '概念图谱' })).toHaveAttribute(
    'href',
    '/graph/',
  );
});

test('keeps global controls and route cards compact', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the explicit viewport matrix covers desktop and mobile once');

  for (const viewport of [
    { width: 1440, height: 900, maximumHeaderSearchWidth: 300, maximumSearchHeight: 44 },
    { width: 390, height: 844, maximumHeaderSearchWidth: 360, maximumSearchHeight: 48 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/routes/');

    const navigation = page.getByRole('navigation', { name: '主导航' });
    if (viewport.width <= 760) {
      await page.getByRole('button', { name: '菜单', exact: true }).click();
    }
    await expect(navigation.getByRole('link')).toHaveCount(4);
    await expect(page.getByRole('navigation', { name: '知识工具' })).toHaveCount(0);

    if (viewport.width <= 760) {
      await page.getByRole('button', { name: '搜索', exact: true }).click();
    }
    const searchBox = page.getByRole('searchbox', { name: '搜索案例、问题或术语' });
    const searchBounds = await searchBox.boundingBox();
    expect(searchBounds).not.toBeNull();
    expect(searchBounds!.width).toBeLessThanOrEqual(viewport.maximumHeaderSearchWidth);
    expect(searchBounds!.height).toBeLessThanOrEqual(viewport.maximumSearchHeight);

    const routeIndex = page.locator('.route-index').first();
    const routeIndexBounds = await routeIndex.boundingBox();
    const routeNumberSize = await routeIndex
      .locator('strong')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(routeIndexBounds).not.toBeNull();
    expect(routeIndexBounds!.height).toBeLessThanOrEqual(52);
    expect(routeNumberSize).toBeLessThanOrEqual(14);
  }
});

test('completes search, filtering and graph selection with a keyboard', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'keyboard equivalence is viewport-independent and runs once');

  await page.goto('/');
  const skipLink = page.getByRole('link', { name: '跳到主要内容' });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  const homeSearch = page.getByRole('searchbox', { name: '搜索案例、问题或术语' });
  await tabTo(page, homeSearch);
  await page.keyboard.type('RAG');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/search\/\?q=RAG$/);
  await expect(page.locator('[data-search-output]')).toHaveAttribute('aria-busy', 'false');
  const firstResult = page.locator('[data-search-results] a').first();
  await tabTo(page, firstResult);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/terms\/retrieval-augmented-generation\/$/);

  await page.goto('/atlas/');
  const ringFilter = page.getByLabel('领域范围');
  await tabTo(page, ringFilter);
  await expect(ringFilter).toBeFocused();
  await ringFilter.selectOption('core');
  await expect(page.locator('[data-atlas-visible]')).not.toHaveText('325');

  await page.goto('/graph/');
  const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
  await expect(graph).toHaveAttribute('data-graph-state', 'ready', { timeout: 15_000 });
  const focusSelect = page.getByLabel('焦点词条');
  await tabTo(page, focusSelect);
  await expect(focusSelect).toBeFocused();
  await focusSelect.selectOption('retrieval-augmented-generation');
  await expect(graph).toHaveAttribute('data-graph-selected', await focusSelect.inputValue());
});
