import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const page = await browser.newPage();
page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()));
page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:3333');
await page.waitForSelector('.cinematic-hero__cta', { timeout: 10000 });
console.log('Clicking CTA...');
await page.click('.cinematic-hero__cta');
for (let i = 0; i < 6; i++) {
  await new Promise(r => setTimeout(r, 500));
  const s = await page.evaluate(() => ({
    scrollY: window.scrollY,
    flowersTop: document.querySelector('#chapter-flowers')?.getBoundingClientRect().top
  }));
  console.log(`step ${i}:`, s);
}
await browser.close();
