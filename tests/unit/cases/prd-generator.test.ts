import { describe, expect, it } from 'vitest';

import { loadCaseStudies } from '../../../src/lib/cases/io';
import { generateCasePrd } from '../../../src/lib/cases/prd-generator';

describe('generateCasePrd', () => {
  it('generates a full baseline PRD markdown when no custom decisions are provided', async () => {
    const cases = await loadCaseStudies();
    const firstCase = cases[0]!.data;

    const result = generateCasePrd({
      caseStudy: firstCase,
    });

    expect(result.isCustomized).toBe(false);
    expect(result.customizedGateCount).toBe(0);
    expect(result.conditionChecksCount).toBe(0);
    expect(result.markdown).toContain(`# 【AI 产品立项 PRD / 方案评审材料】${firstCase.title}`);
    expect(result.markdown).toContain('## 一、 项目背景与立项核心目标');
    expect(result.markdown).toContain('## 二、 六阶段方案选型与决策推演');
    expect(result.markdown).toContain('## 三、 项目材料交付清单');
    expect(result.markdown).toContain('## 四、 核心评估指标与真实基线');
    expect(result.markdown).toContain('## 五、 故障模式与应急恢复手册');
    expect(result.markdown).toContain('Gate 01：');
    expect(result.markdown).toContain('Gate 06：');
  });

  it('incorporates user customized decisions and condition checks', async () => {
    const cases = await loadCaseStudies();
    const firstCase = cases[0]!.data;
    const gate1 = firstCase.gates[0]!;
    const optB = gate1.options[1]!;

    const decisions = {
      [`${firstCase.id}:${gate1.id}`]: {
        caseId: firstCase.id,
        gateId: gate1.id,
        optionId: optB.id,
        optionLabel: optB.label,
        assessment: optB.assessment,
      },
    };

    const conditionChecks = {
      [`${firstCase.id}:${gate1.id}:${optB.id}:0`]: true,
    };

    const result = generateCasePrd({
      caseStudy: firstCase,
      decisions,
      conditionChecks,
    });

    expect(result.isCustomized).toBe(true);
    expect(result.customizedGateCount).toBe(1);
    expect(result.conditionChecksCount).toBe(1);
    expect(result.markdown).toContain(optB.label);
    expect(result.markdown).toContain('[x]');
  });
});
