import { defineCollection } from 'astro/content/config';
import { glob } from 'astro/loaders';

import { routeSchema, termSchema } from './lib/content/schema';

const terms = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/terms' }),
  schema: termSchema,
});

const routes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/routes' }),
  schema: routeSchema,
});

export const collections = { terms, routes };
