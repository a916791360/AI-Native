import { isDeprecatedTerm, isSelectableTerm } from '../src/lib/content/visibility';
import { loadValidatedProjectContent } from './lib/project';

/**
 * 废弃完整性门禁（I6-03）。
 *
 * ---------------------------------------------------------------------------
 * 为什么需要一条专门的门禁
 * ---------------------------------------------------------------------------
 * 「不再单独成页」这件事的失败模式全是静默的：
 *
 *   · replacedBy 指向一个同样被废弃的词条 → 读者从 A 页被送去 B 页，
 *     而 B 页又说「已并入 C」。这条链可以无限长，每一跳都合法，构建全绿。
 *   · 宿主词条自己也被废弃 → 旧链接最终落到一个死胡同。
 *   · 废弃词条仍挂在认知链路的 coreTerms 上 → /map/ 给出一条点进去就
 *     提示「已并入别处」的主干概念。
 *   · 废弃词条仍被阅读路线引用 → 路线读者走到一半被要求「另行阅读」。
 *   · 某个领域的全部词条都被废弃 → 目录里出现一个空领域。
 *
 * 这五条都是数据层可判定的客观事实，所以放在 CI 里，不靠人记得检查。
 *
 * 与 check-content-quality 的分工：那条管「留下的内容够不够好」，
 * 这条管「离开的词条有没有把去路交代清楚」。
 */

const root = process.cwd();
const project = await loadValidatedProjectContent(root);

const byId = new Map(project.terms.map(({ data }) => [data.id, data]));
const selectableIds = new Set(
  project.terms.filter(({ data }) => isSelectableTerm(data)).map(({ data }) => data.id),
);
const problems: string[] = [];

const deprecated = project.terms.filter(({ data }) => isDeprecatedTerm(data));

for (const { data: term } of deprecated) {
  const where = `src/content/terms/${term.domain}/${term.id}.mdx`;

  if (!term.deprecationReason || term.deprecationReason.trim().length < 10) {
    problems.push(`[DEP_REASON] ${where}: 没有写明废弃理由，读者只看到「已废弃」无从判断。`);
  }

  if (!term.replacedBy) {
    problems.push(
      `[DEP_NO_REPLACEMENT] ${where}: 没有 replacedBy——旧链接的读者没有去路。` +
        '即使是纯降级也要指名宿主词条：宿主页据此生成「相关名词」区块。',
    );
    continue;
  }

  const target = byId.get(term.replacedBy);
  if (!target) {
    problems.push(
      `[DEP_UNKNOWN_REPLACEMENT] ${where}: replacedBy 指向的 ${term.replacedBy} 不是已发布词条。`,
    );
    continue;
  }
  if (!selectableIds.has(target.id)) {
    problems.push(
      `[DEP_CHAIN_REPLACEMENT] ${where}: replacedBy 指向 ${target.id}，` +
        `而它自己也不是可独立选择的入口——旧链接会被转送到另一个死胡同。`,
    );
  }
  if (target.domain !== term.domain) {
    // 跨域宿主大多意味着挂错了（同域才是同一块知识）。允许但必须显式说明。
    problems.push(
      `[DEP_CROSS_DOMAIN] ${where}: replacedBy 指向另一个领域的 ${target.id}` +
        `（${term.domain} → ${target.domain}）。若确实如此，请在本条理由里写明跨域的原因。`,
    );
  }
}

// 一个被废弃的词条若出现在链路主干上，/map/ 就会给出一个进了门又被告知走错路的入口。
const deprecatedIds = new Set(deprecated.map(({ data }) => data.id));
for (const station of project.chain) {
  for (const coreTerm of station.coreTerms) {
    if (deprecatedIds.has(coreTerm)) {
      problems.push(
        `[DEP_IN_CHAIN] src/data/chain.yml: 第 ${station.order} 站的 coreTerms 含 ${coreTerm}，` +
          '但它已被废弃——链路主干必须指向可独立选择的入口。',
      );
    }
  }
}

// 阅读路线是「展开清单」，它引用的词条读者会真的走过去。
for (const route of project.routes) {
  for (const chapter of route.data.chapters) {
    for (const step of chapter.terms) {
      if (deprecatedIds.has(step.id)) {
        problems.push(
          `[DEP_IN_ROUTE] src/content/routes/${route.data.id}.mdx: 章节「${chapter.title}」引用了` +
            ` ${step.id}，但它已被废弃。请改指它的 replacedBy，或从路线里移除。`,
        );
      }
    }
  }
}

// 领域不能空：领域是目录的骨架，一格全空比多留一个入口更糟。
const selectablePerDomain = new Map<string, number>();
for (const { data } of project.terms) {
  if (!isSelectableTerm(data)) continue;
  selectablePerDomain.set(data.domain, (selectablePerDomain.get(data.domain) ?? 0) + 1);
}
for (const domain of project.domains) {
  if ((selectablePerDomain.get(domain.id) ?? 0) === 0) {
    problems.push(
      `[DEP_EMPTY_DOMAIN] src/data/domains.yml: 领域 ${domain.id} 已没有可独立选择的词条，` +
        '目录里会出现一个点进去什么都没有的分区。至少把领域根锚点保留为独立入口。',
    );
  }
}

if (problems.length > 0) {
  console.error(`废弃完整性检查未通过，共 ${problems.length} 条：\n`);
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

console.log(
  `Deprecations valid: ${deprecated.length} deprecated terms, ` +
    `${selectableIds.size} selectable entries, ${selectablePerDomain.size} non-empty domains.`,
);
