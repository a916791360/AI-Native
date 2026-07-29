import { describe, expect, it } from 'vitest';

import type { ProjectContent } from '../../../src/lib/content/io';
import { validateProjectContent } from '../../../src/lib/content/validation';
import { cloneProject, makeValidProject } from '../../fixtures/content/projects';

function diagnosticCodes(project = makeValidProject()): string[] {
  return validateProjectContent(project).map((diagnostic) => diagnostic.code);
}

describe('cross-file content validation', () => {
  it('accepts the fixed valid project', () => {
    expect(validateProjectContent(makeValidProject())).toEqual([]);
  });

  const invalidScenarios: [string, string, (project: ProjectContent) => void][] = [
    [
      'duplicate domain ID',
      'DOMAIN_DUPLICATE_ID',
      (project) => (project.domains[1]!.id = project.domains[0]!.id),
    ],
    [
      'duplicate domain order',
      'DOMAIN_DUPLICATE_ORDER',
      (project) => (project.domains[1]!.order = 1),
    ],
    [
      'term filename mismatch',
      'TERM_FILE_ID',
      (project) => (project.terms[0]!.filePath = 'src/content/terms/domain-1/wrong.mdx'),
    ],
    [
      'term domain directory mismatch',
      'TERM_FILE_DOMAIN',
      (project) => (project.terms[0]!.filePath = 'src/content/terms/domain-2/alpha-term.mdx'),
    ],
    [
      'unknown term domain',
      'TERM_DOMAIN_UNKNOWN',
      (project) => (project.terms[0]!.data.domain = 'unknown-domain'),
    ],
    [
      'duplicate term ID',
      'TERM_DUPLICATE_ID',
      (project) => (project.terms[1]!.data.id = 'alpha-term'),
    ],
    [
      'normalized lookup conflict',
      'TERM_LOOKUP_CONFLICT',
      (project) =>
        (project.terms[1]!.data.aliases = [{ value: '  ＡＬＰＨＡ   ＴＥＲＭ ', language: 'en' }]),
    ],
    [
      'duplicate local lookup key',
      'TERM_LOOKUP_DUPLICATE',
      (project) => (project.terms[0]!.data.aliases = [{ value: ' Alpha Term ', language: 'en' }]),
    ],
    [
      'missing verified source',
      'VERIFIED_SOURCES',
      (project) => (project.terms[0]!.data.sources = []),
    ],
    [
      'missing verified date',
      'VERIFIED_DATE_REQUIRED',
      (project) => (project.terms[0]!.data.verifiedAt = undefined),
    ],
    ['missing verified section', 'VERIFIED_SECTION', (project) => (project.terms[0]!.body = '')],
    [
      'missing draft source',
      'DRAFT_SOURCES',
      (project) => {
        project.terms[0]!.data.status = 'draft';
        project.terms[0]!.data.sources = [];
      },
    ],
    [
      'missing draft section',
      'DRAFT_SECTION',
      (project) => {
        project.terms[0]!.data.status = 'draft';
        project.terms[0]!.body = '';
      },
    ],
    [
      'misordered verified sections',
      'VERIFIED_SECTION_ORDER',
      (project) => {
        const first = '<h2 id="what-it-is">它是什么</h2>';
        const second = '<h2 id="why-it-matters">为什么需要它</h2>';
        project.terms[0]!.body = project.terms[0]!.body.replace(
          first,
          '<h2 id="temporary-section">临时章节</h2>',
        )
          .replace(second, first)
          .replace('<h2 id="temporary-section">临时章节</h2>', second);
      },
    ],
    [
      'empty verified section',
      'VERIFIED_SECTION_CONTENT',
      (project) =>
        (project.terms[0]!.body = project.terms[0]!.body.replace('这是一个可验证的定义段落。', '')),
    ],
    [
      'missing deprecated reason',
      'DEPRECATED_REASON',
      (project) => {
        project.terms[0]!.data.status = 'deprecated';
        project.terms[0]!.data.deprecationReason = undefined;
      },
    ],
    [
      'unknown replacement',
      'REPLACEMENT_UNKNOWN',
      (project) => (project.terms[0]!.data.replacedBy = 'missing-term'),
    ],
    [
      'self replacement',
      'REPLACEMENT_SELF',
      (project) => (project.terms[0]!.data.replacedBy = 'alpha-term'),
    ],
    [
      'duplicate source ID',
      'SOURCE_DUPLICATE_ID',
      (project) => (project.terms[0]!.data.sources[1]!.id = project.terms[0]!.data.sources[0]!.id),
    ],
    [
      'duplicate source URL',
      'SOURCE_DUPLICATE_URL',
      (project) =>
        (project.terms[0]!.data.sources[1]!.url = project.terms[0]!.data.sources[0]!.url),
    ],
    [
      'invalid date order',
      'DATE_ORDER',
      (project) => (project.terms[0]!.data.updatedAt = '2026-06-01'),
    ],
    [
      'duplicate relation ID',
      'RELATION_DUPLICATE_ID',
      (project) => project.relations.push({ ...project.relations[0]! }),
    ],
    [
      'duplicate relation tuple',
      'RELATION_DUPLICATE_TUPLE',
      (project) => project.relations.push({ ...project.relations[0]!, id: 'duplicate-tuple' }),
    ],
    [
      'comparison endpoint order',
      'COMPARISON_ORDER',
      (project) =>
        project.relations.push({
          id: 'reversed-comparison',
          source: 'beta-term',
          target: 'alpha-term',
          type: 'comparison',
          explanation: '对称比较关系必须按稳定词条 ID 的升序保存，避免同一关系出现两种写法。',
        }),
    ],
    [
      'unknown relation endpoint',
      'RELATION_ENDPOINT_UNKNOWN',
      (project) => (project.relations[0]!.target = 'missing-term'),
    ],
    [
      'relation self-link',
      'RELATION_SELF',
      (project) => (project.relations[0]!.target = 'alpha-term'),
    ],
    [
      'short relation explanation',
      'RELATION_EXPLANATION_LENGTH',
      (project) => (project.relations[0]!.explanation = '太短'),
    ],
    [
      'prerequisite cycle',
      'RELATION_CYCLE',
      (project) =>
        project.relations.push({
          id: 'beta-precedes-alpha',
          source: 'beta-term',
          target: 'alpha-term',
          type: 'prerequisite',
          explanation: '乙术语反向依赖甲术语会形成一个应当被校验器识别并拒绝的前置循环。',
        }),
    ],
    [
      'component cycle',
      'RELATION_CYCLE',
      (project) =>
        project.relations.push(
          {
            id: 'alpha-component-beta',
            source: 'alpha-term',
            target: 'beta-term',
            type: 'component',
            explanation: '甲术语作为乙术语组成部分，同时下一条反向关系会形成不允许的组成循环。',
          },
          {
            id: 'beta-component-alpha',
            source: 'beta-term',
            target: 'alpha-term',
            type: 'component',
            explanation: '乙术语又作为甲术语组成部分，这种相互包含关系应当由校验器拒绝。',
          },
        ),
    ],
    [
      'verified core orphan',
      'VERIFIED_CORE_ORPHAN',
      (project) =>
        project.terms.push({
          ...structuredClone(project.terms[0]!),
          filePath: 'src/content/terms/domain-1/gamma-term.mdx',
          data: {
            ...structuredClone(project.terms[0]!.data),
            id: 'gamma-term',
            nameZh: '丙术语',
            nameEn: 'Gamma Term',
            sources: structuredClone(project.terms[0]!.data.sources).map((source) => ({
              ...source,
              id: source.id.replace('alpha', 'gamma'),
            })),
          },
        }),
    ],
    [
      'route filename mismatch',
      'ROUTE_FILE_ID',
      (project) => (project.routes[0]!.filePath = 'src/content/routes/wrong-route.mdx'),
    ],
    [
      'duplicate route ID',
      'ROUTE_DUPLICATE_ID',
      (project) => project.routes.push(structuredClone(project.routes[0]!)),
    ],
    [
      'duplicate route order',
      'ROUTE_DUPLICATE_ORDER',
      (project) => {
        const duplicate = structuredClone(project.routes[0]!);
        duplicate.filePath = 'src/content/routes/second-route.mdx';
        duplicate.data.id = 'second-route';
        project.routes.push(duplicate);
      },
    ],
    [
      'unknown route reference',
      'ROUTE_REFERENCE_UNKNOWN',
      (project) => (project.routes[0]!.data.chapters[0]!.terms[1]!.id = 'missing-term'),
    ],
    [
      'unverified published core term',
      'ROUTE_CORE_NOT_VERIFIED',
      (project) => (project.terms[1]!.data.status = 'catalogued'),
    ],
    [
      'duplicate route term',
      'ROUTE_DUPLICATE_TERM',
      (project) => project.routes[0]!.data.chapters[0]!.terms.push({ id: 'alpha-term' }),
    ],
    [
      'route estimate mismatch',
      'ROUTE_ESTIMATE_MISMATCH',
      (project) => (project.routes[0]!.data.estimatedTerms = 3),
    ],
    [
      'empty published chapter',
      'ROUTE_EMPTY_CHAPTER',
      (project) =>
        project.routes[0]!.data.chapters.push({
          id: 'empty',
          title: '空章节',
          transition: '这个固定反例用于验证发布路线不能出现空章节。',
          terms: [],
        }),
    ],
    [
      'prerequisite route order',
      'ROUTE_PREREQUISITE_ORDER',
      (project) => project.routes[0]!.data.chapters[0]!.terms.reverse(),
    ],
    [
      'unknown prerequisite exception',
      'ROUTE_EXCEPTION_UNKNOWN',
      (project) =>
        project.routes[0]!.data.prerequisiteExceptions.push({
          source: 'beta-term',
          target: 'alpha-term',
          explanation: '这个例外没有对应真实的前置关系，因此应当被拒绝。',
        }),
    ],
    [
      'prerequisite exception outside route',
      'ROUTE_EXCEPTION_OUTSIDE_ROUTE',
      (project) =>
        project.routes[0]!.data.prerequisiteExceptions.push({
          source: 'alpha-term',
          target: 'missing-term',
          explanation: '例外端点必须同时出现在路线中，否则无法解释真实的学习顺序。',
        }),
    ],
    [
      'duplicate prerequisite exception',
      'ROUTE_EXCEPTION_DUPLICATE',
      (project) =>
        project.routes[0]!.data.prerequisiteExceptions.push(
          {
            source: 'alpha-term',
            target: 'beta-term',
            explanation: '第一次声明路线顺序例外，并提供足够明确的教学原因。',
          },
          {
            source: 'alpha-term',
            target: 'beta-term',
            explanation: '同一组前置关系不能重复声明第二次路线顺序例外。',
          },
        ),
    ],
  ];

  it.each(invalidScenarios)('rejects %s', (_label, expectedCode, mutate) => {
    const project = cloneProject();
    mutate(project);
    expect(diagnosticCodes(project)).toContain(expectedCode);
  });

  it('accepts an explained route review and prerequisite exception', () => {
    const project = cloneProject();
    project.routes[0]!.data.chapters[0]!.terms.reverse();
    project.routes[0]!.data.chapters[0]!.terms.push({
      id: 'beta-term',
      reviewReason: '在路线结尾复习乙术语，以便整合本章的依赖关系。',
    });
    project.routes[0]!.data.prerequisiteExceptions.push({
      source: 'alpha-term',
      target: 'beta-term',
      explanation: '先用结果建立问题意识，再回看基础机制并在结尾复习。',
    });

    expect(diagnosticCodes(project)).toEqual([]);
  });
});
