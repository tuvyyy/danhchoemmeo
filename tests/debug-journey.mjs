import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});

const page = await browser.newPage();
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
await page.waitForSelector('.cinematic-hero__cta', { timeout: 15000 });
await page.waitForSelector('.fixed.inset-0.z-50', { hidden: true });
await new Promise(r => setTimeout(r, 500));

console.log('1. Home loaded');
await page.screenshot({ path: 'tests/test-01-hero.png' });

// Proceed from Hero to Flowers
await page.click('.cinematic-hero__cta');
await new Promise(r => setTimeout(r, 2200));
console.log('2. Flowers loaded');
await page.screenshot({ path: 'tests/test-02-flowers.png' });

// Scroll to bottom of Flowers and trigger wheel to go to Voucher
await page.evaluate(() => {
  const f = document.querySelector('#chapter-flowers');
  window.scrollTo(0, f.offsetTop + f.offsetHeight - window.innerHeight);
});
await new Promise(r => setTimeout(r, 500));
await page.mouse.wheel({ deltaY: 200 });
await new Promise(r => setTimeout(r, 1200));

console.log('3. Voucher chapter entered');
await page.screenshot({ path: 'tests/test-03-voucher-closed.png' });

// Open envelope
await page.waitForSelector('.envelope__seal:not(:disabled)');
await page.click('.envelope__seal');
await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
await new Promise(r => setTimeout(r, 1500));

console.log('4. Envelope opened, inspecting letter note');
await page.screenshot({ path: 'tests/test-04-envelope-open.png' });

// Inspect letter note from envelope
const letterHit = await page.$('[data-voucher="letter-note"]');
assert(letterHit, 'Letter note hotspot must exist');
await letterHit.click();
await page.waitForSelector('.ticket-inspection');
await new Promise(r => setTimeout(r, 600));

console.log('5. Letter note modal open in Chapter 02');
await page.screenshot({ path: 'tests/test-05-letter-inspect-ch2.png' });

// Close inspection modal
await page.keyboard.press('Escape');
await page.waitForSelector('.ticket-inspection', { hidden: true });
await new Promise(r => setTimeout(r, 400));

// Advance to Chapter 03 (Letter) via next button
const nextBtn = await page.$('.scene-next:not(:disabled)');
assert(nextBtn, 'Next button must be enabled when envelope is open');
await nextBtn.click();
await page.waitForSelector('#chapter-letter');
await new Promise(r => setTimeout(r, 1200));

console.log('6. Chapter 03 Letter Atelier entered');
await page.screenshot({ path: 'tests/test-06-letter-closed.png' });

// Open the letter
await page.click('.letter-open-action');
await new Promise(r => setTimeout(r, 1200));

console.log('7. Letter opened in Chapter 03');
await page.screenshot({ path: 'tests/test-07-letter-open.png' });

// Verify Page 01 has handwritten note
const hasNoteImg = await page.$eval('.letter-keepsake .letter-page--note .letter-page__note-img', img => Boolean(img.src));
assert(hasNoteImg, 'Handwritten note image must be rendered on Page 01');

// Open reader modal
await page.click('.letter-page__read');
await page.waitForSelector('.letter-reader');
await new Promise(r => setTimeout(r, 600));

console.log('8. High-res reader modal open');
await page.screenshot({ path: 'tests/test-08-letter-reader-page1.png' });

// Flip to Page 02 in reader
const nextPageBtn = await page.$('.letter-reader__pagination button:nth-child(3)');
if (nextPageBtn) await nextPageBtn.click();
await new Promise(r => setTimeout(r, 400));
console.log('9. Reader Page 02');
await page.screenshot({ path: 'tests/test-09-letter-reader-page2.png' });

// Close reader
await page.keyboard.press('Escape');
await page.waitForSelector('.letter-reader', { hidden: true });
await new Promise(r => setTimeout(r, 400));

// Reverse scroll back to Chapter 02 (Voucher)
await page.evaluate(() => {
  const l = document.querySelector('#chapter-letter');
  window.scrollTo(0, l.offsetTop);
});
await new Promise(r => setTimeout(r, 300));
await page.mouse.wheel({ deltaY: -200 });
await new Promise(r => setTimeout(r, 1200));

console.log('10. Reverse scroll back to Voucher');
await page.screenshot({ path: 'tests/test-10-reverse-voucher.png' });

assert.deepEqual(errors, []);
console.log('ALL WORKFLOW TESTS PASSED PERFECTLY!');
await browser.close();
