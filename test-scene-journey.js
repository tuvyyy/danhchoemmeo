import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const out = 'docs/screenshots/scene-journey';
fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--no-sandbox'],
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];

async function journey(width, reduced = false, noWebgl = false) {
  const name = `${width}${reduced ? '-reduced' : ''}${noWebgl ? '-no-webgl' : ''}`;
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewport({ width, height: width > 767 ? 900 : 844, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(disabled => {
    window.__sceneDraws = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      window.__sceneDraws += 1;
      return draw.apply(this, args);
    };
    if (disabled) {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return type.startsWith('webgl') ? null : original.call(this, type, ...args);
      };
    }
  }, noWebgl);
  await page.goto(process.env.SCENE_TEST_URL ?? 'http://localhost:3333', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('.journey-mascot__character', { timeout: 60000 });
  const click = async selector => {
    await page.waitForSelector(selector, { visible: true });
    await page.$eval(selector, element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await pause(250);
    await page.click(selector);
  };
  const stage = async id => {
    await page.waitForSelector(`#chapter-${id}`, { timeout: 30000 });
    await page.waitForFunction(chapter => document.querySelector('.journey-mascot')?.dataset.chapter === chapter, { timeout: 15000 }, id);
    await pause(1200);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${name}/${id}: horizontal overflow`);
    await page.screenshot({ path: `${out}/${name}-${id}.png` });
    console.log(`${name}: ${id}`);
  };
  await stage('hero');
  assert.equal(await page.$$eval('[data-chapter-id]', nodes => nodes.length), 1, 'Future chapters must stay locked');
  if (reduced || noWebgl) assert.equal(await page.$('.scene-webgl'), null);
  else {
    await page.waitForSelector('.scene-webgl[data-render-state="running"]');
    const before = await page.evaluate(() => window.__sceneDraws);
    await pause(180);
    assert.ok(await page.evaluate(() => window.__sceneDraws) > before, 'WebGL must render');
    // Exercise the real visibility lifecycle via an explicitly overridden browser visibility property.
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hiddenDraws = await page.evaluate(() => window.__sceneDraws);
    await pause(250);
    assert.equal(await page.evaluate(() => window.__sceneDraws), hiddenDraws, 'Hidden tab must stop WebGL');
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await pause(250);
    assert.ok(await page.evaluate(() => window.__sceneDraws) > hiddenDraws, 'Visible tab must resume WebGL');
    if (width === 1440) {
      const photo = await page.$('.cinematic-hero__image-stage');
      const bounds = await photo.boundingBox();
      await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .7);
      await pause(100);
      assert.notEqual(await page.$eval('.cinematic-hero__image-stage', el => el.style.getPropertyValue('--tilt-y')), '', 'Photo responds to pointer');
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      await pause(500);
      assert.equal(await page.$eval('.scene-webgl', el => el.width <= Math.ceil(el.getBoundingClientRect().width)), true, 'Mobile DPR cap');
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await pause(500);
      assert.equal(await page.$eval('.scene-webgl', el => el.width <= Math.ceil(el.getBoundingClientRect().width * 1.5)), true, 'Desktop DPR cap');
      await page.$eval('.scene-webgl', el => el.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
      await page.waitForFunction(() => !document.querySelector('.scene-webgl'));
      assert.equal(await page.$eval('.scene-background', el => el.dataset.fallback), 'true', 'Context loss keeps static background');
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    }
  }
  if (width < 768) assert.equal(await page.$('.journey-mascot__speech'), null);
  await click('.journey-mascot__character');
  await page.waitForSelector('.journey-mascot__speech');
  await pause(5200);
  assert.equal(await page.$('.journey-mascot__speech'), null, 'Message auto-dismiss');
  await click('.journey-mascot__collapse');
  await click('.journey-mascot__restore');

  await click('.cinematic-hero__cta');
  await page.$eval('.cinematic-hero__cta', button => { button.click(); button.click(); });
  await stage('flowers');
  assert.equal(await page.$$eval('[data-chapter-id]', nodes => nodes.length), 2, 'Rapid clicks must not skip chapter gates');
  assert.equal(await page.$('.scene-webgl'), null, 'Hero WebGL unmounts on chapter exit');
  await page.waitForSelector('.nature-bloom__footer button', { timeout: 45000 });
  await click('.nature-bloom__footer button');
  await stage('wallet');
  await click('[data-testid="wallet-open-trigger"]');
  await page.waitForSelector('[data-testid="wallet-next-btn"]');
  await pause(700);
  await click('[aria-label^="Mở voucher:"]');
  await page.waitForSelector('[role="dialog"]');
  await page.waitForFunction(() => document.querySelector('.journey-mascot').hidden);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)), true, 'Voucher traps keyboard focus');
  assert.equal(await page.$eval('.journey-mascot', el => el.hidden), true, 'Voucher hides mascot');
  await page.keyboard.press('Escape');
  await page.waitForSelector('[role="dialog"]', { hidden: true });
  await page.waitForFunction(() => !document.querySelector('.journey-mascot').hidden);
  await click('[data-testid="wallet-next-btn"]');
  await stage('letter');
  await click('[aria-label="Mở thư"]');
  await pause(1300);
  await click('[aria-label="Phóng to đọc thư"]');
  await page.waitForSelector('[role="dialog"]');
  await page.waitForFunction(() => document.querySelector('.journey-mascot').hidden);
  await page.keyboard.press('Tab');
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)), true, 'Letter traps keyboard focus');
  assert.equal(await page.$eval('.journey-mascot', el => el.hidden), true, 'Reader hides mascot');
  await page.keyboard.press('Escape');
  await page.waitForSelector('[role="dialog"]', { hidden: true });
  await page.waitForFunction(() => !document.querySelector('.journey-mascot').hidden);
  await click('#chapter-letter section > button');
  await stage('moments');
  for (let i = 0; i < 4; i++) await click(`.scrapbook-card:nth-child(${i + 1})`);
  await click('#chapter-moments section > button');
  await stage('anniversary');
  await click('.anniversary-cta');
  await stage('finale');
  await click('[aria-label="Thổi nến"]');
  await pause(3000);
  assert.equal(await page.$eval('.scene-background--orb', el => el.dataset.blown), 'true');
  assert.equal(await page.$('.pig-art--party') !== null, true, 'Finale uses party accessory');
  await page.screenshot({ path: `${out}/${name}-wish.png` });

  // Revisit without resetting interactive state. Scroll also exercises chapter detection.
  for (const id of ['moments', 'wallet', 'hero', 'finale']) {
    console.log(`${name}: revisit ${id}`);
    await page.$eval(`#chapter-${id}`, el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForFunction(chapter => document.querySelector('.journey-mascot').dataset.chapter === chapter, { timeout: 10000 }, id).catch(async error => {
      console.log(await page.evaluate(() => ({ current: document.querySelector('.journey-mascot')?.dataset.chapter, stages: [...document.querySelectorAll('[data-chapter-id]')].map(el => ({ id: el.dataset.chapterId, top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height })) })));
      throw error;
    });
    await pause(300);
    if (id === 'moments') assert.equal(await page.$$eval('.scrapbook-card[aria-pressed="true"]', nodes => nodes.length), 4);
    if (id === 'wallet') assert.equal(await page.$eval('.wallet-object-stage', el => el.dataset.walletState), 'open');
    if (id === 'finale') assert.equal(await page.$('[aria-label="Thổi nến"]'), null);
  }
  assert.deepEqual(errors, [], `${name}: console errors`);
  results.push({ name, passed: true, webglDraws: await page.evaluate(() => window.__sceneDraws) });
  fs.writeFileSync(`${out}/${name}-result.json`, JSON.stringify(results.at(-1), null, 2));
  console.log(`${name}: PASS`);
  await page.close();
}

try {
  const cases = process.argv.slice(2);
  for (const width of [1440, 390, 360]) if (!cases.length || cases.includes(String(width))) await journey(width);
  if (!cases.length || cases.includes('reduced')) await journey(390, true);
  if (!cases.length || cases.includes('no-webgl')) await journey(1440, false, true);
  fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
