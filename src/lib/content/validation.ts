import path from 'node:path';

import type { ContentDocument, ProjectContent } from './io';
import type { Relation, Route, Term } from './schema';
import { isDeprecatedTerm } from './visibility';

const REQUIRED_SECTIONS = [
  'what-it-is',
  'why-it-matters',
  'how-it-works',
  'example',
  'tradeoffs',
  'try-it',
  'next',
  'sources-and-revisions',
] as const;

export interface ContentDiagnostic {
  code: string;
  filePath: string;
  fieldPath: string;
  message: string;
}

export class ContentValidationError extends Error {
  constructor(readonly diagnostics: ContentDiagnostic[]) {
    super(diagnostics.map(formatDiagnostic).join('\n'));
    this.name = 'ContentValidationError';
  }
}

export function formatDiagnostic(diagnostic: ContentDiagnostic): string {
  return `[${diagnostic.code}] ${diagnostic.filePath}#${diagnostic.fieldPath}: ${diagnostic.message}`;
}

export function normalizeLookupKey(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('zh-CN');
}

function addDiagnostic(
  diagnostics: ContentDiagnostic[],
  code: string,
  filePath: string,
  fieldPath: string,
  message: string,
): void {
  diagnostics.push({ code, filePath, fieldPath, message });
}

function termFileParts(filePath: string): { domain: string; id: string } {
  const normalized = filePath.split(path.sep).join('/');
  const match = normalized.match(/src\/content\/terms\/([^/]+)\/([^/]+)\.mdx$/);
  return { domain: match?.[1] ?? '', id: match?.[2] ?? '' };
}

function routeFileId(filePath: string): string {
  return path.basename(filePath, '.mdx');
}

function validateDomains(project: ProjectContent, diagnostics: ContentDiagnostic[]): void {
  const ids = new Map<string, number>();
  const orders = new Map<number, number>();

  project.domains.forEach((domain, index) => {
    const previousId = ids.get(domain.id);
    if (previousId !== undefined) {
      addDiagnostic(
        diagnostics,
        'DOMAIN_DUPLICATE_ID',
        'src/data/domains.yml',
        `${index}.id`,
        `duplicates item ${previousId}`,
      );
    }
    ids.set(domain.id, index);

    const previousOrder = orders.get(domain.order);
    if (previousOrder !== undefined) {
      addDiagnostic(
        diagnostics,
        'DOMAIN_DUPLICATE_ORDER',
        'src/data/domains.yml',
        `${index}.order`,
        `duplicates item ${previousOrder}`,
      );
    }
    orders.set(domain.order, index);
  });
}

function validateTermIdentity(
  termDocument: ContentDocument<Term>,
  domainIds: Set<string>,
  diagnostics: ContentDiagnostic[],
): void {
  const { data: term, filePath } = termDocument;
  const file = termFileParts(filePath);

  if (file.id !== term.id) {
    addDiagnostic(
      diagnostics,
      'TERM_FILE_ID',
      filePath,
      'id',
      `must match filename ${file.id || '(invalid path)'}`,
    );
  }
  if (file.domain !== term.domain) {
    addDiagnostic(
      diagnostics,
      'TERM_FILE_DOMAIN',
      filePath,
      'domain',
      `must match parent directory ${file.domain || '(invalid path)'}`,
    );
  }
  if (!domainIds.has(term.domain)) {
    addDiagnostic(
      diagnostics,
      'TERM_DOMAIN_UNKNOWN',
      filePath,
      'domain',
      `unknown domain ${term.domain}`,
    );
  }
}

function validateTermStatus(
  termDocument: ContentDocument<Term>,
  termIds: Set<string>,
  diagnostics: ContentDiagnostic[],
): void {
  const { data: term, filePath, body } = termDocument;

  if (term.status === 'verified') {
    for (const field of ['publishedAt', 'updatedAt', 'verifiedAt'] as const) {
      if (!term[field]) {
        addDiagnostic(
          diagnostics,
          'VERIFIED_DATE_REQUIRED',
          filePath,
          field,
          'is required for verified terms',
        );
      }
    }
    if (term.sources.length < 2) {
      addDiagnostic(
        diagnostics,
        'VERIFIED_SOURCES',
        filePath,
        'sources',
        'verified terms require at least two sources',
      );
    }
  }

  if (term.status === 'draft' && term.sources.length < 2) {
    addDiagnostic(
      diagnostics,
      'DRAFT_SOURCES',
      filePath,
      'sources',
      'draft terms require at least two sources',
    );
  }

  if (term.status === 'verified' || term.status === 'draft') {
    const codePrefix = term.status === 'verified' ? 'VERIFIED' : 'DRAFT';
    const sectionHeadings = [...body.matchAll(/^<h2 id="([a-z0-9-]+)">.+?<\/h2>\s*$/gm)];
    for (const section of REQUIRED_SECTIONS) {
      const heading = new RegExp(`^<h2 id="${section}">.+?<\\/h2>\\s*$`, 'm');
      if (!heading.test(body)) {
        addDiagnostic(
          diagnostics,
          `${codePrefix}_SECTION`,
          filePath,
          `body.${section}`,
          `missing required level-two heading ID ${section}`,
        );
      }
    }

    const requiredHeadingIds = sectionHeadings
      .map((match) => match[1])
      .filter((id): id is (typeof REQUIRED_SECTIONS)[number] =>
        REQUIRED_SECTIONS.includes(id as (typeof REQUIRED_SECTIONS)[number]),
      );
    if (requiredHeadingIds.join('|') !== REQUIRED_SECTIONS.join('|')) {
      addDiagnostic(
        diagnostics,
        `${codePrefix}_SECTION_ORDER`,
        filePath,
        'body',
        'required section anchors must appear exactly once in the prescribed order',
      );
    }

    sectionHeadings.forEach((heading, index) => {
      const sectionId = heading[1];
      if (!REQUIRED_SECTIONS.includes(sectionId as (typeof REQUIRED_SECTIONS)[number])) return;
      const start = (heading.index ?? 0) + heading[0].length;
      const end = sectionHeadings[index + 1]?.index ?? body.length;
      const content = body.slice(start, end).trim();
      if ([...content].length < 10) {
        addDiagnostic(
          diagnostics,
          `${codePrefix}_SECTION_CONTENT`,
          filePath,
          `body.${sectionId}`,
          'section content must contain at least 10 characters',
        );
      }
    });
  }

  if (isDeprecatedTerm(term) && !term.deprecationReason) {
    addDiagnostic(
      diagnostics,
      'DEPRECATED_REASON',
      filePath,
      'deprecationReason',
      'is required for deprecated terms',
    );
  }

  if (term.replacedBy) {
    if (term.replacedBy === term.id) {
      addDiagnostic(
        diagnostics,
        'REPLACEMENT_SELF',
        filePath,
        'replacedBy',
        'cannot reference the same term',
      );
    } else if (!termIds.has(term.replacedBy)) {
      addDiagnostic(
        diagnostics,
        'REPLACEMENT_UNKNOWN',
        filePath,
        'replacedBy',
        `unknown term ${term.replacedBy}`,
      );
    }
  }

  const sourceIds = new Set<string>();
  const sourceUrls = new Set<string>();
  term.sources.forEach((source, index) => {
    if (sourceIds.has(source.id)) {
      addDiagnostic(
        diagnostics,
        'SOURCE_DUPLICATE_ID',
        filePath,
        `sources.${index}.id`,
        `duplicates source ${source.id}`,
      );
    }
    sourceIds.add(source.id);
    if (sourceUrls.has(source.url)) {
      addDiagnostic(
        diagnostics,
        'SOURCE_DUPLICATE_URL',
        filePath,
        `sources.${index}.url`,
        `duplicates source URL ${source.url}`,
      );
    }
    sourceUrls.add(source.url);
  });

  if (term.publishedAt && term.updatedAt && term.publishedAt > term.updatedAt) {
    addDiagnostic(
      diagnostics,
      'DATE_ORDER',
      filePath,
      'updatedAt',
      'must not be earlier than publishedAt',
    );
  }
  if (term.verifiedAt && term.updatedAt && term.verifiedAt > term.updatedAt) {
    addDiagnostic(
      diagnostics,
      'DATE_ORDER',
      filePath,
      'verifiedAt',
      'must not be later than updatedAt',
    );
  }
}

/**
 * 认知链路（8 站）的结构校验。
 *
 * 这里只管「结构是否成立」，不管「内容写得好不好」：
 *   · 站序必须是 1..8 的连续序列 —— 缺号说明链路断了，学习顺序无从谈起；
 *   · coreTerms 必须指向真实存在的词条 —— 核心节点指向空处，等于这一站不存在；
 *   · 相邻两站重叠不超过 1 个 —— 否则分站失去意义，又退化成一个平级清单。
 *
 * 「A 档词条是否填了 chain」这类完整性问题属于内容质量门禁的职责
 * （见 scripts/check-content-quality.ts），不在这里按档位判定。
 */
function validateChain(project: ProjectContent, diagnostics: ContentDiagnostic[]): void {
  const filePath = 'src/data/chain.yml';
  const termIds = new Set(project.terms.map(({ data }) => data.id));
  const stationIds = new Map<string, number>();

  project.chain.forEach((station, index) => {
    const previousIndex = stationIds.get(station.id);
    if (previousIndex !== undefined) {
      addDiagnostic(
        diagnostics,
        'CHAIN_DUPLICATE_ID',
        filePath,
        `${index}.id`,
        `duplicates item ${previousIndex}`,
      );
    }
    stationIds.set(station.id, index);

    if (station.order !== index + 1) {
      addDiagnostic(
        diagnostics,
        'CHAIN_ORDER_SEQUENCE',
        filePath,
        `${index}.order`,
        `must be ${index + 1} so stations form a continuous 1..${project.chain.length} sequence`,
      );
    }

    station.coreTerms.forEach((termId, termIndex) => {
      if (!termIds.has(termId)) {
        addDiagnostic(
          diagnostics,
          'CHAIN_TERM_UNKNOWN',
          filePath,
          `${index}.coreTerms.${termIndex}`,
          `unknown term ${termId}`,
        );
      }
    });

    const next = project.chain[index + 1];
    if (next) {
      const overlap = station.coreTerms.filter((termId) => next.coreTerms.includes(termId));
      if (overlap.length > 1) {
        addDiagnostic(
          diagnostics,
          'CHAIN_ADJACENT_OVERLAP',
          filePath,
          `${index}.coreTerms`,
          `shares ${overlap.length} terms with ${next.id} (${overlap.join(', ')}); at most 1 allowed`,
        );
      }
    }
  });
}

/**
 * 边界声明的引用校验。
 *
 * `boundaries` 是可选字段，但一旦填写，里面的引用就必须是客观正确的事实：
 * confusions[].with 指向的词条必须存在，且不能是自己。
 * 填错引用是 bug，不分档位、一律硬失败；
 * 「A 档到底有没有填 boundaries」才是按档位判定的内容质量问题。
 */
function validateTermBoundaries(
  termDocument: ContentDocument<Term>,
  termIds: Set<string>,
  diagnostics: ContentDiagnostic[],
): void {
  const { data: term, filePath } = termDocument;
  if (!term.boundaries) return;

  const seen = new Set<string>();
  term.boundaries.confusions.forEach((confusion, index) => {
    const fieldPath = `boundaries.confusions.${index}.with`;

    if (confusion.with === term.id) {
      addDiagnostic(
        diagnostics,
        'BOUNDARY_SELF_REFERENCE',
        filePath,
        fieldPath,
        'cannot point at the term itself',
      );
    } else if (!termIds.has(confusion.with)) {
      addDiagnostic(
        diagnostics,
        'BOUNDARY_TERM_UNKNOWN',
        filePath,
        fieldPath,
        `unknown term ${confusion.with}`,
      );
    }

    if (seen.has(confusion.with)) {
      addDiagnostic(
        diagnostics,
        'BOUNDARY_DUPLICATE',
        filePath,
        fieldPath,
        `duplicate confusion target ${confusion.with}`,
      );
    }
    seen.add(confusion.with);
  });
}

function validateLookupKeys(
  terms: ContentDocument<Term>[],
  diagnostics: ContentDiagnostic[],
): void {
  const owners = new Map<string, { termId: string; filePath: string; fieldPath: string }>();

  for (const termDocument of terms) {
    const { data: term, filePath } = termDocument;
    const keys = [
      { value: term.nameZh, fieldPath: 'nameZh' },
      { value: term.nameEn, fieldPath: 'nameEn' },
      ...term.abbreviations.map((value, index) => ({ value, fieldPath: `abbreviations.${index}` })),
      ...term.aliases.map((alias, index) => ({
        value: alias.value,
        fieldPath: `aliases.${index}.value`,
      })),
    ];
    const localKeys = new Map<string, string>();

    for (const key of keys) {
      const normalized = normalizeLookupKey(key.value);
      const localOwner = localKeys.get(normalized);
      const sameBilingualName = localOwner === 'nameZh' && key.fieldPath === 'nameEn';
      if (localOwner && !sameBilingualName) {
        addDiagnostic(
          diagnostics,
          'TERM_LOOKUP_DUPLICATE',
          filePath,
          key.fieldPath,
          `duplicates ${localOwner} after normalization`,
        );
      } else if (!localOwner) {
        localKeys.set(normalized, key.fieldPath);
      }

      const owner = owners.get(normalized);
      if (owner && owner.termId !== term.id) {
        addDiagnostic(
          diagnostics,
          'TERM_LOOKUP_CONFLICT',
          filePath,
          key.fieldPath,
          `normalized value conflicts with ${owner.filePath}#${owner.fieldPath}`,
        );
      } else {
        owners.set(normalized, { termId: term.id, filePath, fieldPath: key.fieldPath });
      }
    }
  }
}

function detectCycles(
  relations: Relation[],
  type: 'prerequisite' | 'component',
  diagnostics: ContentDiagnostic[],
): void {
  const relevant = relations.filter((relation) => relation.type === type);
  const adjacency = new Map<string, string[]>();
  for (const relation of relevant) {
    const targets = adjacency.get(relation.source) ?? [];
    targets.push(relation.target);
    adjacency.set(relation.source, targets);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const reported = new Set<string>();

  function visit(node: string, trail: string[]): void {
    if (visiting.has(node)) {
      const start = trail.indexOf(node);
      const cycle = [...trail.slice(start), node];
      const signature = [...new Set(cycle)].sort().join('|');
      if (!reported.has(signature)) {
        addDiagnostic(
          diagnostics,
          'RELATION_CYCLE',
          'src/data/relations.yml',
          type,
          `${type} cycle: ${cycle.join(' -> ')}`,
        );
        reported.add(signature);
      }
      return;
    }
    if (visited.has(node)) return;

    visiting.add(node);
    for (const target of adjacency.get(node) ?? []) visit(target, [...trail, node]);
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of adjacency.keys()) visit(node, []);
}

function validateRelations(project: ProjectContent, diagnostics: ContentDiagnostic[]): void {
  const termIds = new Set(project.terms.map(({ data }) => data.id));
  const connected = new Set<string>();

  // relations.yml 是人工维护的语义图，必须检查自身的 ID / 三元组唯一性；
  // catalog-relations.yml 是生成的同域兜底边，只参与「词条是否已连接」判断。
  // 两层允许表达同一条边：兜底边不能因为后来补了一条真实语义边而触发重复报错。
  const validateSet = (relations: Relation[], filePath: string, checkDuplicates: boolean): void => {
    const relationIds = new Map<string, number>();
    const tuples = new Map<string, number>();

    relations.forEach((relation, index) => {
      if (checkDuplicates) {
        const previousId = relationIds.get(relation.id);
        if (previousId !== undefined) {
          addDiagnostic(
            diagnostics,
            'RELATION_DUPLICATE_ID',
            filePath,
            `${index}.id`,
            `duplicates item ${previousId}`,
          );
        }
        relationIds.set(relation.id, index);

        const tuple = `${relation.source}|${relation.target}|${relation.type}`;
        const previousTuple = tuples.get(tuple);
        if (previousTuple !== undefined) {
          addDiagnostic(
            diagnostics,
            'RELATION_DUPLICATE_TUPLE',
            filePath,
            `${index}`,
            `duplicates source, target and type from item ${previousTuple}`,
          );
        }
        tuples.set(tuple, index);
      }

      if (!termIds.has(relation.source)) {
        addDiagnostic(
          diagnostics,
          'RELATION_ENDPOINT_UNKNOWN',
          filePath,
          `${index}.source`,
          `unknown term ${relation.source}`,
        );
      }
      if (!termIds.has(relation.target)) {
        addDiagnostic(
          diagnostics,
          'RELATION_ENDPOINT_UNKNOWN',
          filePath,
          `${index}.target`,
          `unknown term ${relation.target}`,
        );
      }
      if (relation.source === relation.target) {
        addDiagnostic(
          diagnostics,
          'RELATION_SELF',
          filePath,
          `${index}.target`,
          'self-links are forbidden',
        );
      }
      if (
        relation.type === 'comparison' &&
        relation.source.localeCompare(relation.target, 'en') >= 0
      ) {
        addDiagnostic(
          diagnostics,
          'COMPARISON_ORDER',
          filePath,
          `${index}.source`,
          'comparison endpoints must be stored in ascending ID order',
        );
      }

      const explanationLength = [...relation.explanation].length;
      if (explanationLength < 20 || explanationLength > 120) {
        addDiagnostic(
          diagnostics,
          'RELATION_EXPLANATION_LENGTH',
          filePath,
          `${index}.explanation`,
          `must contain 20-120 characters; received ${explanationLength}`,
        );
      }

      connected.add(relation.source);
      connected.add(relation.target);
    });
  };

  validateSet(project.relations, 'src/data/relations.yml', true);
  validateSet(project.catalogRelations, 'src/data/catalog-relations.yml', false);

  // 兜底边不代表人工确认过的学习依赖，不参与语义图的环检测。
  detectCycles(project.relations, 'prerequisite', diagnostics);
  detectCycles(project.relations, 'component', diagnostics);

  for (const term of project.terms) {
    if (
      term.data.status === 'verified' &&
      term.data.ring === 'core' &&
      !connected.has(term.data.id)
    ) {
      addDiagnostic(
        diagnostics,
        'VERIFIED_CORE_ORPHAN',
        term.filePath,
        'id',
        'verified core terms require at least one relation',
      );
    }
  }
}

function routeTerms(route: Route): { id: string; reviewReason?: string }[] {
  return route.chapters.flatMap((chapter) => chapter.terms);
}

function hasPrerequisiteException(route: Route, relation: Relation): boolean {
  return route.prerequisiteExceptions.some(
    (exception) => exception.source === relation.source && exception.target === relation.target,
  );
}

function validateRoutes(project: ProjectContent, diagnostics: ContentDiagnostic[]): void {
  const terms = new Map(project.terms.map((term) => [term.data.id, term.data]));
  const routeIds = new Map<string, string>();
  const routeOrders = new Map<number, string>();

  for (const routeDocument of project.routes) {
    const { data: route, filePath } = routeDocument;
    const previousIdFile = routeIds.get(route.id);
    if (previousIdFile) {
      addDiagnostic(
        diagnostics,
        'ROUTE_DUPLICATE_ID',
        filePath,
        'id',
        `duplicates ${previousIdFile}`,
      );
    }
    routeIds.set(route.id, filePath);

    const previousOrderFile = routeOrders.get(route.order);
    if (previousOrderFile) {
      addDiagnostic(
        diagnostics,
        'ROUTE_DUPLICATE_ORDER',
        filePath,
        'order',
        `duplicates ${previousOrderFile}`,
      );
    }
    routeOrders.set(route.order, filePath);

    if (routeFileId(filePath) !== route.id) {
      addDiagnostic(
        diagnostics,
        'ROUTE_FILE_ID',
        filePath,
        'id',
        `must match filename ${routeFileId(filePath)}`,
      );
    }

    for (const [index, prerequisite] of route.prerequisites.entries()) {
      if (!terms.has(prerequisite)) {
        addDiagnostic(
          diagnostics,
          'ROUTE_REFERENCE_UNKNOWN',
          filePath,
          `prerequisites.${index}`,
          `unknown term ${prerequisite}`,
        );
      }
    }

    const steps = routeTerms(route);
    const firstPosition = new Map<string, number>();
    steps.forEach((step, index) => {
      const term = terms.get(step.id);
      if (!term) {
        addDiagnostic(
          diagnostics,
          'ROUTE_REFERENCE_UNKNOWN',
          filePath,
          `terms.${index}.id`,
          `unknown term ${step.id}`,
        );
      } else if (
        route.status === 'published' &&
        term.ring === 'core' &&
        term.status !== 'verified'
      ) {
        addDiagnostic(
          diagnostics,
          'ROUTE_CORE_NOT_VERIFIED',
          filePath,
          `terms.${index}.id`,
          `published route core term ${step.id} must be verified`,
        );
      }

      if (firstPosition.has(step.id) && !step.reviewReason) {
        addDiagnostic(
          diagnostics,
          'ROUTE_DUPLICATE_TERM',
          filePath,
          `terms.${index}`,
          `repeated term ${step.id} requires reviewReason`,
        );
      }
      if (!firstPosition.has(step.id)) firstPosition.set(step.id, index);
    });

    if (route.estimatedTerms !== firstPosition.size) {
      addDiagnostic(
        diagnostics,
        'ROUTE_ESTIMATE_MISMATCH',
        filePath,
        'estimatedTerms',
        `expected ${firstPosition.size} unique referenced terms`,
      );
    }

    route.chapters.forEach((chapter, index) => {
      if (route.status === 'published' && chapter.terms.length === 0) {
        addDiagnostic(
          diagnostics,
          'ROUTE_EMPTY_CHAPTER',
          filePath,
          `chapters.${index}.terms`,
          'published routes cannot contain empty chapters',
        );
      }
    });

    const prerequisitePairs = new Set(
      project.relations
        .filter((relation) => relation.type === 'prerequisite')
        .map((relation) => `${relation.source}|${relation.target}`),
    );
    const exceptionPairs = new Set<string>();
    route.prerequisiteExceptions.forEach((exception, index) => {
      const pair = `${exception.source}|${exception.target}`;
      if (!prerequisitePairs.has(pair)) {
        addDiagnostic(
          diagnostics,
          'ROUTE_EXCEPTION_UNKNOWN',
          filePath,
          `prerequisiteExceptions.${index}`,
          'must reference an existing prerequisite relation',
        );
      }
      if (!firstPosition.has(exception.source) || !firstPosition.has(exception.target)) {
        addDiagnostic(
          diagnostics,
          'ROUTE_EXCEPTION_OUTSIDE_ROUTE',
          filePath,
          `prerequisiteExceptions.${index}`,
          'both exception endpoints must appear in the route',
        );
      }
      if (exceptionPairs.has(pair)) {
        addDiagnostic(
          diagnostics,
          'ROUTE_EXCEPTION_DUPLICATE',
          filePath,
          `prerequisiteExceptions.${index}`,
          'duplicate prerequisite exception',
        );
      }
      exceptionPairs.add(pair);
    });

    for (const relation of project.relations.filter((item) => item.type === 'prerequisite')) {
      const sourceIndex = firstPosition.get(relation.source);
      const targetIndex = firstPosition.get(relation.target);
      if (
        sourceIndex !== undefined &&
        targetIndex !== undefined &&
        sourceIndex > targetIndex &&
        !hasPrerequisiteException(route, relation)
      ) {
        addDiagnostic(
          diagnostics,
          'ROUTE_PREREQUISITE_ORDER',
          filePath,
          'chapters',
          `${relation.source} must appear before ${relation.target}, or declare an exception`,
        );
      }
    }
  }
}

export function validateProjectContent(project: ProjectContent): ContentDiagnostic[] {
  const diagnostics: ContentDiagnostic[] = [];
  const domainIds = new Set(project.domains.map((domain) => domain.id));
  const termIds = new Set<string>();

  validateDomains(project, diagnostics);

  for (const term of project.terms) {
    if (termIds.has(term.data.id)) {
      addDiagnostic(
        diagnostics,
        'TERM_DUPLICATE_ID',
        term.filePath,
        'id',
        `duplicate term ID ${term.data.id}`,
      );
    }
    termIds.add(term.data.id);
  }

  for (const term of project.terms) {
    validateTermIdentity(term, domainIds, diagnostics);
    validateTermStatus(term, termIds, diagnostics);
    validateTermBoundaries(term, termIds, diagnostics);
  }

  validateChain(project, diagnostics);
  validateLookupKeys(project.terms, diagnostics);
  validateRelations(project, diagnostics);
  validateRoutes(project, diagnostics);

  return diagnostics.sort((left, right) =>
    `${left.filePath}|${left.fieldPath}|${left.code}`.localeCompare(
      `${right.filePath}|${right.fieldPath}|${right.code}`,
      'en',
    ),
  );
}

export function assertValidProjectContent(project: ProjectContent): void {
  const diagnostics = validateProjectContent(project);
  if (diagnostics.length > 0) throw new ContentValidationError(diagnostics);
}
