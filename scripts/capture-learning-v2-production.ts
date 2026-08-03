import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from '@playwright/test';

const root = process.cwd();
const baseUrl = process.env.LEARNING_V2_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const outputDir = path.join(root, 'docs/product/learning-v2/production-screenshots');
const pages = [
  ['case-overview', '/learn/cases/user-feedback-analysis/'],
  ['gate-01-evidence-desk', '/learn/cases/user-feedback-analysis/decide-ai-boundary/'],
] as const;
const viewports = [
  ['desktop', 1440, 900],
  ['tablet', 1024, 768],
  ['mobile', 390, 844],
  ['narrow', 320, 800],
] as const;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors: string[] = [];

try {
  for (const [pageName, pagePath] of pages) {
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

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      if (dimensions.scrollWidth > dimensions.clientWidth) {
        errors.push(
          `${captureName}: horizontal overflow ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`,
        );
      }

      if (pageName === 'gate-01-evidence-desk') {
        const options = page.locator('[data-case-options] details');
        await options.nth(1).locator('summary').click();
        if (
          !(await options
            .nth(1)
            .evaluate((option) => option instanceof HTMLDetailsElement && option.open))
        ) {
          errors.push(`${captureName}: conditional decision did not open`);
        }
        await options.first().locator('summary').click();
        await page
          .locator('[data-case-options]')
          .evaluate((section) => section.scrollIntoView({ block: 'start' }));
      }

      await page.screenshot({ path: path.join(outputDir, `${captureName}.png`) });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length > 0) {
  throw new Error(`Learning V2 production capture failed:\n${errors.join('\n')}`);
}

console.log(
  `Captured and verified ${pages.length * viewports.length} Learning V2 screenshots in ${outputDir}.`,
);
