import type { APIRoute } from 'astro';

import { absoluteSiteUrl, SITE } from '@/config/site';
import { loadProjectContent } from '@/lib/content/io';

const STATIC_PATHS = ['/', '/atlas/', '/routes/', '/graph/', '/methodology/', '/search/'] as const;

export const GET: APIRoute = async () => {
  const project = await loadProjectContent();
  const paths = [
    ...STATIC_PATHS,
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
