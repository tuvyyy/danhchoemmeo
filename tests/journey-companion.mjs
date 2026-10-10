import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { MASCOT_SCENES } from '../src/components/effects/mascot/mascotConfig.ts';

const mobile = process.argv.includes('--mobile');
const reduced = process.argv.includes('--reduced');
const out = `docs/captures/companion${mobile ? '-mobile' : '-desktop'}${reduced ? '-reduced' : ''}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage(), errors = [], states = [];
  const url = process.env.JOURNEY_URL || 'http://127.0.0.1:3333/';
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(url).origin) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  await page.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const stable = id => page.waitForFunction(id => ['active', 'completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState) && !Object.keys(document.documentElement.dataset).some(key => key.endsWith('Handoff')), {}, id);
  const edge = id => page.evaluate(id => {
    const chapter = document.querySelector(`#chapter-${id}`);
    scrollTo({ top: chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight), behavior: 'instant' });
  }, id);
  const checkpoint = async (id, number) => {
    await stable(id);
    await page.waitForSelector(`.journey-mascot[data-chapter="${id}"] .journey-mascot__speech`, { visible: true });
    await wait(450);
    const state = await page.$eval('.journey-mascot__speech', element => {
      const box = element.getBoundingClientRect(), style = getComputedStyle(element);
      return { text: element.innerText, x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: innerWidth, height: innerHeight, opacity: +getComputedStyle(element.parentElement).opacity, fontSize: +style.fontSize.replace('px', ''), exposed: element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)) };
    });
    assert(state.text.trim().length > 20, `${id}: automatic chapter instruction`);
    assert(state.x >= 0 && state.y >= 0 && state.right <= state.width && state.bottom <= state.height, `${id}: bubble stays inside viewport: ${JSON.stringify(state)}`);
    assert(state.exposed && state.opacity > .99 && state.fontSize >= 14, `${id}: readable and unobscured`);
    assert.equal(await page.$('nav[aria-label="Tiến trình hành trình"]'), null);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (id === 'anniversary') assert(await page.$$eval('.together-count, .together-date > span, .together-date time', elements => elements.every(element => {
      const rect = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    })), 'The message leaves the anniversary date and day count readable');
    states.push({ id, ...state });
    await page.screenshot({ path: `${out}/${number}-${id}.png` });
  };
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.gallery-loader', { hidden: true });
  await page.click('.garden-gate__enter');
  await page.waitForSelector('.entrance-gate', { hidden: true });
  await checkpoint('hero', '00');
  await page.click('[aria-label="Thu gọn bé heo"]');
  await page.click('.cinematic-hero__cta');
  await checkpoint('flowers', '01');
  await wait(5500);
  assert(await page.$('.journey-mascot__speech'), 'Instructions remain until explicitly dismissed');
  await edge('flowers');
  await page.click('.nature-bloom__footer button');
  await checkpoint('wallet', '02');
  await page.waitForFunction(() => document.querySelector('.envelope__seal')?.disabled === false);
  await page.click('.envelope__seal');
  await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
  await page.click('.scene-next');
  await checkpoint('letter', '03');
  await page.click('.letter-page__read');
  await page.waitForSelector('.letter-reader');
  await page.waitForSelector('.journey-mascot', { hidden: true });
  await page.keyboard.press('Escape');
  await page.waitForSelector('.letter-reader', { hidden: true });
  await page.waitForSelector('.journey-mascot__speech', { visible: true });
  await page.click('[aria-label="Đóng lời nhắn"]');
  await wait(650);
  assert.equal(await page.$('.journey-mascot__speech'), null, 'Dismissing a message lasts for this chapter');
  await page.click('.journey-mascot__character');
  await page.waitForSelector('.journey-mascot__speech', { visible: true });
  await edge('letter');
  if (mobile && !reduced) {
    await wait(350);
    const point = await page.$eval('.journey-mascot__speech', element => {
      const box = element.getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    });
    const cdp = await page.createCDPSession();
    try {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      for (let step = 1; step <= 5; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - step * 18 }] });
        await wait(20);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await stable('finale');
    } finally { await cdp.detach(); }
  } else await page.click('.letter-next');
  await checkpoint('finale', '04');
  await page.click('.candle-blow-action');
  await page.waitForFunction(expected => document.querySelector('.journey-mascot__speech')?.textContent.includes(expected), {}, MASCOT_SCENES.finale.messages[1]);
  await page.screenshot({ path: `${out}/04-wish-made.png` });
  await edge('finale');
  await page.click('.wish-next');
  await checkpoint('anniversary', '05');
  await page.$eval('.together-next', element => element.click());
  await checkpoint('hero', '06-replay');
  await fs.writeFile(`${out}/states.json`, JSON.stringify(states, null, 2));
  assert.deepEqual(errors, []);
  console.log(`PASS ${out}: six automatic chapter messages, persistent instruction, collapse reset, overlay restoration, dismissal/reopen, birthday reaction, replay, no rail or errors.`);
} finally {
  await Promise.race([browser.close(), wait(3000).then(() => browser.process()?.kill())]);
}
