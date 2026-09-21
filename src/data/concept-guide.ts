import type { Term } from '@/lib/content/schema';

/**
 * 地图页的「高频概念导航」：
 *
 * 这不是第二套词条分类，也不是把站内所有词条再列一遍。它只挑普通人
 * 在 AI 新闻、产品介绍和实际使用中最容易遇到的一组入口，并说明每个
 * 词条在系统里扮演什么角色。认知链路仍由 chain.yml 唯一负责。
 */
export interface ConceptGuideEntry {
  termId: string;
  layer: string;
  role: string;
  confusion: string;
  exposure: string;
  station?: number;
}

export const CONCEPT_GUIDE: readonly ConceptGuideEntry[] = [
  {
    termId: 'artificial-intelligence',
    layer: '范围层',
    role: '先判断它是不是在说 AI 这个大范围，而不是某一个具体模型或产品。',
    confusion: '人工智能不等于生成式 AI；前者还包含识别、预测、推荐与控制。',
    exposure: '新闻常见',
    station: 1,
  },
  {
    termId: 'generative-ai',
    layer: '内容层',
    role: '生成文本、图片、音频或视频，是普通人最容易直接使用的一层。',
    confusion: '生成式 AI 是能力类别，不是某一个聊天软件或单一模型。',
    exposure: '新闻常见',
    station: 1,
  },
  {
    termId: 'large-language-model',
    layer: '模型层',
    role: '负责理解和生成语言，是聊天、写作、总结等产品的核心引擎。',
    confusion: '大语言模型不是搜索引擎；它能组织答案，但不会天然给出证据。',
    exposure: '产品常见',
    station: 1,
  },
  {
    termId: 'multimodal-ai',
    layer: '模型层',
    role: '让一个系统同时处理文字、图片、声音或视频等不同输入输出。',
    confusion: '多模态说的是处理的信息类型，不等于模型一定更聪明或更可靠。',
    exposure: '产品常见',
    station: 1,
  },
  {
    termId: 'image-generation',
    layer: '内容层',
    role: '根据文字或参考图生成新图片，常见于设计、营销和内容创作产品。',
    confusion: '图像生成不是图片搜索；它是在生成新结果，不保证事实或版权边界。',
    exposure: '产品常见',
    station: 1,
  },
  {
    termId: 'video-generation',
    layer: '内容层',
    role: '根据文字、图片或视频生成连续画面，重点还包括时间一致性。',
    confusion: '视频生成不是简单的图片拼接；人物、动作和镜头连续性都可能出错。',
    exposure: '新闻常见',
    station: 1,
  },
  {
    termId: 'hallucination',
    layer: '可靠性层',
    role: '识别 AI 为什么会把不确定的内容说得像真的，建立核验意识。',
    confusion: '幻觉不是语气问题；回答越流畅，越不能替代事实核查。',
    exposure: '使用必遇',
    station: 1,
  },
  {
    termId: 'prompt',
    layer: '交互层',
    role: '用问题、背景、限制和示例把想让 AI 完成的任务说清楚。',
    confusion: '提示词不是一句神奇咒语；任务、上下文和验收标准同样重要。',
    exposure: '使用必遇',
    station: 2,
  },
  {
    termId: 'context-engineering',
    layer: '交互层',
    role: '组织指令、资料、历史和工具结果，让模型拿到真正需要的信息。',
    confusion: '上下文工程比单纯改一句提示词更宽，涉及信息的选择和更新。',
    exposure: '工作常见',
    station: 2,
  },
  {
    termId: 'long-context',
    layer: '交互层',
    role: '描述模型一次能处理多长的材料，常出现在模型能力对比和产品宣传里。',
    confusion: '上下文更长不代表每一处信息都能被同样准确地利用。',
    exposure: '新闻常见',
    station: 2,
  },
  {
    termId: 'retrieval-augmented-generation',
    layer: '知识层',
    role: '回答前先查外部资料，常用于企业知识库、客服和资料问答。',
    confusion: 'RAG 是把证据放进上下文，不是重新训练模型，也不能保证资料本身正确。',
    exposure: '工作常见',
    station: 3,
  },
  {
    termId: 'fine-tuning',
    layer: '模型层',
    role: '用特定数据继续训练模型，让它适应某类任务、风格或行为要求。',
    confusion: '微调主要改变模型行为和倾向，不等于给模型接上实时知识库。',
    exposure: '新闻常见',
  },
  {
    termId: 'ai-agent',
    layer: '行动层',
    role: '让 AI 不只给答案，还能规划步骤、调用工具并根据结果继续行动。',
    confusion: 'Agent 不是更会聊天的机器人；关键区别在于它能否代表你执行动作。',
    exposure: '新闻常见',
    station: 4,
  },
  {
    termId: 'tool-use',
    layer: '行动层',
    role: '模型选择计算器、搜索、文件或业务系统等外部工具完成任务。',
    confusion: '工具调用只说明模型能发起请求，不代表工具权限和结果已经安全。',
    exposure: '产品常见',
    station: 4,
  },
  {
    termId: 'function-calling',
    layer: '接口层',
    role: '用结构化参数把模型的意图交给应用执行，是工具调用常见的技术机制。',
    confusion: '函数调用是应用层调用格式，和 MCP 这种跨系统接入协议不是同一层。',
    exposure: '产品常见',
    station: 5,
  },
  {
    termId: 'model-context-protocol',
    layer: '接口层',
    role: '把模型接外部工具和数据的方式标准化，减少每个系统重复对接。',
    confusion: 'MCP 解决的是接入协议，不是模型本身，也不是一套自动化工作流。',
    exposure: '新闻常见',
    station: 5,
  },
  {
    termId: 'langchain',
    layer: '实现层',
    role: '用代码把模型、提示、工具和流程编排起来的常见框架。',
    confusion: 'LangChain 是实现框架，不是 MCP，也不是一个模型或独立的 Agent。',
    exposure: '新闻常见',
    station: 6,
  },
  {
    termId: 'agent-skills',
    layer: '流程层',
    role: '把一套稳定的做法、资料和输出要求沉淀成可复用模块。',
    confusion: 'Skill 更像可复用的做事说明书，不等于模型能力升级或工具权限。',
    exposure: '工作常见',
    station: 6,
  },
  {
    termId: 'workflow-automation',
    layer: '流程层',
    role: '把明确、重复、可检查的业务步骤交给规则和工具自动执行。',
    confusion: '工作流按预先定义的路径走，Agent 则可能根据状态动态决定下一步。',
    exposure: '工作常见',
    station: 6,
  },
  {
    termId: 'evaluation',
    layer: '判断层',
    role: '用样本和标准判断一次改动到底有没有让系统变好。',
    confusion: '演示效果好不等于评估通过；评估需要可复现的题目、标准和记录。',
    exposure: '工作常见',
    station: 7,
  },
  {
    termId: 'prompt-injection',
    layer: '安全层',
    role: '识别不可信内容如何诱导模型覆盖原指令、泄露信息或越权操作。',
    confusion: '提示词注入不是普通提示词写错，而是输入内容试图改变控制边界。',
    exposure: '新闻常见',
    station: 8,
  },
  {
    termId: 'ai-safety',
    layer: '安全层',
    role: '从伤害、失控、滥用和人工介入等角度判断 AI 系统的风险边界。',
    confusion: 'AI 安全不只是一层关键词过滤，还包括权限、监督、评估和应急退出。',
    exposure: '新闻常见',
    station: 8,
  },
];

export function buildConceptGuide(
  terms: readonly Term[],
): Array<ConceptGuideEntry & { term: Term }> {
  const termMap = new Map(terms.map((term) => [term.id, term]));
  return CONCEPT_GUIDE.flatMap((entry) => {
    const term = termMap.get(entry.termId);
    return term ? [{ ...entry, term }] : [];
  });
}
