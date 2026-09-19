import { loadValidatedProjectContent } from './lib/project';
import { loadCaseStudies } from '../src/lib/cases/io';
import { assertValidCaseStudies } from '../src/lib/cases/validation';

const project = await loadValidatedProjectContent();
const cases = await loadCaseStudies();
assertValidCaseStudies(cases, project);

console.log(
  `Content valid: ${project.domains.length} domains, ${project.chain.length} chain stations, ${project.terms.length} terms, ${project.relations.length} relations, ${project.routes.length} routes, ${cases.length} cases.`,
);
