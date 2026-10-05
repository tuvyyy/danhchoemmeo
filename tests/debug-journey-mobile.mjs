import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});

const page = await browser.newPage();
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto('http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1000));

console.log('Mobile 1. Home loaded');

// Proceed to Flowers
await page.waitForSelector('.cinematic-hero__cta', { visible: true, timeout: 15000 });
await page.click('.cinematic-hero__cta');
await new Promise(r => setTimeout(r, 2200));

await page.waitForSelector('.nature-bloom__footer button');
await page.click('.nature-bloom__footer button');
await new Promise(r => setTimeout(r, 1200));

console.log('Mobile 2. Voucher entered');
await page.screenshot({ path: 'tests/test-mobile-01-voucher.png' });

// Open envelope
await page.waitForSelector('.envelope__seal');
await page.click('.envelope__seal');
await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: 'tests/test-mobile-02-envelope-open.png' });

// Advance to Letter
await page.click('.scene-next');
await page.waitForSelector('#chapter-letter');
await new Promise(r => setTimeout(r, 1200));
console.log('Mobile 3. Letter entered');
await page.screenshot({ path: 'tests/test-mobile-03-letter.png' });

// Open letter
await page.click('.letter-open-action');
await new Promise(r => setTimeout(r, 1200));
console.log('Mobile 4. Letter open');
await page.screenshot({ path: 'tests/test-mobile-04-letter-open.png' });

// Open reader
await page.click('.letter-page__read');
await page.waitForSelector('.letter-reader');
await new Promise(r => setTimeout(r, 600));
console.log('Mobile 5. Reader open');
await page.screenshot({ path: 'tests/test-mobile-05-reader.png' });

assert.deepEqual(errors, []);
console.log('MOBILE WORKFLOW TEST PASSED PERFECTLY!');
await browser.close();
