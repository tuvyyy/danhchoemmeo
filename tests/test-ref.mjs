import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

async function test() {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    background: #16070b;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .envelope-box {
    position: relative;
    width: 84vw;
    aspect-ratio: 1672 / 941;
    max-height: 80vh;
  }
  .full {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
</style>
</head>
<body>
  <div class="envelope-box">
    <!-- Reference image for comparison -->
    <img src="http://localhost:3333/assets/envelope-voucher/chapter02_envelope_final_assets/chapter02-reference.png" style="width: 100%; height: 100%; object-fit: fill;" />
  </div>
</body>
</html>
`;
  await fs.writeFile('c:/danhchoemmeo/tests/test-ref.html', html, 'utf-8');
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 810 });
  await page.goto('file:///c:/danhchoemmeo/tests/test-ref.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'c:/danhchoemmeo/tests/test-ref-rendered.png' });
  await browser.close();
  console.log('Saved test-ref-rendered.png');
}
test().catch(console.error);