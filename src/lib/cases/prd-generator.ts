import type { CaseStudy } from './schema';

export interface SavedGateDecision {
  caseId: string;
  gateId: string;
  stageId?: string;
  optionId: string;
  optionLabel: string;
  assessment: string;
  timestamp?: number;
}

export interface PrdAssemblyContext {
  caseStudy: CaseStudy;
  decisions?: Record<string, SavedGateDecision>;
  conditionChecks?: Record<string, boolean>;
}

export interface GeneratedPrdResult {
  markdown: string;
  isCustomized: boolean;
  customizedGateCount: number;
  conditionChecksCount: number;
  generatedDate: string;
}

/**
 * 组装《AI 产品立项 PRD / 评审材料》
 * 融合用户在 6 个关卡中选择的决策方案、成立条件勾选与案例元数据
 */
export function generateCasePrd(context: PrdAssemblyContext): GeneratedPrdResult {
  const { caseStudy, decisions = {}, conditionChecks = {} } = context;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  let customizedGateCount = 0;
  let conditionChecksCount = 0;

  // 统计用户勾选的成立条件数
  for (const [key, val] of Object.entries(conditionChecks)) {
    if (key.startsWith(`${caseStudy.id}:`) && val) {
      conditionChecksCount++;
    }
  }

  // 关卡推演决策分析
  const gateDeltas = caseStudy.gates.map((gate) => {
    const gateKey = `${caseStudy.id}:${gate.id}`;
    const userDecision = decisions[gateKey];
    const isCustom = Boolean(userDecision);

    if (isCustom) {
      customizedGateCount++;
    }

    // 选定的 option：优先读用户所选，否则回落到推荐方案
    const selectedOption =
      (userDecision && gate.options.find((opt) => opt.id === userDecision.optionId)) ||
      gate.options.find((opt) => opt.assessment === 'recommended') ||
      gate.options[0]!;

    // 检查该方案的成立条件勾选情况
    const conditionsWithCheck = selectedOption.conditions.map((cond, idx) => {
      const checkKey = `${caseStudy.id}:${gate.id}:${selectedOption.id}:${idx}`;
      const isChecked = Boolean(conditionChecks[checkKey]);
      return {
        text: cond,
        checked: isChecked,
      };
    });

    return {
      gate,
      selectedOption,
      isCustom,
      conditionsWithCheck,
    };
  });

  const isCustomized = customizedGateCount > 0 || conditionChecksCount > 0;

  const assessmentLabels: Record<string, string> = {
    recommended: '推荐最佳实践',
    conditional: '有条件成立（折中/特化路径）',
    risky: '高风险路径（需重点防御）',
  };

  const mdParts: string[] = [];

  // 1. 文档头
  mdParts.push(`# 【AI 产品立项 PRD / 方案评审材料】${caseStudy.title}`);
  mdParts.push('');
  mdParts.push(`> **生成时间**：${dateStr}  `);
  mdParts.push(
    `> **项目级别**：${caseStudy.level === 'focus' ? '核心聚焦案例' : '顶石综合案例'} · **业务领域**：${caseStudy.domain}  `,
  );
  mdParts.push(
    `> **方案状态**：${isCustomized ? `融合 PM 实战决策（已个性化定制 ${customizedGateCount} / 6 关，核验 ${conditionChecksCount} 项条件）` : '团队推荐基准方案（未微调，可在关卡中二次定制）'}  `,
  );
  mdParts.push(`> **面向对象**：${caseStudy.audience.join('、')}  `);
  mdParts.push('');
  mdParts.push('---');
  mdParts.push('');

  // 2. 业务背景与立项核心目标
  mdParts.push('## 一、 项目背景与立项核心目标 (Context & Objective)');
  mdParts.push('');
  mdParts.push('### 1.1 业务背景');
  mdParts.push(caseStudy.businessContext);
  mdParts.push('');
  mdParts.push('### 1.2 核心目标');
  mdParts.push(caseStudy.objective);
  mdParts.push('');
  mdParts.push('### 1.3 现有业务流程与痛点');
  caseStudy.currentProcess.forEach((step, idx) => {
    mdParts.push(`${idx + 1}. ${step}`);
  });
  mdParts.push('');
  mdParts.push('### 1.4 客观事实与基线假设');
  caseStudy.baseline.forEach((b) => {
    mdParts.push(`- **[${b.kind.toUpperCase()} · ${b.evidence}]** ${b.statement}`);
  });
  mdParts.push('');
  mdParts.push('### 1.5 刚性边界约束');
  caseStudy.constraints.forEach((c) => {
    mdParts.push(`- **[${c.kind.toUpperCase()} · ${c.evidence}]** ${c.statement}`);
  });
  mdParts.push('');
  mdParts.push('---');
  mdParts.push('');

  // 3. 六阶段方案选型与决策推演
  mdParts.push('## 二、 六阶段方案选型与决策推演 (Architecture & Gate Decisions)');
  mdParts.push('');
  mdParts.push(
    '本章节记录从「边界判断」到「上线交付」全链路 6 大关键关卡的方案抉择、成立条件与风险应对：',
  );
  mdParts.push('');

  gateDeltas.forEach(({ gate, selectedOption, isCustom, conditionsWithCheck }) => {
    const orderStr = String(gate.order).padStart(2, '0');
    mdParts.push(`### Gate ${orderStr}：${gate.title}`);
    mdParts.push(`**核心问题**：${gate.question}`);
    mdParts.push('');
    mdParts.push(
      `- **采纳路径**：**${selectedOption.label}** (${assessmentLabels[selectedOption.assessment] || selectedOption.assessment}) ${isCustom ? '`PM 自主选定`' : '`默认基准`'}`,
    );
    mdParts.push(`- **选型依据 (Rationale)**：${selectedOption.rationale}`);
    mdParts.push('');
    mdParts.push('**前置成立条件清单 (Conditions Checklist)**：');
    conditionsWithCheck.forEach((item) => {
      mdParts.push(`  - [${item.checked ? 'x' : ' '}] ${item.text}`);
    });
    mdParts.push('');
    mdParts.push('**主要风险与防范 (Risks)**：');
    selectedOption.risks.forEach((risk) => {
      mdParts.push(`  - ⚠️ ${risk}`);
    });
    mdParts.push('');
    mdParts.push('**落地后续影响 (Consequences)**：');
    selectedOption.consequences.forEach((cons) => {
      mdParts.push(`  - 📌 ${cons}`);
    });
    mdParts.push('');
    mdParts.push(`- **本关交付材料沉淀 (Artifact Delta)**：${selectedOption.artifactDelta}`);
    mdParts.push('');
  });

  mdParts.push('---');
  mdParts.push('');

  // 4. 交付物与材料演进清单
  mdParts.push('## 三、 项目材料交付清单 (Deliverable Artifacts)');
  mdParts.push('');
  mdParts.push('项目随六关推演逐步形成的 6 份核心产品标准件：');
  mdParts.push('');
  caseStudy.artifacts.forEach((art, idx) => {
    mdParts.push(`### 3.${idx + 1} ${art.title} (\`${art.type}\`)`);
    mdParts.push(art.summary);
    mdParts.push('');
  });
  mdParts.push('---');
  mdParts.push('');

  // 5. 核心评估指标与真实基线
  mdParts.push('## 四、 核心评估指标与真实基线 (Metrics & Guardrails)');
  mdParts.push('');
  mdParts.push('任何 AI 产品上线必须定义明确的评估指标与基线阈值：');
  mdParts.push('');
  mdParts.push('| 类别 | 指标名称 | 期望方向 | 阈值状态 / 目标值 | 详细口径与定义 |');
  mdParts.push('| :--- | :--- | :--- | :--- | :--- |');
  caseStudy.metrics.forEach((m) => {
    const thresholdText =
      m.thresholdStatus === 'baseline-needed' ? '待真实基线' : m.threshold || '-';
    mdParts.push(
      `| ${m.category} | **${m.label}** | ${m.desiredDirection} | ${thresholdText} | ${m.definition} |`,
    );
  });
  mdParts.push('');
  mdParts.push('---');
  mdParts.push('');

  // 6. 故障模式与恢复应急 Runbook
  mdParts.push('## 五、 故障模式与应急恢复手册 (Failure Modes & Recovery Runbook)');
  mdParts.push('');
  mdParts.push('AI 具备概率性与不确定性，必须在立项时即明确降级兜底方案：');
  mdParts.push('');
  mdParts.push(
    '| 故障模式 | 异常监控信号 (Signal) | 业务负面影响 (Impact) | 恢复方案与降级动作 (Recovery) | 主责人 |',
  );
  mdParts.push('| :--- | :--- | :--- | :--- | :--- |');
  caseStudy.failureModes.forEach((f) => {
    mdParts.push(`| **${f.title}** | ${f.signal} | ${f.impact} | ${f.recovery} | ${f.owner} |`);
  });
  mdParts.push('');
  mdParts.push('---');
  mdParts.push('');

  // 7. 按需知识支撑与参考标准
  mdParts.push('## 六、 规范参考与支持资料 (References)');
  mdParts.push('');
  caseStudy.references.forEach((ref) => {
    mdParts.push(`- **[${ref.kind.toUpperCase()}] ${ref.label}**：${ref.supports}`);
  });
  mdParts.push('');
  mdParts.push('---');
  mdParts.push('*文档生成自 AI-Native 实战判断系统 · 面向生产上线的可复核产品方案*');

  return {
    markdown: mdParts.join('\n'),
    isCustomized,
    customizedGateCount,
    conditionChecksCount,
    generatedDate: dateStr,
  };
}
