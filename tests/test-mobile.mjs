import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('file:///c:/danhchoemmeo/tests/test-compose3.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'c:/danhchoemmeo/tests/test-mobile-raw.png' });
  await browser.close();
  console.log('Saved test-mobile-raw.png');
}
test().catch(console.error);