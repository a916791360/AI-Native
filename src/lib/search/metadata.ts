export interface TermSearchRecord {
  id: string;
  url: string;
  nameZh: string;
  nameEn: string;
  abbreviations: string[];
  aliases: { value: string; language: 'zh-CN' | 'en' }[];
  summary: string;
  domain: string;
  domainNameZh: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'catalogued' | 'deprecated' | 'needs-review' | 'verified';
  priority: number;
  featured: boolean;
  searchKeys: string[];
}

export interface SearchFilters {
  domain?: string;
  difficulty?: TermSearchRecord['difficulty'];
  status?: TermSearchRecord['status'];
}

export type MetadataMatchKind = 'exact' | 'prefix' | 'related' | 'approximate' | 'browse';

export interface MetadataSearchResult {
  record: TermSearchRecord;
  score: number;
  matchKind: MetadataMatchKind;
}

export function normalizeSearchQuery(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('zh-CN');
}

function levenshtein(left: string, right: string): number {
  const leftChars = [...left];
  const rightChars = [...right];
  const previous = Array.from({ length: rightChars.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= leftChars.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= rightChars.length; rightIndex += 1) {
      const substitutionCost = leftChars[leftIndex - 1] === rightChars[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        (current[rightIndex - 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + 1,
        (previous[rightIndex - 1] ?? 0) + substitutionCost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[rightChars.length] ?? Number.POSITIVE_INFINITY;
}

function allowedDistance(query: string): number {
  const length = [...query].length;
  if (length < 2) return 0;
  if (length <= 4) return 1;
  if (length <= 10) return 2;
  return 3;
}

function scoreRecord(
  record: TermSearchRecord,
  normalizedQuery: string,
): Omit<MetadataSearchResult, 'record'> | null {
  if (!normalizedQuery) {
    return {
      score: (record.featured ? 120 : 0) + (6 - record.priority),
      matchKind: 'browse',
    };
  }

  const keys = record.searchKeys.map(normalizeSearchQuery);
  if (keys.some((key) => key === normalizedQuery)) {
    return { score: 1_000, matchKind: 'exact' };
  }
  if (keys.some((key) => key.startsWith(normalizedQuery))) {
    return { score: 850, matchKind: 'prefix' };
  }
  const containingKey = keys
    .filter((key) => normalizedQuery.startsWith(key))
    .sort((left, right) => right.length - left.length)[0];
  if (containingKey) {
    const coverage = [...containingKey].length / [...normalizedQuery].length;
    return { score: 430 + coverage * 150, matchKind: 'related' };
  }
  if (keys.some((key) => key.includes(normalizedQuery))) {
    return { score: 700, matchKind: 'related' };
  }

  const normalizedSummary = normalizeSearchQuery(record.summary);
  if (normalizedSummary.includes(normalizedQuery)) {
    return { score: 420, matchKind: 'related' };
  }

  const maximumDistance = allowedDistance(normalizedQuery);
  const closestDistance = Math.min(...keys.map((key) => levenshtein(key, normalizedQuery)));
  if (closestDistance <= maximumDistance) {
    return { score: 600 - closestDistance * 40, matchKind: 'approximate' };
  }

  return null;
}

function matchesFilters(record: TermSearchRecord, filters: SearchFilters): boolean {
  return (
    (!filters.domain || record.domain === filters.domain) &&
    (!filters.difficulty || record.difficulty === filters.difficulty) &&
    (!filters.status || record.status === filters.status)
  );
}

export function searchMetadata(
  records: TermSearchRecord[],
  query: string,
  filters: SearchFilters = {},
): MetadataSearchResult[] {
  const normalizedQuery = normalizeSearchQuery(query);

  return records
    .filter((record) => matchesFilters(record, filters))
    .map((record) => {
      const match = scoreRecord(record, normalizedQuery);
      return match ? { record, ...match } : null;
    })
    .filter((result): result is MetadataSearchResult => result !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.record.priority - right.record.priority ||
        left.record.id.localeCompare(right.record.id, 'en'),
    );
}
