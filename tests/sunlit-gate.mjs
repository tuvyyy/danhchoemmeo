import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const out = 'docs/captures/sunlit-gate';
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const errors = [];
try {
  for (const mobile of [false, true]) {
    const page = await browser.newPage();
    const label = mobile ? 'mobile' : 'desktop';
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
    await page.goto('http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.gallery-loader', { hidden: true });
    await page.waitForSelector('[data-iron="3d"]');
    assert(await page.$eval('.garden-gate__plate', image => image.complete && image.naturalWidth === 1774 && image.src.endsWith('estate-sunset.webp')));
    await page.screenshot({ path: `${out}/${label}-closed.png` });
    const hit = await page.$eval('.garden-gate__hit', element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: Math.min(innerHeight - 120, rect.y + rect.width * .75) };
    });
    if (mobile) await page.touchscreen.tap(hit.x, hit.y); else await page.mouse.move(hit.x, hit.y);
    await wait(1600);
    await page.screenshot({ path: `${out}/${label}-open.png` });
    assert(await page.$eval('.garden-gate', element => +getComputedStyle(element).getPropertyValue('--gate-open') > .99));
    // A lost GPU context must reveal the functional SVG doors, then recover.
    await page.evaluate(() => {
      const canvas = document.querySelector('.garden-gate__iron-3d canvas');
      window.gateContextExtension = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
      window.gateContextExtension.loseContext();
    });
    await page.waitForFunction(() => !document.querySelector('.garden-gate__architecture').dataset.iron);
    assert.equal(await page.$eval('.garden-gate__doors', element => getComputedStyle(element).visibility), 'visible');
    await wait(150);
    await page.evaluate(() => window.gateContextExtension.restoreContext());
    await page.waitForSelector('[data-iron="3d"]');
    await page.click('.garden-gate__enter');
    await page.waitForSelector('.entrance-gate', { hidden: true });
    await page.click('.hero-gallery__back');
    await page.waitForSelector('[data-iron="3d"]');
    assert.equal(await page.$$eval('.garden-gate__iron-3d canvas', elements => elements.length), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.close();
  }
  const fallback = await browser.newPage();
  await fallback.evaluateOnNewDocument(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === 'webgl2' || kind === 'webgl') return null;
      return getContext.call(this, kind, ...args);
    };
  });
  await fallback.goto('http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
  await fallback.waitForSelector('.gallery-loader', { hidden: true });
  assert.equal(await fallback.$eval('.garden-gate__doors', element => getComputedStyle(element).visibility), 'visible');
  await fallback.click('.garden-gate__enter');
  await fallback.waitForSelector('.entrance-gate', { hidden: true });
  assert.deepEqual(errors, []);
  console.log('PASS sunset image, real 3D desktop/mobile, open, context loss/recovery, remount, no WebGL fallback, no overflow/errors');
} finally { await browser.close(); }
