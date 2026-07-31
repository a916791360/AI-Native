# 学习体验重构生产验收

- 日期：2026-07-31
- 已选方向：保持方向 C 的情境入口与方向 A 的课程脊柱视觉，交互按用户修订为递进题库。
- 生产页面：首页、学习中心、24 题总览、24 个单题反馈页，以及从题目事实源派生的连续学习导航。
- 内容边界：保留 300 个公开词条、80 个已核验词条、4 条阅读路线和 308 条概念关系；本轮未改变词条生命周期。

## 用户闭环

1. 用户在首页选择基础、方案或综合难度的精选题，也可以进入 24 题总览。
2. 用户阅读情境与已知条件，从三种可行路径中做出判断。
3. 页面立即解释该选择为何推荐、有条件成立或风险较高；全程不要求文字输入。
4. 用户阅读固定的核心原则与检查清单，按需进入参考词条，然后在反馈区直接继续下一题。
5. 每页显示六阶段课程轨道、当前阶段内位置和全程题号；阶段末题明确进入下一阶段，最后一题回到课程总结。

连续学习导航只表达内容顺序，不记录完成状态，也不会把用户直接进入某题误标为已经完成前面的题目。

## 视觉证据

- 首页桌面：`production-screenshots/home-desktop.png`
- 首页手机：`production-screenshots/home-mobile.png`
- 课程桌面：`production-screenshots/curriculum-desktop.png`
- 课程手机：`production-screenshots/curriculum-mobile.png`
- 题库桌面：`production-screenshots/question-bank-desktop.png`
- 题库手机：`production-screenshots/question-bank-mobile.png`
- 单题桌面：`production-screenshots/question-support-rag-desktop.png`
- 单题手机：`production-screenshots/question-support-rag-mobile.png`
- 选择反馈桌面：`production-screenshots/question-support-rag-feedback-desktop.png`
- 选择反馈手机：`production-screenshots/question-support-rag-feedback-mobile.png`
- 阶段交接桌面：`production-screenshots/question-stage-boundary-desktop.png`
- 阶段交接手机：`production-screenshots/question-stage-boundary-mobile.png`
- 阶段交接反馈桌面：`production-screenshots/question-stage-boundary-feedback-desktop.png`
- 阶段交接反馈手机：`production-screenshots/question-stage-boundary-feedback-mobile.png`

十四张截图均通过控制台错误与横向溢出检查；固定视口为 1440x900 和 390x844。

## 性能基线

首页精选题切换和单题选择反馈使用渐进增强脚本。首页只下发三个精选题的界面字段；每个单题页只下发当前题目的三条反馈。

- 首页初始 JavaScript：5,847 B。
- 首页 CSS：20,674 B。
- Pagefind：1,333,080 B。
- 图谱 JavaScript：446,291 B，仅在图谱相关页面按需加载。
- 最大图片：121,361 B。

`src/data/performance-baseline.json` 将 5,847 B 记录为新的首页基线，并继续使用 15% 回归阈值。

## 自动化门槛

- Astro / TypeScript：0 error，0 warning，0 hint。
- 单元测试：210 项通过。
- E2E：63 项通过，5 项按项目矩阵规则跳过。
- 覆盖：24 题结构、阶段边界、桌面与手机、无 JavaScript 阅读、精选题切换、即时选择反馈、反馈后连续入口、跨阶段交接、无文本输入、键盘、无障碍、五视口无溢出、搜索相关性和既有图谱交互。
