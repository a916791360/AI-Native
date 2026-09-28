import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { analyzeContentQuality } from './lib/content-quality';

/**
 * 内容质量报告 —— 只读。
 *
 * 它不修改任何内容文件，只做两件事：
 *   1. 把 8 项内容质量指标打印成人能读的摘要；
 *   2. 写出机器可读的 reports/content-quality.json，供门禁复用（避免两套切句逻辑）。
 *
 * 用途：在没有基线的时候，先让问题「可见」。所有指标的口径与切句规则
 * 定义在 scripts/lib/content-quality.ts 顶部，一经冻结不得静默调整。
 */

const root = process.cwd();
const report = await analyzeContentQuality(root);
const { metrics, details } = report;

const pct = (value: number): string => `${(value * 100).toFixed(1)}%`;
const clip = (text: string, max = 46): string =>
  [...text].length <= max ? text : `${[...text].slice(0, max).join('')}…`;

console.log('内容质量报告（只读）');
console.log('='.repeat(74));

console.log(
  `\n【规模】可独立选择的词条 ${metrics.totalTerms} 条，正文句子 ${metrics.sentenceCount} 句` +
    (metrics.deprecatedTerms > 0
      ? `\n    （另有 ${metrics.deprecatedTerms} 条已废弃：文件都在、旧 URL 可访问，` +
        `但不再出现在目录 / 搜索 / 图谱里，因此不计入下面任何一项）`
      : ''),
);

console.log(
  `\n【1 · 模板复用率】${pct(metrics.templateReuseRate)}` +
    `\n    ${metrics.templateReuseTerms}/${metrics.totalTerms} 条词条含「跨词条逐字重复」的句子` +
    `\n    复用句 ${metrics.repeatedSentenceCount} 条`,
);
for (const item of details.repeatedSentences.slice(0, 5)) {
  console.log(`      ×${String(item.termCount).padStart(3)} 条  ${clip(item.sample)}`);
}

console.log(
  `\n【2 · 小节结构一致度】${pct(metrics.structureUniformity)}` +
    `\n    共 ${details.structureGroups.length} 种结构签名，最大的 1 组覆盖 ` +
    `${details.structureGroups[0]?.termCount ?? 0}/${metrics.totalTerms} 条`,
);
if (details.structureGroups[0]) {
  console.log(`      小节：${details.structureGroups[0].sections.join(' | ')}`);
}

console.log(
  `\n【3 · 链路覆盖率】${pct(metrics.chainCoverage)}` +
    `\n    ${metrics.chainTerms}/${metrics.totalTerms} 条词条已打 chain 字段`,
);

console.log(
  `\n【4 · 题目挂接率】${pct(metrics.questionLinkRate)}` +
    `\n    ${metrics.questionLinkedTerms}/${metrics.totalTerms} 条词条被 ≥1 道题引用（题库 references 字段）` +
    `\n    注：这是数据层的引用存在性。渲染层是否展示是另一件事——词条页目前不显示反向链接。`,
);

console.log(
  `\n【5 · 案例反链率】${pct(metrics.caseLinkRate)}` +
    `\n    ${metrics.caseLinkedTerms}/${metrics.totalTerms} 条词条被 ≥1 个案例引用` +
    `\n    注：案例通过关卡 referenceIds 绑定关联词条并在词条页展示「出现在哪些案例里」的真实落地闭环。`,
);

console.log(
  `\n【6 · 阅读路线覆盖率】${pct(metrics.routeCoverage)}` +
    `\n    ${metrics.routeLinkedTerms}/${metrics.totalTerms} 条词条出现在 ≥1 条阅读路线里` +
    `\n    注：这是「有没有前后引导」的度量。未覆盖的词条既不在这条路线的上一站，也不在下一站，` +
    `\n    读者读完只能自己找下一步。认知链路（【3】）是第二坐标，本项是链路在存量路线上的落点。`,
);

console.log(
  `\n【7 · 图谱语义比】${pct(metrics.semanticEdgeRatio)}` +
    `\n    人工关系边 ${metrics.humanEdges} 条 / 全部 ${metrics.totalEdges} 条` +
    `（填充边 ${metrics.fillerEdges} 条，由 scripts/lib/catalog-generation.ts 按领域挂点批量生成）`,
);

console.log(
  `\n【8 · 孤立词条数】` +
    `\n    含填充边口径：${metrics.orphanTerms} 条 ← 这是个假象，填充边把每个词条都挂到了领域锚点上` +
    `\n    仅人工边口径：${metrics.orphanTermsHumanOnly} 条 ← 这才是真实的语义连接度`,
);

console.log(
  `\n【9 · 近义碎片簇】${details.synonymClusters.length} 簇` +
    `（涉及 ${details.synonymClusters.reduce((sum, cluster) => sum + cluster.members.length, 0)} 条词条）`,
);
for (const cluster of details.synonymClusters.slice(0, 6)) {
  console.log(
    `      [${cluster.domain}] ${cluster.members.length} 条：${cluster.pairs.slice(0, 3).join('；')}`,
  );
}

console.log('\n' + '='.repeat(74));

const outputDirectory = path.join(root, 'reports');
await mkdir(outputDirectory, { recursive: true });
const outputFile = path.join(outputDirectory, 'content-quality.json');
await writeFile(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`机器可读结果已写入 ${path.relative(root, outputFile)}`);
