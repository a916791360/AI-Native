export interface LearningReference {
  id: string;
  label: string;
}

export type LearningAssessment = 'recommended' | 'conditional' | 'risky';

export interface LearningOption {
  id: string;
  label: string;
  assessment: LearningAssessment;
  feedback: string;
}

export interface LearningQuestion {
  id: string;
  index: string;
  moduleId: string;
  shortTitle: string;
  question: string;
  scenario: string;
  facts: string[];
  options: LearningOption[];
  principle: string;
  checks: string[];
  references: LearningReference[];
}

export interface LearningModule {
  id: string;
  index: string;
  title: string;
  summary: string;
  decision: string;
  outcome: string;
  accent: 'prerequisite' | 'component' | 'comparison' | 'application';
  reading: { href: string; label: string };
}

export interface LearningQuestionContext {
  question: LearningQuestion;
  module: LearningModule;
  moduleQuestions: LearningQuestion[];
  modulePosition: number;
  previous?: LearningQuestion;
  next?: LearningQuestion;
  nextModule?: LearningModule;
  isModuleStart: boolean;
  isModuleEnd: boolean;
}

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
    reading: { href: '/learn/questions/q21-support-rag/', label: '进入综合题' },
  },
];

export const LEARNING_QUESTIONS: LearningQuestion[] = [
  {
    id: 'q01-rules-or-ai',
    index: '01',
    moduleId: 'model-boundaries',
    shortTitle: '规则还是 AI',
    question: '发票金额校验，需要上大模型吗？',
    scenario: '财务希望自动检查发票总额是否等于各明细项之和，字段结构固定，计算规则明确。',
    facts: ['输入是结构化数字', '正确结果可以精确计算', '错误会阻塞报销'],
    options: [
      {
        id: 'a',
        label: '使用确定性规则计算并校验',
        assessment: 'recommended',
        feedback:
          '这是可精确描述的数学规则。普通代码更便宜、可解释，也能保证同样输入得到同样结果。',
      },
      {
        id: 'b',
        label: '让大模型读取发票后判断',
        assessment: 'risky',
        feedback:
          '大模型会增加延迟、成本与不确定性，却没有带来必要能力。这里不应为了“智能”牺牲确定性。',
      },
      {
        id: 'c',
        label: '先微调一个财务专用模型',
        assessment: 'risky',
        feedback: '微调不能替代明确的计算逻辑，还会引入数据、训练和版本维护成本。',
      },
    ],
    principle: '能被稳定规则完整描述的问题，优先使用确定性系统。',
    checks: ['结果是否能精确计算', '同一输入是否必须始终同一输出', 'AI 是否带来规则无法提供的能力'],
    references: [
      { id: 'artificial-intelligence', label: '人工智能' },
      { id: 'ai-capability-boundary', label: 'AI 能力边界' },
    ],
  },
  {
    id: 'q02-classify-or-generate',
    index: '02',
    moduleId: 'model-boundaries',
    shortTitle: '分类还是生成',
    question: '识别投诉类型，应该让模型自由写答案吗？',
    scenario: '客服团队要把来信分到退款、物流、质量和其他四类，后续流程由类别触发。',
    facts: ['类别集合稳定', '下游只需要一个类别', '原始语言表达很多样'],
    options: [
      {
        id: 'a',
        label: '要求模型输出固定类别与置信信息',
        assessment: 'recommended',
        feedback: '输入需要语义理解，但输出空间明确。受约束的分类比自由生成更适合接入稳定流程。',
      },
      {
        id: 'b',
        label: '让模型自由总结，再由员工判断类别',
        assessment: 'conditional',
        feedback: '总结可能辅助阅读，但没有直接解决自动分流目标，并把结构化判断重新交还给人。',
      },
      {
        id: 'c',
        label: '让模型自由生成类别名称',
        assessment: 'risky',
        feedback: '自由类别会产生同义词和新标签，让下游规则难以可靠执行。',
      },
    ],
    principle: '先定义产品所需的最小输出，再决定是否允许生成。',
    checks: ['输出空间是否固定', '下游系统需要文本还是标签', '是否需要拒答或其他类别'],
    references: [
      { id: 'classification', label: '分类' },
      { id: 'structured-output', label: '结构化输出' },
    ],
  },
  {
    id: 'q03-context-limit',
    index: '03',
    moduleId: 'model-boundaries',
    shortTitle: '上下文边界',
    question: '把公司全部文档一次塞给模型，能得到更完整的答案吗？',
    scenario: '团队有数千份制度文档，准备在每次提问时把全部正文拼进提示词。',
    facts: ['文档仍在持续增长', '问题通常只涉及少量段落', '答案必须标出来源'],
    options: [
      {
        id: 'a',
        label: '先检索相关片段，再让模型回答',
        assessment: 'recommended',
        feedback: '检索可以缩小上下文、保留来源，并让成本随相关证据而不是全部文档增长。',
      },
      {
        id: 'b',
        label: '尽量购买上下文最大的模型',
        assessment: 'conditional',
        feedback: '更大窗口能缓解部分限制，但不能解决相关性、引用和文档持续增长的问题。',
      },
      {
        id: 'c',
        label: '把全部文档持续拼接进提示词',
        assessment: 'risky',
        feedback: '超长上下文会提高成本与延迟，且更多文字不等于模型能稳定找到正确证据。',
      },
    ],
    principle: '上下文容量不是知识管理方案；相关证据的选择比输入总量更重要。',
    checks: ['信息是否超过上下文窗口', '是否需要来源追溯', '能否先缩小候选证据'],
    references: [
      { id: 'context-window', label: '上下文窗口' },
      { id: 'token', label: 'Token' },
      { id: 'retrieval-augmented-generation', label: 'RAG' },
    ],
  },
  {
    id: 'q04-high-stakes-answer',
    index: '04',
    moduleId: 'model-boundaries',
    shortTitle: '高风险回答',
    question: '医疗问答效果不错，可以直接给出诊断吗？',
    scenario: '内部测试中，模型对常见症状回答流畅，但没有稳定的引用和不确定性校准。',
    facts: ['错误可能影响就医决定', '流畅不代表事实正确', '用户可能把回答当作专业结论'],
    options: [
      {
        id: 'a',
        label: '限定为信息辅助，并明确转专业人员',
        assessment: 'recommended',
        feedback:
          '高风险场景应收窄任务、展示边界并提供人工升级路径，不能把语言流畅度当作安全证明。',
      },
      {
        id: 'b',
        label: '先小范围开放自动诊断',
        assessment: 'risky',
        feedback: '小范围并不会降低单次错误的伤害，且当前缺少证据链、评估和责任边界。',
      },
      {
        id: 'c',
        label: '增加“仅供参考”免责声明后上线',
        assessment: 'risky',
        feedback: '免责声明不能替代产品约束。用户仍可能依赖具体结论，系统也没有降低错误发生率。',
      },
    ],
    principle: '任务风险越高，模型权限越小，人工监督和证据要求越强。',
    checks: ['错误后果是否可逆', '用户会不会过度信任输出', '是否有可靠的人工升级路径'],
    references: [
      { id: 'hallucination', label: '幻觉' },
      { id: 'human-oversight', label: '人工监督' },
      { id: 'human-escalation', label: '人工升级' },
    ],
  },
  {
    id: 'q05-demo-or-value',
    index: '05',
    moduleId: 'opportunity-judgment',
    shortTitle: '演示还是价值',
    question: '会议纪要生成得很漂亮，就值得做成产品吗？',
    scenario: '原型能输出结构清晰的纪要，但团队还不知道用户会用它完成什么后续任务。',
    facts: ['演示反馈很好', '没有真实使用频率数据', '当前纪要已有人工模板'],
    options: [
      {
        id: 'a',
        label: '先验证纪要是否改善具体后续任务',
        assessment: 'recommended',
        feedback: '产品价值不在文本看起来多好，而在是否减少遗漏、加快分工或提高决策质量。',
      },
      {
        id: 'b',
        label: '先上线，再观察有没有人使用',
        assessment: 'conditional',
        feedback: '可用小实验验证，但在没有成功行为定义时，“有人打开”仍无法证明价值。',
      },
      {
        id: 'c',
        label: '生成质量高就说明需求成立',
        assessment: 'risky',
        feedback: '技术效果与用户价值是两件事。漂亮输出可能只是演示吸引力。',
      },
    ],
    principle: 'AI 能生成什么不是机会定义；用户因此完成什么才是。',
    checks: ['目标用户和高频任务是否明确', '是否改善可观察的行为', '现有替代方案是否已足够'],
    references: [
      { id: 'ai-use-case', label: 'AI 用例' },
      { id: 'problem-solution-fit', label: '问题方案匹配' },
    ],
  },
  {
    id: 'q06-data-readiness',
    index: '06',
    moduleId: 'opportunity-judgment',
    shortTitle: '数据是否可用',
    question: '历史工单很多，就代表训练条件成熟吗？',
    scenario: '公司积累了百万条工单，但标签口径多次变化，敏感信息也没有清理。',
    facts: ['数量很大', '标签含义不一致', '包含客户隐私'],
    options: [
      {
        id: 'a',
        label: '先审计口径、质量、权限与代表性',
        assessment: 'recommended',
        feedback: '数据量不能掩盖定义漂移、偏差与合规问题。先判断数据能否支持目标任务。',
      },
      {
        id: 'b',
        label: '先用全部数据训练，再看效果',
        assessment: 'risky',
        feedback: '脏标签和敏感数据会把问题带入模型，事后修正通常更昂贵。',
      },
      {
        id: 'c',
        label: '只随机抽一小批人工标注',
        assessment: 'conditional',
        feedback: '小批标注适合探索，但仍需确认样本覆盖真实分布，并建立一致口径。',
      },
    ],
    principle: '数据准备度由质量、权限和任务匹配决定，不由行数决定。',
    checks: ['标签定义是否一致', '数据是否覆盖真实场景', '使用权限与隐私是否明确'],
    references: [
      { id: 'training-data', label: '训练数据' },
      { id: 'evaluation', label: '评估' },
    ],
  },
  {
    id: 'q07-error-cost',
    index: '07',
    moduleId: 'opportunity-judgment',
    shortTitle: '错误成本',
    question: '同样 90% 准确率，两个场景的价值一样吗？',
    scenario: '模型 A 推荐内部文章，模型 B 决定是否冻结客户账户；离线准确率都是 90%。',
    facts: ['A 的错误只是推荐不相关', 'B 的错误会中断客户业务', '准确率没有区分错误类型'],
    options: [
      {
        id: 'a',
        label: '分别评估错误类型、后果和恢复成本',
        assessment: 'recommended',
        feedback: '相同准确率可能对应完全不同的产品风险。指标必须映射到具体错误和业务后果。',
      },
      {
        id: 'b',
        label: '都达到 90%，可以同样上线',
        assessment: 'risky',
        feedback: '聚合准确率隐藏了误伤与漏判。高影响决策需要更严格门槛和人工确认。',
      },
      {
        id: 'c',
        label: '只把 B 的目标提高到 95%',
        assessment: 'conditional',
        feedback: '提高数字可能有帮助，但仍需区分错误类型，并设计拦截和恢复路径。',
      },
    ],
    principle: '质量指标只有与错误后果绑定，才具有产品意义。',
    checks: ['最严重的错误是什么', '错误能否被发现和撤销', '指标是否区分误报与漏报'],
    references: [
      { id: 'evaluation', label: '评估' },
      { id: 'human-in-the-loop', label: '人在回路' },
    ],
  },
  {
    id: 'q08-automation-fit',
    index: '08',
    moduleId: 'opportunity-judgment',
    shortTitle: '自动化边界',
    question: '员工重复复制资料，应该直接做 Agent 吗？',
    scenario: '运营每天把一个系统的固定字段复制到另一个系统，步骤稳定，没有语义判断。',
    facts: ['流程稳定', '字段映射固定', '两个系统都有 API'],
    options: [
      {
        id: 'a',
        label: '先做普通工作流自动化',
        assessment: 'recommended',
        feedback: '稳定、固定、可调用 API 的流程不需要 Agent 推理。工作流更容易测试和审计。',
      },
      {
        id: 'b',
        label: '让 Agent 自主操作两个系统',
        assessment: 'risky',
        feedback: 'Agent 增加了决策自由度，也增加误操作和维护成本，却没有必要的语义任务。',
      },
      {
        id: 'c',
        label: '让模型生成复制脚本供人执行',
        assessment: 'conditional',
        feedback: '可辅助一次性开发，但产品运行时仍应采用确定性的集成与校验。',
      },
    ],
    principle: '自动化不等于智能体；只有任务需要动态判断时才增加自主性。',
    checks: ['步骤是否稳定可枚举', '异常是否需要语义判断', '更高自主性是否创造额外价值'],
    references: [
      { id: 'workflow-automation', label: '工作流自动化' },
      { id: 'ai-agent', label: 'AI Agent' },
    ],
  },
  {
    id: 'q09-prompt-or-rag',
    index: '09',
    moduleId: 'solution-choice',
    shortTitle: 'Prompt 还是 RAG',
    question: '回答最新公司政策，只优化 Prompt 够吗？',
    scenario: '政策每周更新，模型预训练时不可能知道内部内容，答案还必须引用原文。',
    facts: ['知识是私有且动态的', '需要来源引用', '问题范围相对明确'],
    options: [
      {
        id: 'a',
        label: '建设可更新、可引用的检索增强流程',
        assessment: 'recommended',
        feedback: 'RAG 把动态私有知识作为运行时证据，适合回答需要更新与追溯的问题。',
      },
      {
        id: 'b',
        label: '继续优化系统 Prompt',
        assessment: 'risky',
        feedback: 'Prompt 可以约束行为，却不能让模型获得没有输入的新政策内容。',
      },
      {
        id: 'c',
        label: '每周重新微调模型',
        assessment: 'risky',
        feedback: '频繁微调昂贵且难追溯，仍不能自然提供逐条来源。',
      },
    ],
    principle: 'Prompt 约束行为，RAG 提供运行时知识；不要混淆两者职责。',
    checks: ['知识是否私有或频繁更新', '是否需要逐条引用', '检索结果能否被评估'],
    references: [
      { id: 'prompt', label: 'Prompt' },
      { id: 'retrieval-augmented-generation', label: 'RAG' },
      { id: 'semantic-search', label: '语义搜索' },
    ],
  },
  {
    id: 'q10-workflow-or-agent',
    index: '10',
    moduleId: 'solution-choice',
    shortTitle: '工作流还是 Agent',
    question: '旅行改签流程，需要全自主 Agent 吗？',
    scenario: '系统要查询政策、比较航班、计算差价并提交改签，其中支付和最终确认影响用户权益。',
    facts: ['步骤大致可预测', '查询结果动态变化', '支付不可随意执行'],
    options: [
      {
        id: 'a',
        label: '确定性流程编排，局部使用模型并设确认点',
        assessment: 'recommended',
        feedback: '已知步骤适合工作流，模型可处理政策理解和方案解释；支付与提交必须明确确认。',
      },
      {
        id: 'b',
        label: '让 Agent 自主决定并完成全部操作',
        assessment: 'risky',
        feedback: '全自主会把不可逆动作交给不确定系统，失败边界和责任都不清楚。',
      },
      {
        id: 'c',
        label: '全部交给人工，不使用任何模型',
        assessment: 'conditional',
        feedback: '风险最低，但放弃了政策检索、比较和解释环节可获得的效率。',
      },
    ],
    principle: '自主性应按任务不确定性逐步增加，不应按技术热度一次拉满。',
    checks: ['哪些步骤可预测', '哪些动作不可逆', '每个模型判断后谁拥有控制权'],
    references: [
      { id: 'workflow-automation', label: '工作流自动化' },
      { id: 'ai-agent', label: 'AI Agent' },
      { id: 'tool-use', label: '工具调用' },
    ],
  },
  {
    id: 'q11-fine-tuning',
    index: '11',
    moduleId: 'solution-choice',
    shortTitle: '何时微调',
    question: '模型语气不统一，第一步应该微调吗？',
    scenario: '品牌客服希望回答更简洁、语气一致，但目前只有二十条示例，也没有稳定评测集。',
    facts: ['问题主要是输出风格', '示例数据很少', '质量标准尚未量化'],
    options: [
      {
        id: 'a',
        label: '先用明确 Prompt、示例和评测验证',
        assessment: 'recommended',
        feedback: '风格问题通常应先用低成本方法建立基线。没有评测集时也无法证明微调收益。',
      },
      {
        id: 'b',
        label: '立即收集数据并微调',
        assessment: 'conditional',
        feedback: '当提示优化达到瓶颈且有足够高质量样本后可考虑，但现在时机过早。',
      },
      {
        id: 'c',
        label: '更换最大参数模型即可',
        assessment: 'risky',
        feedback: '更大模型不保证更符合品牌规范，也没有解决标准和评测缺失。',
      },
    ],
    principle: '先建立可测基线，再用更重的技术解决已被证明的问题。',
    checks: ['Prompt 和示例是否已到瓶颈', '是否有足够高质量数据', '是否能量化微调收益'],
    references: [
      { id: 'fine-tuning', label: '微调' },
      { id: 'prompt', label: 'Prompt' },
      { id: 'eval-set', label: '评测集' },
    ],
  },
  {
    id: 'q12-search-or-generation',
    index: '12',
    moduleId: 'solution-choice',
    shortTitle: '搜索还是生成',
    question: '查找合同原文，应该先生成一段摘要吗？',
    scenario: '法务用户输入条款主题，首要目标是快速定位所有相关原文，不允许遗漏关键段落。',
    facts: ['目标是找全证据', '摘要可能隐藏细节', '用户会自行阅读原文'],
    options: [
      {
        id: 'a',
        label: '优先优化检索召回并展示原文',
        assessment: 'recommended',
        feedback: '用户任务是找全证据。先解决检索覆盖，再把摘要作为可选辅助，而不是替代结果。',
      },
      {
        id: 'b',
        label: '只生成一段综合摘要',
        assessment: 'risky',
        feedback: '摘要可能遗漏、合并或改写关键条款，无法满足完整证据需求。',
      },
      {
        id: 'c',
        label: '检索后默认生成摘要，并隐藏原文',
        assessment: 'risky',
        feedback: '加入检索仍不等于可以隐藏证据。高风险阅读需要原文可见和可定位。',
      },
    ],
    principle: '先匹配用户任务：找证据时，生成不能替代检索与原文。',
    checks: ['用户要答案还是证据集合', '遗漏比冗余更危险吗', '原文是否始终可访问'],
    references: [
      { id: 'semantic-search', label: '语义搜索' },
      { id: 'retrieval-recall', label: '检索召回率' },
    ],
  },
  {
    id: 'q13-user-control',
    index: '13',
    moduleId: 'product-experience',
    shortTitle: '用户控制',
    question: 'AI 改写邮件后，应该直接覆盖原稿吗？',
    scenario: '用户希望快速优化邮件语气，但原文包含重要承诺，模型改写可能改变含义。',
    facts: ['改写结果不完全可预测', '原稿有业务价值', '用户需要快速比较'],
    options: [
      {
        id: 'a',
        label: '并排预览差异，由用户确认替换',
        assessment: 'recommended',
        feedback: '预览和确认保留用户控制，也让语义变化更容易被发现。',
      },
      {
        id: 'b',
        label: '自动覆盖，并提供撤销',
        assessment: 'conditional',
        feedback: '撤销降低了风险，但用户仍可能在未察觉变化时直接发送；关键文本更适合先确认。',
      },
      {
        id: 'c',
        label: '自动覆盖且不保留原稿',
        assessment: 'risky',
        feedback: '用户无法比较或恢复，不确定输出会直接破坏已有工作。',
      },
    ],
    principle: '模型修改用户资产前，应让变化可见、可比较、可拒绝。',
    checks: ['操作是否改变用户原始内容', '差异是否容易发现', '用户能否拒绝或恢复'],
    references: [
      { id: 'user-control', label: '用户控制' },
      { id: 'undo-action', label: '撤销操作' },
    ],
  },
  {
    id: 'q14-uncertainty',
    index: '14',
    moduleId: 'product-experience',
    shortTitle: '表达不确定性',
    question: '模型不确定时，只显示一个置信度百分比够吗？',
    scenario:
      '知识助手准备在每个答案旁显示“置信度 82%”，但用户不知道数字如何计算，也不知道下一步做什么。',
    facts: ['数字未经校准', '用户无法解释 82%', '部分答案缺少可靠来源'],
    options: [
      {
        id: 'a',
        label: '展示证据状态、缺口和可执行下一步',
        assessment: 'recommended',
        feedback:
          '用户需要知道哪里不确定、为什么，以及可以核查来源还是转人工，而不只是看到神秘数字。',
      },
      {
        id: 'b',
        label: '保留百分比并加颜色',
        assessment: 'conditional',
        feedback: '颜色改善扫描，但如果数字不可信、没有行动含义，仍可能制造虚假精确感。',
      },
      {
        id: 'c',
        label: '只显示模型内部置信度',
        assessment: 'risky',
        feedback: '未经校准的分数容易被误解为事实正确概率，可能反而诱导过度信任。',
      },
    ],
    principle: '不确定性设计的目标是帮助行动，不是展示一个看似科学的数字。',
    checks: ['信号是否经过校准', '用户能否理解原因', '界面是否给出核查或升级动作'],
    references: [
      { id: 'uncertainty-display', label: '不确定性呈现' },
      { id: 'human-escalation', label: '人工升级' },
    ],
  },
  {
    id: 'q15-human-escalation',
    index: '15',
    moduleId: 'product-experience',
    shortTitle: '人工介入',
    question: '客服机器人连续答错，转人工入口应该藏在菜单里吗？',
    scenario: '用户已经两次表示答案无关，机器人仍继续生成类似回复，转人工入口位于三级菜单。',
    facts: ['系统已有明显失败信号', '用户目标尚未完成', '继续对话会增加挫败感'],
    options: [
      {
        id: 'a',
        label: '主动提供转人工，并携带已有上下文',
        assessment: 'recommended',
        feedback: '系统已识别失败，应减少用户重复劳动，让人工接管成为主路径而不是隐藏退路。',
      },
      {
        id: 'b',
        label: '再让机器人尝试三次',
        assessment: 'risky',
        feedback: '固定重试忽视了已有失败信号，会增加时间成本并削弱信任。',
      },
      {
        id: 'c',
        label: '保持菜单入口，避免人工量增加',
        assessment: 'risky',
        feedback: '把运营成本转嫁给失败中的用户，会损害任务完成率和长期信任。',
      },
    ],
    principle: '当系统已知自己失败时，升级路径必须及时、明显且不丢上下文。',
    checks: ['什么信号代表 AI 已失败', '用户是否要重复描述问题', '人工接管是否可被快速找到'],
    references: [
      { id: 'human-escalation', label: '人工升级' },
      { id: 'fallback-experience', label: '降级体验' },
    ],
  },
  {
    id: 'q16-recovery',
    index: '16',
    moduleId: 'product-experience',
    shortTitle: '错误恢复',
    question: 'Agent 批量改错了任务状态，怎样恢复才算合格？',
    scenario: '项目 Agent 把 40 个任务标成已完成。系统留下操作日志，但只能逐条手工改回。',
    facts: ['影响范围大', '动作已发生', '日志能确定变更集合'],
    options: [
      {
        id: 'a',
        label: '提供批次预览、确认与一键撤销',
        assessment: 'recommended',
        feedback: '批量动作需要批量级控制。预览减少错误发生，整批撤销降低恢复成本。',
      },
      {
        id: 'b',
        label: '保留日志，让用户自行修复',
        assessment: 'risky',
        feedback: '可审计不等于可恢复。用户仍要承担系统错误造成的大量重复工作。',
      },
      {
        id: 'c',
        label: '以后提高模型准确率',
        assessment: 'risky',
        feedback: '质量优化必要，但不能替代恢复机制；任何模型都可能继续出错。',
      },
    ],
    principle: 'AI 动作的影响范围越大，预览、确认和同范围撤销越重要。',
    checks: ['动作是否可逆', '恢复粒度是否匹配执行粒度', '是否能在执行前预览影响'],
    references: [
      { id: 'undo-action', label: '撤销操作' },
      { id: 'user-control', label: '用户控制' },
    ],
  },
  {
    id: 'q17-eval-set',
    index: '17',
    moduleId: 'quality-constraints',
    shortTitle: '建立评测集',
    question: '团队各试十个问题都觉得不错，可以上线吗？',
    scenario: '知识助手在演示中表现顺畅，但每个人使用的问题不同，也没有记录失败类型。',
    facts: ['样本选择随意', '结果不可重复比较', '真实长尾问题未覆盖'],
    options: [
      {
        id: 'a',
        label: '建立代表性评测集和明确评分规则',
        assessment: 'recommended',
        feedback: '固定样本和评分口径才能比较版本、定位失败，并避免只展示成功例子。',
      },
      {
        id: 'b',
        label: '继续邀请更多同事自由试用',
        assessment: 'conditional',
        feedback: '探索能发现新问题，但不能替代可重复的离线质量门槛。',
      },
      {
        id: 'c',
        label: '演示足够好就先全量上线',
        assessment: 'risky',
        feedback: '演示样本偏差很大，也无法说明长尾问题和严重错误是否受控。',
      },
    ],
    principle: '没有固定评测集，就没有可比较的产品质量。',
    checks: ['样本是否代表真实分布', '评分标准是否一致', '是否覆盖重要失败与边界情况'],
    references: [
      { id: 'eval-set', label: '评测集' },
      { id: 'offline-evaluation', label: '离线评估' },
    ],
  },
  {
    id: 'q18-online-metrics',
    index: '18',
    moduleId: 'quality-constraints',
    shortTitle: '线上指标',
    question: '离线准确率提高，上线后就一定更好吗？',
    scenario: '新模型离线得分提高 5%，但响应变慢，用户更频繁地放弃等待。',
    facts: ['离线质量提高', 'P95 延迟明显上升', '任务完成率下降'],
    options: [
      {
        id: 'a',
        label: '联合观察质量、任务完成与延迟',
        assessment: 'recommended',
        feedback: '模型分数只是产品结果的一部分。线上行为显示更慢的系统反而减少了用户价值。',
      },
      {
        id: 'b',
        label: '准确率更高，应保持新模型',
        assessment: 'risky',
        feedback: '单一离线指标无法代表完整体验，用户放弃意味着产品目标没有实现。',
      },
      {
        id: 'c',
        label: '只优化响应速度，忽略质量',
        assessment: 'risky',
        feedback: '速度也不是唯一目标。需要在质量、体验和业务结果之间建立约束。',
      },
    ],
    principle: '离线指标证明能力，线上指标证明用户是否真正获得价值。',
    checks: ['离线提升是否转化为任务结果', '延迟是否改变用户行为', '是否监控失败和人工接管'],
    references: [
      { id: 'offline-evaluation', label: '离线评估' },
      { id: 'online-evaluation', label: '在线评估' },
      { id: 'latency', label: '延迟' },
    ],
  },
  {
    id: 'q19-cost-latency',
    index: '19',
    moduleId: 'quality-constraints',
    shortTitle: '成本与延迟',
    question: '最强模型效果最好，就应该用于所有请求吗？',
    scenario: '复杂问题使用旗舰模型明显更好，但 70% 的请求只是简单分类，成本与等待时间高出数倍。',
    facts: ['任务难度分布不均', '简单请求有稳定规则', '旗舰模型成为主要成本'],
    options: [
      {
        id: 'a',
        label: '按任务难度路由，保留质量兜底',
        assessment: 'recommended',
        feedback: '分层路由让简单任务使用更轻方案，复杂或不确定任务再升级模型，并用评测守住质量。',
      },
      {
        id: 'b',
        label: '全部使用旗舰模型',
        assessment: 'conditional',
        feedback: '早期基线阶段可能合理，但长期会浪费成本，并让延迟限制产品规模。',
      },
      {
        id: 'c',
        label: '全部换成最便宜模型',
        assessment: 'risky',
        feedback: '成本下降不应以关键任务质量崩溃为代价，需要按场景分层而不是一刀切。',
      },
    ],
    principle: '模型选择是产品资源分配问题，应匹配任务价值与难度。',
    checks: ['请求能否按难度分层', '升级条件是否明确', '质量、成本、延迟是否一起评估'],
    references: [
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'latency', label: '延迟' },
      { id: 'evaluation', label: '评估' },
    ],
  },
  {
    id: 'q20-launch-guardrails',
    index: '20',
    moduleId: 'quality-constraints',
    shortTitle: '上线护栏',
    question: '核心指标达标后，还需要准备降级吗？',
    scenario: '客服助手平均质量已达标，但供应商偶尔超时，少数主题也会出现高风险错误。',
    facts: ['平均指标掩盖少数严重错误', '外部模型服务并非始终可用', '人工流程仍然存在'],
    options: [
      {
        id: 'a',
        label: '设置监控、主题拦截和明确降级流程',
        assessment: 'recommended',
        feedback: '上线门槛不仅是平均质量，还包括异常检测、风险拦截和服务不可用时的可持续流程。',
      },
      {
        id: 'b',
        label: '平均达标即可全量上线',
        assessment: 'risky',
        feedback: '平均值会隐藏长尾事故，外部依赖故障也会让业务完全中断。',
      },
      {
        id: 'c',
        label: '遇到问题后再人工处理',
        assessment: 'conditional',
        feedback: '人工处理是降级的一部分，但触发信号、接管责任和上下文传递必须在上线前定义。',
      },
    ],
    principle: '可靠产品不是永不失败，而是能及时发现、限制影响并恢复。',
    checks: ['哪些异常必须被自动拦截', '依赖不可用时用户看到什么', '谁在什么信号下接管'],
    references: [
      { id: 'ai-guardrail', label: 'AI 护栏' },
      { id: 'observability', label: '可观测性' },
      { id: 'fallback-experience', label: '降级体验' },
    ],
  },
  {
    id: 'q21-support-rag',
    index: '21',
    moduleId: 'capstone',
    shortTitle: '客服知识库',
    question: '客服知识库的第一版，应该直接自动回复客户吗？',
    scenario:
      '答案分散在 3,000 份持续更新的内部文档中。客服需要更快找到可信答案，错误承诺会伤害客户。',
    facts: ['知识动态且分散', '答案必须引用来源', '一线客服仍承担客户沟通责任'],
    options: [
      {
        id: 'a',
        label: '先做带引用的客服辅助，并由人确认',
        assessment: 'recommended',
        feedback:
          '这同时匹配了动态知识、可追溯和错误成本。先验证检索与答案质量，再决定是否扩大自动化。',
      },
      {
        id: 'b',
        label: '直接自动回复所有咨询',
        assessment: 'risky',
        feedback: '当前没有评测和边界数据，全自动会把检索或生成错误直接暴露给客户。',
      },
      {
        id: 'c',
        label: '只做关键词搜索，不生成答案',
        assessment: 'conditional',
        feedback: '这是可靠基线，适合先验证检索；但可能没有充分减少客服理解和组织答案的时间。',
      },
    ],
    principle: '综合方案应从最小可控价值开始，用证据逐步换取更高自动化。',
    checks: ['检索是否覆盖正确证据', '引用能否支持快速复核', '自动化权限如何随质量提升'],
    references: [
      { id: 'retrieval-augmented-generation', label: 'RAG' },
      { id: 'retrieval-recall', label: '检索召回率' },
      { id: 'human-in-the-loop', label: '人在回路' },
    ],
  },
  {
    id: 'q22-sales-copilot',
    index: '22',
    moduleId: 'capstone',
    shortTitle: '销售跟进助手',
    question: '销售助手应该自动给客户发跟进邮件吗？',
    scenario:
      '客户信息分散，销售经常漏跟进。AI 能整理上下文和生成邮件，但错误语气或承诺会影响客户关系。',
    facts: ['整理信息价值明确', '外发动作影响真实客户', '上下文可能不完整'],
    options: [
      {
        id: 'a',
        label: '自动整理与起草，外发前由销售确认',
        assessment: 'recommended',
        feedback: 'AI 承担信息处理和建议，人保留关系判断与外部行动控制，价值和风险边界清楚。',
      },
      {
        id: 'b',
        label: '让 Agent 自主判断并发送',
        assessment: 'risky',
        feedback: '上下文缺口和错误承诺会直接变成客户事故，自主外发超出了当前证据支持的权限。',
      },
      {
        id: 'c',
        label: '只做跟进时间提醒',
        assessment: 'conditional',
        feedback: '风险低且能减少遗漏，但没有利用已有上下文帮助降低准备邮件的时间。',
      },
    ],
    principle: '区分信息处理、建议、决策和外部行动，为每一层单独授予权限。',
    checks: ['哪些信息可能缺失', '动作是否影响外部关系', '确认界面能否暴露关键事实'],
    references: [
      { id: 'ai-agent', label: 'AI Agent' },
      { id: 'tool-use', label: '工具调用' },
      { id: 'user-control', label: '用户控制' },
    ],
  },
  {
    id: 'q23-contract-review',
    index: '23',
    moduleId: 'capstone',
    shortTitle: '合同条款审核',
    question: '合同审核 AI 可以直接给出“通过”结论吗？',
    scenario:
      '法务希望优先发现非标准条款。漏报可能带来法律风险，误报则增加审核负担，最终责任仍在人。',
    facts: ['合同措辞变化大', '风险标准可部分结构化', '审批责任不能转移给模型'],
    options: [
      {
        id: 'a',
        label: '提取条款、提示风险并展示证据',
        assessment: 'recommended',
        feedback:
          '系统帮助发现与组织证据，不替代法律结论。漏报、误报和人工复核负担都可以被独立评估。',
      },
      {
        id: 'b',
        label: '高置信时自动给出通过结论',
        assessment: 'risky',
        feedback: '模型置信并不等于法律正确，且“通过”会掩盖未被识别的风险。',
      },
      {
        id: 'c',
        label: '只生成整份合同摘要',
        assessment: 'conditional',
        feedback: '摘要能提升阅读效率，但没有直接对齐“发现非标准高风险条款”的核心任务。',
      },
    ],
    principle: '高风险 AI 应增强人的证据获取与判断，不应伪装成责任主体。',
    checks: ['系统输出是证据还是最终结论', '漏报与误报如何分别衡量', '人工能否快速复核原文'],
    references: [
      { id: 'structured-output', label: '结构化输出' },
      { id: 'classification', label: '分类' },
      { id: 'human-oversight', label: '人工监督' },
    ],
  },
  {
    id: 'q24-launch-decision',
    index: '24',
    moduleId: 'capstone',
    shortTitle: '上线决策',
    question: '一个 AI 产品方案，怎样才算真正准备好上线？',
    scenario:
      '产品价值已经验证，离线效果也达到目标，但团队还没有线上监控、成本上限和故障接管流程。',
    facts: ['用户愿意使用', '离线质量达标', '运营与失败恢复尚未定义'],
    options: [
      {
        id: 'a',
        label: '补齐监控、预算、护栏和接管后分阶段上线',
        assessment: 'recommended',
        feedback:
          '可上线不仅是“能工作”，还要能被运营：知道何时失败、影响多大、花费多少，以及谁来接管。',
      },
      {
        id: 'b',
        label: '价值和质量达标即可全量上线',
        assessment: 'risky',
        feedback: '缺少运行约束会让偶发错误、成本增长或依赖故障演变为不可控业务问题。',
      },
      {
        id: 'c',
        label: '继续无限期提高离线准确率',
        assessment: 'conditional',
        feedback: '质量仍可提升，但这不能替代运营准备；应明确门槛并通过分阶段发布获得真实证据。',
      },
    ],
    principle: '完整 AI 产品方案必须同时回答价值、能力、体验、质量与运营责任。',
    checks: ['上线门槛是否可度量', '失败能否被发现和限制', '成本与人工责任是否有明确所有者'],
    references: [
      { id: 'online-evaluation', label: '在线评估' },
      { id: 'observability', label: '可观测性' },
      { id: 'ai-guardrail', label: 'AI 护栏' },
      { id: 'cost-optimization', label: '成本优化' },
    ],
  },
];

export const FEATURED_QUESTION_IDS = [
  'q01-rules-or-ai',
  'q09-prompt-or-rag',
  'q21-support-rag',
] as const;

export function getLearningQuestion(id: string): LearningQuestion | undefined {
  return LEARNING_QUESTIONS.find((item) => item.id === id);
}

export function getQuestionsForModule(moduleId: string): LearningQuestion[] {
  return LEARNING_QUESTIONS.filter((item) => item.moduleId === moduleId);
}

export function getLearningQuestionContext(id: string): LearningQuestionContext | undefined {
  const position = LEARNING_QUESTIONS.findIndex((item) => item.id === id);
  if (position === -1) return undefined;

  const question = LEARNING_QUESTIONS[position]!;
  const modulePosition = LEARNING_MODULES.findIndex((item) => item.id === question.moduleId);
  const module = LEARNING_MODULES[modulePosition];
  if (!module) return undefined;

  const moduleQuestions = getQuestionsForModule(module.id);
  const positionWithinModule = moduleQuestions.findIndex((item) => item.id === question.id);

  return {
    question,
    module,
    moduleQuestions,
    modulePosition: positionWithinModule,
    previous: LEARNING_QUESTIONS[position - 1],
    next: LEARNING_QUESTIONS[position + 1],
    nextModule: LEARNING_MODULES[modulePosition + 1],
    isModuleStart: positionWithinModule === 0,
    isModuleEnd: positionWithinModule === moduleQuestions.length - 1,
  };
}

// 每道判断题对应的「如果你是 PM，下一步做什么」落地动作。
// 目标：把判断从「结论」落到「产品经理交付物」，并链接到相关词条深挖。
export const PM_ACTIONS: Record<string, string> = {
  'q01-rules-or-ai': '把输入、期望输出与错误处理人写清，先排除确定性方案，再决定是否引入模型。',
  'q02-classify-or-generate':
    '先定义产品所需的最小输出字段，再决定是否允许自由生成，避免过度设计。',
  'q03-context-limit':
    '列出问题所需的证据来源与召回范围，把「相关性」作为知识方案的核心，而不是拼全文。',
  'q04-high-stakes-answer': '按风险给任务分级，把权限、人工监督与证据要求写进验收标准。',
  'q05-demo-or-value': '先定义「用户因此完成什么任务」，再决定是否立项，而不是把演示效果当机会。',
  'q06-data-readiness': '检查数据质量、权限与任务匹配度，用检查项代替「数据很多」的直觉判断。',
  'q07-error-cost': '把错误按后果分级，让质量指标绑定到错误成本，而不是只看平均准确率。',
  'q08-automation-fit': '画出稳定步骤与需要判断的步骤，只对后者增加智能，别把自动化当 Agent。',
  'q09-prompt-or-rag': '在方案说明里区分行为约束（Prompt）与运行时知识（RAG），各写清职责。',
  'q10-workflow-or-agent': '按任务不确定性逐级授权，把不可自动执行的步骤（如支付）单独标注。',
  'q11-fine-tuning': '先建立可测基线与评测集，再决定是否引入微调，用数据说话。',
  'q12-search-or-generation': '先匹配用户任务是找证据还是生成，决定用检索、摘要还是两者组合。',
  'q13-user-control': '设计「修改可见、可比较、可拒绝」的交互，再动用户资产，而不是直接覆盖。',
  'q14-uncertainty':
    '把不确定性表达成可行动的信息（如「证据不足，需人工确认」），而不是孤立百分比。',
  'q15-human-escalation': '定义失败信号与升级路径，让转人工及时、明显且不丢上下文。',
  'q16-recovery': '按影响范围设计预览、确认与同范围撤销，而不是逐条手工回滚。',
  'q17-eval-set': '建立固定评测集与失败分类，让「质量是否变好」可以重复比较。',
  'q18-online-metrics': '同时盯离线质量与线上任务完成率、延迟，避免只看离线分数。',
  'q19-cost-latency': '按任务难度与价值分配模型资源，做资源分配方案，而不是一律用最强模型。',
  'q20-launch-guardrails': '准备监控、降级与恢复路径，把「可靠」定义为可发现、可限制、可恢复。',
  'q21-support-rag': '从最小可控价值开始，用证据逐级换取更高自动化，先人工确认再自动。',
  'q22-sales-copilot': '为信息处理、建议、决策与外部行动分别授权，外发动作单独设权限。',
  'q23-contract-review': '让 AI 增强证据获取与判断，把最终责任明确留在人身上。',
  'q24-launch-decision': '对照价值、能力、体验、质量与运营责任清单逐项补齐，再谈上线。',
};
