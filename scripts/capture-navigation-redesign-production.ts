import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from '@playwright/test';

const root = process.cwd();
const baseUrl = process.env.NAVIGATION_PREVIEW_URL ?? 'http://127.0.0.1:4322';
const outputDir = path.join(
  root,
  'docs/product/learning-v2/navigation-redesign/production-screenshots',
);
const pages = [
  ['home', '/'],
  ['course', '/learn/'],
  ['case-library', '/learn/cases/'],
  ['case-overview', '/learn/cases/customer-support-knowledge-base/'],
] as const;
const viewports = [
  ['desktop', 1440, 900],
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
        colorScheme: 'light',
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

      for (const label of ['开始学习', '案例库', '知识库']) {
        if (
          (await page.getByRole('navigation', { name: '主导航' }).getByText(label).count()) !== 1
        ) {
          errors.push(`${captureName}: missing direct ${label} navigation`);
        }
      }

      if (viewportName !== 'narrow') {
        await page.screenshot({ path: path.join(outputDir, `${captureName}.png`) });
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length > 0) {
  throw new Error(`Navigation production capture failed:\n${errors.join('\n')}`);
}

console.log(`Captured 8 screenshots and verified 12 production viewport variants.`);
