import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

const root = process.cwd();
const sourceDir = path.join(root, 'docs/product/learning-redesign');
const outputDir = path.join(sourceDir, 'screenshots');
const directions = [
  ['01-curriculum-spine', '01-curriculum-spine.html'],
  ['02-capability-compass', '02-capability-compass.html'],
  ['03-case-studio', '03-case-studio.html'],
] as const;
const viewports = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
] as const;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors: string[] = [];

try {
  for (const [direction, fileName] of directions) {
    for (const [viewportName, width, height] of viewports) {
      const captureName = `${direction}-${viewportName}`;
      const page = await browser.newPage({
        viewport: { width, height },
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      });

      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(`${captureName}: ${message.text()}`);
      });
      page.on('pageerror', (error) => errors.push(`${captureName}: ${error.message}`));

      await page.goto(pathToFileURL(path.join(sourceDir, fileName)).href, {
        waitUntil: 'load',
      });
      await page.evaluate(() => document.fonts.ready);

      const overflow = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      }));
      if (overflow.document > overflow.viewport) {
        errors.push(
          `${captureName}: horizontal overflow ${overflow.document}px > ${overflow.viewport}px`,
        );
      }

      if (direction === '02-capability-compass') {
        await page.locator('[data-goal="opportunity"]').click();
        const title = await page.locator('#route-title').textContent();
        if (!title?.includes('真实场景')) {
          errors.push(`${captureName}: goal selection did not update the recommended route`);
        }
        await page.locator('[data-goal="transition"]').click();
      }

      if (direction === '03-case-studio') {
        await page.locator('[data-case="sales"]').click();
        const title = await page.locator('#case-title').textContent();
        if (!title?.includes('销售跟进助手')) {
          errors.push(`${captureName}: case selection did not update the studio content`);
        }
        await page.locator('[data-case="support"]').click();
      }

      await page.screenshot({ path: path.join(outputDir, `${captureName}.png`) });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length > 0) {
  throw new Error(`Learning redesign verification failed:\n${errors.join('\n')}`);
}

console.log(`Captured and verified 6 learning-redesign screenshots in ${outputDir}.`);
