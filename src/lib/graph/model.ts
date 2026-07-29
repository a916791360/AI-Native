export const RELATION_TYPES = ['prerequisite', 'component', 'comparison', 'application'] as const;

export type GraphRelationType = (typeof RELATION_TYPES)[number];

export interface GraphPosition {
  x: number;
  y: number;
}

export interface GraphNode {
  id: string;
  label: string;
  labelEn: string;
  url: string;
  summary: string;
  domain: string;
  difficulty: string;
  ring: string;
  status: string;
  position: GraphPosition;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphRelationType;
  explanation: string;
}

export interface LocalRelation {
  edgeId: string;
  neighbor: string;
  type: GraphRelationType;
  direction: 'incoming' | 'outgoing' | 'symmetric';
  explanation: string;
}

export interface GraphData {
  version: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  local: Record<string, LocalRelation[]>;
}

export interface GraphFilters {
  domain?: string;
  relationTypes?: GraphRelationType[];
}

export function computeGraphPositions(
  nodes: Pick<GraphNode, 'id'>[],
  edges: Pick<GraphEdge, 'source' | 'target'>[],
): Record<string, GraphPosition> {
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  edges.forEach((edge) => {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  });

  const ordered = [...nodes].sort(
    (left, right) =>
      (degree.get(right.id) ?? 0) - (degree.get(left.id) ?? 0) ||
      left.id.localeCompare(right.id, 'en'),
  );
  const positions: Record<string, GraphPosition> = {};
  const center = { x: 500, y: 360 };

  ordered.forEach((node, index) => {
    if (index === 0) {
      positions[node.id] = center;
      return;
    }

    const ringIndex = index - 1;
    const innerCount = Math.min(7, Math.max(1, ordered.length - 1));
    const inner = ringIndex < innerCount;
    const indexWithinRing = inner ? ringIndex : ringIndex - innerCount;
    const countInRing = inner ? innerCount : Math.max(1, ordered.length - 1 - innerCount);
    const radiusX = inner ? 300 : 430;
    const radiusY = inner ? 215 : 305;
    const angle = -Math.PI / 2 + (indexWithinRing / countInRing) * Math.PI * 2;
    positions[node.id] = {
      x: Math.round(center.x + Math.cos(angle) * radiusX),
      y: Math.round(center.y + Math.sin(angle) * radiusY),
    };
  });

  return positions;
}

export function filterGraph(graph: GraphData, filters: GraphFilters): GraphData {
  const relationTypes = new Set(filters.relationTypes ?? RELATION_TYPES);
  const domainNodes = graph.nodes.filter(
    (node) => !filters.domain || node.domain === filters.domain,
  );
  const nodeIds = new Set(domainNodes.map((node) => node.id));
  const edges = graph.edges.filter(
    (edge) => relationTypes.has(edge.type) && nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );
  const connected = new Set(edges.flatMap((edge) => [edge.source, edge.target]));
  const shouldKeepIsolates = relationTypes.size === RELATION_TYPES.length;
  const nodes = domainNodes.filter((node) => shouldKeepIsolates || connected.has(node.id));

  return { ...graph, nodes, edges };
}

export function selectLocalGraph(
  graph: GraphData,
  focusId: string,
  limit = 20,
): { graph: GraphData; hiddenNodeCount: number } {
  const focus = graph.nodes.find((node) => node.id === focusId);
  if (!focus) return { graph: { ...graph, nodes: [], edges: [] }, hiddenNodeCount: 0 };

  const relations = graph.local[focusId] ?? [];
  const neighborIds: string[] = [];
  for (const relation of relations) {
    if (!neighborIds.includes(relation.neighbor)) neighborIds.push(relation.neighbor);
  }
  const visibleNeighborIds = neighborIds.slice(0, Math.max(0, limit - 1));
  const visibleIds = new Set([focusId, ...visibleNeighborIds]);
  const nodes = graph.nodes.filter((node) => visibleIds.has(node.id));
  const edges = graph.edges.filter(
    (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
  );
  const positions = computeGraphPositions(nodes, edges);

  return {
    graph: {
      ...graph,
      nodes: nodes.map((node) => ({ ...node, position: positions[node.id] ?? node.position })),
      edges,
    },
    hiddenNodeCount: Math.max(0, neighborIds.length - visibleNeighborIds.length),
  };
}

export function createSyntheticGraph(nodeCount = 500, edgeCount = 1200): GraphData {
  const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, index) => {
    const column = index % 25;
    const row = Math.floor(index / 25);
    return {
      id: `synthetic-${index}`,
      label: `节点 ${index + 1}`,
      labelEn: `Synthetic ${index + 1}`,
      url: '#',
      summary: '用于阶段 6 浏览器性能门禁的确定性合成节点。',
      domain: `synthetic-domain-${index % 12}`,
      difficulty: 'beginner',
      ring: 'core',
      status: 'verified',
      position: { x: column * 58, y: row * 58 },
    };
  });
  const edges: GraphEdge[] = Array.from({ length: edgeCount }, (_, index) => {
    const sourceIndex = index % nodeCount;
    const targetIndex = (sourceIndex + 1 + Math.floor(index / nodeCount) * 17) % nodeCount;
    return {
      id: `synthetic-edge-${index}`,
      source: `synthetic-${sourceIndex}`,
      target: `synthetic-${targetIndex}`,
      type: RELATION_TYPES[index % RELATION_TYPES.length] ?? 'prerequisite',
      explanation: '用于验证选择、缩放与筛选不会造成持续阻塞。',
    };
  });

  return { version: 1, nodes, edges, local: {} };
}
