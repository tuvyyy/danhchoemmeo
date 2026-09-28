import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const baseURL = process.env.ENVELOPE_TEST_URL ?? 'http://127.0.0.1:3333';
const out = 'docs/screenshots/chapter02-cinematic';
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const cases = { desktop: [1440, 900, false], mobile: [390, 844, false], reduced: [390, 844, true], tablet: [820, 1180, false], landscape: [844, 390, false], desktop1920: [1920, 1080, false], wide: [2560, 1080, false], small: [360, 800, false] };
const results = [];
try {
  for (const name of (process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(cases))) {
    const [width, height, reduced] = cases[name];
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(baseURL)) errors.push(response.url()); });
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: width < 600, hasTouch: width < 600 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(baseURL, { waitUntil: 'networkidle2' });
    console.log(name + ': loaded');
    await page.waitForSelector('.cinematic-hero__cta', { visible: true });
    await pause(1400);
    if (!reduced) {
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      await pause(80);
      await page.evaluate(() => {
        window.chapterBridges = [];
        window.bridgeObserver = new MutationObserver(records => {
          for (const record of records) for (const node of record.addedNodes) {
            if (node instanceof HTMLElement && node.dataset.chapterTransition) window.chapterBridges.push(node.dataset.chapterTransition);
          }
        });
        window.bridgeObserver.observe(document.body, { childList: true });
      });
    }
    await page.click('.cinematic-hero__cta');
    if (!reduced) {
      await page.waitForSelector('.spider-split');
      await page.waitForSelector('#chapter-flowers');
      assert.equal(await page.$('.chapter-envelope-scene'), null, 'Envelope never mounts during the first slide transition');
      assert.equal(await page.$eval('#chapter-hero [data-chapter-content]', el => getComputedStyle(el).filter), 'none', 'Opening split is not blurred by another transition');
      await page.waitForSelector('.spider-split', { hidden: true });
      assert.deepEqual(await page.evaluate(() => window.chapterBridges), [], 'Opening split owns its handoff without a second bridge');
    }
    await page.waitForSelector('.nature-bloom__footer button', { visible: true });
    await page.$eval('.nature-bloom__footer button', el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
    await page.click('.nature-bloom__footer button');
    if (!reduced) {
      await page.waitForSelector('#chapter-wallet');
      const wrapper = await page.$eval('#chapter-wallet [data-chapter-content]', el => ({ transform: el.style.transform, filter: el.style.filter, opacity: el.style.opacity }));
      assert.deepEqual(wrapper, { transform: '', filter: '', opacity: '' }, 'Envelope wrapper has no competing entrance animation');
    }
    await page.waitForSelector('.chapter-envelope-scene[data-ready="true"]');
    if (!reduced) {
      await page.evaluate(async () => {
        const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/.vite/deps/gsap.js'))?.name;
        if (!url) throw new Error('GSAP module not found');
        const { gsap } = await import(url);
        window.envelopeTimeline = gsap.getById('chapter02-envelope');
        window.envelopeTimeline.pause();
        window.originalParts = [...document.querySelectorAll('.envelope img')];
      });
      const samples = [];
      for (const time of [0, .6, .85, 1.45, 1.699]) {
        await page.evaluate(time => { window.envelopeTimeline.time(time, true); }, time);
        samples.push(await page.evaluate(() => ({
          envelope: Number(getComputedStyle(document.querySelector('.envelope')).opacity),
          flap: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.envelope__flap')).transform).m22,
          corner: Number(getComputedStyle(document.querySelector('.royal-corner')).opacity),
          line: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.corner-line--h')).transform).m11,
          cards: [...document.querySelectorAll('.envelope__ticket')].map(el => Number(getComputedStyle(el).opacity)),
        })));
        if (name === 'desktop') await page.screenshot({ path: `${out}/desktop-arrival-${time}.png` });
      }
      assert.equal(samples[0].envelope, 0, 'Dark entrance');
      assert.equal(samples[0].corner, 0, 'Corners initially hidden');
      assert(samples[2].envelope > 0 && samples[2].envelope < 1, 'Envelope rises into view');
      assert(samples[2].line > 0 && samples[2].line < 1, 'Corner lines extend');
      assert(samples.every(sample => sample.flap === 1 && sample.cards.every(alpha => alpha === 0)), 'Arrival keeps the lid closed and all vouchers hidden');
      await page.evaluate(() => { window.envelopeTimeline.resume(); });
    }
    await page.waitForSelector('.chapter-envelope-scene[data-state="closed"][data-entered="true"]');
    await pause(1000);
    assert.equal(await page.$eval('.chapter-envelope-scene', el => el.dataset.state), 'closed', 'Waiting does not automatically open the envelope');
    await page.screenshot({ path: `${out}/${name}-arrival-closed.png` });
    await page.$eval('.envelope__seal', el => el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }));
    await page.click('.envelope__seal');
    if (!reduced) {
      await page.waitForSelector('.chapter-envelope-scene[data-state="opening"]');
      await page.evaluate(() => { window.envelopeTimeline.pause(); });
      const samples = [];
      for (const time of [0, 1, 1.24, 1.39, 1.54, 1.69, 2.549]) {
        await page.evaluate(time => { window.envelopeTimeline.time(time, true); }, time);
        samples.push(await page.evaluate(() => ({
          flap: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.envelope__flap')).transform).m22,
          cards: [...document.querySelectorAll('.envelope__ticket')].map(el => Number(getComputedStyle(el).opacity)),
        })));
      }
      assert(samples[1].flap < 0, 'The seal press opens the physical lid');
      for (let i = 0; i < 4; i++) {
        assert(samples[2 + i].cards[i] > 0, `Voucher ${i + 1} reveals at its cue`);
        if (i < 3) assert.equal(samples[2 + i].cards[i + 1], 0, 'Next voucher waits for its cue');
      }
      assert.equal(samples.at(-1).flap, -1);
      await page.evaluate(() => { window.envelopeTimeline.resume(); });
    }
    await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
    await page.waitForFunction(() => document.querySelector('.journey-mascot')?.dataset.chapter === 'wallet');
    await page.$eval('#chapter-wallet', el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.mouse.move(0, 0);
    await pause(300);
    const geometry = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      return { bodyRatio: box('.envelope__body').height / box('.scene-artwork').height,
        flapTop: box('.envelope__flap').top, safeTop: box('.scene-pan').top };
    });
    assert(geometry.bodyRatio > .66, 'Envelope body is visibly taller than the former half-height body');
    assert(geometry.flapTop >= geometry.safeTop - 2, 'Open lid stays inside the visible scene');
    assert.equal(await page.$$eval('.royal-corner', els => els.length), 2);
    assert.equal(await page.$$eval('.royal-corner img', els => new Set(els.map(el => el.src)).size), 1, 'Identical corner motif');
    assert.equal(await page.$eval('.royal-corner--bl', el => Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).m11)), -1, 'Opposite corner stays rotated 180 degrees');
    assert.equal(await page.$$eval('.envelope-petal', els => els.length), 16);
    assert.equal(await page.$$eval('.envelope', els => els.length), 1);
    assert.equal(await page.$('.reference'), null, 'No second composition');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (!reduced) assert.equal(await page.evaluate(() => window.originalParts.every((el, i) => document.querySelectorAll('.envelope img')[i] === el)), true);
    else assert.equal(await page.$eval('.envelope-petals', el => getComputedStyle(el).display), 'none');
    await page.screenshot({ path: `${out}/${name}-final.png` });

    for (const id of ['food', 'coffee', 'movie', 'anywhere']) {
      const selector = `[data-voucher="${id}"]`;
      await page.$eval(selector, el => el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }));
      await pause(120);
      const point = await page.$eval(selector, el => {
        const r = el.getBoundingClientRect();
        for (let y = .12; y < .75; y += .1) for (let x = .12; x < .95; x += .1) {
          const px = r.x + r.width * x, py = r.y + r.height * y;
          if (document.elementFromPoint(px, py) === el) return { x: px, y: py };
        }
        return null;
      });
      assert(point, `${id} can be tapped`);
      if (width >= 768 && id === 'coffee') {
        const before = await page.$eval(`[data-ticket-artwork="${id}"] .envelope__ticket-paper`, el => el.getBoundingClientRect().top);
        await page.mouse.move(point.x, point.y); await pause(450);
        const after = await page.$eval(`[data-ticket-artwork="${id}"] .envelope__ticket-paper`, el => el.getBoundingClientRect().top);
        assert(after < before - 10, 'Hover pulls the real card upward');
        if (name === 'desktop') await page.screenshot({ path: `${out}/desktop-hover.png` });
      }
      if (width < 600) await page.touchscreen.tap(point.x, point.y);
      else await page.mouse.click(point.x, point.y);
      await page.waitForSelector('.ticket-inspection');
      await pause(550);
      assert.equal(await page.$eval(`[data-ticket-artwork="${id}"] .envelope__ticket-paper`, el => getComputedStyle(el).visibility), 'hidden', 'Only the pulled-out copy is visible');
      assert.equal(await page.$eval('.journey-mascot', el => el.hidden), true, 'Mascot rests during reading');
      assert.match(await page.$eval('.ticket-inspection-backdrop', el => getComputedStyle(el, '::before').backdropFilter), /blur\(10px\)/, 'The scene behind the voucher is blurred');
      assert.equal(await page.$eval('.ticket-inspection', el => getComputedStyle(el).filter), 'none', 'Voucher details stay sharp');
      assert.equal(await page.$eval('.chapter-envelope-scene', el => el.dataset.running), 'false', 'Background motion pauses while reading');
      if (id === 'coffee') await page.screenshot({ path: `${out}/${name}-detail.png` });
      await page.keyboard.press('Escape');
      await page.waitForSelector('.ticket-inspection', { hidden: true });
      assert.equal(await page.$('.ticket-inspection-backdrop'), null, 'Closing removes the blur layer');
      assert.equal(await page.$eval(selector, el => el === document.activeElement), true);
    }
    await page.$eval('.envelope__seal', el => el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }));
    await page.click('.envelope__seal');
    await page.waitForSelector('.chapter-envelope-scene[data-state="closed"]');
    if (name === 'reduced') {
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      await pause(100);
      assert.equal(await page.$eval('.envelope__flap', el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m22), 1, 'Closed pose survives changing motion preference');
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    }
    await page.screenshot({ path: `${out}/${name}-closed.png` });
    await page.focus('.envelope__seal'); await page.keyboard.press('Enter');
    await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
    assert.equal(await page.$$eval('.envelope', els => els.length), 1);
    await page.click('.scene-next');
    await page.waitForSelector('#chapter-letter');
    await page.waitForFunction(() => document.querySelector('.chapter-envelope-scene').dataset.state === 'closed');
    await page.$eval('#chapter-wallet', el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await page.waitForSelector('.chapter-envelope-scene[data-running="true"]');
    assert.equal(await page.$eval('.chapter-envelope-scene', el => el.dataset.state), 'closed', 'Returning to the chapter also shows the sealed envelope');
    assert.deepEqual(errors, []);
    console.log(`${name}: PASS`);
    results.push({ name, passed: true });
    await fs.writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
    await page.close();
  }
} finally { await browser.close(); }
