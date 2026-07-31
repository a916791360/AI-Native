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
    '/learn/questions/q21-support-rag/',
    '/atlas/',
    '/search/?q=RAG',
    '/routes/',
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

test('completes search, filtering and graph selection with a keyboard', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'keyboard equivalence is viewport-independent and runs once');

  await page.goto('/');
  const skipLink = page.getByRole('link', { name: '跳到主要内容' });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  const homeSearch = page.getByRole('searchbox', { name: '搜索词条' });
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
  await expect(page.locator('[data-atlas-visible]')).not.toHaveText('300');

  await page.goto('/graph/');
  const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
  await expect(graph).toHaveAttribute('data-graph-state', 'ready', { timeout: 15_000 });
  const focusSelect = page.getByLabel('焦点词条');
  await tabTo(page, focusSelect);
  await expect(focusSelect).toBeFocused();
  await focusSelect.selectOption('retrieval-augmented-generation');
  await expect(graph).toHaveAttribute('data-graph-selected', await focusSelect.inputValue());
});
