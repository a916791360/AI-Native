import type { ProjectContent } from '@/lib/content/io';

export interface SiteMetrics {
  domainCount: number;
  coreDomainCount: number;
  termCount: number;
  verifiedTermCount: number;
  routeCount: number;
  publishedRouteCount: number;
  relationCount: number;
  latestVerifiedAt?: string;
}

export function deriveSiteMetrics(project: ProjectContent): SiteMetrics {
  const verifiedDates = project.terms
    .filter(({ data }) => data.status === 'verified')
    .map(({ data }) => data.verifiedAt)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => right.localeCompare(left));

  return {
    domainCount: project.domains.length,
    coreDomainCount: project.domains.filter((domain) => domain.ring === 'core').length,
    termCount: project.terms.length,
    verifiedTermCount: project.terms.filter(({ data }) => data.status === 'verified').length,
    routeCount: project.routes.length,
    publishedRouteCount: project.routes.filter(({ data }) => data.status === 'published').length,
    relationCount: project.relations.length,
    latestVerifiedAt: verifiedDates[0],
  };
}
