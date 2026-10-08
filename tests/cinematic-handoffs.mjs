import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const mobile = process.argv.includes('--mobile');
const label = process.env.CAPTURE_LABEL || 'cinematic';
const selectedPair = process.argv.find(argument => argument.startsWith('--pair='));
const pairs = selectedPair ? [Number(selectedPair.split('=')[1])] : process.argv.includes('--last-two') ? [3, 4] : [1, 2, 3, 4];
const ids = ['hero', 'flowers', 'wallet', 'letter', 'finale', 'anniversary'];
const out = `docs/captures/${label}${mobile ? '-mobile' : '-desktop'}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const p = await browser.newPage(), errors = [], samples = [];
  p.on('pageerror', error => errors.push(error.message));
  await p.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
  const stable = id => p.waitForFunction(id => ['active', 'completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState) && !Object.keys(document.documentElement.dataset).some(key => key.endsWith('Handoff')), {}, id);
  const click = selector => p.$eval(selector, element => element.click());
  const edge = async (id, end = false) => {
    await p.evaluate(({ id, end }) => {
      const stage = document.querySelector(`#chapter-${id}`);
      scrollTo({ top: stage.offsetTop + (end ? Math.max(0, stage.offsetHeight - innerHeight) : 0), behavior: 'instant' });
    }, { id, end });
    await stable(id);
    await wait(150);
  };
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(process.env.JOURNEY_URL || 'http://127.0.0.1:3333/', { waitUntil: 'networkidle2' });
  await p.waitForSelector('.gallery-loader', { hidden: true });
  await click('.garden-gate__enter'); await p.waitForSelector('.entrance-gate', { hidden: true });
  await click('.cinematic-hero__cta'); await stable('flowers');
  await click('.nature-bloom__footer button'); await stable('wallet');
  await p.waitForFunction(() => document.querySelector('.envelope__seal')?.disabled === false);
  await click('.envelope__seal'); await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');
  await click('.scene-next'); await stable('letter');
  await p.waitForSelector('.letter-bloom-garden[data-bloomed="true"]', { timeout: 20000 });
  await click('.letter-next'); await stable('finale');
  await click('.candle-blow-action'); await click('.wish-next'); await stable('anniversary');
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.querySelectorAll('.together-photo img,.birthday-cake img')].every(image => image.complete && image.naturalWidth));
  for (const pair of pairs) {
    if (pair === 1 || pair === 2) {
      await edge('wallet');
      await p.waitForFunction(() => !document.querySelector('.envelope__seal').disabled);
      const desired = pair === 1 ? 'closed' : 'open';
      if (await p.$eval('.chapter-envelope-scene', element => element.dataset.state) !== desired) {
        await click('.envelope__seal'); await p.waitForSelector(`.chapter-envelope-scene[data-state="${desired}"]`);
      }
    }
    if (pair === 3 || pair === 4) {
      await edge('finale');
      const blown = await p.$eval('.celebration-scene', element => element.dataset.blown === 'true');
      if (pair === 3 && blown) await click('.reignite-btn');
      if (pair === 4 && !blown) await click('.candle-blow-action');
      await p.waitForFunction(blown => +getComputedStyle(document.querySelector('.finale-lighting')).opacity === (blown ? 0 : 1), {}, pair === 4);
    }
    for (const reverse of [false, true]) {
      const source = ids[pair + (reverse ? 1 : 0)];
      await edge(source, !reverse);
      await p.evaluate(async ({ pair, reverse }) => {
        const stage = id => document.querySelector(`#chapter-${id}`);
        const content = id => document.querySelector(`[data-chapter-content="${id}"]`);
        const options = { reverse, scrollDelta: 0, finish: () => {} };
        if (pair === 1) {
          const { flowersVoucherHandoff } = await import('/src/chapters/flowersVoucherHandoff.ts');
          window.review = flowersVoucherHandoff({ flowers: stage('flowers'), voucher: stage('wallet'), gardenContent: content('flowers'), voucherContent: content('wallet'), ...options });
        } else if (pair === 2) {
          const { voucherLetterHandoff } = await import('/src/chapters/voucherLetterHandoff.ts');
          window.review = voucherLetterHandoff({ voucher: stage('wallet'), letter: stage('letter'), voucherContent: content('wallet'), letterContent: content('letter'), ...options });
        } else if (pair === 3) {
          const { letterWishHandoff } = await import('/src/chapters/letterWishHandoff.ts');
          window.review = letterWishHandoff({ letter: stage('letter'), wish: stage('finale'), letterContent: content('letter'), wishContent: content('finale'), ...options });
        } else {
          const { wishAnniversaryHandoff } = await import('/src/chapters/wishAnniversaryHandoff.ts');
          window.review = wishAnniversaryHandoff({ wish: stage('finale'), anniversary: stage('anniversary'), wishContent: content('finale'), anniversaryContent: content('anniversary'), ...options });
        }
      }, { pair, reverse });
      const direction = reverse ? 'reverse' : 'forward';
      const percentages = reverse ? [100, 80, 60, 50, 40, 20] : [0, 20, 40, 50, 60, 80];
      for (const percent of percentages) {
        if (percent !== percentages[0]) {
          await p.evaluate(value => window.review.seek(value / 100, false), percent);
          await p.waitForFunction(value => Math.abs(+document.querySelector('[data-handoff-progress]').dataset.handoffProgress - value / 100) < .002, {}, percent);
        }
        samples.push(await p.evaluate(({ pair, reverse, percent }) => ({
          pair, reverse, percent, overflow: document.documentElement.scrollWidth > innerWidth,
          note: [...document.querySelectorAll('.together-copy,.together-note,.together-note__heading')].map(element => ({
            className: element.className, opacity: +getComputedStyle(element).opacity, top: element.getBoundingClientRect().top,
          })),
        }), { pair, reverse, percent }));
        await p.screenshot({ path: `${out}/${pair}-${direction}-${String(reverse ? 100 - percent : percent).padStart(3, '0')}.png` });
      }
      await p.evaluate(() => { window.review.dispose(); delete window.review; });
      const destination = ids[pair + (reverse ? 0 : 1)];
      await edge(destination, reverse);
      await p.screenshot({ path: `${out}/${pair}-${direction}-100.png` });
      assert.equal(await p.$('.chapter-light-bridge,.finale-handoff-backdrop,.anniversary-handoff-backdrop,.garden-video-fold,.chapter-page-turn-shade'), null, 'Transient scenery is removed after scrubbing');
      console.log(`Captured ${pair} ${direction}: seven frames, ${mobile ? 'mobile' : 'desktop'}.`);
    }
  }
  assert(samples.every(sample => !sample.overflow), 'No horizontal overflow at any sampled progress');
  assert(samples.filter(sample => sample.pair === 4 && sample.percent >= 80).every(sample => sample.note.every(element => element.opacity > .99)), 'Anniversary copy is readable before landing, without a paused entrance animation');
  assert.deepEqual(errors, []);
  await fs.writeFile(`${out}/samples.json`, JSON.stringify(samples, null, 2));
  console.log(`PASS ${out}: reversible handoffs, seven-frame sequences, no overflow, no errors or leftover layers.`);
} finally {
  await Promise.race([browser.close(), wait(3000).then(() => browser.process()?.kill())]);
}
