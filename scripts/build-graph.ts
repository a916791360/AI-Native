import { buildGraph } from './lib/generate';
import { loadValidatedProjectContent, writeGeneratedJson } from './lib/project';

const project = await loadValidatedProjectContent();
const graph = buildGraph(project);
await writeGeneratedJson('graph.json', graph);

console.log(`Generated graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges.`);
