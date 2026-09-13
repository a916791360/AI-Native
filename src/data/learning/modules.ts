import type { LearningModule } from './types';

/**
 * 六个阶段是主题轴，三层递进是深度轴。
 * 每一层都会把这六个阶段完整走一遍，所以阶段顺序不变、每层的题目形态变深。
 */
export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'model-boundaries',
    index: '01',
    title: 'AI 基础与模型边界',
    summary: '先理解 AI 能做什么、不能保证什么，再讨论产品功能。',
    decision: '这个问题是否真的需要 AI？',
    outcome: '识别生成、规则与模型边界',
    accent: 'prerequisite',
    reading: { href: '/routes/ai-foundations/', label: 'AI 零基础入门' },
  },
  {
    id: 'opportunity-judgment',
    index: '02',
    title: '场景与机会判断',
    summary: '从用户价值、数据条件和错误成本判断一个机会是否成立。',
    decision: '这个机会值得做、能够做吗？',
    outcome: '建立场景筛选标准',
    accent: 'component',
    reading: { href: '/routes/ai-product-scenario-judgment/', label: 'AI 产品与场景判断' },
  },
  {
    id: 'solution-choice',
    index: '03',
    title: '方案选择',
    summary: '比较 Prompt、RAG、工作流、Agent 与微调的适用边界。',
    decision: '哪种方案最小、可靠且可验证？',
    outcome: '做出有依据的技术取舍',
    accent: 'application',
    reading: { href: '/routes/rag-from-zero/', label: 'RAG 从零到应用' },
  },
  {
    id: 'product-experience',
    index: '04',
    title: 'AI 产品体验',
    summary: '设计控制、解释、恢复与人工介入，让用户能正确使用不确定系统。',
    decision: '人和 AI 分别在什么时候做决定？',
    outcome: '形成可靠的人机协作体验',
    accent: 'component',
    reading: { href: '/routes/human-ai-collaboration/', label: '高效人机协作' },
  },
  {
    id: 'quality-constraints',
    index: '05',
    title: '质量与商业约束',
    summary: '用评估、延迟、成本和护栏判断产品能否长期运行。',
    decision: '怎样证明它长期可用且值得运行？',
    outcome: '建立上线与运营门槛',
    accent: 'comparison',
    reading: { href: '/terms/evaluation/', label: '从“评估”开始阅读' },
  },
  {
    id: 'capstone',
    index: '06',
    title: '综合产品项目',
    summary: '把机会、方案、体验和质量约束放进完整业务情境中判断。',
    decision: '这份方案能否经得住业务与技术评审？',
    outcome: '完成端到端产品判断',
    accent: 'prerequisite',
    reading: { href: '/routes/ai-pm-career/', label: '转岗 AI 产品经理' },
  },
];

export function getLearningModule(id: string): LearningModule | undefined {
  return LEARNING_MODULES.find((module) => module.id === id);
}
