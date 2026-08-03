# Learning System V2 阶段 12C 方向验收

- 日期：2026-08-03
- 状态：三方向已完成并通过原型验收；用户已选择方向 02「证据决策台」
- 生产影响：无；本轮没有修改 Astro 页面、组件、Token、案例状态或部署配置

## 交付文件

| 方向            | HTML                       | 桌面 1440x900                     | 手机 390x844                     |
| --------------- | -------------------------- | --------------------------------- | -------------------------------- |
| 01 连续评审脊柱 | `01-review-spine.html`     | `01-review-spine-desktop.png`     | `01-review-spine-mobile.png`     |
| 02 证据决策台   | `02-evidence-desk.html`    | `02-evidence-desk-desktop.png`    | `02-evidence-desk-mobile.png`    |
| 03 能力星图     | `03-capability-orbit.html` | `03-capability-orbit-desktop.png` | `03-capability-orbit-mobile.png` |

## 共同结构断言

三版均使用同一“每日用户反馈分析与产品改进”案例，包含一个可见主入口、六个连续 Gate、Gate 01 三条可选路径、即时反馈、材料前后变化和完整档案概览。页面明确说明无需输入、不保存个人进度、选择可重置；没有使用虚构完成率、学习时长、业务提升或已验证阈值。

## 浏览器验收

使用项目现有 `@playwright/test` Chromium 对六个视口逐一渲染：

- 三版在 1440x900 和 390x844 均无控制台错误或页面脚本错误。
- 三版在两个视口均满足 `documentElement.scrollWidth <= innerWidth`，无横向溢出。
- 移动端每版均只有一个可见主起点，六个阶段节点完整存在。
- 三版的推荐路径选择均能显示即时反馈，材料变化均能展开，完整档案均可访问。
- 方向 01 与 02 额外保留一个视觉隐藏的 skip link，供键盘和屏幕阅读器直接跳到 Gate 01；它不是第二个可见主按钮。
- 六张截图像素尺寸分别为 1440x900 和 390x844。

## 代码验收

- 四个 Markdown/HTML 文件通过仓库固定版本 Prettier 检查。
- `git diff --check` 通过。
- HTML 不依赖远程脚本、图片或运行时数据，可以通过 `file://` 独立打开。

## Gate 状态

阶段 12C 已关闭。用户选择原话与生产转译约束见 `direction-approved.md`；阶段 13 仍需先完成 Huashu Design 的生产转译五问检查点，再修改 Astro 生产页面。
