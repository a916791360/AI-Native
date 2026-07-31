import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  collectPerformanceMetrics,
  evaluatePerformanceBudget,
  formatPerformanceMetrics,
  type PerformanceBaseline,
} from './lib/performance-budget';

const root = process.cwd();
const current = await collectPerformanceMetrics(root);

if (process.argv.includes('--measure-only')) {
  console.log(JSON.stringify(current, null, 2));
  process.exit(0);
}

const baseline = JSON.parse(
  await readFile(path.join(root, 'src/data/performance-baseline.json'), 'utf8'),
) as PerformanceBaseline;
const issues = evaluatePerformanceBudget(current, baseline);

if (issues.length > 0) {
  throw new Error(`Performance budget exceeded:\n- ${issues.join('\n- ')}`);
}

console.log(`Performance budget valid: ${formatPerformanceMetrics(current)}.`);
