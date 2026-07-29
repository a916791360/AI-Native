import { stringify as stringifyYaml } from 'yaml';

import {
  flattenCatalogCandidates,
  PUBLISHED_CATALOG_BATCHES,
  type CatalogCandidate,
  type CatalogPlan,
  type CatalogSummaries,
} from '../../src/lib/content/catalog';
import type { Relation, Term } from '../../src/lib/content/schema';

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
};

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

export function buildPublishedCatalogTerms(catalog: CatalogPlan, summaries: CatalogSummaries) {
  return flattenCatalogCandidates(catalog)
    .filter((candidate) => PUBLISHED_CATALOG_BATCHES.includes(candidate.batch as 'B' | 'C'))
    .map((candidate) => {
      const variants = variantsFor(catalog, candidate.id);
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
        status: 'catalogued',
        priority: priorityFor(candidate),
        featured: false,
        sources: [],
      };
      return { candidate, data };
    });
}

export function serializeCatalogTerm(term: Term): string {
  return `---\n${stringifyYaml(term, { lineWidth: 0 })}---\n`;
}

export function buildPublishedCatalogRelations(
  catalog: CatalogPlan,
  summaries: CatalogSummaries,
): Relation[] {
  const allCandidates = new Map(
    flattenCatalogCandidates(catalog).map((candidate) => [candidate.id, candidate]),
  );
  return buildPublishedCatalogTerms(catalog, summaries).map(({ candidate }) => {
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
  return stringifyYaml(relations, { lineWidth: 0 });
}
