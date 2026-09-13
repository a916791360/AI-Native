import type { LearningQuestion } from '../types';

/**
 * 第三层「权衡取舍」。
 * 每一题的两个目标同时成立、同时重要，四个选项都像有道理：
 * 两个 conditional 各自站在一个目标那一边，risky 是「两个都想要、结果两个都没守住」的方案。
 */
export const TIER3_QUESTIONS: LearningQuestion[] = [
  {
    id: 'q61-accuracy-or-explain',
    index: '61',
    tierId: 't3-tradeoff',
    moduleId: 'model-boundaries',
    shortTitle: '准确还是可解释',
    question: '简历初筛要更准，还是要能说明理由？',
    scenario:
      '招聘团队想用模型提高简历初筛准确率，但合规要求每个淘汰决定都能向候选人说明理由，而最准的模型给不出稳定解释。',
    facts: [
      '合规要求淘汰理由可说明',
      '当前最准的模型无法解释',
      '淘汰决定影响候选人权益',
      '团队没有自研可解释模型的人力',
    ],
    options: [
      {
        id: 'a',
        label: '先收紧模型自由度，用可解释方案换一部分准确率',
        assessment: 'recommended',
        feedback:
          '把合规要求当作不可让渡的边界，用结构化特征与规则承担初筛、模型只做排序辅助。代价是准确率上限定得更低，但每个淘汰决定都能落到具体依据上。',
      },
      {
        id: 'b',
        label: '用最准的模型，事后补一份解释文档',
        assessment: 'conditional',
        feedback:
          '守住了准确率，但事后解释与模型真实决策过程脱钩，遇到合规质询时无法逐单自证，把合规风险转嫁给了法务与后续环节。',
      },
      {
        id: 'c',
        label: '双模型并行，准的做决定、可解释的写理由',
        assessment: 'conditional',
        feedback:
          '看似两边都保住，实际两个模型可能给出不一致的判断，理由与决定对不上时更难解释，还把系统复杂度和成本翻了一倍。',
      },
      {
        id: 'd',
        label: '先上线高准确率模型，等自研能力到位再替换',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：上线期间合规缺口一直存在，而「等能力到位」没有时间点和责任人，替换通常不会真的发生。',
      },
    ],
    principle:
      '两个目标都不可让渡时，先分清哪个是外部约束、哪个是内部偏好，把外部约束当边界，在边界内优化另一个，并写明被放弃那部分的代价由谁承担。',
    checks: ['两个目标里哪个是外部强制的', '被放弃的代价由谁承担', '被牺牲的目标有无替代补偿'],
    references: [
      { id: 'explainable-ai', label: '可解释人工智能' },
      { id: 'ai-risk-management', label: 'AI 风险管理' },
      { id: 'human-oversight', label: '人工监督' },
      { id: 'accountability', label: '问责' },
    ],
  },
  {
    id: 'q62-ceiling-or-certainty',
    index: '62',
    tierId: 't3-tradeoff',
    moduleId: 'model-boundaries',
    shortTitle: '上限还是稳定',
    question: '结算摘要要覆盖更难的表述，还是要结果每次都一致？',
    scenario:
      '财务团队希望模型能处理各种口语化报销说明，但月度结算要求同样输入每次得到同样结果，而生成式模型输出并不稳定。',
    facts: ['结算结果需可复现', '报销说明口语化严重', '规则方案覆盖不足', '模型输出存在随机性'],
    options: [
      {
        id: 'a',
        label: '让模型只做语言归一化，金额与科目仍由确定性规则计算',
        assessment: 'recommended',
        feedback:
          '把不可复现的部分限制在语言理解上，结算数值仍走确定性逻辑。代价是复杂表述的识别率不高，但每次结果一致、可对账，出错时也能定位到具体环节。',
      },
      {
        id: 'b',
        label: '全流程交给模型，用固定参数保证稳定',
        assessment: 'conditional',
        feedback:
          '想同时拿到能力上限和确定性，但固定参数只降低波动、不消除波动，结算结果仍无法逐次复现，把对账风险留给了财务人员。',
      },
      {
        id: 'c',
        label: '先用模型跑一遍，人工逐单核对结果',
        assessment: 'conditional',
        feedback:
          '守住了确定性，却把模型省下的时间全部转成人工核对成本，量一大就不可持续，等于用人力补上模型不稳定的缺口。',
      },
      {
        id: 'd',
        label: '先上模型，出现对账差异时再补规则',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：上线后差异会持续发生且难以归因，而补规则既没有触发条件也没有责任人，最后往往靠临时人工兜底。',
      },
    ],
    principle:
      '确定性与能力上限很难同时拉满，先把不可复现的部分圈在最小的环节里，再考虑扩展能力，并接受这部分能力提升带来的代价。',
    checks: ['哪一步结果必须可复现', '波动被限制在多小范围', '出错后能否逐单归因'],
    references: [
      { id: 'temperature', label: '温度参数' },
      { id: 'structured-output', label: '结构化输出' },
      { id: 'ai-capability-boundary', label: 'AI 能力边界' },
      { id: 'observability', label: '可观测性' },
    ],
  },
  {
    id: 'q63-general-or-finetune',
    index: '63',
    tierId: 't3-tradeoff',
    moduleId: 'model-boundaries',
    shortTitle: '通用还是微调',
    question: '术语理解要通用，还是要贴合本行业表达？',
    scenario:
      '内容团队希望模型看懂行业黑话，但同一套系统还要服务多条业务线，通用模型理解稳定却常把专业说法解释错。',
    facts: [
      '行业术语表达高度本地化',
      '系统需服务多条业务线',
      '通用模型专业理解偏弱',
      '微调需要持续维护标注数据',
    ],
    options: [
      {
        id: 'a',
        label: '先用检索与提示注入术语表，把微调留到术语稳定之后',
        assessment: 'recommended',
        feedback:
          '把术语当作可变的知识外挂进来，模型能力保持通用。代价是每次都要维护术语表、单次调用更长，但业务线各自改动时不必重训模型。',
      },
      {
        id: 'b',
        label: '直接微调一版领域模型，先把术语理解做上去',
        assessment: 'conditional',
        feedback:
          '术语理解确实提升，但知识被写进权重，业务线一改说法就要重训，维护成本转嫁给算法团队，通用场景还可能变差。',
      },
      {
        id: 'c',
        label: '每个业务线各微调一版，各自服务各自',
        assessment: 'conditional',
        feedback:
          '单线效果最好，代价是版本数量随业务线增长，评测、回归与上线的维护负担成倍增加，跨线经验也无法复用。',
      },
      {
        id: 'd',
        label: '通用与微调两套并行，谁好用就用谁',
        assessment: 'risky',
        feedback:
          '两个目标都没真正守住：两套结果不一致时无法向用户解释，也没有判定规则，最后既没有统一体验，也背上了双份维护成本。',
      },
    ],
    principle:
      '知识会频繁变化时优先外挂，行为需要稳定时才考虑写进权重，并把长期维护的代价算进决策。',
    checks: ['术语变化频率有多高', '维护成本落在谁身上', '通用场景会不会被拖累'],
    references: [
      { id: 'fine-tuning', label: '微调' },
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'prompt-constraint', label: '提示约束' },
      { id: 'lora', label: '低秩适配' },
    ],
  },
  {
    id: 'q64-coverage-or-boundary',
    index: '64',
    tierId: 't3-tradeoff',
    moduleId: 'model-boundaries',
    shortTitle: '多接还是守住',
    question: '客服机器人要多接问题，还是要少答错？',
    scenario:
      '客服团队希望机器人多覆盖用户提问、少转人工，但错误回答会带来投诉，而机器人只在一部分问题上足够可靠。',
    facts: [
      '转人工率是团队考核项',
      '错误回答会引发投诉',
      '部分问题类型质量不足',
      '用户对答错容忍度低',
    ],
    options: [
      {
        id: 'a',
        label: '按问题类型划定可靠范围，范围外直接转人工',
        assessment: 'recommended',
        feedback:
          '把能力边界显式写进产品，可靠范围内自助、范围外快速转人工。代价是转人工率短期下不去，但错答带来的投诉与返工明显减少。',
      },
      {
        id: 'b',
        label: '让机器人先尝试回答，答不上再转人工',
        assessment: 'conditional',
        feedback:
          '覆盖面上去了，但「答不上」由模型自己判断并不可靠，它常在不确定时仍然作答，把错误成本转嫁给了用户与售后团队。',
      },
      {
        id: 'c',
        label: '扩充知识库与话术，先把覆盖问题数做大',
        assessment: 'conditional',
        feedback:
          '覆盖面提升明显，但知识补全不能保证每类问题都答得对，把质量风险摊薄后隐藏起来，出问题时更难判断是哪一类失效。',
      },
      {
        id: 'd',
        label: '先放开所有问题，用投诉数据回头收敛',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：用户先承受一批错误回答，而投诉数据只能事后归因、无法挽回体验，收敛动作通常也没有明确负责人。',
      },
    ],
    principle:
      '覆盖与可靠不可兼得时，先守住错误成本高的那部分边界，把扩张当作有条件的后续动作，并接受短期覆盖率的代价。',
    checks: ['哪些错误用户无法自行发现', '边界由谁判定且是否可靠', '扩张的触发条件是什么'],
    references: [
      { id: 'ai-capability-boundary', label: 'AI 能力边界' },
      { id: 'human-escalation', label: '人工升级处理' },
      { id: 'fallback-experience', label: '降级体验' },
      { id: 'hallucination', label: '幻觉' },
    ],
  },
  {
    id: 'q65-autonomy-or-audit',
    index: '65',
    tierId: 't3-tradeoff',
    moduleId: 'model-boundaries',
    shortTitle: '放手还是留痕',
    question: '运维助手要多自动执行，还是要每步可追溯？',
    scenario:
      '运维团队希望助手自动排查并修复常见故障，但事故复盘要求每一步操作都能追溯到指令、依据与执行人。',
    facts: [
      '事故复盘需逐步骤追溯',
      '故障响应窗口很短',
      '常见故障处理步骤固定',
      '自动操作会直接影响线上环境',
    ],
    options: [
      {
        id: 'a',
        label: '把自动执行限定在固定处理步骤，其余动作留人工确认并全程留痕',
        assessment: 'recommended',
        feedback:
          '让自主性只覆盖可预期的部分，高风险动作仍由人确认，同时把每一步的指令与依据记录下来。代价是响应速度不如全自动，但复盘时能逐条还原。',
      },
      {
        id: 'b',
        label: '全自动执行以压缩响应时间，事后补录操作日志',
        assessment: 'conditional',
        feedback:
          '响应速度拿到了，但事后补录的日志与真实执行过程存在偏差，关键决策依据仍无法还原，把审计风险留给了复盘环节。',
      },
      {
        id: 'c',
        label: '所有操作都人工确认，助手只做建议',
        assessment: 'conditional',
        feedback:
          '可审计性最高，但把自动化的时间收益全部放弃，响应窗口内的人力成为瓶颈，等于用速度换取了完整留痕。',
      },
      {
        id: 'd',
        label: '先全自动跑起来，等出现事故再补审计',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：事故前没有可追溯的凭据，事故后也无法还原当时依据，补审计既不能回溯历史，也不会自动发生。',
      },
    ],
    principle:
      '自主性与可审计性冲突时，先按动作风险分级，把留痕能力做在自动执行之前，并接受响应速度上的代价。',
    checks: ['哪些动作必须可追溯到人', '留痕是否在执行时产生', '高风险动作由谁确认'],
    references: [
      { id: 'auditability', label: '可审计性' },
      { id: 'human-in-the-loop', label: '人在回路' },
      { id: 'trace', label: '调用追踪' },
      { id: 'ai-guardrail', label: 'AI 护栏' },
    ],
  },
  {
    id: 'q66-value-or-cost',
    index: '66',
    tierId: 't3-tradeoff',
    moduleId: 'opportunity-judgment',
    shortTitle: '价值还是成本',
    question: '免费额度要照顾用户体验，还是要压住单次成本？',
    scenario:
      '增长团队希望新用户免费试用更长时间以提升转化，但财务测算显示免费调用量越大，单客获取成本越高。',
    facts: [
      '免费试用是转化主要入口',
      '单次调用成本随用量上升',
      '团队有季度成本上限',
      '试用期过短影响转化率',
    ],
    options: [
      {
        id: 'a',
        label: '按用户价值分层设定免费额度，高潜用户给更长试用',
        assessment: 'recommended',
        feedback:
          '把有限成本投在更可能转化的用户上，用分层替代一刀切。代价是要建立分层判定规则并持续校准，但整体成本可控、高价值用户体验不受损。',
      },
      {
        id: 'b',
        label: '全面延长试用期，先把转化率做上去',
        assessment: 'conditional',
        feedback:
          '用户体验与转化数据好看，但成本按用量线性放大，超出季度上限后只能临时收紧，把压力转嫁给后续预算与运营节奏。',
      },
      {
        id: 'c',
        label: '统一缩短试用，优先保住成本上限',
        assessment: 'conditional',
        feedback:
          '成本守住了，但把体验代价平摊给所有用户，高潜用户同样被劝退，转化损失难以在事后归因到具体人群。',
      },
      {
        id: 'd',
        label: '先延长试用，等成本超了再想办法优化',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：成本超支是确定发生的，而「再想办法」没有具体动作和时间点，最后通常靠临时砍额度伤害已承诺的用户。',
      },
    ],
    principle:
      '资源受限时先做分层而不是一刀切，把成本集中在最可能产生价值的人群上，并接受分层规则本身的维护代价。',
    checks: ['成本上限是谁的硬约束', '被牺牲的体验落在哪类人', '分层规则由谁维护'],
    references: [
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'business-model', label: '商业模式' },
      { id: 'north-star-metric', label: '北极星指标' },
      { id: 'ai-adoption', label: 'AI 采用' },
    ],
  },
  {
    id: 'q67-ship-or-maintain',
    index: '67',
    tierId: 't3-tradeoff',
    moduleId: 'opportunity-judgment',
    shortTitle: '快交还是好养',
    question: '需求要先赶上节点，还是要留下可维护的结构？',
    scenario:
      '业务方要求本季度上线智能问答，但工程团队评估按当前设计后续每次改知识都要改代码，维护成本会持续累积。',
    facts: [
      '业务方要求季度内上线',
      '当前设计改知识需改代码',
      '后续每季都有知识更新',
      '团队无额外排期补技术方案',
    ],
    options: [
      {
        id: 'a',
        label: '在节点内上线，但把知识配置化列为上线后第一个迭代的硬性范围',
        assessment: 'recommended',
        feedback:
          '先交付可用版本，同时把可维护性变成有排期、有验收的后续范围。代价是首个版本体验偏粗糙，但后续改知识不必再动代码。',
      },
      {
        id: 'b',
        label: '先按最快路径上线，维护问题等有人反馈再说',
        assessment: 'conditional',
        feedback:
          '节点守住了，但把可维护性完全推给未来，知识更新会持续消耗工程时间，成本以隐性方式转嫁给后续每个季度的排期。',
      },
      {
        id: 'c',
        label: '坚持先做配置化再上线，节点往后顺延',
        assessment: 'conditional',
        feedback:
          '结构干净，但把交付时间当作代价付出去，业务方在窗口期内拿不到任何结果，机会成本由业务承担且无法事后补偿。',
      },
      {
        id: 'd',
        label: '两边同时推进，上线和重构并行做',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：并行让团队同时背负交付与重构压力，上线质量与结构改造都不到位，最后两边都要返工。',
      },
    ],
    principle:
      '交付与可维护冲突时，不要放弃其中一个，而是给被推迟的那个写明范围、排期与验收标准，并承认粗糙版本的代价。',
    checks: ['被推迟的部分有没有排期', '技术债由谁在何时偿还', '业务窗口期的损失谁承担'],
    references: [
      { id: 'prioritization', label: '需求优先级' },
      { id: 'roadmap', label: '产品路线图' },
      { id: 'tech-collaboration', label: '与工程师协作' },
      { id: 'acceptance-criteria', label: '验收标准' },
    ],
  },
  {
    id: 'q68-breadth-or-depth',
    index: '68',
    tierId: 't3-tradeoff',
    moduleId: 'opportunity-judgment',
    shortTitle: '铺开还是做深',
    question: '助手要服务更多岗位，还是先在一个岗位做到能用？',
    scenario:
      '平台团队希望助手尽快覆盖多个岗位以证明通用性，但只有客服岗位的数据与流程足够清晰，其他岗位仍在摸索。',
    facts: [
      '客服岗位数据与流程清晰',
      '其他岗位需求尚未收敛',
      '资源只够一个方向做深',
      '多岗位覆盖更易争取预算',
    ],
    options: [
      {
        id: 'a',
        label: '先在客服岗位做到可量化可用，再按同一套方法复制到其他岗位',
        assessment: 'recommended',
        feedback:
          '用单点深度换出可复制的做法与可信数据，再谈铺开。代价是短期覆盖岗位数少、说服力有限，但复制时有依据而不是从零试探。',
      },
      {
        id: 'b',
        label: '同时覆盖多个岗位，每个都做到能演示',
        assessment: 'conditional',
        feedback:
          '覆盖数字好看，但每个岗位都停在演示水平，问题一旦深入就暴露，把「看起来可用」与「真的可用」之间的落差留给了业务方。',
      },
      {
        id: 'c',
        label: '先做平台通用能力，不绑定具体岗位',
        assessment: 'conditional',
        feedback:
          '避免了过早绑定单一场景，但通用能力缺少真实约束检验，做深时才发现与岗位流程不匹配，返工代价由后续项目承担。',
      },
      {
        id: 'd',
        label: '广度与深度都要，先同时立项再逐步收口',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：并行立项摊薄了本就有限的资源，收口时机与标准都没定义，最后每个方向都留下半成品。',
      },
    ],
    principle: '资源有限时，先用单点深度换出可复制的方法，再换广度，并接受短期覆盖面上的代价。',
    checks: ['哪个场景的数据与流程最成熟', '复制方法是否已经形成', '摊薄资源后谁先停摆'],
    references: [
      { id: 'mvp', label: '最小可行产品' },
      { id: 'problem-solution-fit', label: '问题方案匹配' },
      { id: 'prioritization', label: '需求优先级' },
      { id: 'ai-use-case', label: 'AI 应用场景' },
    ],
  },
  {
    id: 'q69-growth-or-quality',
    index: '69',
    tierId: 't3-tradeoff',
    moduleId: 'opportunity-judgment',
    shortTitle: '扩量还是守线',
    question: '用户增长要快，还是先守住回答质量线？',
    scenario:
      '运营团队希望尽快开放注册冲量，但当前评测显示部分问题类型回答质量不稳定，质量下滑会直接影响留存。',
    facts: [
      '开放注册能快速拉新',
      '部分问题类型质量不稳',
      '留存对首次体验敏感',
      '评测集已能覆盖主要类型',
    ],
    options: [
      {
        id: 'a',
        label: '按问题类型分批开放，质量达标的类型先放量',
        assessment: 'recommended',
        feedback:
          '把增长拆成按类型可控的批次，用评测结果决定开放节奏。代价是拉新速度不如全量开放，但每一批用户的首次体验都在质量线之上。',
      },
      {
        id: 'b',
        label: '全量开放抢增长，质量用后续迭代补',
        assessment: 'conditional',
        feedback:
          '增长数字拿到了，但首批用户的差体验会直接反映在留存上，补质量的成本要用来挽回已经流失的人，代价比晚开放更高。',
      },
      {
        id: 'c',
        label: '先不发新用户，把质量打磨到位再说',
        assessment: 'conditional',
        feedback:
          '质量守得最稳，但把时间窗口整体让出去，竞品与用户习惯都在变，等准备好时获客成本可能已经不同。',
      },
      {
        id: 'd',
        label: '一边全量开放，一边同步赶质量修复',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：修复排期被增长带来的问题挤占，质量线持续被突破，增长也因为体验差而留不住人。',
      },
    ],
    principle:
      '增长与质量冲突时，用可验证的质量门槛决定放量节奏，把速度上的代价换成可控的分批推进。',
    checks: ['质量门槛用什么指标定义', '哪类问题还没达标', '放量后如何快速回退'],
    references: [
      { id: 'evaluation', label: 'AI 评估' },
      { id: 'online-evaluation', label: '在线评估' },
      { id: 'canary-release', label: '金丝雀发布' },
      { id: 'task-success-rate', label: '任务成功率' },
    ],
  },
  {
    id: 'q70-build-or-buy',
    index: '70',
    tierId: 't3-tradeoff',
    moduleId: 'opportunity-judgment',
    shortTitle: '自研还是采购',
    question: '核心能力要自己建，还是先用外部服务抢时间？',
    scenario:
      '团队在评估知识问答能力，自研可控但周期长，采购能立刻上线，而核心能力的差异会影响后续产品空间。',
    facts: [
      '自研周期覆盖两个季度',
      '采购方案可立刻上线',
      '核心能力影响后续差异化',
      '团队缺少相关工程经验',
    ],
    options: [
      {
        id: 'a',
        label: '先用外部服务验证场景，同时把切换成本控制在可替换的接口层',
        assessment: 'recommended',
        feedback:
          '用采购换验证时间，用接口隔离保留将来自研或更换的空间。代价是要多维护一层适配与数据迁移方案，但不必现在就把路线锁死。',
      },
      {
        id: 'b',
        label: '直接自研，把核心能力握在自己手里',
        assessment: 'conditional',
        feedback:
          '可控性与长期空间拿到了，但两个季度内没有可验证的产品，机会成本由业务承担，且团队经验不足会让周期进一步拉长。',
      },
      {
        id: 'c',
        label: '全面采购，先用现成能力把产品做起来',
        assessment: 'conditional',
        feedback:
          '上线最快，但核心能力与数据都留在外部，后续想差异化时受制于对方能力边界与价格，切换代价随时间持续上升。',
      },
      {
        id: 'd',
        label: '先采购上线，之后再找机会替换成自研',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：替换没有触发条件和预算，业务一旦依赖外部服务就更难切，所谓「之后再自研」通常不会发生。',
      },
    ],
    principle:
      '自研与采购的取舍要留下退路：先明确哪些能力必须自有，再用可控的切换代价换取验证时间。',
    checks: ['哪些能力必须长期自有', '切换成本有多高', '验证窗口有多长'],
    references: [
      { id: 'competitive-analysis', label: '竞品分析' },
      { id: 'model-api', label: '模型 API' },
      { id: 'tech-collaboration', label: '与工程师协作' },
      { id: 'roadmap', label: '产品路线图' },
    ],
  },
  {
    id: 'q71-rag-quality-latency',
    index: '71',
    tierId: 't3-tradeoff',
    moduleId: 'solution-choice',
    shortTitle: '准答还是快答',
    question: '检索回答要更准，还是要更快返回？',
    scenario:
      '知识助手要回答一线员工提问，检索更多片段能提升答案准确率，但每次检索与重排都会拉长等待时间。',
    facts: [
      '一线员工在通话中查询',
      '召回片段越多答案越准',
      '重排会显著增加耗时',
      '等待超过数秒会被放弃',
    ],
    options: [
      {
        id: 'a',
        label: '先按延迟预算定召回上限，用重排只处理最相关的候选',
        assessment: 'recommended',
        feedback:
          '把延迟当作硬预算，先定召回规模再决定是否重排。代价是放弃一部分边缘问题的召回，但主流程能在可接受时间内返回可用答案。',
      },
      {
        id: 'b',
        label: '扩大召回并加重排，把准确率放到第一位',
        assessment: 'conditional',
        feedback:
          '答案更准，但把等待时间全部转移给一线员工，通话场景下用户会直接放弃使用，等于用可用性换取准确率。',
      },
      {
        id: 'c',
        label: '只做关键词检索，把响应压到最短',
        assessment: 'conditional',
        feedback:
          '速度最快，但同义与口语化提问召回不到内容，准确率下降后用户仍要转人工，用质量换来的时间收益被抵消。',
      },
      {
        id: 'd',
        label: '先都加上，等用户反馈慢再优化',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：慢与不准同时出现，用户不会区分原因，只记得不好用；而优化没有指标约束，通常也不会被排进迭代。',
      },
    ],
    principle:
      '质量与延迟冲突时，把延迟写成不可突破的预算，在预算内追求质量，并承认放弃的那部分准确率代价。',
    checks: ['延迟预算是多少', '超出预算的收益有多大', '放弃的召回由谁兜底'],
    references: [
      { id: 'latency-budget', label: '延迟预算' },
      { id: 'reranking', label: '重排' },
      { id: 'retrieval-recall', label: '检索召回率' },
      { id: 'streaming-response', label: '流式响应' },
    ],
  },
  {
    id: 'q72-autonomy-or-control',
    index: '72',
    tierId: 't3-tradeoff',
    moduleId: 'solution-choice',
    shortTitle: '授权还是兜底',
    question: 'Agent 要少打断人，还是要每步都能拦住？',
    scenario:
      '销售团队希望 Agent 自动整理客户资料并推进后续动作，但任何对外发送或改数据都可能造成难以撤回的影响。',
    facts: ['对外发送不可撤回', 'Agent 步骤链较长', '销售希望减少手工操作', '客户数据涉及敏感信息'],
    options: [
      {
        id: 'a',
        label: '读取与整理全自动，对外发送和改数据保留人工确认',
        assessment: 'recommended',
        feedback:
          '按可逆性划分权限，可撤销的步骤放手，不可撤销的步骤拦在人前。代价是仍有确认动作，但不会出现无法挽回的对外影响。',
      },
      {
        id: 'b',
        label: '全程自动执行，用事后抽查来兜底',
        assessment: 'conditional',
        feedback:
          '操作效率最高，但抽查只能发现已发生的问题，无法阻止不可撤回的发送，把风险成本转嫁给客户关系与合规环节。',
      },
      {
        id: 'c',
        label: '每一步都要人工确认，保证绝对可控',
        assessment: 'conditional',
        feedback:
          '风险最低，但确认次数过多让自动化收益归零，销售会绕开系统手工处理，可控性在真实使用中反而失效。',
      },
      {
        id: 'd',
        label: '先放开权限跑通流程，之后再收紧',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：放开期间已经发生不可撤回的对外动作，而收紧没有触发条件与时间点，通常要等到出事才会做。',
      },
    ],
    principle: '自主性应按动作可逆性逐级授权，不可逆动作必须留在人的确认之后，并接受效率上的代价。',
    checks: ['哪些动作不可撤回', '确认点是否足够少', '权限边界由谁维护'],
    references: [
      { id: 'human-in-the-loop', label: '人在回路' },
      { id: 'undo-action', label: '撤销操作' },
      { id: 'agent-sandbox', label: 'Agent 沙箱' },
      { id: 'function-calling', label: '函数调用' },
    ],
  },
  {
    id: 'q73-finetune-or-maintain',
    index: '73',
    tierId: 't3-tradeoff',
    moduleId: 'solution-choice',
    shortTitle: '调优还是好维护',
    question: '输出风格要更贴合，还是要长期改得动？',
    scenario:
      '内容团队希望模型输出更贴合品牌语气，微调效果明显，但语气规范会随季度调整，团队没有长期标注人力。',
    facts: ['微调能显著改善语气', '语气规范每季度更新', '团队无长期标注人力', '提示词方案效果中等'],
    options: [
      {
        id: 'a',
        label: '先用提示词与示例把语气规则表达清楚，微调留给规则稳定之后',
        assessment: 'recommended',
        feedback:
          '把易变的规范放在可随时改动的提示层，改动成本低。代价是语气一致性弱于微调，但每季度调整不必重新标注和训练。',
      },
      {
        id: 'b',
        label: '微调一版语气模型，先把效果做到最好',
        assessment: 'conditional',
        feedback:
          '语气贴合度最高，但规范一变就要重新标注训练，把长期维护成本压给没有标注人力的团队，效果会随规范更新而衰减。',
      },
      {
        id: 'c',
        label: '每季度按新规范微调一次，保持效果领先',
        assessment: 'conditional',
        feedback:
          '效果持续在线，代价是每季度都要投入标注与训练资源，还要维护多版本模型的评测与回归，成本被固定成常规支出。',
      },
      {
        id: 'd',
        label: '先用提示词，效果不好再微调',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：既没有把提示层的规则整理清楚，也没有给出微调的判定标准，最后在效果不满意时反复试错。',
      },
    ],
    principle:
      '当规则本身还在变化时，先选改动成本低的手段，把维护代价算进选择，而不是只看当前效果。',
    checks: ['规范变化频率多高', '改动一次的成本是多少', '谁负责长期维护'],
    references: [
      { id: 'fine-tuning', label: '微调' },
      { id: 'few-shot-prompting', label: '少样本提示' },
      { id: 'prompt-versioning', label: '提示词版本管理' },
      { id: 'instruction-tuning', label: '指令微调' },
    ],
  },
  {
    id: 'q74-workflow-or-simple',
    index: '74',
    tierId: 't3-tradeoff',
    moduleId: 'solution-choice',
    shortTitle: '编排还是简单',
    question: '流程要一次做全，还是先跑最小闭环？',
    scenario:
      '团队希望把审批、检索、生成、回写串成完整自动化流程，但其中多步依赖不稳定，一旦失败整条链路都要重跑。',
    facts: [
      '多步依赖存在不确定性',
      '失败后需整链重跑',
      '业务只要求先跑通主路径',
      '团队首次做流程编排',
    ],
    options: [
      {
        id: 'a',
        label: '先只自动跑主路径，把不稳定步骤留给人工衔接',
        assessment: 'recommended',
        feedback:
          '用最小闭环验证价值，把不确定性挡在人工环节。代价是自动化程度低、需要人配合，但链路短、失败容易定位，跑通后再逐步替换。',
      },
      {
        id: 'b',
        label: '直接做全流程编排，一次把自动化做完整',
        assessment: 'conditional',
        feedback:
          '自动化收益最大，但首次编排就要处理所有异常分支，失败后整链重跑的时间成本高，把不确定性代价留给了运维与用户。',
      },
      {
        id: 'c',
        label: '全部人工执行，先把流程规则理清楚',
        assessment: 'conditional',
        feedback:
          '稳定性最好，但完全没有验证自动化是否可行，规则在纸面上清晰、落地时才暴露问题，时间成本由后续项目承担。',
      },
      {
        id: 'd',
        label: '先按全流程设计，边做边简化',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：设计复杂度已经铺开，简化没有明确范围与负责人，最后既没跑通主路径，也留下难以维护的半成品。',
      },
    ],
    principle:
      '先跑通最小闭环再扩展复杂度，用人工衔接承担暂时的不确定性，代价是自动化程度和短期效率。',
    checks: ['哪一步最不稳定', '失败后重跑代价多大', '人工衔接要持续多久'],
    references: [
      { id: 'workflow-automation', label: '工作流自动化' },
      { id: 'task-decomposition', label: '任务拆解' },
      { id: 'mvp', label: '最小可行产品' },
      { id: 'agent-orchestration', label: 'Agent 编排' },
    ],
  },
  {
    id: 'q75-refactor-or-incremental',
    index: '75',
    tierId: 't3-tradeoff',
    moduleId: 'solution-choice',
    shortTitle: '重构还是渐进',
    question: '旧系统要一次换掉，还是要边跑边改？',
    scenario:
      '现有问答系统结构混乱、迭代变慢，团队想一次性重写，但业务不能停机，且重写期间新需求仍在涌入。',
    facts: [
      '现有系统持续承接线上流量',
      '重写期间需求不会停止',
      '结构问题拖慢每次迭代',
      '团队没有第二套人力',
    ],
    options: [
      {
        id: 'a',
        label: '按模块分批替换，每替换一块就切换流量并观察',
        assessment: 'recommended',
        feedback:
          '把重构拆成可回退的小步，业务不停机、需求能继续排。代价是过渡期两套结构并存、维护更麻烦，但风险始终可控。',
      },
      {
        id: 'b',
        label: '暂停新需求，集中人力一次性重写',
        assessment: 'conditional',
        feedback:
          '结构能彻底做干净，但把业务等待成本全部付出去，重写期间的竞争与用户需求变化无人响应，代价由业务方承担。',
      },
      {
        id: 'c',
        label: '先不动结构，继续在旧系统上叠需求',
        assessment: 'conditional',
        feedback:
          '交付不受影响，但结构问题会持续放大，每次迭代成本递增，把技术债转嫁给未来的排期与工程稳定性。',
      },
      {
        id: 'd',
        label: '重写与旧系统维护同时进行，两边都不停',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：人力被摊成两半，旧系统迭代变慢、新系统也迟迟不能上线，最后两边都延期。',
      },
    ],
    principle:
      '重构与交付冲突时，用可回退的小步替换代替一次性切换，把过渡期的维护复杂度当作必要代价。',
    checks: ['能否分批替换并回退', '过渡期由谁承担维护', '业务等待成本多高'],
    references: [
      { id: 'rollback', label: '回滚' },
      { id: 'continuous-delivery', label: '持续交付' },
      { id: 'tech-collaboration', label: '与工程师协作' },
      { id: 'canary-release', label: '金丝雀发布' },
    ],
  },
  {
    id: 'q76-efficiency-or-control',
    index: '76',
    tierId: 't3-tradeoff',
    moduleId: 'product-experience',
    shortTitle: '快用还是可控',
    question: '批量操作要一步完成，还是要让人逐条确认？',
    scenario:
      '运营团队希望一键把模型生成的文案批量发布，但文案会直接触达用户，错发之后很难逐条撤回。',
    facts: [
      '文案直接触达外部用户',
      '批量操作覆盖数百条',
      '撤回需逐条人工处理',
      '运营每日有发布时效要求',
    ],
    options: [
      {
        id: 'a',
        label: '批量生成、批量预览，发布前保留一次整体确认',
        assessment: 'recommended',
        feedback:
          '把效率放在生成与预览环节，把控制放在唯一不可逆的发布动作上。代价是多一次确认点击，但错发风险不再随批量规模放大。',
      },
      {
        id: 'b',
        label: '一键批量发布，用事后抽查发现问题',
        assessment: 'conditional',
        feedback:
          '效率最高，但抽查只能覆盖部分内容，错发一旦触达用户就要逐条撤回，把纠错成本转嫁给客服与运营。',
      },
      {
        id: 'c',
        label: '每条都单独确认后再发布，确保零错发',
        assessment: 'conditional',
        feedback:
          '控制力最强，但确认次数随批量线性增长，运营无法在时效内完成发布，效率代价直接体现在业务节奏上。',
      },
      {
        id: 'd',
        label: '先一键发布，等出现问题再加确认环节',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：上线期间错发已经发生且难以撤回，而加确认要等事故推动，期间用户已经承受了错误内容。',
      },
    ],
    principle:
      '效率与控制冲突时，把确认点放在唯一不可逆的动作上，其余环节尽量自动化，并接受一次确认的时间代价。',
    checks: ['哪一步不可逆', '确认次数是否可接受', '错发后如何撤回'],
    references: [
      { id: 'undo-action', label: '撤销操作' },
      { id: 'user-control', label: '用户控制权' },
      { id: 'human-in-the-loop', label: '人在回路' },
      { id: 'task-success-rate', label: '任务成功率' },
    ],
  },
  {
    id: 'q77-automation-or-trust',
    index: '77',
    tierId: 't3-tradeoff',
    moduleId: 'product-experience',
    shortTitle: '代劳还是信任',
    question: '系统要多替用户做决定，还是要让人看清在做什么？',
    scenario:
      '产品希望自动替用户整理并归档文件以减少操作，但用户看不到分类依据，担心文件被放错位置后找不到。',
    facts: [
      '归档结果影响后续查找',
      '分类依据对用户不可见',
      '用户已习惯手工整理',
      '自动化可减少重复操作',
    ],
    options: [
      {
        id: 'a',
        label: '自动整理但保留可见的分类依据，并允许一键还原',
        assessment: 'recommended',
        feedback:
          '把自动化当作可被检验的建议，用户能看到依据、也能整体撤回。代价是要多做一层解释与还原能力，但信任建立后使用率会自然上升。',
      },
      {
        id: 'b',
        label: '全自动整理，用准确率说服用户接受',
        assessment: 'conditional',
        feedback:
          '操作负担最小，但用户看不到依据就只能靠结果判断，一次放错就会整体放弃功能，把信任成本压在准确率上。',
      },
      {
        id: 'c',
        label: '先只给分类建议，全部由用户手动执行',
        assessment: 'conditional',
        feedback:
          '用户完全掌握主动权，但自动化收益几乎没有，重复操作没有减少，用效率换来的信任提升有限。',
      },
      {
        id: 'd',
        label: '先全自动上线，等用户抱怨再补解释',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：用户在无解释的情况下已经失去信任，事后补解释也很难挽回，还要额外处理被放错的文件。',
      },
    ],
    principle:
      '自动化与信任冲突时，把自动化结果做成可解释、可还原的动作，用透明度换取用户接受度，代价是多一层解释成本。',
    checks: ['用户能否看懂判断依据', '结果能否整体还原', '信任靠什么建立'],
    references: [
      { id: 'user-trust', label: '用户信任' },
      { id: 'explanation-interface', label: '解释界面' },
      { id: 'undo-action', label: '撤销操作' },
      { id: 'autopilot-pattern', label: '自动驾驶模式' },
    ],
  },
  {
    id: 'q78-info-or-burden',
    index: '78',
    tierId: 't3-tradeoff',
    moduleId: 'product-experience',
    shortTitle: '给全还是减负',
    question: '结果页要多给依据，还是要让人快速下判断？',
    scenario:
      '审核团队希望模型输出所有判断依据以便复核，但依据条目过多，审核员每次都要逐条读完才能做决定。',
    facts: [
      '审核员有单量时效要求',
      '依据过多拖慢单次处理',
      '复核时需要追溯理由',
      '多数单子结论明确',
    ],
    options: [
      {
        id: 'a',
        label: '默认只显示关键依据，完整内容收进可展开的详情',
        assessment: 'recommended',
        feedback:
          '把信息按是否需要现场决策分层，常见单子快速过、复杂单子可展开追溯。代价是要定义什么算关键依据，但审核时效与可复核性都保住。',
      },
      {
        id: 'b',
        label: '全部依据一次展示，保证复核信息完整',
        assessment: 'conditional',
        feedback:
          '信息完整性最好，但把筛选负担交给每个审核员，单量时效被拖慢，代价体现在团队产能而不是某个人身上。',
      },
      {
        id: 'c',
        label: '只显示结论，依据在复核时另外查询',
        assessment: 'conditional',
        feedback:
          '审核速度最快，但判断依据不在现场，复核要跳出当前流程另查，把追溯成本转移到复核环节，问题也更难及时发现。',
      },
      {
        id: 'd',
        label: '先全部展示，等审核员反馈再精简',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：时效在精简前持续受损，而精简缺少判定标准与负责人，通常只会停在临时抱怨阶段。',
      },
    ],
    principle:
      '信息量与决策负担冲突时，按「是否影响当场判断」分层展示，把完整信息放在可展开处，代价是要定义关键信息的标准。',
    checks: ['哪些信息影响当场判断', '完整依据放在哪里', '复核需要多久能查到'],
    references: [
      { id: 'progressive-disclosure', label: '渐进披露' },
      { id: 'explanation-interface', label: '解释界面' },
      { id: 'user-control', label: '用户控制权' },
      { id: 'observability', label: '可观测性' },
    ],
  },
  {
    id: 'q79-personal-or-consistent',
    index: '79',
    tierId: 't3-tradeoff',
    moduleId: 'product-experience',
    shortTitle: '因人还是统一',
    question: '回答要按人调整，还是要对所有用户口径一致？',
    scenario:
      '客服助手希望按用户历史偏好调整话术以提升满意度，但同一政策问题若说法不同，容易引发用户之间对比与争议。',
    facts: [
      '政策类问题口径需一致',
      '用户偏好差异明显',
      '不同说法会被用户对比',
      '满意度与一次性解决率挂钩',
    ],
    options: [
      {
        id: 'a',
        label: '政策结论统一，语气与呈现方式按用户偏好调整',
        assessment: 'recommended',
        feedback:
          '把不可变的事实与可变的表达分开，结论一致、表达个性化。代价是要明确哪些内容不许改写，但既避免了口径冲突，也照顾了体验。',
      },
      {
        id: 'b',
        label: '全面按用户偏好改写回答，把满意度做上去',
        assessment: 'conditional',
        feedback:
          '满意度短期提升，但同一政策的表述会随用户而变，一旦被对比就要额外解释，把口径风险转嫁给客服与合规。',
      },
      {
        id: 'c',
        label: '所有回答统一模板输出，保证口径绝对一致',
        assessment: 'conditional',
        feedback:
          '口径最稳，但忽略用户差异后沟通效率下降，用户仍要反复追问，把体验代价留给一线客服承担。',
      },
      {
        id: 'd',
        label: '先个性化再说，等出现争议再统一口径',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：争议发生前已经产生了不一致的对外说法，事后统一也无法回收，用户对同一问题的印象已经分裂。',
      },
    ],
    principle:
      '个性化与一致性冲突时，先固定不可变的事实与结论，只在表达层做差异，代价是表达规则需要额外维护并纳入评测。',
    checks: ['哪些内容不允许改写', '差异只发生在哪一层', '不一致被对比时怎么解释'],
    references: [
      { id: 'instruction-hierarchy', label: '指令层级' },
      { id: 'prompt-constraint', label: '提示约束' },
      { id: 'user-trust', label: '用户信任' },
      { id: 'human-ai-collaboration', label: '人机协作' },
    ],
  },
  {
    id: 'q80-proactive-or-intrusive',
    index: '80',
    tierId: 't3-tradeoff',
    moduleId: 'product-experience',
    shortTitle: '提醒还是打扰',
    question: '助手要多主动提醒风险，还是要少打断当前操作？',
    scenario:
      '写作助手希望在检测到表述风险时立刻提示，但用户正连续输入，频繁弹出提示会打断思路并让人关掉提醒。',
    facts: ['风险提示能减少返工', '频繁弹窗打断输入', '用户可直接关闭提醒', '高风险表述后果较重'],
    options: [
      {
        id: 'a',
        label: '低风险静默标记在侧栏，高风险才即时打断',
        assessment: 'recommended',
        feedback:
          '按后果轻重分配打扰额度，把打断留给真正需要当场处理的问题。代价是要定义风险分级规则，但提示不会被整体关掉。',
      },
      {
        id: 'b',
        label: '检测到任何风险都立即弹窗提示',
        assessment: 'conditional',
        feedback:
          '风险覆盖最全，但打断次数随输入量上升，用户一旦关掉提醒就再也收不到高风险警告，把风险成本转移给了后续环节。',
      },
      {
        id: 'c',
        label: '全部改为事后汇总提示，绝不打断输入',
        assessment: 'conditional',
        feedback:
          '写作体验最顺畅，但事后提示往往已经过了修改时机，用户要回头逐条返工，代价体现在返工工作量上。',
      },
      {
        id: 'd',
        label: '先全部即时提示，等用户抱怨再调频率',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：抱怨出现前用户已经关掉了提示，调节频率要靠反馈驱动，而关闭提醒的用户不会再给反馈。',
      },
    ],
    principle:
      '主动提示与打扰冲突时，按后果严重程度分配打扰额度，把即时打断留给高代价问题，并接受分级规则的维护成本。',
    checks: ['哪些风险必须当场提示', '打断次数上限是多少', '关掉提醒后还剩什么保障'],
    references: [
      { id: 'uncertainty-display', label: '不确定性呈现' },
      { id: 'user-control', label: '用户控制权' },
      { id: 'feedback-loop', label: '反馈闭环' },
      { id: 'copilot-pattern', label: '副驾驶模式' },
    ],
  },
  {
    id: 'q81-quality-or-cost',
    index: '81',
    tierId: 't3-tradeoff',
    moduleId: 'quality-constraints',
    shortTitle: '效果还是花费',
    question: '回答质量要拉满，还是要压住每次调用的成本？',
    scenario:
      '知识助手希望用更强的模型与更长上下文提升回答质量，但按当前调用量测算，成本会超出可承受的运营预算。',
    facts: [
      '调用量仍在持续增长',
      '更强模型单次成本更高',
      '运营预算按季度核定',
      '低价值问答占比不低',
    ],
    options: [
      {
        id: 'a',
        label: '按问题难度路由，简单问题走小模型，复杂问题才用大模型',
        assessment: 'recommended',
        feedback:
          '把成本花在真正需要强模型的请求上，用路由替代一刀切。代价是要维护判断难度与兜底规则，但整体质量与预算都能守住。',
      },
      {
        id: 'b',
        label: '统一使用最强模型，把质量做到最好',
        assessment: 'conditional',
        feedback:
          '质量上限最高，但成本按调用量线性放大，预算耗尽后只能临时限流，把成本压力转嫁给运营与用户可用性。',
      },
      {
        id: 'c',
        label: '统一换成小模型，优先保住成本',
        assessment: 'conditional',
        feedback:
          '成本最可控，但复杂问题质量明显下降，用户会在关键场景失去信任，用质量问题换来的成本节约很难被认可。',
      },
      {
        id: 'd',
        label: '先用最强模型，等成本超了再换小模型',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：超支是确定发生的，切换时还要重新验证质量，用户已经形成的体验预期也会被打断。',
      },
    ],
    principle:
      '质量与成本冲突时，先按请求价值分层再分配算力，把成本集中投在高价值请求上，代价是路由规则需要持续校准。',
    checks: ['哪些请求值得用强模型', '路由错了怎么兜底', '预算上限由谁守'],
    references: [
      { id: 'model-routing', label: '模型路由' },
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'fallback-model', label: '备用模型' },
      { id: 'service-level-objective', label: '服务等级目标' },
    ],
  },
  {
    id: 'q82-launch-or-eval',
    index: '82',
    tierId: 't3-tradeoff',
    moduleId: 'quality-constraints',
    shortTitle: '先上还是先测',
    question: '版本要尽快上线，还是先补足评测样本？',
    scenario:
      '团队承诺本周上线新提示版本，但评测集里高风险的失败类型样本偏少，现有结论不足以判断改动是否安全。',
    facts: ['上线时间已对外承诺', '高风险样本覆盖不足', '改动影响全部用户', '补充评测需额外时间'],
    options: [
      {
        id: 'a',
        label: '按时上线但缩小范围，只对低风险场景放量并同步补评测',
        assessment: 'recommended',
        feedback:
          '用范围控制替代时间让步，把不确定的部分先挡在门外。代价是上线收益有限，但承诺兑现的同时没有把风险一次性推给全部用户。',
      },
      {
        id: 'b',
        label: '按时全量上线，用线上指标代替评测',
        assessment: 'conditional',
        feedback:
          '时间守住了，但线上指标只能事后发现问题，高风险失败一旦发生就已影响真实用户，把验证成本转嫁给了用户。',
      },
      {
        id: 'c',
        label: '推迟上线，先把评测集补到足够覆盖',
        assessment: 'conditional',
        feedback:
          '验证最充分，但把承诺违约的成本付出去，业务方与外部依赖都要重新协调，时间代价由协作方共同承担。',
      },
      {
        id: 'd',
        label: '先上线，评测与观察同时进行',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：全量用户已经在缺乏评测结论的情况下使用新版本，出问题时也没有事先定义的判断依据。',
      },
    ],
    principle:
      '上线速度与验证充分冲突时，用范围和时间换确定性，先放量低风险部分，代价是短期收益被压缩。',
    checks: ['哪类失败后果最重', '能否缩小上线范围', '违约成本由谁承担'],
    references: [
      { id: 'offline-evaluation', label: '离线评估' },
      { id: 'canary-release', label: '金丝雀发布' },
      { id: 'eval-set', label: '评测集' },
      { id: 'rollback', label: '回滚' },
    ],
  },
  {
    id: 'q83-coverage-or-precision',
    index: '83',
    tierId: 't3-tradeoff',
    moduleId: 'quality-constraints',
    shortTitle: '多找还是找准',
    question: '检索要多召回相关内容，还是要让结果都精准可用？',
    scenario:
      '法务检索希望尽量不漏掉相关条款，但召回放宽后大量不相关条文混入结果，律师仍要逐条筛掉。',
    facts: [
      '漏掉条款后果较重',
      '结果过多需人工筛选',
      '条款表述差异较大',
      '检索结果直接进入工作底稿',
    ],
    options: [
      {
        id: 'a',
        label: '先保证高召回，再用重排与筛选条件压缩结果集',
        assessment: 'recommended',
        feedback:
          '把不漏当作底线，用后续环节控制噪音。代价是系统复杂度上升、单次耗时更长，但既不漏条款也减少了人工筛选量。',
      },
      {
        id: 'b',
        label: '只看召回率，把所有可能相关的条文都给出来',
        assessment: 'conditional',
        feedback:
          '漏检风险最低，但把筛选负担全部交给律师，结果越多越难发现真正相关的条文，效率代价由使用者承担。',
      },
      {
        id: 'c',
        label: '只看精确率，只给高置信度的少量结果',
        assessment: 'conditional',
        feedback:
          '结果干净，但低置信度却关键的相关条款会被直接漏掉，代价以漏检形式出现，且往往在事后复核时才被发现。',
      },
      {
        id: 'd',
        label: '两个指标都要，先都按高标准调',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：召回与精确同时拉高会让阈值互相牵制，调参没有明确优先级，最后两个指标都不达标。',
      },
    ],
    principle:
      '召回与精确冲突时，先确认漏检与噪音哪个代价更高，把底线指标定死，再用后续环节压低另一个代价。',
    checks: ['漏检和噪音哪个更贵', '筛选负担由谁承担', '底线指标定在哪'],
    references: [
      { id: 'retrieval-recall', label: '检索召回率' },
      { id: 'retrieval-precision', label: '检索精确率' },
      { id: 'reranking', label: '重排' },
      { id: 'metadata-filtering', label: '元数据过滤' },
    ],
  },
  {
    id: 'q84-review-cost-or-error',
    index: '84',
    tierId: 't3-tradeoff',
    moduleId: 'quality-constraints',
    shortTitle: '多审还是少错',
    question: '审核要投入更多人力，还是要控制人工成本？',
    scenario:
      '平台希望降低内容审核的人力投入，但漏放违规内容会带来处罚与口碑损失，而抽检比例降低后漏检风险上升。',
    facts: ['违规内容有处罚风险', '人工审核按量计费', '模型判定存在漏检', '违规内容比例并不高'],
    options: [
      {
        id: 'a',
        label: '模型先筛，按风险分层决定人工复核比例，高风险内容全量复核',
        assessment: 'recommended',
        feedback:
          '把有限人力集中到后果最重的内容上，用分层替代统一比例。代价是要维护分层规则与复核记录，但人力成本与漏检风险都落在可控范围。',
      },
      {
        id: 'b',
        label: '降低抽检比例，把人力成本压到最低',
        assessment: 'conditional',
        feedback:
          '成本目标达成，但漏检概率随抽检比例下降而上升，一旦被处罚，代价远超节省的人力，风险由平台整体承担。',
      },
      {
        id: 'c',
        label: '全量人工复核，确保不放过任何违规内容',
        assessment: 'conditional',
        feedback:
          '漏检风险最低，但审核量随内容增长线性上升，成本不可持续，最终要么涨价要么限制内容量，代价转移到业务侧。',
      },
      {
        id: 'd',
        label: '先降抽检，等出现问题再提高比例',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：问题出现前已经产生了实际违规，事后提高比例既无法追回损失，也会让团队在压力下临时加人。',
      },
    ],
    principle:
      '人工成本与错误成本冲突时，按后果严重程度分配复核人力，把全量审核留给高代价内容，代价是分层规则需要持续维护。',
    checks: ['哪类错误的代价最高', '复核比例由什么决定', '漏检后如何追责与补救'],
    references: [
      { id: 'content-moderation', label: '内容审核' },
      { id: 'human-evaluation', label: '人工评估' },
      { id: 'ai-risk-management', label: 'AI 风险管理' },
      { id: 'human-oversight', label: '人工监督' },
    ],
  },
  {
    id: 'q85-monitoring-or-overhead',
    index: '85',
    tierId: 't3-tradeoff',
    moduleId: 'quality-constraints',
    shortTitle: '细看还是省耗',
    question: '监控要记录每一次调用细节，还是要控制日志带来的开销？',
    scenario:
      '团队希望完整记录每次调用的输入输出以便排查问题，但全量日志带来存储成本，还会拖慢高峰期的响应速度。',
    facts: [
      '全量日志存储成本高',
      '写日志会占用响应时间',
      '问题排查需要调用细节',
      '高峰时段调用量集中',
    ],
    options: [
      {
        id: 'a',
        label: '常规调用只记指标，采样保留完整链路，异常请求全量落盘',
        assessment: 'recommended',
        feedback:
          '把详细日志留给真正需要排查的请求，用采样与异常触发控制开销。代价是部分正常请求无法完整复现，但存储与延迟都在预算内。',
      },
      {
        id: 'b',
        label: '全量记录输入输出，保证任何问题都能复盘',
        assessment: 'conditional',
        feedback:
          '排查能力最强，但存储与写日志开销随调用量增长，高峰期延迟上升，把性能代价转嫁给了正在使用的用户。',
      },
      {
        id: 'c',
        label: '只记录汇总指标，不保留单次调用细节',
        assessment: 'conditional',
        feedback:
          '开销最小，但问题出现时无法还原具体调用，只能靠猜测定位，把排查成本转移到工程团队的反复试错上。',
      },
      {
        id: 'd',
        label: '先全量记录，等存储报警再降级',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：报警发生前延迟已经受到影响，降级时又会丢失排查所需的日志，两头都没保住。',
      },
    ],
    principle:
      '监控粒度与开销冲突时，用采样和异常触发代替全量记录，把细节留给真正需要排查的请求，代价是部分可复现性。',
    checks: ['哪些问题需要完整链路', '开销预算上限是多少', '降级时优先丢什么'],
    references: [
      { id: 'observability', label: '可观测性' },
      { id: 'trace', label: '调用追踪' },
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'latency-optimization', label: '延迟优化' },
    ],
  },
  {
    id: 'q86-scope-or-deadline',
    index: '86',
    tierId: 't3-tradeoff',
    moduleId: 'capstone',
    shortTitle: '砍范围还是延期',
    question: '项目要按期交付，还是要保住完整功能范围？',
    scenario:
      '综合项目定在季度末评审，但核心场景的评测与护栏还没做完，若保范围就要延期，若按期就要砍掉部分能力。',
    facts: ['季度末有正式评审', '评测与护栏尚未完成', '部分能力可延后交付', '评审结果影响后续资源'],
    options: [
      {
        id: 'a',
        label: '按期评审，但明确砍掉的能力并给出补齐时间表',
        assessment: 'recommended',
        feedback:
          '把评审当作验证价值的机会，用明确的范围削减换取按期交付。代价是首版能力不完整，但砍掉的部分有时间表，评审时也说得清。',
      },
      {
        id: 'b',
        label: '保全部范围，把评审推到下个季度',
        assessment: 'conditional',
        feedback:
          '功能完整性最好，但把时间成本与资源风险付出去，评审延期会影响后续投入判断，机会成本由整个项目承担。',
      },
      {
        id: 'c',
        label: '按期交付但对外不说明范围变化，先过评审',
        assessment: 'conditional',
        feedback:
          '短期最省事，但范围缩水被隐藏后，评审结论建立在错误前提上，代价以信任损失的形式在后续协作中显现。',
      },
      {
        id: 'd',
        label: '范围不减、时间不延，靠加班赶完',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：评测与护栏最容易被压缩，交付质量下降，而评审时仍要面对没做完的部分，团队也付出额外消耗。',
      },
    ],
    principle:
      '时间与范围冲突时，先砍范围并公开说明，把被砍部分写进后续计划，代价是首版不完整但结论可信。',
    checks: ['哪些能力可以延后', '评审要验证什么', '砍掉的部分谁在何时补'],
    references: [
      { id: 'mvp', label: '最小可行产品' },
      { id: 'prioritization', label: '需求优先级' },
      { id: 'stakeholder-management', label: '干系人管理' },
      { id: 'acceptance-criteria', label: '验收标准' },
    ],
  },
  {
    id: 'q87-debt-or-delivery',
    index: '87',
    tierId: 't3-tradeoff',
    moduleId: 'capstone',
    shortTitle: '还债还是交付',
    question: '这个季度要还技术债，还是要继续交新功能？',
    scenario:
      '团队评估显示当前结构已拖慢迭代，但业务方本季度的功能承诺已经对外公布，两条路线需要同一批人力。',
    facts: [
      '结构问题已拖慢迭代',
      '功能承诺已对外公布',
      '两条路线共用同一批人力',
      '技术债影响稳定性与排期',
    ],
    options: [
      {
        id: 'a',
        label: '把还债拆成与功能同批交付的小项，按迭代固定分配一部分人力',
        assessment: 'recommended',
        feedback:
          '让还债跟着功能一起走，而不是等一个专门窗口。代价是每个功能都会慢一点，但稳定性改善持续发生，也不会挤掉已承诺的交付。',
      },
      {
        id: 'b',
        label: '本季度集中还债，功能交付往后推',
        assessment: 'conditional',
        feedback:
          '结构改善最彻底，但把已公布的功能承诺推迟，外部信任受损，代价由业务方与客户关系承担。',
      },
      {
        id: 'c',
        label: '先把功能全部交完，还债留到下一个季度',
        assessment: 'conditional',
        feedback:
          '交付承诺不违约，但结构问题继续累积，后续每次迭代更慢，把成本以更高的排期压力转嫁给未来团队。',
      },
      {
        id: 'd',
        label: '还债和功能都排满，靠团队自己消化',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：人力被排满后还债最先被牺牲，功能也只能勉强交付，最后两边都欠着。',
      },
    ],
    principle:
      '技术债与交付冲突时，把还债切成随迭代持续发生的小项，代价是每期速度略降，换取结构不再恶化。',
    checks: ['还债能否拆成小项', '每期分配多少人力', '不还债的后果多久显现'],
    references: [
      { id: 'tech-collaboration', label: '与工程师协作' },
      { id: 'roadmap', label: '产品路线图' },
      { id: 'continuous-delivery', label: '持续交付' },
      { id: 'prioritization', label: '需求优先级' },
    ],
  },
  {
    id: 'q88-metric-or-experience',
    index: '88',
    tierId: 't3-tradeoff',
    moduleId: 'capstone',
    shortTitle: '指标还是体验',
    question: '优化要盯住单一指标，还是要照顾整体体验？',
    scenario:
      '团队希望提升首次解决率，但把这个指标做高的一种方式是让助手少转人工，而少转人工会让答错的用户无处求助。',
    facts: [
      '首次解决率是核心考核项',
      '少转人工能拉高该指标',
      '答错用户需要人工兜底',
      '满意度与转人工率存在张力',
    ],
    options: [
      {
        id: 'a',
        label: '把首次解决率与错答率、转人工后满意度一起纳入考核',
        assessment: 'recommended',
        feedback:
          '用一组互相制约的指标代替单一目标，避免指标被单点优化。代价是考核口径更复杂、短期数字不好看，但用户求助路径不会被堵住。',
      },
      {
        id: 'b',
        label: '集中优化首次解决率，其他指标后续再看',
        assessment: 'conditional',
        feedback:
          '指标提升明显，但团队会自然地减少转人工，答错用户失去兜底，把体验代价转移给了最需要帮助的那部分用户。',
      },
      {
        id: 'c',
        label: '考核改为只看用户满意度，避免指标被扭曲',
        assessment: 'conditional',
        feedback:
          '更贴近用户感受，但满意度受样本与表达影响大，缺少过程指标支撑时，团队无法判断问题出在哪个环节，改进方向变得模糊。',
      },
      {
        id: 'd',
        label: '先冲指标，出问题再补体验',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：指标达成的同时体验已经受损，而补体验缺少触发条件，通常要等投诉积累到一定程度才会被处理。',
      },
    ],
    principle:
      '单一指标容易被单点优化，用一组互相制约的指标绑定真实体验，代价是考核与归因变得更复杂。',
    checks: ['指标被拉高靠的是什么动作', '谁在承担被牺牲的体验', '还缺哪个制衡指标'],
    references: [
      { id: 'north-star-metric', label: '北极星指标' },
      { id: 'product-analytics', label: '产品数据分析' },
      { id: 'task-success-rate', label: '任务成功率' },
      { id: 'human-escalation', label: '人工升级处理' },
    ],
  },
  {
    id: 'q89-compliance-or-experience',
    index: '89',
    tierId: 't3-tradeoff',
    moduleId: 'capstone',
    shortTitle: '合规还是顺滑',
    question: '流程要满足合规留痕，还是要让用户操作更顺？',
    scenario:
      '产品希望简化企业客户的授权与确认步骤以缩短开通时间，但合规要求每次数据处理都有可追溯的授权记录。',
    facts: ['授权记录需可追溯', '开通步骤多影响转化', '企业客户对合规敏感', '简化步骤会削弱留痕'],
    options: [
      {
        id: 'a',
        label: '把授权做成一次清晰确认并自动留痕，减少重复填写',
        assessment: 'recommended',
        feedback:
          '合规要求不变，把体验优化放在减少重复操作上。代价是要改造授权与记录链路，但既保住了可追溯性，也压缩了开通步骤。',
      },
      {
        id: 'b',
        label: '先简化流程提升转化，授权记录后续补齐',
        assessment: 'conditional',
        feedback:
          '转化率短期提升，但授权记录缺失无法事后补造，合规风险被留在系统里，一旦被追溯就难以自证。',
      },
      {
        id: 'c',
        label: '保留全部合规步骤，不做体验优化',
        assessment: 'conditional',
        feedback:
          '合规最稳妥，但开通步骤多、转化受阻，把体验代价交给客户与销售团队承担，长期也会影响合规方案的落地率。',
      },
      {
        id: 'd',
        label: '先按体验优先上线，等合规检查前再补',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：检查前的时间里留痕一直缺失，补齐也无法回溯历史操作，最终仍要在检查压力下仓促改造。',
      },
    ],
    principle:
      '合规与体验冲突时，把合规当作不可让渡的底线，把优化空间放在减少重复动作上，代价是要投入改造留痕链路。',
    checks: ['哪些记录是强制留存的', '哪一步可以合并而非删除', '缺失记录能否补回'],
    references: [
      { id: 'data-protection', label: '数据保护' },
      { id: 'informed-consent', label: '知情同意' },
      { id: 'auditability', label: '可审计性' },
      { id: 'user-control', label: '用户控制权' },
    ],
  },
  {
    id: 'q90-pilot-or-scale',
    index: '90',
    tierId: 't3-tradeoff',
    moduleId: 'capstone',
    shortTitle: '试点还是铺开',
    question: '试点经验要直接复制，还是要为规模化重做一遍？',
    scenario:
      '试点团队反馈效果很好，但试点依赖人工兜底与专人维护，规模化后这些投入无法按同样比例扩张。',
    facts: [
      '试点有人工兜底投入',
      '试点阶段由专人维护',
      '规模化无法同比例加人',
      '业务方希望尽快复制',
    ],
    options: [
      {
        id: 'a',
        label: '先补齐可规模化的部分，再按批次复制并设观察点',
        assessment: 'recommended',
        feedback:
          '把试点里靠人力撑住的部分显式替换成产品或流程能力，再谈复制。代价是铺开速度慢，但每批扩张都在可控成本内。',
      },
      {
        id: 'b',
        label: '直接复制到所有业务线，先拿到规模效果',
        assessment: 'conditional',
        feedback:
          '铺开速度最快，但人工兜底无法同比例扩张，问题会在规模上去之后集中暴露，代价由一线团队承担。',
      },
      {
        id: 'c',
        label: '先只在试点维持现状，暂不扩张',
        assessment: 'conditional',
        feedback:
          '成本与质量最可控，但把规模化机会让出去，业务方看不到推广路径，试点投入的回报周期被无限拉长。',
      },
      {
        id: 'd',
        label: '一边快速复制，一边补可规模化的能力',
        assessment: 'risky',
        feedback:
          '两个目标都没守住：复制带来的兜底压力会挤占改造人力，改造迟迟完不成，规模越大问题越多。',
      },
    ],
    principle:
      '试点与规模化之间，先把靠人力撑住的部分替换为可复制能力，再按批次扩张，代价是推广速度。',
    checks: ['试点靠什么撑住效果', '规模化后谁来兜底', '每批扩张的观察点是什么'],
    references: [
      { id: 'ai-adoption', label: 'AI 采用' },
      { id: 'go-to-market', label: '上线与增长' },
      { id: 'project-management', label: '项目管理' },
      { id: 'feedback-loop', label: '反馈闭环' },
    ],
  },
];

export const TIER3_PM_ACTIONS: Record<string, string> = {
  'q61-accuracy-or-explain':
    '用错误成本、合规要求与回滚能力写出一段可被质疑的上线决策说明，并注明主动放弃了哪部分准确率。',
  'q62-ceiling-or-certainty':
    '把「哪些字段必须可复现」写进验收标准，并明确模型只承担语言归一化这一环，其余走确定性规则。',
  'q63-general-or-finetune':
    '把术语表维护责任人与更新频率写进方案，并给出微调的触发条件、回归评测集与验收方式。',
  'q64-coverage-or-boundary':
    '列出可靠问题类型清单与转人工判定规则，把覆盖率目标与错答上限一起写进上线验收标准与复盘点。',
  'q65-autonomy-or-audit':
    '按动作风险分级列出自动化清单，明确每级的留痕字段与人工确认点，作为上线评审材料。',
  'q66-value-or-cost':
    '写出分层额度规则与成本上限的对应表，标出每层人群的判定依据、月度复盘口径与超支降级顺序。',
  'q67-ship-or-maintain':
    '把知识配置化写成下一迭代的验收标准与明确排期，并记录本版为赶节点主动放弃的能力清单与影响。',
  'q68-breadth-or-depth':
    '选定一个岗位写出可量化的成功标准、数据条件与复制清单，并明确本季度主动不覆盖的岗位及理由。',
  'q69-growth-or-quality':
    '把质量门槛写成放量准入条件，列出分批开放的问题类型顺序、每批观察指标与不达标时的回退动作。',
  'q70-build-or-buy':
    '画出能力分层图，标出必须自有与可采购的部分，并写明切换触发条件与迁移工作量估算。',
  'q71-rag-quality-latency':
    '写出延迟预算与召回上限的对应表，标出超出预算时的降级路径、兜底答案与转人工触发条件。',
  'q72-autonomy-or-control':
    '列出 Agent 动作清单并按可逆性分级，为每个不可逆动作定义确认界面、日志字段与权限回收方式。',
  'q73-finetune-or-maintain':
    '把语气规范拆成可提示的规则与示例清单，写明微调的触发条件、评测方式与所需人力来源。',
  'q74-workflow-or-simple':
    '画出主路径与不稳定步骤清单，标出人工衔接位置、失败后的重跑范围与后续自动化的替换顺序。',
  'q75-refactor-or-incremental':
    '按模块排出替换顺序与流量切换计划，写明每一步的回退条件、观察指标与过渡期维护责任人。',
  'q76-efficiency-or-control':
    '标出流程中唯一不可逆的动作，为它设计整体预览与确认界面，并写明错发后的撤回路径与责任人。',
  'q77-automation-or-trust':
    '为自动整理设计依据展示与一键还原入口，并把首次接受率与还原使用率写进上线观察指标。',
  'q78-info-or-burden':
    '定义关键依据的判定规则与默认展示条数，把完整依据收进可展开详情并保留一键追溯入口。',
  'q79-personal-or-consistent':
    '列出不可改写的事实清单与可调整的表达维度，写成提示约束并纳入每次上线的评测检查项。',
  'q80-proactive-or-intrusive':
    '定义风险分级与对应提示方式，写明每一级的打扰频率上限，以及用户关闭提醒后的兜底保障。',
  'q81-quality-or-cost':
    '按问题难度与业务价值写出路由规则表，标注兜底模型、单次成本上限与每月校准责任人。',
  'q82-launch-or-eval':
    '按风险划出首批放量场景与评测补齐清单，写明上线范围、观察指标与回滚触发条件及责任人。',
  'q83-coverage-or-precision':
    '写出召回与精确的底线指标与目标指标，说明筛选环节由谁承担，并给出重排与过滤规则的验收方式。',
  'q84-review-cost-or-error':
    '按内容风险分层定义复核比例与判定标准，写明抽检记录留存方式与漏检后的补救流程与责任人。',
  'q85-monitoring-or-overhead':
    '定义采样比例与异常触发条件，写明日志保留时长、开销上限，以及降级时优先舍弃的日志类型。',
  'q86-scope-or-deadline':
    '列出本期交付范围与主动延后清单，写明补齐时间表、评审要回答的关键问题与验证方式。',
  'q87-debt-or-delivery':
    '把还债拆成可验收的小项并入迭代计划，写明每期人力占比、结构改善指标与迭代验收方式。',
  'q88-metric-or-experience':
    '写出主指标与制衡指标的成对关系，说明每个指标被拉高时可能牺牲什么，并定好月度复盘口径。',
  'q89-compliance-or-experience':
    '列出强制留痕字段与可合并的操作步骤，画出优化后的授权流程，并标注每处合规校验点与责任人。',
  'q90-pilot-or-scale':
    '列出试点中依赖人力的环节与替换方案，排出分批复制顺序、每批成功判定标准与退出条件。',
};
