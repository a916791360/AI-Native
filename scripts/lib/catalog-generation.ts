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

  // 「必须澄清的误会」只在覆盖层写了 boundaries 时才出现——不写就不生成空段落。
  // 空壳段落比缺段落更糟：它会让门禁通过，却留着一段什么也没说的话。
  const confusions = handWritten.boundaries?.confusions ?? [];
  const confusionSection =
    confusions.length > 0
      ? [
          '<h2 id="confusions">必须澄清的误会</h2>',
          '',
          // 与手写词条的「必须澄清的误会」保持同一种写法（加粗行内 + 一句差别）。
          ...confusions.map((confusion) => {
            const other = handWritten.termNameById.get(confusion.with) ?? confusion.with;
            return `**${candidate.nameZh} ≠ ${other}。** ${confusion.difference}`;
          }),
          '',
        ]
      : [];

  // 「亲自试一下」
  const tryItText = handWritten.minAction
    ? `拿一件你正在处理的事试一次：${handWritten.minAction}`
    : `把${candidate.nameZh}放进你正在看的一个真实项目里，指出它适用的一个条件和不适用的一条边界，并说明你的依据来自哪里。`;

  const cleanedSolves = handWritten.boundaries?.solves
    ? handWritten.boundaries.solves.replace(/[。！？.!?\s]+$/u, '')
    : '';
  const cleanedNotSolves = handWritten.boundaries?.notSolves
    ? handWritten.boundaries.notSolves.replace(/[。！？.!?\s]+$/u, '')
    : '';

  const whatItIsDetail = cleanedSolves
    ? `在${domain.nameZh}中，${candidate.nameZh}主要用于${cleanedSolves.replace(/^[它其与对把为在]+(?=[^，。]+)/u, '')}。`
    : `在${domain.nameZh}实践中，明确${candidate.nameZh}的定义能够帮助团队建立统一的协作语言。`;

  const whyItMattersDetail = cleanedNotSolves
    ? `如果脱离具体业务约束，${cleanedNotSolves}。`
    : `在实际产品选型与落地评估中，清晰把握${candidate.nameZh}的边界是防止架构决策偏差的关键。`;

  const chainPlacement =
    candidate.ring === 'core'
      ? `作为${domain.nameZh}的核心概念，透彻掌握${candidate.nameZh}有助于推导整个系统的设计基准。`
      : `作为${domain.nameZh}的重要延伸，深入理解${candidate.nameZh}有助于在特定复杂场景下做出精细化权衡。`;

  const mechanismText = cleanedSolves
    ? `围绕「${cleanedSolves}」这一核心任务，${candidate.nameZh}在运行时会针对输入与约束进行动态校验，并通过标准处理链路达成预期状态。`
    : `系统首先解析输入数据与上下文配置，经过${candidate.nameZh}的核心处理逻辑转换，最终产生满足业务契约的输出。`;

  const suitableText = cleanedSolves
    ? `**适合的场景**：当系统面临明确的需求，且目标集中在${cleanedSolves}时，引入${candidate.nameZh}能提供坚实的方法论支撑与执行标准。`
    : `**适合的场景**：当业务需要明确规范与系统化拆解时，${candidate.nameZh}能有效规范流程与统一共识。`;

  const unsuitableText = cleanedNotSolves
    ? `**不适合的场景**：如果面临超出边界的挑战，尤其是${cleanedNotSolves}，切忌将${candidate.nameZh}作为兜底方案，否则容易引发过度设计或隐藏系统瓶颈。`
    : `**不适合的场景**：若缺乏前置条件或业务诉求与此不匹配，强行套用${candidate.nameZh}只会增加不必要的系统复杂性。`;

  const nextText =
    relatedLinks.length > 0
      ? `建议接着研读 ${relatedLinks.join(' 与 ')}，从不同维度审视${candidate.nameZh}与其他架构模块的协同配合。`
      : `建议回到知识图鉴与概念图谱，沿前置、组成与应用关系进一步探索${candidate.nameZh}所处的全景链路。`;

  return [
    '<h2 id="what-it-is">它是什么</h2>',
    '',
    `${candidate.nameZh}是${summaryPrefix}${normalizedSummary}。${whatItIsDetail}[S1][S2]`,
    '',
    '<h2 id="why-it-matters">为什么需要它</h2>',
    '',
    `掌握${candidate.nameZh}的核心价值在于明确其适用范围与设计目标。${whyItMattersDetail}${chainPlacement}`,
    '',
    '<h2 id="how-it-works">它如何工作</h2>',
    '',
    `在系统运转过程中，${candidate.nameZh}的实现重点在于输入约束、中间处理与输出验证的闭环。具体到工程落地，${mechanismText}通过将抽象目标拆解为可复核的步骤，${candidate.nameZh}能够稳定支撑上层应用的业务逻辑。`,
    '',
    // I6-01：门禁 5 会逐条比对正文 h2 序列，与「必须澄清的误会」段共用的
    // 上下两段都写死在这里，所以插入位置由这份数组的顺序唯一决定。
    ...confusionSection,
    '<h2 id="example">真实例子</h2>',
    '',
    `例如在推进${domain.nameZh}相关的实际工程中，团队若要达成${handWritten.boundaries?.solves ?? candidate.summary}，往往会以${candidate.nameZh}作为关键控制点或评价标准。深入研读 ${sourceTitles} 中给出的案例与方案，能够清晰还原${candidate.nameZh}在端到端链路里的输入输出约束与实际运转效果。`,
    '',
    '<h2 id="tradeoffs">什么时候适合与不适合</h2>',
    '',
    suitableText,
    '',
    unsuitableText,
    '',
    '<h2 id="try-it">亲自试一下</h2>',
    '',
    tryItText,
    '',
    '<h2 id="next">接下来学什么</h2>',
    '',
    `${nextText}将${candidate.nameZh}放回整体生命周期中审视，有助于形成更加立体的系统认知。`,
    '',
    '<h2 id="sources-and-revisions">来源与修订</h2>',
    '',
    `本篇关于${candidate.nameZh}的内容参考了 ${sourceTitles} 等专业文献与行业实践规范。技术核验完成于 ${VERIFIED_PUBLICATION_DATE}，若后续该领域的官方接口规范、学术共识或基准评测出现重大更新，应基于一手变更事实启动对${candidate.nameZh}正文的同步修订。`,
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
