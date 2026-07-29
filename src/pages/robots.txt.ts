import type { APIRoute } from 'astro';

import { absoluteSiteUrl, SITE } from '@/config/site';

export const GET: APIRoute = () => {
  const lines = SITE.publicOrigin
    ? [
        'User-agent: *',
        'Allow: /',
        `Sitemap: ${absoluteSiteUrl('/sitemap.xml', SITE.publicOrigin)}`,
      ]
    : ['User-agent: *', 'Disallow: /', '# Set PUBLIC_SITE_URL to enable public indexing.'];

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
