import { describe, expect, it } from 'vitest';

import { buildGraph, buildTermRegistry } from '../../../scripts/lib/generate';
import { cloneProject } from '../../fixtures/content/projects';

describe('generated content artifacts', () => {
  it('creates deterministic searchable registry entries and excludes drafts', () => {
    const project = cloneProject();
    project.terms[0]!.data.aliases = [{ value: '  Ａｌｐｈａ   Alias ', language: 'en' }];
    project.terms[1]!.data.status = 'draft';

    const registry = buildTermRegistry(project);

    expect(registry.terms).toHaveLength(1);
    expect(registry.terms[0]).toMatchObject({
      id: 'alpha-term',
      url: '/terms/alpha-term/',
      searchKeys: expect.arrayContaining(['alpha alias']),
    });
    expect(buildTermRegistry(project)).toEqual(registry);
  });

  it('generates incoming, outgoing and symmetric local graph views', () => {
    const project = cloneProject();
    project.relations.push({
      id: 'alpha-compared-with-beta',
      source: 'alpha-term',
      target: 'beta-term',
      type: 'comparison',
      explanation: '甲术语和乙术语用于验证比较关系会自动生成对称的本地浏览数据。',
    });

    const graph = buildGraph(project);

    expect(graph.nodes.map((node) => node.id)).toEqual(['alpha-term', 'beta-term']);
    expect(graph.nodes.every((node) => Number.isFinite(node.position.x))).toBe(true);
    expect(buildGraph(project)).toEqual(graph);
    expect(graph.local['alpha-term']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ neighbor: 'beta-term', direction: 'outgoing' }),
        expect.objectContaining({ neighbor: 'beta-term', direction: 'symmetric' }),
      ]),
    );
    expect(graph.local['beta-term']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ neighbor: 'alpha-term', direction: 'incoming' }),
        expect.objectContaining({ neighbor: 'alpha-term', direction: 'symmetric' }),
      ]),
    );
  });

  it('removes review and deprecated terms from recommendations', () => {
    const project = cloneProject();
    project.terms[0]!.data.featured = true;
    project.terms[0]!.data.status = 'needs-review';
    project.terms[1]!.data.featured = true;
    project.terms[1]!.data.status = 'deprecated';
    project.terms[1]!.data.deprecationReason = '这个测试术语已经过时，需要保留历史链接但不再推荐。';

    expect(buildTermRegistry(project).terms.map((term) => term.featured)).toEqual([false, false]);
  });
});
