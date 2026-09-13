# Design — AI Native 学习站

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

> 本文件是「方案 A」全局舒适度改造的产物。站点此前没有设计系统，每个页面各自
> 挑主题，导致同类页面彼此不一致、层级靠字号硬撑。从这里开始，页面共享同一套
> 主题 / 字体 / 间距 / 动效立场；变化只发生在宏观结构。

## Genre

**editorial** — 这是一个「读物」而非「产品推销页」的知识库。判断、场景、取舍是
正文，正文就是品牌。所以：单列阅读宽度、克制的分隔线、字重承担层级、不喊口号。

## Macrostructure family

- **Marketing 页**（`/` 首页）— **Long Document**。一条竖向阅读脊：定位 →
  三层路径 → 六阶段 → 起步入口。变体旋钮：hero 是否带统计带、六阶段用列表还是网格。
- **Content 页**（`/glossary`、`/routes`、`/cases`、`/atlas`、`/methodology`、词条详情）—
  **Index-First**。页面本身就是一份分类链接清单；细线分隔行，不做 hero 大图。
  变体旋钮：分组标签带的有无、每行的元信息密度。
- **App 页**（学习主线 `/learn`、`/learn/questions/[id]`、`/learn/complete`）—
  **Narrative Workflow**。T1 → T2 → T3 是编号阶段；答题页是「某一个阶段的作业面」，
  单列一题一屏，阶段编号就是层徽标。变体旋钮：进度呈现方式、阶段内的分组粒度。

## Theme

`custom` — vibe「荧光网格终端 · 深空墨绿」。深色单主题（不加浅色变体：两套主题
意味着每个 token 都要验一遍对比度，收益不抵成本）。

- `--color-canvas` oklch(0.155 0.01 165)
- `--color-panel` oklch(0.185 0.011 165)
- `--color-panel-raised` oklch(0.215 0.013 165)
- `--color-ink` oklch(0.93 0.018 152)
- `--color-muted` oklch(0.76 0.024 160)
- `--color-quiet` oklch(0.68 0.022 162)
- `--color-line` oklch(0.31 0.02 162)
- `--color-line-soft` oklch(0.245 0.016 162)
- `--color-accent` oklch(0.88 0.21 121) ← 荧光青柠，主强调
- `--color-accent-strong` oklch(0.8 0.13 176) ← 青绿，次强调
- `--color-focus` oklch(0.8 0.13 176)

主强调只出现在：层徽标、当前进度、正确答案判定、主 CTA。**每屏不超过 5%。**

## Typography

- Display: `PingFang SC / HarmonyOS Sans SC / Source Han Sans SC / Noto Sans SC`, weight **800**, normal
- Body: 同一字面，weight **400**
- Mono: `SF Mono / JetBrains Mono / Menlo / Consolas`, weight 400 — 只用于标签、序号、数值
- Display tracking: `-0.02em`；Label tracking: `+0.1em`
- Type scale anchor: `--text-display` = `clamp(2rem, 3.6vw, 3rem)`，1.25 主三度

**display 与 body 共用同一中文字面是刻意的决定，不是疏漏。** 中文字体文件动辄
数 MB，引入第二个字面会直接压垮性能预算（`src/data/performance-baseline.json`
里的 `homeInitialJavaScriptBytes` 与 CSS 体积都卡着阈值）。所以层级必须由
**字重反差（400 → 800）、字距、等宽 outlier** 承担，不靠换字体。

**禁用中间字重（500 / 600 / 650）。** 400 挨着 600 读起来是「默认设置」；400 挨着
800 才是一个选择。所有标题走 `var(--weight-display)`，所有正文与标签走
`var(--weight-body)`，中间不留档。

## Spacing

4pt 命名刻度，值在 `src/styles/tokens.css`。页面必须用命名 token
（`var(--space-3)`），禁止裸值。三个容器宽度：`--content-max` 90rem（全宽）/
`--content-standard` 76rem（标准页）/ `--reading-max` 46rem（正文行宽）。

圆角只有三档：`--radius-sm` 8px（小件）/ `--radius-md` 10px（容器）/
`--radius-pill`（交互控件与徽标）。禁止出现第四种圆角值。

## Motion

- Easings: `cubic-bezier(0.16, 1, 0.3, 1)` = `--ease-out-expo`；快交互
  `cubic-bezier(0.2, 0, 0, 1)` = `--transition-fast`
- Reveal pattern: **仅 transform 位移**（`translateY(16px)`），不做透明度淡入——
  透明度淡入会让首屏外元素在过渡窗口里被无障碍扫描判为低对比度。
- Reduced-motion fallback: 直接可见，无过渡。
- **动效先减后加。** 目录页 90 张卡片的逐张入场已删除：45ms 步进意味着最后一张
  要等 1.35s，且折叠层里的卡片拿不到布局盒，永远等不到触发。

## Microinteractions stance

- **静默成功**，不做庆祝式 toast。
- 答题反馈**就地展开**，不弹面板、不跳页：选项下方直接出现判定与理由。
- 选项按下不做缩放位移（已移除全局 `button:active { transform: scale(0.98) }`）。
- 折叠用原生 `<details>`，键盘与无 JS 用户都能用；进度状态写在折叠头上，收起也读得到。
- 交互控件必须写满 8 态（default / hover / focus-visible / active / disabled /
  loading / error / success）；`:focus-visible` 环不做出现动画，必须瞬时可见。

## CTA voice

- Primary: 实心荧光青柠底 + 画布色文字，`--radius-pill`，内边距 `--space-2 --space-4`。
- Secondary: 描边 + 文字色，同圆角；hover 时描边混入强调色。
- 文案用动词短语（「开始第一题 →」），不用「点击这里」。

## Per-page allowances

- Marketing 页 MAY 用 Tier-A CSS 图形做 hero 富化。
- App 页 MUST NOT 用富化——功能自己说话。答题页只有正文、选项、判定。
- Content 页只用字体排版。

## What pages MUST share

- 站点字标与主导航。
- 强调色及其用量（每屏 ≤ 5%）。
- display / body 字面与 **400 ↔ 800** 的字重立场。
- CTA 的形状、圆角、内边距节奏。
- 段落节奏：mono 小标签 + display 标题，**上下堆叠**。

## What pages MAY differ on

- 页型家族内的宏观结构（同为 marketing 页，首页可以 Long Document，子页可以别的）。
- hero 原型（限家族允许范围内）。
- 富化——仅 marketing 页，仅 Tier-A。

## 已知例外（待后续处理，不在本次范围）

- `src/styles/unified-pages.css` 里仍有 23 处 `font-weight: 650`，分布在术语 /
  路线 / 案例 / 图谱 / 方法论页面。这些页面不在本次「学习主线三页 + 全局层」
  的批准范围内，暂不扩散改动。**下次触碰这些页面时必须一并换成
  `var(--weight-display)`。**
- 首页 hero 原先的「假终端窗口」是 Hallmark 明令的 _re-drawn UI chrome_ 反模式
  （用 CSS 重绘一个并不存在的应用界面：三个圆点 + 假标题栏 + 虚构命令行）。已
  换成「判断三问」的排版框（上下各一道细线，无窗口外壳）。hero 是否彻底放弃
  终端语汇（等宽字体 + 荧光强调仍在用）留待下一轮决定。

## Exports

`src/styles/tokens.css` 是本项目内的事实来源。

### tokens.css

```css
:root {
  --color-canvas: oklch(0.155 0.01 165);
  --color-panel: oklch(0.185 0.011 165);
  --color-panel-raised: oklch(0.215 0.013 165);
  --color-ink: oklch(0.93 0.018 152);
  --color-muted: oklch(0.76 0.024 160);
  --color-quiet: oklch(0.68 0.022 162);
  --color-line: oklch(0.31 0.02 162);
  --color-line-soft: oklch(0.245 0.016 162);
  --color-accent: oklch(0.88 0.21 121);
  --color-accent-strong: oklch(0.8 0.13 176);
  --color-focus: oklch(0.8 0.13 176);

  --font-display:
    'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC', 'Noto Sans SC', 'Microsoft YaHei',
    -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: var(--font-display);
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Cascadia Code', 'Menlo', 'Consolas', monospace;

  --weight-body: 400;
  --weight-display: 800;
  --tracking-display: -0.02em;
  --tracking-label: 0.1em;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lead: 1.0625rem;
  --text-md: 1.25rem;
  --text-lg: 1.5rem;
  --text-xl: 1.875rem;
  --text-2xl: 2.25rem;
  --text-display: clamp(2rem, 3.6vw, 3rem);

  --space-0: 0.25rem;
  --space-1: 0.5rem;
  --space-2: 0.75rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
  --space-7: 4.5rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.625rem;
  --radius-pill: 999px;

  --transition-fast: 170ms cubic-bezier(0.2, 0, 0, 1);
  --transition-panel: 260ms cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-canvas: oklch(0.155 0.01 165);
  --color-ink: oklch(0.93 0.018 152);
  --color-accent: oklch(0.88 0.21 121);
  --font-display: 'PingFang SC', sans-serif;
  --font-body: 'PingFang SC', sans-serif;
  --spacing-3: 1rem;
  --text-md: 1.25rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "canvas": { "$value": "oklch(0.155 0.01 165)", "$type": "color" },
    "ink": { "$value": "oklch(0.93 0.018 152)", "$type": "color" },
    "accent": { "$value": "oklch(0.88 0.21 121)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "PingFang SC", "$type": "fontFamily" },
    "body": { "$value": "PingFang SC", "$type": "fontFamily" }
  },
  "space": { "md": { "$value": "1.5rem", "$type": "dimension" } }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 0.155 0.01 165;
  --foreground: 0.93 0.018 152;
  --primary: 0.88 0.21 121;
  --primary-foreground: 0.155 0.01 165;
  --muted: 0.31 0.02 162;
  --muted-foreground: 0.76 0.024 160;
  --border: 0.31 0.02 162;
  --input: 0.31 0.02 162;
  --ring: 0.8 0.13 176;
  --radius: 0.625rem;
}
```
