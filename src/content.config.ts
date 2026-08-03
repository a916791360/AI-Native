import { defineCollection } from 'astro/content/config';
import { glob } from 'astro/loaders';

import { routeSchema, termSchema } from './lib/content/schema';
import { caseStudySchema } from './lib/cases/schema';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/cases' }),
  schema: caseStudySchema,
});

const terms = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/terms' }),
  schema: termSchema,
});

const routes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/routes' }),
  schema: routeSchema,
});

export const collections = { cases, terms, routes };
