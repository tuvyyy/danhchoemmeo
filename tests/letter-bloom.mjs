import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const mobile = process.argv.includes('--mobile'), reduced = process.argv.includes('--reduced');
const out = process.env.LETTER_CAPTURE_DIR || `docs/captures/letter-bloom${mobile ? '-mobile' : ''}${reduced ? '-reduced' : ''}`;
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
 const p = await browser.newPage(), errors = [], requests = [];
 p.on('request', request => requests.push(request.url()));
 p.on('pageerror', error => { errors.push(error.message); console.log('PAGE ERROR',error.message); });
 await p.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
 await p.goto(process.env.TEST_URL || 'http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
 await p.waitForSelector('.gallery-loader', { hidden: true });
 await p.click('.garden-gate__enter'); await p.waitForSelector('.entrance-gate', { hidden: true });
 await p.click('.hero-gallery .cinematic-hero__cta');
 await p.waitForFunction(() => document.querySelector('#chapter-flowers').dataset.chapterState === 'active');
 await p.waitForFunction(() => { const video = document.querySelector('#chapter-flowers .garden-video'); return video && video.videoWidth > 0 && !video.paused; });
 assert.equal(await p.$('#chapter-flowers .letter-bloom-garden'), null, 'Keep the video chapter separate from the restored garden');
 await p.evaluate(() => document.querySelector('.nature-bloom__footer button').scrollIntoView({block:'center',behavior:'instant'}));
 await wait(300);
 await p.click('.nature-bloom__footer button');
 await p.waitForFunction(() => document.querySelector('.envelope__seal')?.disabled === false).catch(async error => { console.log(await p.evaluate(()=>({state:document.querySelector('#chapter-wallet')?.dataset,scene:document.querySelector('.chapter-envelope-scene')?.dataset, text:document.body.innerText.slice(-1500)})));throw error; });
 await p.click('.envelope__seal'); await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');
 await p.waitForSelector('.letter-bloom-garden');
 if (!reduced) assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 if (reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
 if (process.argv.includes('--handoff') && !reduced) {
  await p.evaluate(() => document.querySelector('#chapter-wallet').scrollIntoView({ behavior: 'instant' }));
  await p.screenshot({ path: `${out}/handoff-000.png` });
  let previous = 0;
  for (const percent of [20, 40, 50, 60, 80, 100]) {
   await p.mouse.wheel({ deltaY: (percent - previous) / 100 * (mobile ? 844 : 900) });
   if (percent < 100) await p.waitForFunction(value => Math.abs(+document.querySelector('.letter-atelier').dataset.handoffProgress - value) < .002, {}, percent / 100);
   else await p.waitForFunction(() => !document.documentElement.dataset.voucherLetterHandoff);
   await p.screenshot({ path: `${out}/handoff-${String(percent).padStart(3,'0')}.png` });
   previous = percent;
  }
 } else await p.click('.scene-next');
 await p.waitForFunction(() => document.querySelector('#chapter-letter').dataset.chapterState === 'active' && !document.documentElement.dataset.voucherLetterHandoff);
 if (mobile) await p.evaluate(() => document.querySelector('.letter-bloom-garden').scrollIntoView({ block: 'end', behavior: 'instant' }));
 await p.waitForSelector('.letter-bloom-garden[data-running="true"]');
 assert.equal(await p.$$eval('.letter-bloom-garden canvas', es => es.length), 15);
 assert.equal(await p.$$eval('.letter-bloom-garden__grass', es => es.length), 3, 'The original three grass layers return');
 assert(await p.$$eval('.letter-bloom-garden__grass', es => es.every(e => e.complete && e.naturalWidth > 0)), 'Grass assets load');
 assert.equal(await p.$('.letter-atelier__intro'), null, 'Remove the left introduction');
 if (!mobile) assert(await p.evaluate(() => document.querySelector('.letter-keepsake').getBoundingClientRect().right < document.querySelector('[data-flower-main]').getBoundingClientRect().left), 'Letter left, garden right');
 assert.equal(requests.some(url => url.includes('/letter-garden/garden-dusk.webp')), false, 'No scenic background image loads behind the cluster');
 await p.screenshot({ path: `${out}/01-buds.png` });
 if (!reduced && process.argv.includes('--frames')) {
  const started = Date.now();
  for (const percent of [0, 20, 40, 50, 60, 80, 100]) {
   await wait(Math.max(0, percent / 100 * 5000 - (Date.now() - started)));
   await p.screenshot({ path: `${out}/bloom-${String(percent).padStart(3, '0')}.png` });
  }
 } else if (!reduced) {
  await wait(2600);
  const frame = await p.$eval('.letter-bloom-garden [data-flower-main]', e => +e.dataset.bloomFrame);
  assert(frame > 1 && frame < 60, 'Lily gradually opens');
  await p.screenshot({ path: `${out}/02-opening.png` });
 }
 await p.waitForSelector('.letter-bloom-garden[data-bloomed="true"]', { timeout: 20000 });
 await p.screenshot({ path: `${out}/03-bloomed.png` });
 assert.equal(await p.$$eval('.letter-bloom-garden canvas[data-bloom-stage="6"]', es => es.length), 13);
 if (mobile) await p.evaluate(() => document.querySelector('.letter-desk').scrollIntoView({ block: 'start', behavior: 'instant' }));
 await p.click('.letter-desk__controls button:last-child');
 await wait(reduced ? 30 : 1150);
 await p.screenshot({ path: `${out}/03-cover-closed.png` });
 await p.click('.letter-cover'); await wait(reduced ? 30 : 1150);
 await p.screenshot({ path: `${out}/04-letter-open.png` });
 await p.click('.letter-page__read'); await p.waitForSelector('.letter-reader');
 assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 await p.keyboard.press('ArrowRight');
 assert.equal(await p.$eval('.letter-reader .letter-page', e => e.dataset.page), '1');
 await p.keyboard.press('Escape'); await p.waitForSelector('.letter-reader', { hidden: true });
 assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
 await p.click('.letter-next');
 await p.waitForFunction(() => document.querySelector('#chapter-moments').dataset.chapterState === 'active');
 assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 assert.deepEqual(errors, []);
 console.log(`${out}: PASS preserved video, 15 staggered blooms, original grass, letter left, no premature playback, reader/pagination, pause, next chapter, no overflow/errors`);
} finally { await browser.close(); }
