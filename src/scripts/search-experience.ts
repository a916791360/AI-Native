import registry from '@/generated/term-registry.json';
import {
  searchMetadata,
  type MetadataSearchResult,
  type SearchFilters,
  type TermSearchRecord,
} from '@/lib/search/metadata';

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: Record<string, string>;
}

interface PagefindRawResult {
  data: () => Promise<PagefindResultData>;
}

interface PagefindResponse {
  results: PagefindRawResult[];
}

interface PagefindApi {
  init: () => Promise<void>;
  options: (options: Record<string, unknown>) => Promise<void>;
  search: (query: string | null, options?: Record<string, unknown>) => Promise<PagefindResponse>;
  debouncedSearch: (
    query: string,
    options?: Record<string, unknown>,
    debounceTimeout?: number,
  ) => Promise<PagefindResponse | null>;
}

interface DisplayResult {
  record: TermSearchRecord;
  score: number;
  source: '词条索引' | '正文索引';
  excerpt?: string;
}

const records = registry.terms as TermSearchRecord[];
const recordsByUrl = new Map(records.map((record) => [record.url, record]));
const recordsById = new Map(records.map((record) => [record.id, record]));
let pagefindPromise: Promise<PagefindApi> | undefined;

function loadPagefind(): Promise<PagefindApi> {
  pagefindPromise ??= (async () => {
    const pagefindPath = '/pagefind/pagefind.js';
    const api = (await import(/* @vite-ignore */ pagefindPath)) as PagefindApi;
    await api.options({
      excerptLength: 32,
      ranking: {
        metaWeights: { title: 10, lookup: 8, nameEn: 8, description: 2 },
        pageLength: 0.6,
        termFrequency: 0.8,
      },
    });
    await api.init();
    return api;
  })();
  return pagefindPromise;
}

function readFilters(root: HTMLElement): SearchFilters {
  return Object.fromEntries(
    [...root.querySelectorAll<HTMLSelectElement>('[data-search-filter]')]
      .map((select) => [select.dataset.searchFilter, select.value])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1])),
  ) as SearchFilters;
}

function pagefindOptions(filters: SearchFilters): Record<string, unknown> {
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return Object.keys(activeFilters).length > 0 ? { filters: activeFilters } : {};
}

function mergeResults(
  metadataResults: MetadataSearchResult[],
  pagefindResults: PagefindResultData[],
): DisplayResult[] {
  const merged = new Map<string, DisplayResult>(
    metadataResults.map((result) => [
      result.record.url,
      { record: result.record, score: result.score, source: '词条索引' },
    ]),
  );

  pagefindResults.forEach((result, index) => {
    const record = recordsById.get(result.meta.termId ?? '') ?? recordsByUrl.get(result.url);
    if (!record) return;

    const existing = merged.get(record.url);
    const pagefindScore = 680 - index;
    if (!existing) {
      merged.set(record.url, {
        record,
        score: pagefindScore,
        source: '正文索引',
        excerpt: result.excerpt,
      });
      return;
    }

    if (existing.score < 700) {
      existing.score = Math.max(existing.score, pagefindScore);
      existing.source = '正文索引';
      existing.excerpt = result.excerpt;
    }
  });

  return [...merged.values()].sort(
    (left, right) =>
      right.score - left.score ||
      left.record.priority - right.record.priority ||
      left.record.id.localeCompare(right.record.id, 'en'),
  );
}

const difficultyLabels = { beginner: '入门', intermediate: '进阶', advanced: '深入' } as const;
const statusLabels = {
  catalogued: '已收录',
  verified: '已核验',
  'needs-review': '需要复核',
  deprecated: '已弃用',
} as const;

function renderResults(root: HTMLElement, results: DisplayResult[], query: string): void {
  const list = root.querySelector<HTMLOListElement>('[data-search-results]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]');
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  if (!list || !empty || !status) return;

  list.replaceChildren();
  empty.hidden = results.length > 0;
  status.textContent = query
    ? `找到 ${results.length} 个匹配词条`
    : `显示 ${results.length} 个词条`;

  results.forEach((result, index) => {
    const item = document.createElement('li');
    item.className = 'search-result';
    item.dataset.resultId = result.record.id;

    const number = document.createElement('span');
    number.className = 'search-result-number';
    number.textContent = String(index + 1).padStart(2, '0');

    const title = document.createElement('a');
    title.className = 'search-result-title';
    title.href = result.record.url;
    const titleZh = document.createElement('strong');
    titleZh.textContent = result.record.nameZh;
    const titleEn = document.createElement('small');
    titleEn.textContent = result.record.nameEn;
    title.append(titleZh, titleEn);

    const copy = document.createElement('div');
    copy.className = 'search-result-copy';
    const excerpt = document.createElement('p');
    if (result.excerpt) excerpt.innerHTML = result.excerpt;
    else excerpt.textContent = result.record.summary;
    copy.append(excerpt);

    const meta = document.createElement('div');
    meta.className = 'search-result-meta';
    const details = document.createElement('span');
    details.textContent = `${result.record.domainNameZh} · ${difficultyLabels[result.record.difficulty]} · ${statusLabels[result.record.status]}`;
    const source = document.createElement('span');
    source.className = 'search-result-source';
    source.textContent = result.source;
    meta.append(details, source);

    item.append(number, title, copy, meta);
    list.append(item);
  });
}

function syncIndexMode(root: HTMLElement, query: string, filters: SearchFilters): boolean {
  const isEmpty = !query.trim() && Object.keys(filters).length === 0;
  const useIndex = root.dataset.emptyBehavior === 'index' && isEmpty;
  const output = root.querySelector<HTMLElement>('[data-search-output]');
  const targetSelector = root.dataset.indexTarget;
  const target = targetSelector ? document.querySelector<HTMLElement>(targetSelector) : null;
  if (output) output.hidden = useIndex;
  if (target) target.hidden = !useIndex;
  return useIndex;
}

async function executeSearch(root: HTMLElement, debounced = false): Promise<void> {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const state = root.querySelector<HTMLElement>('[data-search-index-state]');
  const output = root.querySelector<HTMLElement>('[data-search-output]');
  if (!input || !state || !output) return;

  const query = input.value.trim();
  const filters = readFilters(root);
  const metadataResults = searchMetadata(records, query, filters);
  const useIndex = syncIndexMode(root, query, filters);
  if (useIndex) {
    output.ariaBusy = 'false';
    return;
  }

  renderResults(
    root,
    metadataResults.map((result) => ({
      record: result.record,
      score: result.score,
      source: '词条索引',
    })),
    query,
  );

  if (!query) {
    output.ariaBusy = 'false';
    state.textContent = '词条索引已就绪';
    return;
  }

  const requestId = `${query}|${JSON.stringify(filters)}`;
  root.dataset.searchRequest = requestId;
  output.ariaBusy = 'true';
  const loadingTimer = window.setTimeout(() => {
    if (root.dataset.searchRequest === requestId) state.textContent = '正在读取正文索引';
  }, 400);

  try {
    const pagefind = await loadPagefind();
    const response = debounced
      ? await pagefind.debouncedSearch(query, pagefindOptions(filters), 180)
      : await pagefind.search(query, pagefindOptions(filters));
    if (!response || root.dataset.searchRequest !== requestId) return;
    const resultData = await Promise.all(
      response.results.slice(0, 30).map((result) => result.data()),
    );
    if (root.dataset.searchRequest !== requestId) return;
    renderResults(root, mergeResults(metadataResults, resultData), query);
    state.textContent = '词条索引 + 正文索引';
  } catch {
    if (root.dataset.searchRequest === requestId) {
      state.textContent = '正文索引暂不可用，已保留词条索引结果';
    }
  } finally {
    window.clearTimeout(loadingTimer);
    if (root.dataset.searchRequest === requestId) output.ariaBusy = 'false';
  }
}

function updateUrl(input: HTMLInputElement, filters: SearchFilters): void {
  const params = new URLSearchParams();
  if (input.value.trim()) params.set('q', input.value.trim());
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  window.history.replaceState(
    {},
    '',
    query ? `${window.location.pathname}?${query}` : window.location.pathname,
  );
}

function initializeSearch(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('form');
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const clear = root.querySelector<HTMLButtonElement>('[data-search-clear]');
  const selects = [...root.querySelectorAll<HTMLSelectElement>('[data-search-filter]')];
  if (!form || !input || !clear) return;

  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') ?? '';
  selects.forEach((select) => {
    select.value = params.get(select.dataset.searchFilter ?? '') ?? '';
  });

  input.addEventListener('focus', () => void loadPagefind().catch(() => undefined), { once: true });
  input.addEventListener('input', () => {
    updateUrl(input, readFilters(root));
    void executeSearch(root, true);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateUrl(input, readFilters(root));
    void executeSearch(root);
  });
  selects.forEach((select) =>
    select.addEventListener('change', () => {
      updateUrl(input, readFilters(root));
      void executeSearch(root);
    }),
  );
  clear.addEventListener('click', () => {
    input.value = '';
    selects.forEach((select) => (select.value = ''));
    updateUrl(input, {});
    void executeSearch(root);
    input.focus();
  });

  void executeSearch(root);
}

document.querySelectorAll<HTMLElement>('[data-search-experience]').forEach(initializeSearch);
