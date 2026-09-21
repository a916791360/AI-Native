import type { ContentDocument, ProjectContent } from '../../../src/lib/content/io';
import type { ChainStation, Domain, Relation, Route, Term } from '../../../src/lib/content/schema';

export const VERIFIED_BODY = `<h2 id="what-it-is">它是什么</h2>

这是一个可验证的定义段落。

<h2 id="why-it-matters">为什么需要它</h2>

这里解释它解决的问题。

<h2 id="how-it-works">它如何工作</h2>

这里解释主要工作机制。

<h2 id="example">真实例子</h2>

这里提供一个有边界的例子。

<h2 id="tradeoffs">什么时候适合与不适合</h2>

这里同时说明收益、前提、限制和代价。

<h2 id="try-it">亲自试一下</h2>

目标、步骤和判断标准都在这里。

<h2 id="next">接下来学什么</h2>

这里给出后续学习方向。

<h2 id="sources-and-revisions">来源与修订</h2>

这里解释来源引用和修订范围。`;

function makeDomains(): Domain[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `domain-${index + 1}`,
    order: index + 1,
    nameZh: `测试领域 ${index + 1}`,
    nameEn: `Test Domain ${index + 1}`,
    shortNameZh: `领域 ${index + 1}`,
    description: `用于内容契约测试的第 ${index + 1} 个固定领域说明。`,
    ring: index < 8 ? 'core' : 'extended',
  }));
}

function makeTerm(id: string, nameZh: string): ContentDocument<Term> {
  return {
    filePath: `src/content/terms/domain-1/${id}.mdx`,
    body: VERIFIED_BODY,
    data: {
      id,
      nameZh,
      nameEn: id
        .split('-')
        .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
        .join(' '),
      abbreviations: [],
      aliases: [],
      summary: `${nameZh}是用于验证内容数据契约的固定示例术语。`,
      domain: 'domain-1',
      difficulty: 'beginner',
      ring: 'core',
      status: 'verified',
      priority: 1,
      featured: false,
      publishedAt: '2026-07-01',
      updatedAt: '2026-07-02',
      verifiedAt: '2026-07-02',
      sources: [
        {
          id: `${id}-source-a`,
          type: 'official-doc',
          title: `${nameZh}官方资料一`,
          url: `https://example.com/${id}/a`,
          publisher: 'Example Institute',
          accessedAt: '2026-07-02',
        },
        {
          id: `${id}-source-b`,
          type: 'paper',
          title: `${nameZh}研究资料二`,
          url: `https://example.com/${id}/b`,
          publisher: 'Example Journal',
          publishedAt: '2025-01-01',
          accessedAt: '2026-07-02',
        },
      ],
    },
  };
}

function makeRelation(): Relation {
  return {
    id: 'alpha-precedes-beta',
    source: 'alpha-term',
    target: 'beta-term',
    type: 'prerequisite',
    explanation: '先理解甲术语的基础机制，才能正确理解乙术语所描述的后续方法与边界。',
  };
}

function makeRoute(): ContentDocument<Route> {
  return {
    filePath: 'src/content/routes/test-route.mdx',
    body: '',
    data: {
      id: 'test-route',
      order: 1,
      nameZh: '测试学习路线',
      summary: '用于验证路线引用、重复节点与前置顺序规则的固定学习路线。',
      audience: ['内容契约测试人员'],
      prerequisites: [],
      learningGoals: ['理解两项测试术语之间的依赖关系'],
      estimatedTerms: 2,
      chapters: [
        {
          id: 'foundations',
          title: '基础章节',
          transition: '先学习前置术语，再进入依赖它的后续概念。',
          terms: [{ id: 'alpha-term' }, { id: 'beta-term' }],
        },
      ],
      outcomes: ['能够识别并解释测试路线中的前置关系'],
      prerequisiteExceptions: [],
      status: 'published',
    },
  };
}

function makeChain(): ChainStation[] {
  // 夹具里只有 alpha-term / beta-term 两个词条可供引用，因此每站只放一个核心词条。
  // 真实内容的「每站 3–5 个」由 chainStationSchema 约束，而这里不经过 schema 解析。
  // 交替引用是为了同时满足「相邻两站重叠不超过 1 个」的结构约束。
  const core = ['alpha-term', 'beta-term'];
  return Array.from({ length: 8 }, (_, index) => ({
    id: `station-${index + 1}`,
    order: index + 1,
    nameZh: `测试链路第 ${index + 1} 站`,
    question: `第 ${index + 1} 站要回答的核心问题是什么？`,
    goal: `第 ${index + 1} 站的一句话目标：说清这一层为语言模型补上了什么。`,
    coreTerms: [core[index % core.length]!],
    action: `在第 ${index + 1} 站完成一个 30 分钟内能做完、且结果可观察的动作。`,
  }));
}

export function makeValidProject(): ProjectContent {
  return {
    domains: makeDomains(),
    chain: makeChain(),
    semanticRelations: [makeRelation()],
    terms: [makeTerm('alpha-term', '甲术语'), makeTerm('beta-term', '乙术语')],
    relations: [makeRelation()],
    catalogRelations: [],
    routes: [makeRoute()],
  };
}

export function cloneProject(project = makeValidProject()): ProjectContent {
  return structuredClone(project);
}
