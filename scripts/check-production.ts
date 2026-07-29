import {
  loadContentProductionPlan,
  loadResearchPackets,
  validateContentProduction,
} from '../src/lib/content/production';
import { loadValidatedProjectContent } from './lib/project';

const [plan, packets, project] = await Promise.all([
  loadContentProductionPlan(),
  loadResearchPackets(),
  loadValidatedProjectContent(),
]);
const diagnostics = validateContentProduction(plan, packets, project);

if (diagnostics.length > 0) {
  throw new Error(
    diagnostics.map((item) => `[${item.code}] ${item.filePath}: ${item.message}`).join('\n'),
  );
}

console.log(
  `Content production valid: ${plan.batches.length} batch, ${packets.length} research packets, target ${plan.targetVerified.min}-${plan.targetVerified.max} verified terms.`,
);
