import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

/**
 * 认知链路（/map/）的契约测试。
 *
 * 为什么单独建一个 spec：链路是「第二坐标轴」，它的失败方式和其它页面不同——
 * 页面能正常渲染、构建也不报错，但一站都挂不上词条，看上去就是 8 个空盒子。
 * 这类静默失败必须由断言兜住，所以这里既验结构（8 站 / 导航 / 前后站），
 * 也验数据（每站至少 1 个词条、站点计数与页头声明互相自洽）。
 */

interface ChainStationFixture {
  order: number;
  nameZh: string;
}

const stations = parseYaml(
  readFileSync(new URL('../../src/data/chain.yml', import.meta.url), 'utf8'),
) as ChainStationFixture[];

test('renders eight ordered stations that each carry at least one term', async ({ page }) => {
  await page.goto('/map/');

  await expect(page).toHaveTitle('AI 认知链路 | AI-Native');

  const rail = page.getByRole('navigation', { name: '链路站点导航' });
  const railLinks = rail.locator('[data-chain-rail]');
  await expect(railLinks).toHaveCount(stations.length);

  // 顺序是契约：链路是递进关系，站号写错就等于把学习顺序写错。
  for (const station of stations) {
    await expect(railLinks.nth(station.order - 1)).toHaveAttribute(
      'href',
      `#station-${station.order}`,
    );
    await expect(railLinks.nth(station.order - 1)).toContainText(station.nameZh);
  }

  const sections = page.locator('.chain-station');
  await expect(sections).toHaveCount(stations.length);

  let placed = 0;
  for (const station of stations) {
    const section = page.locator(`[data-station="${station.order}"]`);
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(station.nameZh);

    const terms = section.locator('.station-terms li');
    const count = await terms.count();
    // 每站必须有真实词条：空站意味着这条链路在该层断了，读者到这就无路可走。
    expect(count, `第 ${station.order} 站词条数`).toBeGreaterThan(0);
    placed += count;

    // 每个概念都得是指向真实词条页的链接，不能是纯文本占位。
    const firstHref = await terms.first().locator('a.term-link').getAttribute('href');
    expect(firstHref).toMatch(/^\/terms\/[a-z0-9-]+\/$/);
  }

  // 页头声称「X/Y terms placed」，这个数字必须等于各站实际渲染出的词条总数，
  // 否则两处口径会各自漂移，读者看到的是两个不同的覆盖率。
  // 注意眉标在样式里被 text-transform 转成了大写，匹配必须忽略大小写。
  const eyebrow = await page.locator('.page-intro').first().innerText();
  const declared = eyebrow.match(/(\d+)\/(\d+)\s*terms placed/i);
  expect(declared, `页头可见链路覆盖声明：${eyebrow}`).not.toBeNull();
  expect(Number(declared![1])).toBe(placed);
  expect(Number(declared![2])).toBeGreaterThan(0);
});

test('highlights the matching rail entry when a station is opened directly', async ({ page }) => {
  await page.goto('/map/');

  const railLinks = page.locator('[data-chain-rail]');
  const target = stations[4]!;

  await page.locator(`[data-chain-rail="${target.order}"]`).click();
  await expect(railLinks.nth(target.order - 1)).toHaveAttribute('aria-current', 'true');
  await expect(page).toHaveURL(new RegExp(`#station-${target.order}$`));

  // 同一时刻只应有一站被点亮——这是滚动监听的常见回归点。
  await expect(page.locator('[data-chain-rail][aria-current="true"]')).toHaveCount(1);
});

test('shows each station’s previous and next stop as real links', async ({ page }) => {
  await page.goto('/map/');

  // 首尾两站各自缺一个邻居，中间的站必须两头都有；缺了就等于链路断开。
  const first = page.locator(`[data-station="1"]`);
  const last = page.locator(`[data-station="${stations.length}"]`);
  await expect(first.locator('.station-nav a')).toHaveCount(1);
  await expect(last.locator('.station-nav a')).toHaveCount(1);

  for (const station of stations.slice(1, -1)) {
    await expect(
      page.locator(`[data-station="${station.order}"] .station-nav a`),
      `第 ${station.order} 站的前后站链接`,
    ).toHaveCount(2);
  }
});

test('carries the chain position onto the term page', async ({ page }) => {
  // 不写死词条 id：从链路页第 3 站随便取一个真实词条，再验它自己的页面。
  // 这样测试跟着数据走，内容增删都不会让断言失效。
  const station = stations[2]!;
  await page.goto('/map/');
  const termLink = page
    .locator(`[data-station="${station.order}"] .station-terms a.term-link`)
    .first();
  const termHref = await termLink.getAttribute('href');
  const termName = (await termLink.innerText()).trim();
  expect(termHref, '第 3 站应有词条链接').not.toBeNull();

  await page.goto(termHref!);

  await expect(page.getByRole('heading', { level: 1, name: termName })).toBeVisible();
  const chainLine = page.locator('.term-chain');
  await expect(chainLine).toBeVisible();
  await expect(chainLine).toHaveAttribute('data-chain-station', String(station.order));

  // 词条页不能只是「提到」链路，必须能一键跳回那一站。
  await expect(chainLine.locator('a.chain-station-link')).toHaveAttribute(
    'href',
    `/map/#station-${station.order}`,
  );
  await expect(chainLine).toContainText(`第 ${station.order} 站`);
});

test('points each reading route back at the stations it covers', async ({ page }) => {
  await page.goto('/routes/');

  const chainLinks = page.locator('.route-chain a[href^="/map/#station-"]');
  // 路线是「展开清单」，链路是主路径。若一条路线都指不回链路，
  // 说明词条落点与路线章节脱节了——这是 I2-05 要锁住的关系。
  expect(await chainLinks.count()).toBeGreaterThan(0);

  const href = await chainLinks.first().getAttribute('href');
  expect(href).toMatch(/^\/map\/#station-[1-8]$/);
});

test('gives the reader a way out after the final station', async ({ page }) => {
  await page.goto('/map/');

  // 链路页曾经是死胡同：8 站读完，页内没有任何通往判断题与案例的出口
  // （改动前全页 /learn 链接数为 0）。读者刚补完词汇量就被放下，
  // 而这条链路的用途正是「有了词汇量之后去做判断」。
  const exit = page.locator('.chain-exit');
  await expect(exit).toBeVisible();
  await expect(exit.getByRole('heading', { level: 2 })).toBeVisible();

  await expect(exit.locator('.chain-exit-primary')).toHaveAttribute('href', '/learn/');
  await expect(exit.getByRole('link', { name: '看一个完整案例' })).toHaveAttribute(
    'href',
    '/learn/cases/',
  );
  await expect(exit.getByRole('link', { name: '按顺序读完一组词条' })).toHaveAttribute(
    'href',
    '/routes/',
  );

  // 出口必须在最末一站之后。它表达的是「读完 8 站该去哪」，
  // 一旦跑到中间去，就变成把还在读的人赶走。
  const exitFollowsLastStation = await page.evaluate((stationCount) => {
    const last = document.querySelector(`[data-station="${stationCount}"]`);
    const exitNode = document.querySelector('.chain-exit');
    if (!last || !exitNode) return false;
    return Boolean(last.compareDocumentPosition(exitNode) & Node.DOCUMENT_POSITION_FOLLOWING);
  }, stations.length);
  expect(exitFollowsLastStation, '出口应排在第 8 站之后').toBe(true);
});
