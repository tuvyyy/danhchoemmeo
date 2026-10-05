import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const mobile = process.argv.includes('--mobile');
const reduced = process.argv.includes('--reduced');
const label = process.argv[2] || 'iteration1';
const out = `docs/captures/finale-${label}${mobile ? '-mobile' : ''}`;
await fs.mkdir(out, { recursive: true });

const height = mobile ? 844 : 900;
const width = mobile ? 390 : 1440;
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true
});

let page;
try {
  page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile });
  if(process.argv.includes('--missing-art')) {
    await page.setRequestInterception(true);
    page.on('request',r=>r.url().includes('/birthday-cake/')?r.abort():r.continue());
  }

  if (reduced) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  }

  // 1. Hero
  await page.goto('http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.gallery-loader', { hidden: true });
  await page.click('.garden-gate__enter');
  await page.waitForSelector('.entrance-gate', { hidden: true });
  await page.waitForSelector('.cinematic-hero__cta');
  await wait(800);
  await page.click('.cinematic-hero__cta');
  await wait(2100);

  // 2. Flowers
  await page.waitForFunction(() => ['active', 'completing'].includes(document.querySelector('#chapter-flowers').dataset.chapterState));
  await page.evaluate(() => {
    const s = document.querySelector('#chapter-flowers');
    scrollTo(0, s.offsetTop + s.offsetHeight - innerHeight);
    document.querySelector('.nature-bloom__footer button').click();
  });

  // 3. Voucher Envelope
  await page.waitForFunction(() => !document.querySelector('.envelope__seal').disabled, { timeout: 45000 });
  await wait(200);
  await page.waitForFunction(()=>['active','completing'].includes(document.querySelector('#chapter-wallet').dataset.chapterState));await page.click('.envelope__seal');
  await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
  await page.click('.scene-next');

  // 4. Letter
  await page.waitForSelector('#chapter-letter');
  await wait(1500);
  await page.mouse.move(310, 220);
  await wait(300);
  if (!mobile) {
    assert(await page.$eval('[data-custom-cursor]', e => getComputedStyle(e).visibility === 'visible' && +getComputedStyle(e).opacity > 0), 'Chapter 03 custom cursor restored');
  }
  await page.click('.letter-open-action');
  await wait(reduced ? 100 : 1150);
  await page.evaluate(() => {
    const s = document.querySelector('#chapter-letter');
    scrollTo(0, s.offsetTop + s.offsetHeight - innerHeight);
  });
  await wait(250);
  await page.click('.letter-next');
  await page.waitForFunction(() => !document.documentElement.dataset.letterMomentsHandoff);
  await wait(300);

  // 5. Moments
  for (let i = 0; i < 4; i++) {
    await page.click(`.memory-print[data-index="${i}"]`);
    await wait(reduced ? 30 : 900);
  }
  assert.equal(await page.$eval('.memory-table', e => e.dataset.seen), '4', 'All 4 moments revealed');
  await page.evaluate(() => {
    const s = document.querySelector('#chapter-moments');
    scrollTo(0, s.offsetTop + s.offsetHeight - innerHeight);
  });
  await wait(200);
  await page.click('.moments-next');
  await page.waitForFunction(() => !document.documentElement.dataset.momentsAnniversaryHandoff);
  await page.waitForSelector('.together-scene');
  await wait(500);

  // Scroll to bottom boundary of Anniversary
  await page.evaluate(() => {
    const s = document.querySelector('#chapter-anniversary');
    window.scrollTo(0, s.offsetTop + s.offsetHeight - window.innerHeight);
  });
  await wait(300);
  await page.waitForFunction(() => {
    const s = document.querySelector('#chapter-anniversary');
    return s && s.getBoundingClientRect().bottom <= window.innerHeight + 2;
  });

  async function input(delta) {
    if (!mobile) return page.mouse.wheel({ deltaY: delta });
    const cdp = await page.createCDPSession();
    const start = delta > 0 ? height - 160 : 140;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: start }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: start - delta }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  }

  async function capture(direction) {
    await page.screenshot({ path: `${out}/${direction}-000.png` });
    let last = 0;
    const points = reduced ? [100] : [20, 40, 50, 60, 80, 100];
    for (const p of points) {
      await input((p - last) / 100 * height * (direction === 'forward' ? 1 : -1));
      await wait(300);
      if (p < 100) {
        const expected = (direction === 'forward' ? p : 100 - p) / 100;
        await page.waitForFunction(
          exp => Math.abs(+document.querySelector('.celebration-scene').dataset.handoffProgress - exp) < 0.005,
          {},
          expected
        );
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
          'No horizontal overflow'
        );
        if (p === 50) {
          const before = await page.$eval('.celebration-scene', e => e.dataset.handoffProgress);
          await wait(500);
          assert(Math.abs(await page.$eval('.celebration-scene', e => +e.dataset.handoffProgress)-Number(before))<.003, 'Progress held on stop');
        }
      } else {
        await page.waitForFunction(() => !document.documentElement.dataset.anniversaryFinaleHandoff);
      }
      await page.screenshot({ path: `${out}/${direction}-${String(p).padStart(3, '0')}.png` });
      last = p;
    }
  }

  // Forward transition capture
  await capture('forward');
  await page.screenshot({ path: `${out}/finale-unblown.png` });
  if(process.argv.includes('--missing-art'))assert(await page.$('.cake-tier--top'),'Failed artwork retains the CSS cake and live candle');

  // Test candle blowing interaction
  const recording=process.argv.includes('--record')?await page.screencast({path:`${out}/candle.mp4`,format:'mp4',fps:30}):null;
  if(recording)await wait(600);
  const candlePosition = () => page.$eval('.birthday-candle', e => {
    const rect = e.getBoundingClientRect();
    return { x: rect.x, y: rect.y + scrollY };
  });
  const beforeBlow = await candlePosition();
  await page.focus('.candle-blow-action');
  await page.keyboard.press('Enter');
  await wait(reduced ? 100 : 1000);
  assert.equal(await page.$eval('.celebration-scene', e => e.dataset.blown), 'true', 'Candle blown state active');
  await page.screenshot({ path: `${out}/finale-blown.png` });
  assert.equal(await page.$eval('.candle-aura',e=>+getComputedStyle(e).opacity),0,'Blowing also extinguishes the actual candlelight');
  assert.equal(await page.$eval('.reignite-btn', e => e === document.activeElement), true, 'Focus follows the replaced blow control');
  const afterBlow = await candlePosition();
  assert(Math.abs(afterBlow.x-beforeBlow.x)<2 && Math.abs(afterBlow.y-beforeBlow.y)<2, 'Candle stays anchored when the birthday message changes');
  assert.match(await page.$eval('.celebration-scene [role="status"]', e => e.textContent), /Nến đã tắt/, 'Candle state is announced');
  if(recording){await wait(2200);await recording.stop();}

  // Test re-ignite
  await page.keyboard.press('Enter');
  await wait(400);
  assert.equal(await page.$eval('.celebration-scene', e => e.dataset.blown), 'false', 'Candle re-ignited');
  assert.equal(await page.$eval('.candle-blow-action', e => e === document.activeElement), true, 'Focus returns to the restored blow control');

  // Test reverse transition back to Anniversary
  await page.evaluate(() => {
    const s = document.querySelector('#chapter-finale');
    window.scrollTo(0, s.offsetTop);
  });
  await wait(300);
  await page.waitForFunction(() => {
    const s = document.querySelector('#chapter-finale');
    return s && Math.abs(s.getBoundingClientRect().top) <= 2;
  });
  await capture('reverse');

  // Verify Anniversary state retained
  assert.equal(await page.$eval('.together-ticket__count strong', e => !!e.textContent), true, 'Ticket count present');
  await page.screenshot({ path: `${out}/anniversary-restored.png` });

  // A previously extinguished flame must stay dark during a later chapter handoff.
  await page.click('.together-next');
  await page.waitForFunction(()=>document.querySelector('#chapter-finale').dataset.chapterState==='active');
  await page.focus('.birthday-candle');
  const beforeSpace=await page.evaluate(()=>scrollY);
  await page.keyboard.press('Space');await wait(900);
  assert.equal(await page.$eval('.celebration-scene',e=>e.dataset.blown),'true','Native candle supports Space');
  assert(Math.abs(await page.evaluate(()=>scrollY)-beforeSpace)<2,'Space activates the candle without scrolling the chapter');
  await page.evaluate(()=>document.querySelector('#chapter-finale').scrollIntoView({behavior:'instant'}));
  if(!reduced){
    await input(-height*.5);
    await page.waitForFunction(()=>Math.abs(+document.querySelector('.celebration-scene').dataset.handoffProgress-.5)<.003);
    assert.equal(await page.$eval('.candle-flame',e=>+getComputedStyle(e).opacity),0,'Extinguished flame stays dark during reverse handoff');
    assert.equal(await page.$eval('.candle-aura',e=>+getComputedStyle(e).opacity),0,'Extinguished aura stays dark during reverse handoff');
    await input(-height*.5);
  }else await input(-height);
  await page.waitForFunction(()=>document.querySelector('#chapter-anniversary').dataset.chapterState==='completing');
  await page.click('.together-next');await page.waitForFunction(()=>document.querySelector('#chapter-finale').dataset.chapterState==='active');
  assert.equal(await page.$eval('.celebration-scene',e=>e.dataset.blown),'true');
  assert.equal(await page.$eval('.candle-flame',e=>+getComputedStyle(e).opacity),0,'Re-entry preserves the wish');

  await page.click('.revisit-btn');
  await page.waitForFunction(() => document.querySelector('#chapter-hero').dataset.chapterState === 'completing');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'chapter-hero', 'Replay restores focus to the opening');
  await page.click('.cinematic-hero__cta');
  await page.waitForFunction(() => document.querySelector('#chapter-flowers').dataset.chapterState === 'completing');
  assert.equal(await page.$eval('[data-chapter-content="flowers"]', e => e.inert), false, 'The journey remains interactive after replay');

  assert.deepEqual(errors, []);
  console.log(`${out}: PASS forward, hold, anchored candle, keyboard focus, blow/light off, re-ignite, reverse, wish retained, replay, no errors`);
} catch (error) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: `${out}/failure.png` });
    console.error(await page.evaluate(() => ({
      scrollY,
      handoffs: { ...document.documentElement.dataset },
      focus: document.activeElement?.className,
      chapters: [...document.querySelectorAll('[data-chapter-state]')].map(e => ({ id: e.id, state: e.dataset.chapterState })),
    })));
  }
  throw error;
} finally {
  await browser.close();
}
