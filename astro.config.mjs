import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://np.aiready.vip',
  devToolbar: { enabled: false },
  integrations: [mdx()],
  output: 'static',
});
