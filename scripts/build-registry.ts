import { buildTermRegistry } from './lib/generate';
import { loadValidatedProjectContent, writeGeneratedJson } from './lib/project';

const project = await loadValidatedProjectContent();
const registry = buildTermRegistry(project);
await writeGeneratedJson('term-registry.json', registry);

console.log(`Generated term registry with ${registry.terms.length} public terms.`);
