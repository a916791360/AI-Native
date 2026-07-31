import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from '@playwright/test';

const root = process.cwd();
const baseUrl = process.env.LEARNING_PREVIEW_URL ?? 'http://127.0.0.1:4323';
const outputDir = path.join(root, 'docs/product/learning-redesign/production-screenshots');
const pages = [
  ['home', '/', false],
  ['curriculum', '/learn/', false],
  ['question-bank', '/learn/questions/', false],
  ['question-support-rag', '/learn/questions/q21-support-rag/', false],
  ['question-support-rag-feedback', '/learn/questions/q21-support-rag/', true],
] as const;
const viewports = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
] as const;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors: string[] = [];

try {
  for (const [pageName, pagePath, showFeedback] of pages) {
    for (const [viewportName, width, height] of viewports) {
      const captureName = `${pageName}-${viewportName}`;
      const page = await browser.newPage({
        viewport: { width, height },
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      });

      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(`${captureName}: ${message.text()}`);
      });
      page.on('pageerror', (error) => errors.push(`${captureName}: ${error.message}`));

      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (showFeedback) {
        await page.locator('[data-option]').first().click();
        await page.locator('[data-feedback-panel]').scrollIntoViewIfNeeded();
      }

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      if (dimensions.scrollWidth > dimensions.clientWidth) {
        errors.push(
          `${captureName}: horizontal overflow ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`,
        );
      }

      await page.screenshot({ path: path.join(outputDir, `${captureName}.png`) });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length > 0) {
  throw new Error(`Learning production capture failed:\n${errors.join('\n')}`);
}

console.log(
  `Captured and verified ${pages.length * viewports.length} production screenshots in ${outputDir}.`,
);
