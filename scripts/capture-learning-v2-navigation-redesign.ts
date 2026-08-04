import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

const root = process.cwd();
const sourceDir = path.join(root, 'docs/product/learning-v2/navigation-redesign/design-demos');
const outputDir = path.join(root, 'docs/product/learning-v2/navigation-redesign/screenshots');
const directions = [
  ['01-task-quest', '01-task-quest.html'],
  ['02-clear-content-hub', '02-clear-content-hub.html'],
  ['03-learning-signpost', '03-learning-signpost.html'],
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
  for (const [direction, fileName] of directions) {
    for (const [viewportName, width, height] of viewports) {
      const captureName = `${direction}-${viewportName}`;
      const page = await browser.newPage({
        viewport: { width, height },
        colorScheme: 'light',
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

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      if (dimensions.scrollWidth > dimensions.clientWidth) {
        errors.push(
          `${captureName}: horizontal overflow ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`,
        );
      }

      const directCaseEntryCount = await page.getByRole('link', { name: '案例库' }).count();
      if (directCaseEntryCount === 0) {
        errors.push(`${captureName}: no direct 案例库 entry`);
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
  throw new Error(`Navigation redesign verification failed:\n${errors.join('\n')}`);
}

console.log(`Captured 6 screenshots and verified 9 viewport variants in ${outputDir}.`);
