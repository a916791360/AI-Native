import type { LearningQuestion } from '../types';

/**
 * 第二层：场景判断。
 * 每道题都带真实约束（数据不全、成本有限、错误不可逆、知识频繁更新、
 * 合规限制、时延预算、用户专业程度），因此会出现「看起来也行」的选项。
 * 作者按自然顺序写题：正确项固定放在数组第一位，装配时由 orderOptions 按 id 打散。
 */
export const TIER2_QUESTIONS: LearningQuestion[] = [
  {
    id: 'q31-long-doc-source',
    index: '31',
    tierId: 't2-judge',
    moduleId: 'model-boundaries',
    shortTitle: '文档增长与来源',
    question: '制度文档持续增长，还把全文拼进提示词吗？',
    scenario:
      '团队有数千份制度文档且每月新增，员工提问必须能点开原文核对，预算只够单次调用一万字以内。',
    facts: ['文档每月持续新增', '答案必须标出来源段落', '单次调用成本有上限'],
    options: [
      {
        id: 'a',
        label: '先检索相关片段再让模型作答',
        assessment: 'recommended',
        feedback:
          '检索让上下文随相关证据而不是全部文档增长，同时保留可点击的来源段落，来源与成本两个约束都能满足。',
      },
      {
        id: 'b',
        label: '换一个上下文更大的模型继续拼全文',
        assessment: 'conditional',
        feedback:
          '更大窗口能缓解容量问题，但成本随全文长度上升，而且文档持续新增意味着窗口迟早会再被撑满，来源定位也没有解决。',
      },
      {
        id: 'c',
        label: '把全部文档拼进提示词并让模型自己找',
        assessment: 'risky',
        feedback:
          '成本与延迟随全文线性上涨，而且更多文字不等于模型能稳定找到正确证据，来源标注也失去依据。',
      },
    ],
    principle: '上下文容量不是知识管理方案；相关证据的选择比输入总量更重要。',
    checks: ['信息是否超过上下文窗口', '是否需要来源追溯', '能否先缩小候选证据'],
    references: [
      { id: 'context-window', label: '上下文窗口' },
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'citation-generation', label: '引用生成' },
    ],
  },
  {
    id: 'q32-high-risk-capability',
    index: '32',
    tierId: 't2-judge',
    moduleId: 'model-boundaries',
    shortTitle: '高风险能力边界',
    question: '高风险场景里，通用模型的回答可以直接采信吗？',
    scenario:
      '医疗咨询团队想让模型直接给出用药剂量建议，一旦出错后果严重，而团队手上只有通用模型可用。',
    facts: ['一旦出错后果不可逆', '只有通用模型可用', '领域有明确规范要求', '缺少专业审核环节'],
    options: [
      {
        id: 'a',
        label: '让模型只做资料整理与风险提示，结论交专业人员判断',
        assessment: 'recommended',
        feedback:
          '用药建议属于高风险结论，让模型整理资料、由专业人员判断，既用上模型效率又保留责任主体。',
      },
      {
        id: 'b',
        label: '先小范围试点，由专业人员逐条复核后再答复',
        assessment: 'conditional',
        feedback:
          '小范围试点加逐条复核能控制风险，但复核成本很高，而且没有改变「模型直接给出结论」这一根本问题。',
      },
      {
        id: 'c',
        label: '把领域规范写进提示词，限制模型只答规范内问题',
        assessment: 'conditional',
        feedback:
          '把规范写进提示词能约束回答范围，但规范之外的问题依然存在，模型也无法为越界回答负责。',
      },
      {
        id: 'd',
        label: '直接让模型给出剂量建议并由客服转述',
        assessment: 'risky',
        feedback:
          '通用模型缺少领域约束，由客服转述等于把专业判断交给非专业人员，而这类错误后果不可逆。',
      },
    ],
    principle: '模型能走多远由错误成本决定，高风险结论必须由具备责任能力的人做出。',
    checks: ['错误后果是否可逆', '是否有具备资质的责任人', '模型输出能否被独立验证'],
    references: [
      { id: 'ai-capability-boundary', label: 'AI 能力边界' },
      { id: 'human-oversight', label: '人工监督' },
      { id: 'ai-risk-management', label: 'AI 风险管理' },
      { id: 'hallucination', label: '幻觉' },
    ],
  },
  {
    id: 'q33-bigger-window',
    index: '33',
    tierId: 't2-judge',
    moduleId: 'model-boundaries',
    shortTitle: '大窗口能否解决',
    question: '换成更大的上下文窗口，就能答对近期政策吗？',
    scenario:
      '客服团队发现模型常答错近期政策，采购建议换成上下文窗口更大的模型，团队想知道这能否解决问题。',
    facts: ['错误来自知识过期', '新模型的窗口更大', '预算可覆盖一次升级', '知识每月都在更新'],
    options: [
      {
        id: 'a',
        label: '先定位错误来源，再决定是否需要更大窗口',
        assessment: 'recommended',
        feedback:
          '先定位错误来源再选手段，能避免把知识过期误当成窗口容量问题，采购前先确认根因更稳妥。',
      },
      {
        id: 'b',
        label: '同时升级窗口并接入知识检索，双管齐下',
        assessment: 'conditional',
        feedback:
          '同时升级和接入检索能覆盖两种情况，但一次性投入两份成本，根因未查清时很容易白花钱。',
      },
      {
        id: 'c',
        label: '先按现状扩大窗口并观察一周',
        assessment: 'conditional',
        feedback: '扩大窗口观察一周成本可控，但如果错误来自知识过期，观察结果仍会指向同一个失败。',
      },
      {
        id: 'd',
        label: '直接采购更大窗口的模型，认为窗口就是答案质量',
        assessment: 'risky',
        feedback: '把窗口大小等同于回答质量，忽略了错误来自知识过期，采购之后问题依旧存在。',
      },
    ],
    principle: '窗口容量解决的是放得下，不解决知识是否最新；先定位失败原因再选手段。',
    checks: ['失败原因是否已定位', '知识是否需要更新', '换模型能否改变根因'],
    references: [
      { id: 'context-window', label: '上下文窗口' },
      { id: 'long-context', label: '长上下文' },
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'hallucination', label: '幻觉' },
    ],
  },
  {
    id: 'q34-small-model-rules',
    index: '34',
    tierId: 't2-judge',
    moduleId: 'model-boundaries',
    shortTitle: '小模型加规则',
    question: '字段规则明确的录入任务，一定要用大模型吗？',
    scenario:
      '财务团队要把报销单按十几个字段录入系统，字段规则明确，团队希望压低单次成本并保证格式稳定。',
    facts: ['字段规则基本可枚举', '单量很大且要控成本', '格式错误可当场发现', '任务几乎不需要推理'],
    options: [
      {
        id: 'a',
        label: '用小模型加规则校验，把大模型留给例外情况',
        assessment: 'recommended',
        feedback:
          '字段规则可枚举、错误能当场发现，用小模型加规则校验更便宜也更稳定，大模型只处理真正的例外。',
      },
      {
        id: 'b',
        label: '直接用大模型统一处理所有单据',
        assessment: 'conditional',
        feedback:
          '大模型统一处理能省掉规则维护，但单量大时成本随单量线性上升，格式稳定性也不如规则校验。',
      },
      {
        id: 'c',
        label: '让模型自由发挥，靠人工逐条核对结果',
        assessment: 'risky',
        feedback:
          '让模型自由发挥再靠人工逐条核对，等于把成本从模型转移到人力，而且错误会先进入系统。',
      },
    ],
    principle: '任务越确定，越该用便宜且可验证的方案；模型能力只在需要判断的地方付费。',
    checks: ['规则能否被明确写出', '错误能否被即时校验', '成本是否随单量放大'],
    references: [
      { id: 'model-capability', label: '模型能力' },
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'structured-output', label: '结构化输出' },
      { id: 'model-routing', label: '模型路由' },
    ],
  },
  {
    id: 'q35-trace-to-source',
    index: '35',
    tierId: 't2-judge',
    moduleId: 'model-boundaries',
    shortTitle: '输出可追溯',
    question: '结论必须能回到原文时，提示词该怎么写？',
    scenario:
      '合规团队要求每条结论都能定位到制度原文的具体条款，而模型目前只给结论、不给任何依据。',
    facts: ['每条结论要有出处', '制度原文可以检索', '审计会逐条抽查依据'],
    options: [
      {
        id: 'a',
        label: '先检索条款，再要求模型引用条款作答',
        assessment: 'recommended',
        feedback:
          '先检索到具体条款再要求引用作答，让每条结论都有可点开的依据，直接满足审计抽查的要求。',
      },
      {
        id: 'b',
        label: '在提示词里要求模型尽量说明理由',
        assessment: 'conditional',
        feedback:
          '要求模型说明理由能提高可读性，但理由不等于原文出处，审计时仍然无法定位到具体条款。',
      },
      {
        id: 'c',
        label: '让模型凭记忆补充依据，事后人工核对',
        assessment: 'risky',
        feedback:
          '让模型凭记忆补依据，会生成看似合理却无法核对的引用，抽查时反而制造新的合规风险。',
      },
    ],
    principle: '可追溯不是写作风格，而是先取到证据再让模型基于证据表达。',
    checks: ['依据是否先于生成', '引用能否被点开验证', '无依据时是否有拒答'],
    references: [
      { id: 'citation-generation', label: '引用生成' },
      { id: 'grounding', label: '事实依据约束' },
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'auditability', label: '可审计性' },
    ],
  },
  {
    id: 'q36-incomplete-data',
    index: '36',
    tierId: 't2-judge',
    moduleId: 'opportunity-judgment',
    shortTitle: '数据不全机会',
    question: '数据不全时，这个自动分类机会还成立吗？',
    scenario:
      '团队想用历史工单训练分类模型，但只有近三个月记录，而且标签由不同客服手填，口径并不一致。',
    facts: ['只有近三个月记录', '标签口径并不一致', '业务方希望尽快上线'],
    options: [
      {
        id: 'a',
        label: '先做规则加人工兜底的小范围验证',
        assessment: 'recommended',
        feedback:
          '数据只覆盖三个月且标签口径不一，先用规则加人工兜底验证核心场景，能在小成本下确认机会是否成立。',
      },
      {
        id: 'b',
        label: '先按现有标签训练一版再看效果',
        assessment: 'conditional',
        feedback:
          '按现有标签先训练一版能快速看到效果，但标签口径不一致会让评测结果无法解释，好坏都说不清原因。',
      },
      {
        id: 'c',
        label: '直接全量上线，靠线上数据自动纠偏',
        assessment: 'risky',
        feedback:
          '靠线上数据自动纠偏的前提是有可靠反馈，标签本身不可信时，只会把错误更快固化下来。',
      },
    ],
    principle: '数据不全时先把机会缩小到可验证的范围，而不是用上线来代替验证。',
    checks: ['数据是否覆盖主要场景', '标签是否可信', '失败是否可兜底'],
    references: [
      { id: 'training-data', label: '训练数据' },
      { id: 'ai-use-case', label: 'AI 应用场景' },
      { id: 'human-in-the-loop', label: '人在回路' },
      { id: 'mvp', label: '最小可行产品' },
    ],
  },
  {
    id: 'q37-irreversible-error',
    index: '37',
    tierId: 't2-judge',
    moduleId: 'opportunity-judgment',
    shortTitle: '错误不可逆',
    question: '错误不可逆的动作，应该交给模型自动执行吗？',
    scenario:
      '销售团队想让模型自动给客户发送报价邮件，价格一旦发错就无法撤回，而团队希望全自动以提升响应速度。',
    facts: ['报价错误无法撤回', '客户会直接看到内容', '团队追求响应速度'],
    options: [
      {
        id: 'a',
        label: '模型生成草稿，发送前由销售确认',
        assessment: 'recommended',
        feedback:
          '报价一旦发出无法撤回，让模型只生成草稿、由销售确认发送，用最小的人工环节守住不可逆动作。',
      },
      {
        id: 'b',
        label: '设置金额阈值，低于阈值的自动发送',
        assessment: 'conditional',
        feedback:
          '按金额设阈值能减少确认次数，但阈值以下的错误报价同样无法撤回，风险只是被缩小而不是消除。',
      },
      {
        id: 'c',
        label: '全自动发送，出错后再发更正邮件',
        assessment: 'risky',
        feedback: '先发错再补更正邮件会直接损害客户关系，把本可避免的错误变成对外可见的事故。',
      },
    ],
    principle: '不可逆动作的自动化程度取决于出错后能否收回，而不是取决于效率收益。',
    checks: ['动作是否可撤回', '错误成本由谁承担', '确认环节是否可承受'],
    references: [
      { id: 'human-in-the-loop', label: '人在回路' },
      { id: 'undo-action', label: '撤销操作' },
      { id: 'ai-risk-management', label: 'AI 风险管理' },
      { id: 'autopilot-pattern', label: '自动驾驶模式' },
    ],
  },
  {
    id: 'q38-roi-judgment',
    index: '38',
    tierId: 't2-judge',
    moduleId: 'opportunity-judgment',
    shortTitle: '投入产出比',
    question: '这项提效投入，该怎么判断值不值？',
    scenario:
      '内容团队每月产出两百篇稿，希望用模型做初稿，但需要两人长期维护提示词与评测，团队想先算清值不值。',
    facts: ['每月稿件量基本固定', '需要两人长期维护', '初稿质量需人工修改', '人力成本可以估算'],
    options: [
      {
        id: 'a',
        label: '先量化人工节省与维护成本再决定',
        assessment: 'recommended',
        feedback: '把人工节省与两人维护成本放在一起量化，才能判断净收益，避免只看模型效果就立项。',
      },
      {
        id: 'b',
        label: '先在一条内容线试点并统计真实耗时',
        assessment: 'conditional',
        feedback:
          '单条内容线试点能拿到真实耗时数据，但样本只覆盖一类稿件，直接外推到全部产线并不成立。',
      },
      {
        id: 'c',
        label: '先看模型效果，效果够好再考虑成本',
        assessment: 'conditional',
        feedback:
          '先看效果再算成本能降低当下的决策压力，但效果达标不等于净收益为正，维护成本仍会持续发生。',
      },
      {
        id: 'd',
        label: '直接按人均产出翻倍来立项',
        assessment: 'risky',
        feedback:
          '把演示中的产出倍数当成业务收益，忽略了初稿仍需人工修改，以及两人长期维护的持续投入。',
      },
    ],
    principle: '提效价值要减去长期维护成本，模型效果的提升不等于业务的净收益。',
    checks: ['节省是否可量化', '维护成本是否计入', '收益是否随规模变化'],
    references: [
      { id: 'business-model', label: '商业模式' },
      { id: 'product-analytics', label: '产品数据分析' },
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'problem-solution-fit', label: '问题方案匹配' },
    ],
  },
  {
    id: 'q39-stated-vs-real',
    index: '39',
    tierId: 't2-judge',
    moduleId: 'opportunity-judgment',
    shortTitle: '需求与现场',
    question: '需求方说的方案，和现场问题对得上吗？',
    scenario:
      '需求方说要一个智能问答机器人，实地观察后发现客服大部分时间花在跨系统查订单状态，而不是回答知识问题。',
    facts: ['需求方指定了方案形态', '现场耗时集中在查单', '客服需切换多个系统'],
    options: [
      {
        id: 'a',
        label: '先回到现场确认问题，再决定方案形态',
        assessment: 'recommended',
        feedback:
          '需求方给的是方案而不是问题，回到现场确认耗时集中在查单，才能判断该做问答还是该做查询。',
      },
      {
        id: 'b',
        label: '按需求方要求先做问答机器人',
        assessment: 'conditional',
        feedback:
          '按需求方要求做问答机器人能快速交付，但现场真正耗时在跨系统查单，功能上线也解决不了。',
      },
      {
        id: 'c',
        label: '照需求文档开发，交付后再看效果',
        assessment: 'risky',
        feedback:
          '照需求文档开发再验证效果，等于把问题定义的责任也交给需求方，返工成本由团队承担。',
      },
    ],
    principle: '需求方给的是方案，产品经理要先还原问题，再判断方案是否匹配。',
    checks: ['问题是否被现场验证', '方案与耗时是否对应', '是否有更小的解法'],
    references: [
      { id: 'requirement-analysis', label: '需求分析' },
      { id: 'user-research', label: '用户研究' },
      { id: 'problem-solution-fit', label: '问题方案匹配' },
      { id: 'user-interview', label: '用户访谈' },
    ],
  },
  {
    id: 'q40-compliance-limit',
    index: '40',
    tierId: 't2-judge',
    moduleId: 'opportunity-judgment',
    shortTitle: '合规限制',
    question: '合规受限时，这个训练机会还有别的做法吗？',
    scenario:
      '团队想用客户通话录音训练客服助手，法务指出录音涉及个人信息，未经同意不能用于模型训练。',
    facts: ['录音包含个人信息', '尚未取得明确同意', '客服场景确实有需求'],
    options: [
      {
        id: 'a',
        label: '改用脱敏文本与公开知识构建能力',
        assessment: 'recommended',
        feedback:
          '录音含个人信息且未获同意，改用脱敏文本与公开知识重建能力，能在合规前提下保留大部分场景价值。',
      },
      {
        id: 'b',
        label: '先做脱敏试点并请法务逐条确认',
        assessment: 'conditional',
        feedback:
          '脱敏试点加逐条确认能降低风险，但脱敏是否彻底、授权范围是否覆盖训练用途都还不确定。',
      },
      {
        id: 'c',
        label: '先用录音训练，等上线前再补授权',
        assessment: 'risky',
        feedback: '先用录音训练再补授权，把合规风险留到上线前，一旦授权拿不到，前期投入全部作废。',
      },
    ],
    principle: '合规不是上线前的检查项，它决定方案可以从哪些数据出发。',
    checks: ['数据是否含个人信息', '授权是否覆盖用途', '是否有合规替代数据'],
    references: [
      { id: 'data-protection', label: '数据保护' },
      { id: 'privacy', label: '隐私' },
      { id: 'informed-consent', label: '知情同意' },
      { id: 'data-governance', label: '数据治理' },
    ],
  },
  {
    id: 'q41-update-freq-rag',
    index: '41',
    tierId: 't2-judge',
    moduleId: 'solution-choice',
    shortTitle: '微调记知识',
    question: '知识每周更新，还应该靠微调记住它吗？',
    scenario:
      '政策问答助手每周都有新文件，团队考虑用微调把知识写进模型，但文件还在持续增加且要求当天可查。',
    facts: ['政策文件每周更新', '更新需要当天生效', '团队有微调的预算'],
    options: [
      {
        id: 'a',
        label: '用检索接入最新文件，微调只调表达风格',
        assessment: 'recommended',
        feedback:
          '政策每周更新且要当天生效，用检索接入最新文件、微调只管表达风格，能让知识更新与模型训练彻底解耦。',
      },
      {
        id: 'b',
        label: '定期重新微调，并配合检索兜底',
        assessment: 'conditional',
        feedback:
          '定期重训加检索兜底能兼顾两者，但重训周期与当天生效之间存在时间差，更新仍然会滞后。',
      },
      {
        id: 'c',
        label: '一次微调把知识固化，更新时再微调一次',
        assessment: 'risky',
        feedback:
          '把会变的知识固化进模型，每次更新都要重新微调，成本和滞后都会随更新频率一起放大。',
      },
    ],
    principle: '会变的知识放在模型外面，稳定的行为才值得写进模型里面。',
    checks: ['知识更新频率多高', '更新能否当天生效', '微调是否可回滚'],
    references: [
      { id: 'fine-tuning', label: '微调' },
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'data-ingestion', label: '数据接入' },
      { id: 'indexing-pipeline', label: '索引管线' },
    ],
  },
  {
    id: 'q42-workflow-or-agent',
    index: '42',
    tierId: 't2-judge',
    moduleId: 'solution-choice',
    shortTitle: '流程还是智能体',
    question: '步骤固定的多步任务，该用工作流还是 Agent？',
    scenario:
      '团队要把合同审批做成自动流程，步骤固定且每一步都要留痕，但中间有一步需要判断条款是否异常。',
    facts: ['流程步骤基本固定', '每一步都需要留痕', '一步需要判断异常'],
    options: [
      {
        id: 'a',
        label: '用工作流编排，只在判断步骤引入模型',
        assessment: 'recommended',
        feedback:
          '步骤固定且要留痕，用工作流编排能让每一步都可审计，只在判断条款异常的那一步调用模型。',
      },
      {
        id: 'b',
        label: '先用 Agent 跑通流程，再逐步收敛',
        assessment: 'conditional',
        feedback:
          '先用 Agent 跑通再收敛能快速看到全貌，但 Agent 的执行路径不确定，审批留痕的要求很难满足。',
      },
      {
        id: 'c',
        label: '交给自主 Agent 自行决定流程走向',
        assessment: 'risky',
        feedback:
          '让 Agent 自行决定流程走向，等于放弃对审批步骤的控制，也无法向审计说明每一步的依据。',
      },
    ],
    principle: '流程越固定，越该用可预测的编排；把智能放在真正需要判断的那一步。',
    checks: ['步骤是否可预先确定', '是否需要审计留痕', '判断步骤是否可控'],
    references: [
      { id: 'workflow-automation', label: '工作流自动化' },
      { id: 'ai-agent', label: 'AI Agent' },
      { id: 'task-decomposition', label: '任务拆解' },
      { id: 'human-in-the-loop', label: '人在回路' },
    ],
  },
  {
    id: 'q43-rag-boundary',
    index: '43',
    tierId: 't2-judge',
    moduleId: 'solution-choice',
    shortTitle: '检索的边界',
    question: '检索召回不到内容时，能直接让模型自己生成吗？',
    scenario:
      '客服知识库里长尾问题很多，检索经常召回不到内容，团队想知道是不是该放弃检索、改成让模型直接生成。',
    facts: ['长尾问题占比很高', '知识库覆盖并不全', '错误答复会误导用户'],
    options: [
      {
        id: 'a',
        label: '检索不到时明确拒答并转人工',
        assessment: 'recommended',
        feedback:
          '知识库里没有的内容模型也编不出来，检索不到时明确拒答并转人工，是唯一不会误导用户的出口。',
      },
      {
        id: 'b',
        label: '先扩大召回，再让模型总结现有内容',
        assessment: 'conditional',
        feedback:
          '扩大召回再总结能提高覆盖，但长尾问题本就缺少知识，召回提升有限，错误答复的风险依然存在。',
      },
      {
        id: 'c',
        label: '检索不到就让模型自由生成答案',
        assessment: 'risky',
        feedback:
          '检索不到就自由生成，等于让模型在无依据时编造答案，用户无法分辨真假，客服还会把错误继续传下去。',
      },
    ],
    principle: '检索的边界就是知识的边界；没有证据时，诚实拒答比流畅生成更负责。',
    checks: ['知识是否真实存在', '召回失败是否可识别', '无答案时的出口是什么'],
    references: [
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'retrieval-recall', label: '检索召回率' },
      { id: 'human-escalation', label: '人工升级处理' },
      { id: 'hallucination', label: '幻觉' },
    ],
  },
  {
    id: 'q44-cost-latency-tier',
    index: '44',
    tierId: 't2-judge',
    moduleId: 'solution-choice',
    shortTitle: '档位与延迟',
    question: '延迟和成本都卡死时，模型档位怎么定？',
    scenario: '在线客服助手要求两秒内响应，且单次成本有硬上限，团队在大模型和小模型之间犹豫不决。',
    facts: ['响应要求两秒以内', '单次成本有硬上限', '问题难度差异很大'],
    options: [
      {
        id: 'a',
        label: '简单问题走小模型，难题升级到大模型',
        assessment: 'recommended',
        feedback:
          '延迟和成本都卡死时，按问题难度分配算力，简单问题走小模型、难题升级，比统一档位更划算。',
      },
      {
        id: 'b',
        label: '统一用中等模型，先上线再优化',
        assessment: 'conditional',
        feedback:
          '统一用中等模型能简化工程实现，但简单问题付出了多余成本，难题也可能达不到质量要求。',
      },
      {
        id: 'c',
        label: '全部用最强模型，靠缓存摊薄成本',
        assessment: 'risky',
        feedback:
          '全部用最强模型再靠缓存摊薄，缓存命中率无法保证，未命中的请求会直接冲破成本上限。',
      },
    ],
    principle: '约束固定时，按问题难度分配算力，比统一档位更省也更稳。',
    checks: ['延迟预算是否硬性', '成本能否按请求分摊', '问题难度是否可分'],
    references: [
      { id: 'model-routing', label: '模型路由' },
      { id: 'latency-budget', label: '延迟预算' },
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'semantic-cache', label: '语义缓存' },
    ],
  },
  {
    id: 'q45-hybrid-solution',
    index: '45',
    tierId: 't2-judge',
    moduleId: 'solution-choice',
    shortTitle: '混合方案',
    question: '既要理解自然语言又要查准数字，该怎么组合？',
    scenario:
      '内部知识助手既要回答概念问题，也要按条件查库存，团队发现纯检索答不准数字，纯查询又听不懂自然语言。',
    facts: ['概念问题需要检索', '数字必须实时准确', '用户用自然语言提问'],
    options: [
      {
        id: 'a',
        label: '模型负责理解意图，数据由接口实时查询',
        assessment: 'recommended',
        feedback:
          '库存数字必须实时准确，让模型负责理解意图、由接口实时查询数据，才能既听懂问题又不编造数字。',
      },
      {
        id: 'b',
        label: '让模型先检索，再拼接查询结果',
        assessment: 'conditional',
        feedback:
          '先检索再拼接查询结果能复用现有知识库，但检索到的库存可能是旧值，数字准确性仍然没有保证。',
      },
      {
        id: 'c',
        label: '让模型根据检索到的历史数据估算数字',
        assessment: 'risky',
        feedback: '让模型根据历史数据估算数字，用户会把它当成真实库存，错误会直接进入业务决策。',
      },
    ],
    principle: '该实时取的数据不要靠生成，模型负责理解与组织，事实由系统提供。',
    checks: ['数据是否需要实时', '答案是否含精确数值', '能否调用现成接口'],
    references: [
      { id: 'function-calling', label: '函数调用' },
      { id: 'tool-use', label: '工具调用' },
      { id: 'retrieval-augmented-generation', label: '检索增强生成' },
      { id: 'structured-output', label: '结构化输出' },
    ],
  },
  {
    id: 'q46-pro-vs-consumer',
    index: '46',
    tierId: 't2-judge',
    moduleId: 'product-experience',
    shortTitle: '专业与普通用户',
    question: '专业用户和普通用户能共用一套控制设计吗？',
    scenario:
      '同一套诊断功能，一边给工程师用，一边给普通用户用，团队想用同一套界面与同一套默认权限。',
    facts: ['两类用户能力差异大', '普通用户易误信结论', '专业用户需要看细节'],
    options: [
      {
        id: 'a',
        label: '按能力分层，专业版给细节、普通版给结论与提醒',
        assessment: 'recommended',
        feedback:
          '两类用户判断能力差异大，专业版给细节、普通版给结论与提醒，才能让默认值匹配各自的风险承受力。',
      },
      {
        id: 'b',
        label: '先做一套简单界面，专业用户用高级设置',
        assessment: 'conditional',
        feedback:
          '一套简单界面加高级设置能减少开发量，但普通用户仍会误信默认结论，专业用户也缺少必要细节。',
      },
      {
        id: 'c',
        label: '两版共用同一默认值，靠用户自己调整',
        assessment: 'risky',
        feedback:
          '两版共用同一默认值，等于让不具备判断能力的用户承担专业级的风险，误用后很难追责。',
      },
    ],
    principle: '控制设计要匹配用户判断能力，同一功能对不同人群需要不同的默认值。',
    checks: ['用户是否有判断能力', '默认值由谁承担风险', '细节是否会淹没用户'],
    references: [
      { id: 'user-control', label: '用户控制权' },
      { id: 'progressive-disclosure', label: '渐进披露' },
      { id: 'human-ai-collaboration', label: '人机协作' },
      { id: 'ai-onboarding', label: 'AI 产品引导' },
    ],
  },
  {
    id: 'q47-high-vs-low-freq',
    index: '47',
    tierId: 't2-judge',
    moduleId: 'product-experience',
    shortTitle: '低频功能设计',
    question: '低频功能也需要完整的控制面板吗？',
    scenario:
      '一个功能每月只用一两次，团队却为它设计了复杂的确认流程与参数面板，用户每次都要重新学习。',
    facts: ['功能使用频率很低', '用户记不住操作路径', '出错代价并不算高'],
    options: [
      {
        id: 'a',
        label: '用默认值加引导，把选择收进必要一步',
        assessment: 'recommended',
        feedback:
          '功能每月只用一两次，用户记不住路径，用默认值加引导把选择收进必要一步，学习成本最低。',
      },
      {
        id: 'b',
        label: '保留面板但补一份使用说明',
        assessment: 'conditional',
        feedback: '保留面板再补使用说明，等于把学习成本转给用户，低频场景下说明也很少有人会看。',
      },
      {
        id: 'c',
        label: '维持现状，让用户按流程逐项确认',
        assessment: 'risky',
        feedback: '维持逐项确认的现状，会让每次使用都从零开始学习，低频功能反而变成团队的负担。',
      },
    ],
    principle: '低频功能的设计目标是降低学习成本，而不是暴露全部可调项。',
    checks: ['使用频率有多低', '默认值是否安全', '学习成本由谁承担'],
    references: [
      { id: 'progressive-disclosure', label: '渐进披露' },
      { id: 'ai-onboarding', label: 'AI 产品引导' },
      { id: 'user-control', label: '用户控制权' },
      { id: 'task-success-rate', label: '任务成功率' },
    ],
  },
  {
    id: 'q48-user-distrust',
    index: '48',
    tierId: 't2-judge',
    moduleId: 'product-experience',
    shortTitle: '用户不信任',
    question: '用户不信任输出时，应该加什么？',
    scenario: '系统准确率其实不低，但用户每次都要重新核对一遍结果，导致实际效率并没有提升。',
    facts: ['模型准确率并不低', '用户每次都逐条复核', '实际效率没有提升'],
    options: [
      {
        id: 'a',
        label: '让输出附带依据与不确定提示，便于快速核对',
        assessment: 'recommended',
        feedback:
          '用户复核的原因是缺少可验证的依据，让输出附带来源与不确定提示，能把核对从重做变成抽查。',
      },
      {
        id: 'b',
        label: '先继续提高准确率，等用户自然信任',
        assessment: 'conditional',
        feedback: '继续提高准确率方向没错，但准确率再高也不会自动产生信任，用户仍然缺少判断依据。',
      },
      {
        id: 'c',
        label: '用更肯定的语气输出，减少用户疑虑',
        assessment: 'risky',
        feedback: '用更肯定的语气输出会掩盖真实的不确定性，一旦出错，用户对系统的信任会跌得更狠。',
      },
    ],
    principle: '信任来自可核对的依据，而不是更自信的措辞。',
    checks: ['不信任的原因是什么', '依据能否被快速验证', '表达是否夸大确定性'],
    references: [
      { id: 'user-trust', label: '用户信任' },
      { id: 'confidence-calibration', label: '置信度校准' },
      { id: 'explanation-interface', label: '解释界面' },
      { id: 'uncertainty-display', label: '不确定性呈现' },
    ],
  },
  {
    id: 'q49-context-loss',
    index: '49',
    tierId: 't2-judge',
    moduleId: 'product-experience',
    shortTitle: '上下文丢失',
    question: '多轮对话里，怎么避免关键约束被忘掉？',
    scenario:
      '用户在第 8 轮修改需求时，助手已经忘记第 2 轮说过的限制条件，反复给出不合要求的方案。',
    facts: ['对话轮次已经很长', '关键约束只在早期说过', '用户需要反复纠正'],
    options: [
      {
        id: 'a',
        label: '把关键约束单独记录并在每轮重申',
        assessment: 'recommended',
        feedback: '关键约束只在早期说过，把它单独记录下来并在每轮重申，比依赖模型自己记住更可靠。',
      },
      {
        id: 'b',
        label: '压缩历史对话，只保留最近几轮',
        assessment: 'conditional',
        feedback: '压缩历史能控制长度，但压缩本身就可能丢掉早期约束，正是这道题要避免的问题。',
      },
      {
        id: 'c',
        label: '依赖模型记住全部历史内容',
        assessment: 'risky',
        feedback: '指望模型记住全部历史，轮次一长约束必然被稀释，用户只能反复纠正，体验持续恶化。',
      },
    ],
    principle: '长对话要靠显式的状态管理，而不是指望模型自己记得。',
    checks: ['约束是否被显式保存', '压缩是否会丢关键信息', '用户能否看到当前约束'],
    references: [
      { id: 'conversation-context', label: '对话上下文' },
      { id: 'short-term-memory', label: '短期记忆' },
      { id: 'context-compression', label: '上下文压缩' },
      { id: 'state-management', label: '状态管理' },
    ],
  },
  {
    id: 'q50-batch-control',
    index: '50',
    tierId: 't2-judge',
    moduleId: 'product-experience',
    shortTitle: '批量操作可控',
    question: '上千条批量修改，怎么保证可控？',
    scenario:
      '运营团队要一次修改上千条商品文案，系统只能整体提交，提交之后无法逐条检查，文案对外可见。',
    facts: ['单次改动上千条文案', '整体提交无法回滚', '修改后的文案对外可见'],
    options: [
      {
        id: 'a',
        label: '先出预览与差异，再分批提交并可回滚',
        assessment: 'recommended',
        feedback:
          '改动范围上千条且对外可见，先出预览与差异、分批提交并可回滚，才能把不可逆风险降到最低。',
      },
      {
        id: 'b',
        label: '先抽检几十条，没问题就整体提交',
        assessment: 'conditional',
        feedback:
          '抽检几十条能发现明显问题，但抽检覆盖不到的部分依然会一次性生效，而且提交后无法回滚。',
      },
      {
        id: 'c',
        label: '一次性提交，出错后再逐条改回',
        assessment: 'risky',
        feedback:
          '一次性提交再逐条改回，等于把上千条文案的错误同时暴露给用户，改回期间损失已经发生。',
      },
    ],
    principle: '批量操作的可靠性来自可预览、可分批、可回滚，而不是提交前的抽检。',
    checks: ['改动范围有多大', '是否可预览差异', '能否整体回滚'],
    references: [
      { id: 'undo-action', label: '撤销操作' },
      { id: 'human-in-the-loop', label: '人在回路' },
      { id: 'error-recovery', label: '错误恢复' },
      { id: 'ai-guardrail', label: 'AI 护栏' },
    ],
  },
  {
    id: 'q51-small-eval-set',
    index: '51',
    tierId: 't2-judge',
    moduleId: 'quality-constraints',
    shortTitle: '评测集不足',
    question: '评测集只有几十条，能上线吗？',
    scenario:
      '团队只攒了三十条测试用例就要上线，业务方认为样本太少不能说明问题，而上线时间已经很近。',
    facts: ['测试用例约三十条', '上线时间已经很近', '失败模式尚不明确'],
    options: [
      {
        id: 'a',
        label: '按失败模式分类补样例，先覆盖高风险场景',
        assessment: 'recommended',
        feedback:
          '样本量小但可以按失败模式补齐，先覆盖高风险场景，比单纯增加条数更能说明能不能上线。',
      },
      {
        id: 'b',
        label: '先上线，用线上数据持续补充评测',
        assessment: 'conditional',
        feedback:
          '先上线再用线上数据补充评测能加快节奏，但上线前没有覆盖高风险场景，代价会由用户承担。',
      },
      {
        id: 'c',
        label: '直接按当前通过率判断可以上线',
        assessment: 'risky',
        feedback:
          '用三十条用例的通过率推断整体质量，样本无法支撑结论，等于把上线决策建立在巧合上。',
      },
    ],
    principle: '评测集的价值在覆盖关键失败模式，数量只是表象。',
    checks: ['是否覆盖高风险场景', '失败模式是否分类', '结论是否被样本量支撑'],
    references: [
      { id: 'eval-set', label: '评测集' },
      { id: 'golden-dataset', label: '黄金数据集' },
      { id: 'online-evaluation', label: '在线评估' },
      { id: 'human-evaluation', label: '人工评估' },
    ],
  },
  {
    id: 'q52-offline-vs-online',
    index: '52',
    tierId: 't2-judge',
    moduleId: 'quality-constraints',
    shortTitle: '离线与线上',
    question: '离线分数很高，为什么线上还是出问题？',
    scenario:
      '离线评测分数很高，上线后用户投诉却变多，团队开始怀疑评测集与真实使用之间的差距太大。',
    facts: ['离线评测表现良好', '线上投诉反而增加', '评测样本来自历史数据'],
    options: [
      {
        id: 'a',
        label: '对齐线上真实输入，重建评测集',
        assessment: 'recommended',
        feedback:
          '评测样本来自历史数据，与线上真实输入分布不一致，重建评测集才能让分数重新变得可信。',
      },
      {
        id: 'b',
        label: '先看线上日志，再决定是否改评测',
        assessment: 'conditional',
        feedback:
          '先看线上日志再决定是否改评测能避免盲目重做，但日志只反映失败，缺少对正常流量的覆盖。',
      },
      {
        id: 'c',
        label: '认为是用户不会用，继续按离线指标迭代',
        assessment: 'risky',
        feedback: '把问题归因于用户不会用，会继续按失真的离线指标迭代，投诉只会越来越多。',
      },
    ],
    principle: '离线指标只有在输入分布与线上一致时才可信。',
    checks: ['评测输入是否贴近线上', '失败是否被评测覆盖', '指标是否绑定了失败模式'],
    references: [
      { id: 'offline-evaluation', label: '离线评估' },
      { id: 'online-evaluation', label: '在线评估' },
      { id: 'observability', label: '可观测性' },
      { id: 'trace', label: '调用追踪' },
    ],
  },
  {
    id: 'q53-quality-vs-latency',
    index: '53',
    tierId: 't2-judge',
    moduleId: 'quality-constraints',
    shortTitle: '质量与延迟',
    question: '准确率和响应速度冲突时，先动哪一边？',
    scenario:
      '用户要求在数秒内看到答复，但多轮检索加重排能明显提升准确率，团队的时间预算非常紧张。',
    facts: ['响应需在数秒以内', '加重排可提升准确率', '用户等待就会流失'],
    options: [
      {
        id: 'a',
        label: '先流式返回结果，重排只用于高风险问题',
        assessment: 'recommended',
        feedback:
          '延迟预算紧时，先流式返回让用户看到进展，重排只用于高风险问题，把重计算花在真正值得的地方。',
      },
      {
        id: 'b',
        label: '先全量加重排，用缓存抵消延迟',
        assessment: 'conditional',
        feedback:
          '全量加重排再用缓存抵消延迟，但缓存命中并不稳定，未命中的请求仍会超出用户的等待上限。',
      },
      {
        id: 'c',
        label: '取消重排，直接用最快的一路结果',
        assessment: 'risky',
        feedback: '直接取消重排会同时丢掉准确率提升，高风险的错误答案也没有任何补偿机制。',
      },
    ],
    principle: '延迟预算固定时，按问题风险分配重计算，而不是全局加重或全局砍掉。',
    checks: ['延迟预算是多少', '哪些问题值得重算', '用户能否看到中间结果'],
    references: [
      { id: 'latency-budget', label: '延迟预算' },
      { id: 'reranking', label: '重排' },
      { id: 'streaming-response', label: '流式响应' },
      { id: 'perceived-latency', label: '感知延迟' },
    ],
  },
  {
    id: 'q54-cost-over-budget',
    index: '54',
    tierId: 't2-judge',
    moduleId: 'quality-constraints',
    shortTitle: '成本超预算',
    question: '成本超预算时，应该先砍哪一块？',
    scenario:
      '上线后单次调用成本超出预算，团队提出三个方向：缩短提示词、换小模型、减少检索条数，需要排出先后。',
    facts: ['单次成本超出预算', '提示词含大量固定说明', '检索条数可以调整'],
    options: [
      {
        id: 'a',
        label: '先精简提示词并缓存固定部分',
        assessment: 'recommended',
        feedback: '提示词里的固定说明不产生新信息，精简并缓存这部分能直接降本，又不影响答案质量。',
      },
      {
        id: 'b',
        label: '先降低检索条数，观察质量变化',
        assessment: 'conditional',
        feedback:
          '减少检索条数确实省成本，但召回不足会直接拉低答案质量，需要先确认质量是否还能接受。',
      },
      {
        id: 'c',
        label: '直接换最小模型，质量下降再说',
        assessment: 'risky',
        feedback: '直接换最小模型会把成本和质量的取舍一次性做死，质量下降之后还得再改回来。',
      },
    ],
    principle: '先砍不改变信息量的开销，再动会影响答案质量的部分。',
    checks: ['哪些开销不产生信息', '削减是否影响质量', '成本能否按调用分摊'],
    references: [
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'prompt-cache', label: '提示词缓存' },
      { id: 'top-k', label: 'Top-K 召回' },
      { id: 'model-routing', label: '模型路由' },
    ],
  },
  {
    id: 'q55-guardrail-overfire',
    index: '55',
    tierId: 't2-judge',
    moduleId: 'quality-constraints',
    shortTitle: '护栏误拦',
    question: '护栏误拦太多，能不能直接关掉？',
    scenario: '安全护栏上线后频繁拦截正常提问，用户抱怨问什么都答不了，团队又担心直接关掉会出事。',
    facts: ['正常提问被频繁拦截', '用户开始放弃使用', '确实存在需拦截内容'],
    options: [
      {
        id: 'a',
        label: '按误拦样本调阈值，保留高风险拦截',
        assessment: 'recommended',
        feedback:
          '误拦集中在正常提问上，按误拦样本调阈值、同时保留高风险拦截，能在不放弃安全的前提下恢复可用性。',
      },
      {
        id: 'b',
        label: '先降低拦截强度，用人工抽检兜底',
        assessment: 'conditional',
        feedback:
          '降低拦截强度加人工抽检能缓解抱怨，但抽检覆盖不了全部流量，漏拦的风险只是被延后。',
      },
      {
        id: 'c',
        label: '直接关闭护栏，等出问题再加回来',
        assessment: 'risky',
        feedback: '直接关闭护栏会让本该拦截的内容全部放行，等出问题再加回来时，影响已经造成。',
      },
    ],
    principle: '护栏要在误拦与漏拦之间调平衡，而不是在开与关之间二选一。',
    checks: ['误拦来自哪一类输入', '漏拦的后果多大', '阈值能否分层'],
    references: [
      { id: 'ai-guardrail', label: 'AI 护栏' },
      { id: 'safety-filter', label: '安全过滤器' },
      { id: 'content-moderation', label: '内容审核' },
      { id: 'fallback-experience', label: '降级体验' },
    ],
  },
  {
    id: 'q56-legacy-integration',
    index: '56',
    tierId: 't2-judge',
    moduleId: 'capstone',
    shortTitle: '历史系统集成',
    question: '老系统没有接口，智能问答还做得成吗？',
    scenario:
      '企业想给十年历史的订单系统加智能问答，系统没有接口文档，数据分散在多个库，团队希望三个月上线。',
    facts: ['系统缺少接口文档', '数据分散在多个库', '上线窗口只有三个月'],
    options: [
      {
        id: 'a',
        label: '先只读关键表，做只读问答，不碰写操作',
        assessment: 'recommended',
        feedback:
          '老系统缺接口文档、数据分散，先只读关键表做只读问答，能在三个月窗口内交付且不引入写风险。',
      },
      {
        id: 'b',
        label: '先做数据同步，再逐步开放功能',
        assessment: 'conditional',
        feedback:
          '先做数据同步再逐步开放功能方向正确，但同步范围一旦扩大，三个月的窗口很可能不够用。',
      },
      {
        id: 'c',
        label: '直接改造老系统接口，一次做到位',
        assessment: 'risky',
        feedback: '直接改造老系统接口，把项目风险押在最不可控的部分，延期之后连只读问答都上不了。',
      },
    ],
    principle: '历史系统的第一步是划清只读边界，把改造风险留在业务系统之外。',
    checks: ['哪些数据可只读获取', '写操作是否必要', '上线窗口能否覆盖改造'],
    references: [
      { id: 'data-ingestion', label: '数据接入' },
      { id: 'ai-application', label: 'AI 应用' },
      { id: 'project-management', label: '项目管理' },
      { id: 'rollback', label: '回滚' },
    ],
  },
  {
    id: 'q57-budget-constraint',
    index: '57',
    tierId: 't2-judge',
    moduleId: 'capstone',
    shortTitle: '预算约束范围',
    question: '预算只够少量调用时，功能范围怎么定？',
    scenario:
      '方案要覆盖全公司两千名员工，但预算只够每人每天几十次调用，团队还想让功能看起来足够完整。',
    facts: ['需要覆盖两千名员工', '调用次数有硬上限', '高频需求集中在少数场景'],
    options: [
      {
        id: 'a',
        label: '只开放高频场景，把额度用在最值的地方',
        assessment: 'recommended',
        feedback:
          '额度有限时只开放高频场景，把调用集中在价值最高的地方，比全量铺开更经得起预算约束。',
      },
      {
        id: 'b',
        label: '全量开放但按部门分配额度',
        assessment: 'conditional',
        feedback:
          '按部门分配额度看似公平，但部门内部的高频与低频需求被同等对待，额度仍然会被浪费。',
      },
      {
        id: 'c',
        label: '先全量开放，超支后再限制',
        assessment: 'risky',
        feedback: '先全量开放再限制，会让用户在功能被收回时产生强烈反弹，而且预算已经先超支了。',
      },
    ],
    principle: '预算有限时，范围应该跟着价值走，而不是先铺开再收缩。',
    checks: ['额度能否按场景分配', '哪些场景价值最高', '超支后如何降级'],
    references: [
      { id: 'prioritization', label: '需求优先级' },
      { id: 'cost-optimization', label: '成本优化' },
      { id: 'rate-limiting', label: '限流' },
      { id: 'fallback-experience', label: '降级体验' },
    ],
  },
  {
    id: 'q58-headcount',
    index: '58',
    tierId: 't2-judge',
    moduleId: 'capstone',
    shortTitle: '单人维护',
    question: '只有一个人维护时，功能该加多快？',
    scenario:
      '项目只有一名算法工程师，却同时要维护检索、评测和线上服务，团队还计划每月新增两个功能。',
    facts: ['算法工程师只有一人', '需同时维护三块内容', '计划每月新增两个功能'],
    options: [
      {
        id: 'a',
        label: '先固化评测与运维，再谈新增功能',
        assessment: 'recommended',
        feedback:
          '只有一名工程师却要维护三块，先把评测与运维固化下来，新增功能才不会持续制造维护负担。',
      },
      {
        id: 'b',
        label: '先按计划加功能，运维问题出现再补',
        assessment: 'conditional',
        feedback:
          '按计划加功能能对齐业务预期，但运维问题出现时仍由同一个人处理，故障恢复会被拖长。',
      },
      {
        id: 'c',
        label: '同时推进全部功能，靠加班保证进度',
        assessment: 'risky',
        feedback: '同时推进全部功能靠加班保证，一旦有人请假或离职，线上服务与评测会同时失守。',
      },
    ],
    principle: '人力约束下，可维护性优先于功能数量，否则功能会变成负债。',
    checks: ['维护工作能否自动化', '新增功能的边际成本', '出故障时谁处理'],
    references: [
      { id: 'project-management', label: '项目管理' },
      { id: 'observability', label: '可观测性' },
      { id: 'prioritization', label: '需求优先级' },
      { id: 'tech-collaboration', label: '与工程师协作' },
    ],
  },
  {
    id: 'q59-launch-window',
    index: '59',
    tierId: 't2-judge',
    moduleId: 'capstone',
    shortTitle: '时间窗口',
    question: '时间窗口压死时，质量验证能省吗？',
    scenario:
      '业务要求在大促前两周上线推荐文案功能，但评测集还没有建立，团队只能压缩质量验证环节。',
    facts: ['上线只剩两周时间', '评测集还没有建立', '大促期间流量集中'],
    options: [
      {
        id: 'a',
        label: '缩小功能范围，只上可验证的部分',
        assessment: 'recommended',
        feedback:
          '两周内无法完成评测，就缩小功能范围只上可验证的部分，把未验证的能力挡在高流量之外。',
      },
      {
        id: 'b',
        label: '先上线并加大人工抽检比例',
        assessment: 'conditional',
        feedback:
          '上线加人工抽检能发现部分问题，但大促流量集中，抽检比例再高也追不上内容的生成速度。',
      },
      {
        id: 'c',
        label: '跳过评测直接上线，大促后再补',
        assessment: 'risky',
        feedback:
          '跳过评测直接上线，等于在大促这种最不能出错的时段做全量试验，故障影响面被放到最大。',
      },
    ],
    principle: '时间不够时砍范围，而不是砍验证；未验证的部分不要暴露在高流量下。',
    checks: ['功能能否再缩小', '验证能否在小范围完成', '故障影响面多大'],
    references: [
      { id: 'mvp', label: '最小可行产品' },
      { id: 'eval-set', label: '评测集' },
      { id: 'canary-release', label: '金丝雀发布' },
      { id: 'rollback', label: '回滚' },
    ],
  },
  {
    id: 'q60-org-resistance',
    index: '60',
    tierId: 't2-judge',
    moduleId: 'capstone',
    shortTitle: '组织阻力',
    question: '方案没问题但组织不配合，该怎么推？',
    scenario:
      '方案能减少一半重复工作，但会改变客服的考核方式，一线主管明确表示不配合，项目推不动。',
    facts: ['方案会改变考核方式', '一线主管明确反对', '重复工作确实很多'],
    options: [
      {
        id: 'a',
        label: '先与主管共同定义收益分配与试点范围',
        assessment: 'recommended',
        feedback:
          '阻力来自考核方式而不是技术，先与主管共同定义收益分配与试点范围，才能把反对者变成参与者。',
      },
      {
        id: 'b',
        label: '先找愿意配合的小组试点',
        assessment: 'conditional',
        feedback: '找愿意配合的小组试点能证明效果，但主管不认可时，试点结束之后依然无法推广。',
      },
      {
        id: 'c',
        label: '由高层下令强制推行',
        assessment: 'risky',
        feedback: '靠高层强制推行，一线会用消极执行来对抗，项目表面上线、实际没有人真正使用。',
      },
    ],
    principle: '组织阻力往往来自利益与考核，而不是技术可行性，先解决激励再谈推广。',
    checks: ['阻力来自谁的利益', '收益如何分配', '试点能否独立于考核'],
    references: [
      { id: 'stakeholder-management', label: '干系人管理' },
      { id: 'ai-adoption', label: 'AI 采用' },
      { id: 'feedback-loop', label: '反馈闭环' },
      { id: 'user-research', label: '用户研究' },
    ],
  },
];

// 每道判断题对应的「如果你是 PM，下一步做什么」落地动作。
// 目标：把判断从「结论」落到「产品经理交付物」，并链接到相关词条深挖。
export const TIER2_PM_ACTIONS: Record<string, string> = {
  'q31-long-doc-source':
    '产出一份知识方案说明，写清检索范围、来源标注方式与单次成本上限，交评审确认。',
  'q32-high-risk-capability':
    '把高风险场景列成清单，标出每项的审核责任人与拒答条件，写进验收标准。',
  'q33-bigger-window': '先做一次失败归因分析，把错误分成知识过期与窗口不足两类，再决定是否采购。',
  'q34-small-model-rules': '整理字段规则清单与例外场景，输出规则加小模型的处理边界文档与验收标准。',
  'q35-trace-to-source': '定义引用格式与拒答条件，把「无依据不回答」写进提示词与验收标准。',
  'q36-incomplete-data': '先产出小范围验证方案，写明覆盖场景、兜底方式与成功标准，两周内跑出结论。',
  'q37-irreversible-error':
    '画出动作风险分级表，标注哪些动作必须人工确认，并写成发送流程的验收项。',
  'q38-roi-judgment': '做一份投入产出测算表，列出人工节省、维护人力与净收益，作为立项依据。',
  'q39-stated-vs-real': '写一份现场观察记录，把真实耗时与需求方描述并列，作为需求评审材料。',
  'q40-compliance-limit': '和法务一起输出数据使用边界说明，列出可用与不可用数据，再确定方案。',
  'q41-update-freq-rag': '画一张知识更新流程图，标出从文件发布到用户可查的最短路径与负责人。',
  'q42-workflow-or-agent': '产出流程步骤图，标出需要模型判断的步骤与留痕要求，作为技术方案输入。',
  'q43-rag-boundary': '定义无答案时的出口：拒答话术、转人工路径与召回不足的监控指标。',
  'q44-cost-latency-tier': '做一份模型档位分配表，写清各类问题对应的档位、延迟与成本上限。',
  'q45-hybrid-solution': '梳理需要实时取数的字段清单，与工程确认接口，写明哪些数字不允许生成。',
  'q46-pro-vs-consumer': '按用户能力分层写两份交互说明，分别定义默认值、可见细节与风险提示。',
  'q47-high-vs-low-freq': '为低频功能定义默认路径与一次性引导，把可调项统一收进高级设置。',
  'q48-user-distrust': '设计依据展示与不确定提示的具体样式，并定义用户核对的最短路径。',
  'q49-context-loss': '定义对话状态的保存字段与重申规则，写进交互说明与提示词模板。',
  'q50-batch-control': '设计批量操作的预览、分批与回滚流程，写出每一步的用户确认点。',
  'q51-small-eval-set': '按失败模式重排评测集，先补齐高风险场景样例，再给出明确的上线门槛。',
  'q52-offline-vs-online': '对齐线上真实输入重建评测集，输出离线与线上指标的对照说明与差异原因。',
  'q53-quality-vs-latency': '把延迟预算写进方案约束，列出需要重排的问题类型与对应的降级策略。',
  'q54-cost-over-budget': '做一份成本拆解表，标出可削减项与不可削减项，附质量影响说明。',
  'q55-guardrail-overfire': '整理误拦样本的分类，产出阈值调整方案与高风险内容的保留清单。',
  'q56-legacy-integration': '画出只读数据范围图，标出三个月内可交付的功能边界，交评审确认。',
  'q57-budget-constraint': '按场景列出调用额度分配方案，写明超支后的降级策略与对应责任人。',
  'q58-headcount': '排出维护优先级清单，先固化评测与监控，再确定新增功能的节奏。',
  'q59-launch-window': '把功能范围缩到可验证的部分，写清大促期间的上线清单与回滚条件。',
  'q60-org-resistance': '与一线主管共同输出试点方案，写明收益分配方式与考核调整建议。',
};
