import { loadCaseStudies } from '../src/lib/cases/io';
import { buildCaseNavigation, buildCaseRegistry } from '../src/lib/cases/generate';
import { assertValidCaseStudies } from '../src/lib/cases/validation';
import { loadValidatedProjectContent, writeGeneratedJson } from './lib/project';

const project = await loadValidatedProjectContent();
const cases = await loadCaseStudies();
assertValidCaseStudies(cases, project);

await Promise.all([
  writeGeneratedJson('case-registry.json', buildCaseRegistry(cases)),
  writeGeneratedJson('case-navigation.json', buildCaseNavigation(cases)),
]);

console.log(`Generated case registry and navigation for ${cases.length} case studies.`);
