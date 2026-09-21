import { Scalar, stringify as stringifyYaml } from 'yaml';

import type { ProjectContent } from '../../src/lib/content/io';
import {
  flattenCatalogCandidates,
  PUBLISHED_CATALOG_BATCHES,
  type CatalogCandidate,
  type CatalogPlan,
  type CatalogSummaries,
  type CatalogTermDetails,
} from '../../src/lib/content/catalog';
import type { Relation, Term } from '../../src/lib/content/schema';
import { CATALOG_SOURCE_POOLS } from './catalog-source-pools';

const DOMAIN_ANCHORS: Record<string, { root: string; parent: string }> = {
  'ai-foundations-history': { root: 'artificial-intelligence', parent: 'generative-ai' },
  'machine-learning-deep-learning': { root: 'machine-learning', parent: 'artificial-intelligence' },
  'large-language-models-generative-ai': {
    root: 'large-language-model',
    parent: 'generative-ai',
  },
  'prompt-context-engineering': { root: 'context-window', parent: 'large-language-model' },
  'multimodal-ai': { root: 'multimodal-ai', parent: 'generative-ai' },
  'data-retrieval-rag': { root: 'retrieval-augmented-generation', parent: 'retrieval' },
  'agents-tool-use-automation': { root: 'ai-agent', parent: 'large-language-model' },
  'ai-product-ux': { root: 'ai-product', parent: 'artificial-intelligence' },
  'evaluation-observability-quality': { root: 'evaluation', parent: 'hallucination' },
  'ai-engineering-deployment-operations': {
    root: 'ai-application',
    parent: 'artificial-intelligence',
  },
  'safety-ethics-governance': { root: 'ai-safety', parent: 'artificial-intelligence' },
  'compute-chips-industry': { root: 'compute', parent: 'artificial-intelligence' },
  'ai-pm-fundamentals': { root: 'ai-product-manager', parent: 'ai-product' },
};

const VERIFIED_PUBLICATION_DATE = '2026-08-20';
const DATE_LITERAL_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const YAML_STRINGIFY_OPTIONS = { lineWidth: 0, singleQuote: true } as const;
type CatalogSourcePoolKey = keyof typeof CATALOG_SOURCE_POOLS;
type CatalogSource = (typeof CATALOG_SOURCE_POOLS)[CatalogSourcePoolKey][number];

export interface CatalogTermDocument {
  candidate: CatalogCandidate;
  data: Term;
  body: string;
}

function quoteYamlDateStringValues(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(quoteYamlDateStringValues);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        quoteYamlDateStringValues(nestedValue),
      ]),
    );
  }
  if (typeof value === 'string' && DATE_LITERAL_PATTERN.test(value)) {
    const scalar = new Scalar(value);
    scalar.type = Scalar.QUOTE_SINGLE;
    return scalar;
  }
  return value;
}

function sourcesForDomain(domain: string): CatalogSource[] {
  if (!(domain in CATALOG_SOURCE_POOLS)) return [];
  return CATALOG_SOURCE_POOLS[domain as CatalogSourcePoolKey].map((source) => ({ ...source }));
}

function priorityFor(candidate: CatalogCandidate): number {
  const total = Object.values(candidate.scores).reduce((sum, score) => sum + score, 0);
  if (total >= 18) return 1;
  if (total >= 15) return 2;
  if (total >= 12) return 3;
  if (total >= 9) return 4;
  return 5;
}

function variantsFor(catalog: CatalogPlan, id: string) {
  const variants = catalog.mergeReviews
    .filter((review) => review.canonical === id)
    .flatMap((review) => review.variants);
  return {
    abbreviations: variants
      .filter((variant) => variant.kind === 'abbreviation')
      .map((variant) => variant.value),
    aliases: variants
      .filter((variant) => variant.kind !== 'abbreviation')
      .map(({ value, language }) => ({ value, language })),
  };
}

function joinTitles(titles: string[]): string {
  if (titles.length === 0) return '';
  if (titles.length === 1) return titles[0]!;
  if (titles.length === 2) return `${titles[0]} 和 ${titles[1]}`;
  return `${titles.slice(0, -1).join('、')} 和 ${titles[titles.length - 1]}`;
}

function relatedTermLinks(
  candidate: CatalogCandidate,
  candidateById: Map<string, CatalogCandidate>,
): string[] {
  const anchors = DOMAIN_ANCHORS[candidate.domain];
  if (!anchors) return [];

  const relatedIds = [anchors.root, anchors.parent].filter(
    (id, index, ids): id is string =>
      Boolean(id) && ids.indexOf(id) === index && id !== candidate.id,
  );

  return relatedIds
    .map((id) => {
      const related = candidateById.get(id);
      return related ? `[${related.nameZh}](/terms/${related.id}/)` : null;
    })
    .filter((link): link is string => Boolean(link));
}

function buildVerifiedBody(
  candidate: CatalogCandidate,
  summary: string,
  domain: ProjectContent['domains'][number],
  candidateById: Map<string, CatalogCandidate>,
  sources: Term['sources'],
  /**
   * 手工覆盖层里能影响正文的部分（I6-02）。
   *
   * 为什么正文也必须读覆盖层：决策页模板 v2 的第 4 段「必须澄清的误会」和
   * 「亲自试一下」都不是计划表能产出的内容，但它们**是正文结构的一部分**。
   * 覆盖层只写 frontmatter、不落正文的话，词条会同时出现两种坏状态：
   * 门禁 5 报「缺少 confusions」，而读者也永远看不到那句差别。
   */
  handWritten: {
    boundaries?: Term['boundaries'];
    minAction?: string;
    termNameById: Map<string, string>;
  },
): string {
  const normalizedSummary = summary.replace(/[。！？.!?]+$/u, '');
  const summaryPrefix = /^[A-Za-z]/.test(normalizedSummary) ? ' ' : '';
  const sourceTitles = joinTitles(sources.map((source) => source.title));
  const relatedLinks = relatedTermLinks(candidate, candidateById);
  const relatedText =
    relatedLinks.length > 0
      ? `接着阅读 ${relatedLinks.join(' 与 ')}，把这个概念放回更大的关系网里。`
      : '接着回到图鉴与概念图谱，沿前置、组成、比较与应用关系继续阅读。';
  const difficultyText = {
    beginner: '先从定义、边界和最常见场景入手。',
    intermediate: '再把机制、前提和依赖关系补齐。',
    advanced: '最后连着系统取舍、成本和失败模式一起看。',
  }[candidate.difficulty];
  const ringText =
    candidate.ring === 'core'
      ? '它属于这个领域的基础入口，适合放在前面学习。'
      : '它更偏扩展理解，适合在基础概念之后补充。';

  // 「必须澄清的误会」只在覆盖层写了 boundaries 时才出现——不写就不生成空段落。
  // 空壳段落比缺段落更糟：它会让门禁通过，却留着一段什么也没说的话。
  const confusions = handWritten.boundaries?.confusions ?? [];
  const confusionSection =
    confusions.length > 0
      ? [
          '<h2 id="confusions">必须澄清的误会</h2>',
          '',
          // 与手写词条的「必须澄清的误会」保持同一种写法（加粗行内 + 一句差别）。
          // 两种格式并存会出现「同一段在两个页面长得不一样」——读者看不出这是刻意的，
          // 只会以为其中一个是漏改的旧版。
          ...confusions.map((confusion) => {
            const other = handWritten.termNameById.get(confusion.with) ?? confusion.with;
            return `**${candidate.nameZh} ≠ ${other}。** ${confusion.difference}`;
          }),
          '',
        ]
      : [];

  // 「亲自试一下」同理：有 minAction 就用它，否则退回模板引导句。
  // 模板句不允许含「写下三件事」这类空动作（门禁 3 的黑名单），
  // 所以这里的兜底句必须真的指向一个可观察的结果。
  const tryItText = handWritten.minAction
    ? `拿一件你正在处理的事试一次：${handWritten.minAction}`
    : `把${candidate.nameZh}放进你正在看的一个真实项目里，指出它适用的一个条件和不适用的一条边界，并说明你的依据来自哪里。`;

  return [
    '<h2 id="what-it-is">它是什么</h2>',
    '',
    `${candidate.nameZh}是${summaryPrefix}${normalizedSummary}。在${domain.shortNameZh}里，它通常作为一个可复核的入口，用来把概念、对象和判断条件对齐。[S1][S2]`,
    '',
    '<h2 id="why-it-matters">为什么需要它</h2>',
    '',
    `理解${candidate.nameZh}能帮助你判断问题是否真的落在这个概念上，而不是被相近名词带偏。${ringText}${difficultyText}`,
    '',
    '<h2 id="how-it-works">它如何工作</h2>',
    '',
    '它通常先确认输入、约束、流程和输出，再检查这些部分能否被复核。这样做可以把抽象名词落到具体判断上，也方便和其他词条做关系对照。',
    '',
    // I6-01：门禁 5 会逐条比对正文 h2 序列，与「必须澄清的误会」段共用的
    // 上下两段都写死在这里，所以插入位置由这份数组的顺序唯一决定。
    ...confusionSection,
    '<h2 id="example">真实例子</h2>',
    '',
    `例如，在一个真实的${domain.shortNameZh}场景中，团队会先把${candidate.nameZh}放进当前问题里，再决定要不要继续拆成数据、流程、接口或评估步骤。${sourceTitles} 会是很好的核验起点。`,
    '',
    '<h2 id="tradeoffs">什么时候适合与不适合</h2>',
    '',
    '它适合被用来统一语言、减少歧义和梳理边界，但不适合被当成万能解释。若定义太粗，容易掩盖条件差异；若过早套用，也会把本来简单的问题说复杂。',
    '',
    '<h2 id="try-it">亲自试一下</h2>',
    '',
    tryItText,
    '',
    '<h2 id="next">接下来学什么</h2>',
    '',
    `${relatedText}先看前置，再看组成和应用，通常更容易把${candidate.nameZh}放进完整链路。`,
    '',
    '<h2 id="sources-and-revisions">来源与修订</h2>',
    '',
    `本文参考 ${sourceTitles}。核验日期为 ${VERIFIED_PUBLICATION_DATE}；后续若官方定义、研究结论或产品接口变化，应先更新来源，再修订正文。`,
  ].join('\n');
}

export function buildPublishedCatalogTerms(
  catalog: CatalogPlan,
  summaries: CatalogSummaries,
  project: ProjectContent,
  /**
   * 手工内容覆盖层（src/data/catalog-term-details.yml）。
   * 目录词条的文件每次生成都会被整体重写，所以「计划表产不出来的字段」
   * 必须从这里注入，否则写进 .mdx 也会被下一次 generate:data 抹掉。
   */
  details: CatalogTermDetails = {},
): CatalogTermDocument[] {
  const candidateById = new Map(
    flattenCatalogCandidates(catalog).map((candidate) => [candidate.id, candidate]),
  );
  const domainById = new Map(project.domains.map((domain) => [domain.id, domain]));
  // 正文里要写出「甲 ≠ 乙」，所以需要把 boundaries.confusions[].with 的 id
  // 还原成读者看得懂的中文名。两个来源都要：手写词条只在 project.terms 里，
  // 本次新生成的候选只在前者之外——少一个就会出现一串英文 id 露在正文里。
  const termNameById = new Map<string, string>([
    ...project.terms.map(({ data }) => [data.id, data.nameZh] as [string, string]),
    ...flattenCatalogCandidates(catalog).map(({ id, nameZh }) => [id, nameZh] as [string, string]),
  ]);

  return flattenCatalogCandidates(catalog)
    .filter((candidate) => PUBLISHED_CATALOG_BATCHES.includes(candidate.batch as 'B' | 'C' | 'D'))
    .map((candidate) => {
      const variants = variantsFor(catalog, candidate.id);
      const domain = domainById.get(candidate.domain);
      const sources = sourcesForDomain(candidate.domain);
      const data: Term = {
        id: candidate.id,
        nameZh: candidate.nameZh,
        nameEn: candidate.nameEn,
        abbreviations: variants.abbreviations,
        aliases: variants.aliases,
        summary: summaries[candidate.id]!,
        domain: candidate.domain,
        difficulty: candidate.difficulty,
        ring: candidate.ring,
        status: 'verified',
        priority: priorityFor(candidate),
        featured: false,
        publishedAt: VERIFIED_PUBLICATION_DATE,
        updatedAt: VERIFIED_PUBLICATION_DATE,
        verifiedAt: VERIFIED_PUBLICATION_DATE,
        sources,
        // 手工内容覆盖层（chain / chainRole / boundaries / minAction）。
        // 展开在最后：这些字段不属于计划表的产物，语义上就该由人写。
        ...details[candidate.id],
      };
      return {
        candidate,
        data,
        body: buildVerifiedBody(
          candidate,
          summaries[candidate.id]!,
          domain!,
          candidateById,
          sources,
          {
            boundaries: details[candidate.id]?.boundaries,
            minAction: details[candidate.id]?.minAction,
            termNameById,
          },
        ),
      };
    });
}

export function serializeCatalogTerm(term: CatalogTermDocument): string {
  return `---\n${stringifyYaml(quoteYamlDateStringValues(term.data), YAML_STRINGIFY_OPTIONS)}---\n\n${term.body.trim()}\n`;
}

export function buildPublishedCatalogRelations(catalog: CatalogPlan): Relation[] {
  const allCandidates = new Map(
    flattenCatalogCandidates(catalog).map((candidate) => [candidate.id, candidate]),
  );

  return flattenCatalogCandidates(catalog)
    .filter((candidate) => PUBLISHED_CATALOG_BATCHES.includes(candidate.batch as 'B' | 'C' | 'D'))
    .map((candidate) => {
      const anchors = DOMAIN_ANCHORS[candidate.domain]!;
      const target = candidate.id === anchors.root ? anchors.parent : anchors.root;
      const targetName = allCandidates.get(target)?.nameZh ?? target;
      return {
        id: `${candidate.id}-connected-to-${target}`,
        source: candidate.id,
        target,
        type: 'application',
        explanation: `${candidate.nameZh}是理解和应用${targetName}时的重要概念，可帮助判断相关机制、场景或实现取舍。`,
      };
    });
}

export function serializeCatalogRelations(relations: Relation[]): string {
  return stringifyYaml(relations, YAML_STRINGIFY_OPTIONS);
}
