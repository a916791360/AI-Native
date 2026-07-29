import { loadValidatedProjectContent } from './lib/project';

const project = await loadValidatedProjectContent();

console.log(
  `Content valid: ${project.domains.length} domains, ${project.terms.length} terms, ${project.relations.length} relations, ${project.routes.length} routes.`,
);
