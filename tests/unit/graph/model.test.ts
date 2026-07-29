import { describe, expect, it } from 'vitest';

import {
  createSyntheticGraph,
  filterGraph,
  selectLocalGraph,
  type GraphData,
} from '../../../src/lib/graph/model';

const graph = createSyntheticGraph(24, 48);

describe('graph model', () => {
  it('builds deterministic 500-node benchmark data', () => {
    const first = createSyntheticGraph();
    const second = createSyntheticGraph();

    expect(first.nodes).toHaveLength(500);
    expect(first.edges).toHaveLength(1200);
    expect(second).toEqual(first);
  });

  it('applies domain and relation filters independently', () => {
    const byDomain = filterGraph(graph, { domain: 'synthetic-domain-0' });
    const byRelation = filterGraph(graph, { relationTypes: ['prerequisite'] });

    expect(byDomain.nodes).toHaveLength(2);
    expect(byDomain.nodes.every((node) => node.domain === 'synthetic-domain-0')).toBe(true);
    expect(byRelation.edges.length).toBeGreaterThan(0);
    expect(byRelation.edges.every((edge) => edge.type === 'prerequisite')).toBe(true);
  });

  it('caps local graphs at twenty nodes and reports hidden neighbors', () => {
    const localRelations = graph.nodes.slice(1).map((node, index) => ({
      edgeId: `local-${index}`,
      neighbor: node.id,
      type: 'prerequisite' as const,
      direction: 'outgoing' as const,
      explanation: '测试局部图裁剪。',
    }));
    const localGraph: GraphData = {
      ...graph,
      edges: localRelations.map((relation) => ({
        id: relation.edgeId,
        source: graph.nodes[0]!.id,
        target: relation.neighbor,
        type: relation.type,
        explanation: relation.explanation,
      })),
      local: { [graph.nodes[0]!.id]: localRelations },
    };

    const result = selectLocalGraph(localGraph, graph.nodes[0]!.id);

    expect(result.graph.nodes).toHaveLength(20);
    expect(result.hiddenNodeCount).toBe(4);
  });
});
