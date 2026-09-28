import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

async function test() {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; min-height: 100vh;
    background: radial-gradient(ellipse 110% 90% at 50% 45%, #230810 0%, #150308 55%, #0a0104 100%);
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: serif;
    color: #cbb085;
    padding: 16px 0;
  }

  .chapter-header {
    text-align: center;
    margin-bottom: 8px;
    z-index: 50;
  }
  .chapter-title {
    font-size: 11px;
    letter-spacing: 0.35em;
    font-family: 'Cinzel', 'Playfair Display', serif;
    color: #d4af72;
    opacity: 0.9;
  }
  .chapter-star {
    display: block;
    font-size: 9px;
    color: #d4af72;
    margin-top: 2px;
    opacity: 0.8;
  }

  /* Mobile envelope scene */
  .envelope-scene-mobile {
    position: relative;
    width: 92vw;
    height: 80vh;
    max-height: 720px;
    border-radius: 8px;
    overflow: hidden;
  }

  .layer {
    position: absolute;
    user-select: none;
  }

  /* 2. Top flap */
  .layer-top-flap {
    left: -5%;
    top: -4%;
    width: 110%;
    height: 35%;
    object-fit: fill;
    z-index: 2;
    filter: drop-shadow(0 6px 14px rgba(0,0,0,0.5));
  }

  /* 3. Ivory inner liner */
  .layer-inner-liner {
    left: 0;
    top: 4%;
    width: 100%;
    height: 90%;
    object-fit: fill;
    z-index: 3;
    clip-path: inset(0 0 16% 0);
  }

  /* 4. Letter Note — prominent on top half */
  .layer-letter {
    position: absolute;
    left: 6%;
    top: 14%;
    width: 88%;
    height: auto;
    transform: rotate(-1.5deg);
    z-index: 10;
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.38));
  }

  /* 5. Vouchers — stack/fan underneath letter */
  .voucher-group-mobile {
    position: absolute;
    left: 4%;
    top: 45%;
    width: 92%;
    height: 48%;
    z-index: 12;
  }
  .voucher-card-m {
    position: absolute;
    width: 44%;
    height: auto;
    filter: drop-shadow(0 8px 18px rgba(0,0,0,0.38));
    cursor: pointer;
  }
  .vm-1 { left: 2%;  top: 10%; transform: rotate(-6deg); z-index: 1; }
  .vm-2 { left: 26%; top: 2%;  transform: rotate(-1deg); z-index: 4; }
  .vm-3 { left: 48%; top: 8%;  transform: rotate(4deg);  z-index: 3; }
  .vm-4 { left: 56%; top: 14%; transform: rotate(8deg);  z-index: 2; }

  /* 6. Bottom Burgundy Pocket */
  .layer-bottom-pocket {
    left: -5%;
    bottom: -4%;
    width: 110%;
    height: 42%;
    object-fit: fill;
    z-index: 20;
    pointer-events: none;
    filter: drop-shadow(0 -6px 20px rgba(0,0,0,0.5));
  }

  /* Pocket text */
  .pocket-branding {
    position: absolute;
    left: 50%;
    bottom: 6%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 22;
    pointer-events: none;
  }
  .pocket-title {
    font-size: 10px;
    letter-spacing: 0.25em;
    color: #d4af72;
    margin-bottom: 2px;
  }
  .pocket-subtitle {
    font-size: 8px;
    letter-spacing: 0.18em;
    color: #c5a065;
  }

  /* 7. Wax seal */
  .layer-wax-seal {
    left: 50%;
    top: 8%;
    width: 60px;
    height: 60px;
    transform: translateX(-50%);
    z-index: 25;
    pointer-events: none;
    filter: drop-shadow(0 6px 14px rgba(0,0,0,0.6));
  }
</style>
</head>
<body>
  <div class="chapter-header">
    <div class="chapter-title">CHƯƠNG 02</div>
    <div class="chapter-star">✦</div>
  </div>

  <div class="envelope-scene-mobile">
    <img class="layer layer-top-flap" src="http://localhost:3333/assets/envelope-voucher/02_envelope_top_flap.png" />
    <img class="layer layer-inner-liner" src="http://localhost:3333/assets/envelope-voucher/04_envelope_inner_liner.png" />
    <img class="layer layer-letter" src="http://localhost:3333/assets/envelope-voucher/06_letter_note.png" />

    <div class="voucher-group-mobile">
      <img class="voucher-card-m vm-1" src="http://localhost:3333/assets/envelope-voucher/07_voucher_01_food.png" />
      <img class="voucher-card-m vm-2" src="http://localhost:3333/assets/envelope-voucher/08_voucher_02_coffee.png" />
      <img class="voucher-card-m vm-3" src="http://localhost:3333/assets/envelope-voucher/09_voucher_03_movie.png" />
      <img class="voucher-card-m vm-4" src="http://localhost:3333/assets/envelope-voucher/10_voucher_04_anywhere.png" />
    </div>

    <img class="layer layer-bottom-pocket" src="http://localhost:3333/assets/envelope-voucher/03_envelope_bottom_pocket.png" />

    <div class="pocket-branding">
      <div class="pocket-title">NHỮNG ĐIỀU NHỎ BÉ</div>
      <div class="pocket-subtitle">CHO NGƯỜI THẬT ĐẶC BIỆT</div>
    </div>

    <img class="layer layer-wax-seal" src="http://localhost:3333/assets/envelope-voucher/05_wax_seal.png" />
  </div>
</body>
</html>
`;
  await fs.writeFile('c:/danhchoemmeo/tests/test-mobile-compose.html', html, 'utf-8');
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('file:///c:/danhchoemmeo/tests/test-mobile-compose.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'c:/danhchoemmeo/tests/test-mobile-compose.png' });
  await browser.close();
  console.log('Saved test-mobile-compose.png');
}
test().catch(console.error);