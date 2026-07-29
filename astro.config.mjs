import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [mdx()],
  output: 'static',
});
