import { describe, expect, it } from 'vitest';
import { getOptionImpact } from '../../../src/lib/cases/impact';
import type { CaseOption } from '../../../src/lib/cases/schema';

describe('getOptionImpact', () => {
  it('evaluates recommended options with high accuracy and balanced trade-offs', () => {
    const option: CaseOption = {
      id: 'rag-vector-db',
      label: '搭建专用 RAG 向量知识库',
      assessment: 'recommended',
      rationale: '结合企业内网知识切片与重排，大幅降低幻觉。',
      conditions: ['已完成历史文档清洗', '具备向量索引计算资源'],
      risks: ['切片质量直接影响召回率'],
      consequences: ['提升专业问答准确度到生产可用级别'],
      artifactDelta: '新增 RAG 索引管线设计规范',
    };

    const impact = getOptionImpact(option);
    expect(impact.accuracy).toBeGreaterThanOrEqual(90);
    expect(impact.cycle).toBeGreaterThan(0);
    expect(impact.cost).toBeGreaterThan(0);
    expect(impact.humanBurden).toBeGreaterThan(0);
    expect(impact.warning).toContain('平衡点');
  });

  it('evaluates risky options with appropriate warning alerts and accuracy penalties', () => {
    const option: CaseOption = {
      id: 'pure-direct-prompt',
      label: '纯 Prompt 直接将海量未脱敏资料拼入提示词',
      assessment: 'risky',
      rationale: '开发速度最快，但伴随高额 Token 与严重长上下文遗忘。',
      conditions: ['仅限内部非正式原型验证'],
      risks: ['长上下文中间丢失', '极易发生跨权限数据泄露'],
      consequences: ['并发调用将耗尽每月 API 预算'],
      artifactDelta: '记录原型探索失败教训',
    };

    const impact = getOptionImpact(option);
    expect(impact.accuracy).toBeLessThan(85);
    expect(impact.warning).toContain('高代价警告');
  });
});
