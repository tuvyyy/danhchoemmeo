import puppeteer from 'puppeteer-core';

const pause = ms => new Promise(res => setTimeout(res, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });

  // 1. Desktop (1440x810)
  {
    console.log('Capturing Desktop...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810 });
    await page.goto('http://localhost:3333/', { waitUntil: 'networkidle2' });
    await pause(1000);
    await page.waitForSelector('.cinematic-hero__cta', { visible: true });
    await page.click('.cinematic-hero__cta');
    await pause(1000);
    await page.waitForSelector('.nature-bloom__footer button', { visible: true });
    await page.click('.nature-bloom__footer button');
    await pause(1800);
    await page.waitForSelector('.chapter-voucher-section', { visible: true });
    await pause(1800);
    await page.screenshot({ path: 'c:/danhchoemmeo/docs/screenshots/chapter02-desktop.png' });
    console.log('Saved chapter02-desktop.png');
    await page.close();
  }

  // 2. Mobile (390x844)
  {
    console.log('Capturing Mobile...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3333/', { waitUntil: 'networkidle2' });
    await pause(1000);
    await page.waitForSelector('.cinematic-hero__cta', { visible: true });
    await page.click('.cinematic-hero__cta');
    await pause(1000);
    await page.waitForSelector('.nature-bloom__footer button', { visible: true });
    await page.click('.nature-bloom__footer button');
    await pause(1800);
    await page.waitForSelector('.chapter-voucher-section', { visible: true });
    await pause(1800);
    await page.screenshot({ path: 'c:/danhchoemmeo/docs/screenshots/chapter02-mobile.png' });
    console.log('Saved chapter02-mobile.png');
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});