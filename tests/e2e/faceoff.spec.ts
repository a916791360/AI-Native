import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Phase 3 (M3) UX Features', () => {
  test('renders concept faceoff arena with pair switching and interactive quiz', async ({
    page,
  }) => {
    await page.goto('/atlas/faceoff/');

    // 1. Heading and intro
    await expect(
      page.getByRole('heading', { level: 1, name: '易混概念同屏 PK 对决台' }),
    ).toBeVisible();

    // 2. Tab selector with 10 pairs
    const tabs = page.locator('.switcher-item');
    await expect(tabs).toHaveCount(10);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');

    // 3. Default pair (RAG vs FT) display
    const firstArticle = page.locator('.faceoff-card').first();
    await expect(firstArticle).toBeVisible();
    await expect(firstArticle).toContainText('RAG (检索增强生成)');
    await expect(firstArticle).toContainText('Fine-Tuning (模型微调)');

    // 4. Metrics comparison bars
    const metricBars = firstArticle.locator('.metric-row');
    expect(await metricBars.count()).toBe(5);

    // 5. Interactive scenario quiz
    const quizSection = firstArticle.locator('.quiz-panel');
    await expect(quizSection).toBeVisible();
    const quizOption = quizSection.locator('.quiz-btn').first();
    await quizOption.click();

    const quizFeedback = quizSection.locator('[data-quiz-feedback]').first();
    await expect(quizFeedback).toBeVisible();

    // 6. Switch to second pair (Function Calling vs MCP)
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await expect(page).toHaveURL(/#function-calling-vs-mcp/);
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');

    const secondArticle = page.locator('#pair-function-calling-vs-mcp');
    await expect(secondArticle).toBeVisible();
    await expect(secondArticle).toContainText('MCP (模型上下文协议)');

    // 7. Accessibility audit
    const axeResults = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test('embeds interactive architecture flow card on core term pages', async ({ page }) => {
    await page.goto('/terms/retrieval-augmented-generation/');

    // 1. Term heading
    await expect(page.getByRole('heading', { level: 1, name: '检索增强生成' })).toBeVisible();

    // 2. Interactive architecture flow card
    const flowCard = page.locator('.concept-architecture-flow');
    await expect(flowCard).toBeVisible();
    await expect(flowCard.locator('h3#architecture-flow-heading')).toContainText('数据流向图');

    // 3. Node rail buttons
    const nodeButtons = flowCard.locator('.flow-node-btn');
    expect(await nodeButtons.count()).toBeGreaterThanOrEqual(4);

    // Click 2nd node
    await nodeButtons.nth(1).click();
    await expect(nodeButtons.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(flowCard.locator('.step-detail-card').nth(1)).toBeVisible();

    // 4. Bidirectional Faceoff link card
    const faceoffCard = page.locator('.term-faceoff-card');
    await expect(faceoffCard).toBeVisible();
    await expect(faceoffCard.locator('a')).toHaveAttribute(
      'href',
      '/atlas/faceoff/#rag-vs-fine-tuning',
    );
  });

  test('filters questions by practical pain-points on learning catalog', async ({ page }) => {
    await page.goto('/learn/');

    // 1. Pain points explorer section
    const painpointsSection = page.locator('.catalog-painpoints');
    await expect(painpointsSection).toBeVisible();

    // 2. 6 pain point chips
    const chips = painpointsSection.locator('.painpoint-chip');
    await expect(chips).toHaveCount(6);

    // 3. Click first chip (幻觉与事实不准)
    const firstChip = chips.first();
    await firstChip.click();
    await expect(firstChip).toHaveClass(/active/);

    // Status label is now visible
    const statusLabel = painpointsSection.locator('[data-painpoint-status]');
    await expect(statusLabel).toBeVisible();
    await expect(statusLabel.locator('[data-active-painpoint-name]')).toHaveText('幻觉与事实不准');

    // Matching questions are highlighted
    const matchedCards = page.locator('.learning-card[data-painpoint-match="true"]');
    expect(await matchedCards.count()).toBeGreaterThan(0);

    // Non-matching cards are dimmed
    const dimmedCards = page.locator('.learning-card[data-painpoint-dim="true"]');
    expect(await dimmedCards.count()).toBeGreaterThan(0);

    // 4. Reset filter
    const resetBtn = painpointsSection.locator('[data-reset-painpoint]');
    await resetBtn.click();
    await expect(statusLabel).toBeHidden();
    await expect(firstChip).not.toHaveClass(/active/);
    await expect(page.locator('.learning-card[data-painpoint-match="true"]')).toHaveCount(0);
    await expect(page.locator('.learning-card[data-painpoint-dim="true"]')).toHaveCount(0);
  });
});
