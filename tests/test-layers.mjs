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
    background: radial-gradient(ellipse 110% 90% at 50% 45%, #2a0b14 0%, #1a050c 50%, #0c0205 100%);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
  }
  .stage {
    position: relative;
    width: 84vw;
    max-width: 1440px;
    aspect-ratio: 1672 / 941;
    max-height: 78vh;
  }
  .layer {
    position: absolute;
    user-select: none;
    pointer-events: none;
  }
  /* 1. Inner liner */
  .inner-liner {
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    z-index: 1;
  }
  /* 2. Top flap */
  .top-flap {
    left: 0;
    top: -12%;
    width: 100%;
    height: auto;
    transform: scaleY(-1);
    z-index: 2;
  }
  /* 3. Letter note */
  .letter-note {
    left: 6%;
    top: 15%;
    width: 38%;
    transform: rotate(-3.5deg);
    z-index: 10;
    filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));
  }
  /* 4. Vouchers */
  .voucher {
    position: absolute;
    width: 16%;
    z-index: 12;
    filter: drop-shadow(0 14px 28px rgba(0,0,0,0.45));
    transition: transform 0.3s ease;
  }
  .voucher-1 { left: 44%; top: 24%; transform: rotate(-7deg); z-index: 11; }
  .voucher-2 { left: 55%; top: 16%; transform: rotate(-2deg); z-index: 14; }
  .voucher-3 { left: 70%; top: 24%; transform: rotate(3deg); z-index: 12; }
  .voucher-4 { left: 81%; top: 27%; transform: rotate(7deg); z-index: 11; }
  /* 5. Bottom pocket */
  .bottom-pocket {
    left: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    z-index: 25;
  }
  /* 6. Wax seal */
  .wax-seal {
    left: 50%;
    top: 14%;
    width: 80px;
    transform: translateX(-50%);
    z-index: 30;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));
  }
</style>
</head>
<body>
  <div class="stage">
    <img class="layer inner-liner" src="http://localhost:3333/assets/envelope-voucher/04_envelope_inner_liner.png" />
    <img class="layer top-flap" src="http://localhost:3333/assets/envelope-voucher/02_envelope_top_flap.png" />
    <img class="layer letter-note" src="http://localhost:3333/assets/envelope-voucher/06_letter_note.png" />
    <img class="layer voucher voucher-1" src="http://localhost:3333/assets/envelope-voucher/07_voucher_01_food.png" />
    <img class="layer voucher voucher-2" src="http://localhost:3333/assets/envelope-voucher/08_voucher_02_coffee.png" />
    <img class="layer voucher voucher-3" src="http://localhost:3333/assets/envelope-voucher/09_voucher_03_movie.png" />
    <img class="layer voucher voucher-4" src="http://localhost:3333/assets/envelope-voucher/10_voucher_04_anywhere.png" />
    <img class="layer bottom-pocket" src="http://localhost:3333/assets/envelope-voucher/03_envelope_bottom_pocket.png" />
    <img class="layer wax-seal" src="http://localhost:3333/assets/envelope-voucher/05_wax_seal.png" />
  </div>
</body>
</html>
`;
  await fs.writeFile('c:/danhchoemmeo/tests/test-layers.html', html, 'utf-8');
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 810 });
  await page.goto('file:///c:/danhchoemmeo/tests/test-layers.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'c:/danhchoemmeo/tests/test-layers.png' });
  await browser.close();
  console.log('Saved test-layers.png');
}
test().catch(console.error);