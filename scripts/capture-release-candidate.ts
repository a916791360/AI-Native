import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from '@playwright/test';

const root = process.cwd();
const baseUrl = process.env.RELEASE_CANDIDATE_URL ?? 'http://127.0.0.1:4321';
const outputDir = path.join(root, 'docs/product/release-candidate/stage-10-screenshots');
const captures = [
  ['home-1440x900', '/', 1440, 900],
  ['home-1280x800', '/', 1280, 800],
  ['home-1024x768', '/', 1024, 768],
  ['home-390x844', '/', 390, 844],
  ['home-360x800', '/', 360, 800],
  ['atlas-1440x900', '/atlas/', 1440, 900],
  ['atlas-390x844', '/atlas/', 390, 844],
  ['routes-1280x800', '/routes/', 1280, 800],
  ['routes-390x844', '/routes/', 390, 844],
  ['route-detail-1280x800', '/routes/rag-from-zero/', 1280, 800],
  ['route-detail-390x844', '/routes/rag-from-zero/', 390, 844],
  ['term-1024x768', '/terms/retrieval-augmented-generation/', 1024, 768],
  ['term-360x800', '/terms/retrieval-augmented-generation/', 360, 800],
  ['graph-1440x900', '/graph/', 1440, 900],
  ['graph-390x844', '/graph/', 390, 844],
  ['search-1280x800', '/search/?q=RAG', 1280, 800],
  ['search-360x800', '/search/?q=RAG', 360, 800],
  ['methodology-1024x768', '/methodology/', 1024, 768],
  ['methodology-360x800', '/methodology/', 360, 800],
  ['404-390x844', '/not-a-real-concept/', 390, 844],
] as const;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors: string[] = [];

try {
  for (const [name, pagePath, width, height] of captures) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const text = message.text();
      const isExpectedNotFound =
        pagePath === '/not-a-real-concept/' &&
        text.includes('Failed to load resource') &&
        text.includes('404');
      if (!isExpectedNotFound) errors.push(`${name}: ${text}`);
    });
    page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`));
    await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle' });
    if (pagePath === '/graph/') {
      const graph = page.locator('[data-graph-explorer][data-graph-mode="full"]');
      await graph.scrollIntoViewIfNeeded();
      if (width <= 820) await graph.locator('[data-graph-load]').click();
      await graph.waitFor({ state: 'visible' });
      await graph.evaluate((element) =>
        element.getAttribute('data-graph-state') === 'ready'
          ? undefined
          : new Promise<void>((resolve) => {
              const observer = new MutationObserver(() => {
                if (element.getAttribute('data-graph-state') === 'ready') {
                  observer.disconnect();
                  resolve();
                }
              });
              observer.observe(element, {
                attributes: true,
                attributeFilter: ['data-graph-state'],
              });
            }),
      );
    }
    await page.screenshot({ path: path.join(outputDir, `${name}.png`) });
    await page.close();
  }
} finally {
  await browser.close();
}

if (errors.length > 0)
  throw new Error(`Release screenshots reported errors:\n${errors.join('\n')}`);
console.log(`Captured ${captures.length} release-candidate screenshots in ${outputDir}.`);
