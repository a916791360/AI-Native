import type { ProjectContent } from '@/lib/content/io';
// 相对路径而不是 @/ 别名：vitest 不读 tsconfig 的 paths，值导入用别名会解析失败
// （类型导入会被擦除，所以这里以前没有暴露出这个问题）。
import { isDeprecatedTerm, isSelectableTerm } from '../content/visibility';

export interface SiteMetrics {
  domainCount: number;
  coreDomainCount: number;
  termCount: number;
  /** 已废弃词条数：它们不再是入口，但站点对外说明「收了口径」时需要这个数。 */
  deprecatedTermCount: number;
  verifiedTermCount: number;
  routeCount: number;
  publishedRouteCount: number;
  relationCount: number;
  latestVerifiedAt?: string;
}

export function deriveSiteMetrics(project: ProjectContent): SiteMetrics {
  const publicTerms = project.terms.filter(({ data }) => isSelectableTerm(data));
  const publicTermIds = new Set(publicTerms.map(({ data }) => data.id));
  const verifiedDates = project.terms
    .filter(({ data }) => data.status === 'verified')
    .map(({ data }) => data.verifiedAt)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => right.localeCompare(left));

  return {
    domainCount: project.domains.length,
    coreDomainCount: project.domains.filter((domain) => domain.ring === 'core').length,
    termCount: publicTerms.length,
    deprecatedTermCount: project.terms.filter(({ data }) => isDeprecatedTerm(data)).length,
    verifiedTermCount: project.terms.filter(
      ({ data }) => data.status === 'verified' && isSelectableTerm(data),
    ).length,
    routeCount: project.routes.length,
    publishedRouteCount: project.routes.filter(({ data }) => data.status === 'published').length,
    relationCount: project.relations.filter(
      ({ source, target }) => publicTermIds.has(source) && publicTermIds.has(target),
    ).length,
    latestVerifiedAt: verifiedDates[0],
  };
}
