import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export interface PerformanceMetrics {
  homeInitialJavaScriptBytes: number;
  homeCssBytes: number;
  pagefindBytes: number;
  graphJavaScriptBytes: number;
  largestImageBytes: number;
}

export interface PerformanceBaseline {
  version: 1;
  capturedAt: string;
  regressionThreshold: number;
  absoluteLimits: {
    largestImageBytes: number;
  };
  metrics: PerformanceMetrics;
}

const METRIC_LABELS: Record<keyof PerformanceMetrics, string> = {
  homeInitialJavaScriptBytes: '首页首屏 JavaScript',
  homeCssBytes: '首页 CSS',
  pagefindBytes: 'Pagefind 索引',
  graphJavaScriptBytes: '图谱 JavaScript',
  largestImageBytes: '最大图片',
};

function byteLength(value: string): number {
  return Buffer.byteLength(value, 'utf8');
}

function attributes(tag: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)) {
    result.set(match[1]!.toLowerCase(), match[3]!);
  }
  return result;
}

function localAssetPath(distRoot: string, reference: string, fromFile = distRoot): string | null {
  if (/^(?:data:|https?:|\/\/)/.test(reference)) return null;
  const withoutQuery = reference.split(/[?#]/, 1)[0]!;
  const resolved = withoutQuery.startsWith('/')
    ? path.join(distRoot, withoutQuery.slice(1))
    : path.resolve(path.dirname(fromFile), withoutQuery);
  const relative = path.relative(distRoot, resolved);
  return relative.startsWith('..') || path.isAbsolute(relative) ? null : resolved;
}

async function filesRecursively(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesRecursively(entryPath) : Promise.resolve([entryPath]);
    }),
  );
  return nested.flat();
}

async function sumFileBytes(files: Iterable<string>): Promise<number> {
  const uniqueFiles = [...new Set(files)];
  const sizes = await Promise.all(uniqueFiles.map(async (file) => (await stat(file)).size));
  return sizes.reduce((total, size) => total + size, 0);
}

export function moduleReferences(source: string): string[] {
  const references = [
    ...source.matchAll(/(?:from\s*|import\s*\()(["'`])(.*?)\1/g),
    ...source.matchAll(/import\s*(["'`])(.*?)\1/g),
  ];
  return [...new Set(references.map((match) => match[2]!))];
}

function linkedAssets(html: string, distRoot: string, htmlPath: string) {
  const stylesheets = new Set<string>();
  const scripts = new Set<string>();
  let inlineCssBytes = 0;
  let inlineJavaScriptBytes = 0;

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.get('rel') !== 'stylesheet' || !attrs.has('href')) continue;
    const asset = localAssetPath(distRoot, attrs.get('href')!, htmlPath);
    if (asset) stylesheets.add(asset);
  }

  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    inlineCssBytes += byteLength(match[1]!);
  }

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = attributes(match[1]!);
    const type = attrs.get('type')?.toLowerCase();
    if (type === 'application/ld+json' || type === 'application/json') continue;
    const source = attrs.get('src');
    if (source) {
      const asset = localAssetPath(distRoot, source, htmlPath);
      if (asset) scripts.add(asset);
    } else {
      inlineJavaScriptBytes += byteLength(match[2]!);
    }
  }

  return { stylesheets, scripts, inlineCssBytes, inlineJavaScriptBytes };
}

async function moduleGraphBytes(distRoot: string, entryFiles: Iterable<string>): Promise<number> {
  const pending = [...entryFiles];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const source = await readFile(current, 'utf8');
    for (const reference of moduleReferences(source)) {
      const dependency = localAssetPath(distRoot, reference, current);
      if (dependency?.endsWith('.js') && !visited.has(dependency)) pending.push(dependency);
    }
  }

  return sumFileBytes(visited);
}

export async function collectPerformanceMetrics(root = process.cwd()): Promise<PerformanceMetrics> {
  const distRoot = path.join(root, 'dist');
  const homePath = path.join(distRoot, 'index.html');
  const graphPath = path.join(distRoot, 'graph/index.html');
  const [homeHtml, graphHtml, pagefindFiles, distFiles] = await Promise.all([
    readFile(homePath, 'utf8'),
    readFile(graphPath, 'utf8'),
    filesRecursively(path.join(distRoot, 'pagefind')),
    filesRecursively(distRoot),
  ]);
  const homeAssets = linkedAssets(homeHtml, distRoot, homePath);
  const graphAssets = linkedAssets(graphHtml, distRoot, graphPath);
  const imageFiles = distFiles.filter((file) => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file));
  const imageSizes = await Promise.all(imageFiles.map(async (file) => (await stat(file)).size));

  return {
    homeInitialJavaScriptBytes:
      (await sumFileBytes(homeAssets.scripts)) + homeAssets.inlineJavaScriptBytes,
    homeCssBytes: (await sumFileBytes(homeAssets.stylesheets)) + homeAssets.inlineCssBytes,
    pagefindBytes: await sumFileBytes(pagefindFiles),
    graphJavaScriptBytes:
      (await moduleGraphBytes(distRoot, graphAssets.scripts)) + graphAssets.inlineJavaScriptBytes,
    largestImageBytes: Math.max(0, ...imageSizes),
  };
}

export function evaluatePerformanceBudget(
  current: PerformanceMetrics,
  baseline: PerformanceBaseline,
): string[] {
  const issues: string[] = [];

  for (const key of Object.keys(current) as (keyof PerformanceMetrics)[]) {
    const baselineBytes = baseline.metrics[key];
    const currentBytes = current[key];
    const limit = Math.floor(baselineBytes * (1 + baseline.regressionThreshold));
    if ((baselineBytes === 0 && currentBytes > 0) || currentBytes > limit) {
      issues.push(
        `${METRIC_LABELS[key]} is ${currentBytes} bytes; baseline ${baselineBytes} bytes allows ${limit} bytes.`,
      );
    }
  }

  if (current.largestImageBytes > baseline.absoluteLimits.largestImageBytes) {
    issues.push(
      `最大图片 is ${current.largestImageBytes} bytes; absolute limit is ${baseline.absoluteLimits.largestImageBytes} bytes.`,
    );
  }

  return issues;
}

export function formatPerformanceMetrics(metrics: PerformanceMetrics): string {
  return (Object.keys(metrics) as (keyof PerformanceMetrics)[])
    .map((key) => `${METRIC_LABELS[key]} ${(metrics[key] / 1024).toFixed(1)} KiB`)
    .join('; ');
}
