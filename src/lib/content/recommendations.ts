import type { ChainStation, Relation, Term } from './schema';

export const RECOMMENDATION_SOURCE_LABELS = {
  chain: '沿认知链路',
  relation: '根据真实关系',
  domain: '同领域兜底',
} as const;

export type RecommendationSource = keyof typeof RECOMMENDATION_SOURCE_LABELS;

const RELATION_LABELS: Record<Relation['type'], string> = {
  prerequisite: '前置概念',
  component: '组成部分',
  comparison: '易混概念',
  application: '实际应用',
};

export interface LearningRecommendationItem {
  termId: string;
  nameZh: string;
  summary: string;
  relationType?: Relation['type'];
  relationLabel?: string;
  explanation?: string;
}

export interface LearningRecommendations {
  source: RecommendationSource;
  sourceLabel: string;
  reason: string;
  items: LearningRecommendationItem[];
}

const roleRank = (role: Term['chainRole']): number =>
  role === 'intro' ? 0 : role === 'core' ? 1 : role === 'advanced' ? 2 : 3;

const sortTerms = (left: Term, right: Term): number =>
  roleRank(left.chainRole) - roleRank(right.chainRole) ||
  Number(right.featured) - Number(left.featured) ||
  right.priority - left.priority ||
  left.nameZh.localeCompare(right.nameZh, 'zh-CN');

const toItem = (term: Term, relation?: Relation): LearningRecommendationItem => ({
  termId: term.id,
  nameZh: term.nameZh,
  summary: term.summary,
  relationType: relation?.type,
  relationLabel: relation ? RELATION_LABELS[relation.type] : undefined,
  explanation: relation?.explanation,
});

/**
 * 为词条页选择唯一的一组“下一步”推荐。
 *
 * 这是有意的三级降级，而不是把所有候选混成一张“相关词条”清单：
 * 1. 有下一站时，沿认知链路继续；
 * 2. 没有下一站时，使用 relations.yml 中的真实语义关系；
 * 3. 前两者都没有时，才用同领域词条兜底。
 *
 * catalog-relations.yml 不参与第二级，因此批量生成的同域邻接不会伪装成语义推荐。
 */
export function getLearningRecommendations(
  current: Term,
  terms: readonly Term[],
  semanticRelations: readonly Relation[],
  chain: readonly ChainStation[],
): LearningRecommendations | undefined {
  const termMap = new Map(terms.map((term) => [term.id, term]));
  const nextStation =
    typeof current.chain === 'number'
      ? [...chain]
          .sort((left, right) => left.order - right.order)
          .find((station) => station.order === current.chain! + 1)
      : undefined;

  if (nextStation) {
    const coreTermIds = new Set(nextStation.coreTerms);
    const nextTerms = terms
      .filter((term) => term.chain === nextStation.order)
      .sort((left, right) => {
        const coreRank = Number(coreTermIds.has(right.id)) - Number(coreTermIds.has(left.id));
        return coreRank || sortTerms(left, right);
      })
      .slice(0, 3);

    if (nextTerms.length > 0) {
      return {
        source: 'chain',
        sourceLabel: RECOMMENDATION_SOURCE_LABELS.chain,
        reason: `你现在在第 ${current.chain} 站，下一站是「${nextStation.nameZh}」：先沿主路径补上这一层。`,
        items: nextTerms.map((term) => toItem(term)),
      };
    }
  }

  const relationItems = semanticRelations
    .filter((relation) => relation.source === current.id || relation.target === current.id)
    .map((relation) => {
      const relatedId = relation.source === current.id ? relation.target : relation.source;
      const relatedTerm = termMap.get(relatedId);
      return relatedTerm ? { term: relatedTerm, relation } : undefined;
    })
    .filter((item): item is { term: Term; relation: Relation } => Boolean(item))
    .sort(
      (left, right) =>
        Number(right.relation.type === 'prerequisite') -
          Number(left.relation.type === 'prerequisite') || sortTerms(left.term, right.term),
    )
    .slice(0, 3);

  if (relationItems.length > 0) {
    return {
      source: 'relation',
      sourceLabel: RECOMMENDATION_SOURCE_LABELS.relation,
      reason: '当前词条没有可继续的下一站，下面按已核验的语义关系给出最有帮助的邻接概念。',
      items: relationItems.map(({ term, relation }) => toItem(term, relation)),
    };
  }

  const domainTerms = terms
    .filter((term) => term.id !== current.id && term.domain === current.domain)
    .sort(sortTerms)
    .slice(0, 3);

  if (domainTerms.length > 0) {
    return {
      source: 'domain',
      sourceLabel: RECOMMENDATION_SOURCE_LABELS.domain,
      reason: '当前词条暂时没有下一站或真实语义关系，先从同一领域的其他入口继续探索。',
      items: domainTerms.map((term) => toItem(term)),
    };
  }

  return undefined;
}
