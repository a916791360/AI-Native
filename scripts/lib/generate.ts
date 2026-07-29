import type { ProjectContent } from '../../src/lib/content/io';
import type { Relation, Term } from '../../src/lib/content/schema';
import { normalizeLookupKey } from '../../src/lib/content/validation';
import { computeGraphPositions } from '../../src/lib/graph/model';

function isPublicTerm(term: Term): boolean {
  return term.status !== 'draft';
}

function byId<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id, 'en');
}

export function buildTermRegistry(project: ProjectContent) {
  const domains = new Map(project.domains.map((domain) => [domain.id, domain]));

  return {
    version: 1,
    terms: project.terms
      .map(({ data }) => data)
      .filter(isPublicTerm)
      .map((term) => ({
        id: term.id,
        url: `/terms/${term.id}/`,
        nameZh: term.nameZh,
        nameEn: term.nameEn,
        abbreviations: term.abbreviations,
        aliases: term.aliases,
        summary: term.summary,
        domain: term.domain,
        domainNameZh: domains.get(term.domain)?.nameZh ?? term.domain,
        difficulty: term.difficulty,
        ring: term.ring,
        status: term.status,
        priority: term.priority,
        featured: term.featured && !['needs-review', 'deprecated'].includes(term.status),
        searchKeys: [
          term.nameZh,
          term.nameEn,
          ...term.abbreviations,
          ...term.aliases.map((alias) => alias.value),
        ].map(normalizeLookupKey),
      }))
      .sort((left, right) => left.priority - right.priority || byId(left, right)),
  };
}

interface LocalRelation {
  edgeId: string;
  neighbor: string;
  type: Relation['type'];
  direction: 'incoming' | 'outgoing' | 'symmetric';
  explanation: string;
}

export function buildGraph(project: ProjectContent) {
  const publicTerms = project.terms
    .map(({ data }) => data)
    .filter(isPublicTerm)
    .sort(byId);
  const publicIds = new Set(publicTerms.map((term) => term.id));
  const edges = project.relations
    .filter((relation) => publicIds.has(relation.source) && publicIds.has(relation.target))
    .sort(byId);
  const local: Record<string, LocalRelation[]> = Object.fromEntries(
    publicTerms.map((term) => [term.id, []]),
  );

  for (const edge of edges) {
    if (edge.type === 'comparison') {
      local[edge.source]?.push({
        edgeId: edge.id,
        neighbor: edge.target,
        type: edge.type,
        direction: 'symmetric',
        explanation: edge.explanation,
      });
      local[edge.target]?.push({
        edgeId: edge.id,
        neighbor: edge.source,
        type: edge.type,
        direction: 'symmetric',
        explanation: edge.explanation,
      });
      continue;
    }

    local[edge.source]?.push({
      edgeId: edge.id,
      neighbor: edge.target,
      type: edge.type,
      direction: 'outgoing',
      explanation: edge.explanation,
    });
    local[edge.target]?.push({
      edgeId: edge.id,
      neighbor: edge.source,
      type: edge.type,
      direction: 'incoming',
      explanation: edge.explanation,
    });
  }

  for (const relations of Object.values(local)) {
    relations.sort((left, right) =>
      `${left.type}|${left.neighbor}|${left.edgeId}`.localeCompare(
        `${right.type}|${right.neighbor}|${right.edgeId}`,
        'en',
      ),
    );
  }

  const positions = computeGraphPositions(publicTerms, edges);

  return {
    version: 1,
    nodes: publicTerms.map((term) => ({
      id: term.id,
      label: term.nameZh,
      labelEn: term.nameEn,
      url: `/terms/${term.id}/`,
      summary: term.summary,
      domain: term.domain,
      difficulty: term.difficulty,
      ring: term.ring,
      status: term.status,
      position: positions[term.id] ?? { x: 500, y: 360 },
    })),
    edges,
    local,
  };
}
