import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

const baseURL = process.env.ENVELOPE_TEST_URL ?? 'http://127.0.0.1:3344';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const out = 'docs/screenshots/chapter-scroll';
await fs.mkdir(out, { recursive: true });
const active = async (page, id) => {
  try { await page.waitForFunction(id => {
  const el = document.querySelector('#chapter-' + id);
  return el && ['active', 'completing'].includes(el.dataset.chapterState) && !document.body.dataset.chapterMoving;
  }, { timeout: 10000 }, id); }
  catch (error) {
    console.log('Navigation failed', id, await page.evaluate(() => ({ y: scrollY, moving: document.body.dataset.chapterMoving,
      wheels: window.wheelTrace,
      stages: [...document.querySelectorAll('[data-chapter-id]')].map(el => ({ id: el.dataset.chapterId, state: el.dataset.chapterState, top: el.getBoundingClientRect().top })) })));
    throw error;
  }
};
const edge = async (page, id, end = true) => {
  await page.$eval('#chapter-' + id, (el, end) => window.scrollTo({
    top: el.getBoundingClientRect().top + scrollY + (end ? Math.max(0, el.offsetHeight - innerHeight) : 0), behavior: 'instant',
  }), end);
  await pause(300);
};
async function boot(width, height, mobile = false) {
  const page = await browser.newPage();
  page.errors = [];
  page.on('pageerror', error => page.errors.push(error.message));
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(baseURL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.cinematic-hero__cta', { visible: true });
  await pause(1300);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await pause(100);
  return page;
}
try {
  const page = await boot(1440, 900);
  // A deliberately long chapter verifies reading within a screen before turning it.
  await page.$eval('.cinematic-hero', el => { el.style.minHeight = '160vh'; });
  await page.mouse.move(700, 450);
  await page.mouse.wheel({ deltaY: 120 });
  await pause(100);
  const early = await page.evaluate(() => scrollY);
  await pause(550);
  const settled = await page.evaluate(() => scrollY);
  assert(early > 0 && early < settled && Math.abs(settled - 120) < 3, 'Wheel movement eases within a tall chapter');
  assert.equal(await page.$('#chapter-flowers'), null, 'Reading does not skip the rest of a tall chapter');
  await edge(page, 'hero');
  await page.evaluate(() => {
    window.scrollTrace = [];
    window.wheelTrace = [];
    addEventListener('wheel', event => window.wheelTrace.push({ at: performance.now(), dy: event.deltaY }));
    addEventListener('scroll', () => window.scrollTrace.push(scrollY));
  });
  await page.mouse.wheel({ deltaY: 180 });
  await page.waitForSelector('body[data-chapter-moving="true"]');
  // Send a continuous native input stream without waiting for a rendered frame
  // after every event (which would turn a burst into separate slow gestures).
  const desktopInput = await page.createCDPSession();
  const pendingWheels = [];
  for (let i = 0; i < 28; i++) {
    pendingWheels.push(desktopInput.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: 70 }));
    await pause(35);
  }
  await Promise.all(pendingWheels);
  await active(page, 'flowers');
  assert.equal(await page.$('#chapter-wallet'), null, 'One continuous wheel gesture advances only one chapter');
  assert.equal(await page.$('[data-chapter-transition]'), null, 'No blackout overlay');
  assert.equal(await page.$eval('#chapter-flowers [data-chapter-content]', el => getComputedStyle(el).filter), 'none');
  assert(Math.abs(await page.$eval('#chapter-flowers', el => el.getBoundingClientRect().top)) < 3);
  const trace = await page.evaluate(() => window.scrollTrace);
  assert(trace.length > 8 && trace.every((y, i) => !i || y >= trace[i - 1]), 'Slide travels continuously in the requested direction');
  await page.screenshot({ path: `${out}/vertical-handoff.png` });
  await edge(page, 'flowers');
  await page.mouse.wheel({ deltaY: 180 });
  await active(page, 'wallet');
  await page.waitForSelector('.chapter-envelope-scene[data-entered="true"]');
  assert.equal(await page.$eval('.chapter-envelope-scene', el => el.dataset.state), 'closed');
  await page.click('.envelope__seal');
  await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
  await page.$eval('[data-voucher="food"]', el => el.click());
  await page.waitForSelector('[aria-modal="true"]');
  const readingY = await page.evaluate(() => scrollY);
  await page.mouse.wheel({ deltaY: 700 });
  await page.keyboard.press('PageDown');
  await pause(800);
  assert.equal(await page.evaluate(() => scrollY), readingY, 'Reading a voucher blocks chapter movement');
  assert.equal(await page.$('#chapter-letter'), null);
  await page.keyboard.press('Escape');
  await page.waitForSelector('[aria-modal="true"]', { hidden: true });
  await page.keyboard.press('PageDown');
  await active(page, 'letter');
  assert.equal(await page.$eval('.chapter-envelope-scene', el => el.dataset.state), 'closed');
  await edge(page, 'letter', false);
  await page.keyboard.press('PageUp');
  await active(page, 'wallet');
  assert.equal(await page.$eval('.chapter-envelope-scene', el => el.dataset.state), 'closed', 'Returning preserves the sealed entrance');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.keyboard.press('PageUp');
  await active(page, 'flowers');
  assert.equal(await page.$('body[data-chapter-moving="true"]'), null);
  // Reach every chapter by scrolling, without needing its next-chapter button.
  const chapters = ['flowers', 'wallet', 'letter', 'moments', 'anniversary', 'finale'];
  for (let i = 0; i < chapters.length - 1; i++) {
    await edge(page, chapters[i]);
    await page.keyboard.press('PageDown');
    await active(page, chapters[i + 1]);
  }
  await edge(page, 'finale');
  await page.keyboard.press('PageDown');
  await active(page, 'finale');
  assert.equal(await page.$$eval('[data-chapter-id]', nodes => nodes.length), 7, 'Whole journey is reachable and stops at the final chapter');
  assert.deepEqual(page.errors, []);
  console.log('desktop: PASS — damping, one gesture/one chapter, vertical motion, modal isolation, keyboard, reduced motion');
  await page.close();

  const phone = await boot(390, 844, true);
  const cdp = await phone.createCDPSession();
  const swipe = async (x1, y1, x2, y2) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 10, y: y1 + (y2 - y1) * i / 10 }] });
      await pause(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await edge(phone, 'hero');
  await swipe(190, 650, 190, 300);
  await active(phone, 'flowers');
  await edge(phone, 'flowers');
  await swipe(190, 650, 190, 300);
  await active(phone, 'wallet');
  await phone.waitForSelector('.chapter-envelope-scene[data-entered="true"]');
  const panBefore = await phone.$eval('.scene-pan', el => el.scrollLeft);
  await swipe(315, 400, 65, 400);
  await pause(500);
  assert(await phone.$eval('.scene-pan', el => el.scrollLeft) > panBefore + 50, 'Horizontal envelope pan remains native');
  assert.equal(await phone.$('#chapter-letter'), null, 'Horizontal swipe never changes chapter');
  await swipe(195, 700, 195, 350);
  await active(phone, 'letter');
  await edge(phone, 'letter', false);
  await swipe(195, 300, 195, 650);
  await active(phone, 'wallet');
  await phone.screenshot({ path: `${out}/mobile-sealed-return.png` });
  assert.deepEqual(phone.errors, []);
  console.log('mobile: PASS — vertical swipe both directions, horizontal pan, sealed return');
  await phone.close();
} finally { await browser.close(); }
