import type { APIRoute } from 'astro';

import { absoluteSiteUrl, SITE } from '@/config/site';
import { loadCaseStudies } from '@/lib/cases/io';
import { caseHref, gateHref } from '@/lib/cases/presentation';
import { loadProjectContent } from '@/lib/content/io';

const STATIC_PATHS = [
  '/',
  '/learn/',
  '/learn/questions/',
  '/atlas/',
  '/routes/',
  '/graph/',
  '/methodology/',
  '/search/',
] as const;

export const GET: APIRoute = async () => {
  const [project, cases] = await Promise.all([loadProjectContent(), loadCaseStudies()]);
  const paths = [
    ...STATIC_PATHS,
    ...cases.flatMap(({ data }) => [
      caseHref(data.id),
      ...data.gates.map((gate) => gateHref(data.id, gate.id)),
    ]),
    ...project.routes.map(({ data }) => `/routes/${data.id}/`),
    ...project.terms
      .filter(({ data }) => data.status !== 'draft')
      .map(({ data }) => `/terms/${data.id}/`),
  ];
  const urls = SITE.publicOrigin
    ? paths
        .map((path) => `  <url><loc>${absoluteSiteUrl(path, SITE.publicOrigin!)}</loc></url>`)
        .join('\n')
    : '';
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
