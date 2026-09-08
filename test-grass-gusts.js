import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots/grass-rebuild');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runGrassGustsAudit() {
  console.log('===========================================================');
  console.log('STARTING CONTINUOUS GRASS MEADOW & GUST ACCEPTANCE AUDIT');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('  [Console Error]:', msg.text());
    }
  });

  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.url()} (${req.failure()?.errorText})`);
    console.log('  [Network Error]:', req.url(), req.failure()?.errorText);
  });

  try {
    console.log('\n--- 1. DESKTOP CONTINUOUS MEADOW & GUST PROPAGATION (1440 x 900) ---');
    await page.goto('http://localhost:3333/', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('  Loaded http://localhost:3333/');

    // Advance Hero -> Flowers
    console.log('  Advancing Hero -> Flowers...');
    await page.waitForFunction(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Bắt đầu hành trình')
      );
      return !!btn;
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Bắt đầu hành trình')
      );
      btn?.click();
    });

    await page.waitForSelector('#chapter-flowers', { timeout: 5000 });
    await sleep(900);

    // Verify 0 marquee remnants
    const marqueeCheck = await page.evaluate(() => {
      const marqueeEl = document.querySelector('[data-layer="marquee"]');
      const hasText = document.body.innerText.includes('growing with you');
      return { hasMarqueeEl: !!marqueeEl, hasMarqueeText: hasText };
    });
    if (marqueeCheck.hasMarqueeEl || marqueeCheck.hasMarqueeText) {
      throw new Error(`Marquee remnants detected in DOM: ${JSON.stringify(marqueeCheck)}`);
    }
    console.log('  ✓ Verified: Zero background marquee remnants.');

    // 1. Capture Calm Moment (t ~ 1.0s)
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-calm.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-calm.png');

    // 2. Capture Gust Left (t ~ 2.8s - 3.2s)
    await sleep(1800);
    const leftGustState = await page.evaluate(() => {
      const f1 = document.querySelector('[data-grass-clump="f1"]');
      const f3 = document.querySelector('[data-grass-clump="f3"]');
      return {
        f1Transform: f1 ? window.getComputedStyle(f1).transform : null,
        f3Transform: f3 ? window.getComputedStyle(f3).transform : null,
      };
    });
    console.log('  Left gust deflection state:', leftGustState);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-gust-left.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-gust-left.png');

    // 3. Capture Gust Center (t ~ 3.5s - 3.8s)
    await sleep(500);
    const centerGustState = await page.evaluate(() => {
      const f2 = document.querySelector('[data-grass-clump="f2"]');
      const f3 = document.querySelector('[data-grass-clump="f3"]');
      return {
        f2Transform: f2 ? window.getComputedStyle(f2).transform : null,
        f3Transform: f3 ? window.getComputedStyle(f3).transform : null,
      };
    });
    console.log('  Center gust deflection state:', centerGustState);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-gust-center.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-gust-center.png');

    // 4. Capture Gust Right (t ~ 4.2s - 4.5s)
    await sleep(600);
    const rightGustState = await page.evaluate(() => {
      const f4 = document.querySelector('[data-grass-clump="f4"]');
      return {
        f4Transform: f4 ? window.getComputedStyle(f4).transform : null,
      };
    });
    console.log('  Right gust deflection state:', rightGustState);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-gust-right.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-gust-right.png');

    // Wait for full bloom and verify UI accessibility
    let fullReady = false;
    for (let i = 0; i < 40; i++) {
      const status = await page.evaluate(() => {
        const quote = document.querySelector('[data-layer="quote"] h2');
        const cta = document.querySelector('button.group');
        const main = document.querySelector('[data-flower-main="true"]');
        const sec = document.querySelector('[data-flower-secondary="true"]');
        return {
          hasQuote: !!quote,
          hasCta: !!cta,
          mainFrame: main ? parseInt(main.getAttribute('data-bloom-frame') || '1') : null,
          secFrame: sec ? parseInt(sec.getAttribute('data-bloom-frame') || '1') : null,
        };
      });

      if (status.hasCta && status.mainFrame === 60 && status.secFrame === 60) {
        fullReady = true;
        console.log('  Full bloom reached:', status);
        break;
      }
      await sleep(250);
    }
    if (!fullReady) throw new Error('Flowers bloom or CTA unlock timed out!');

    // --- 2. MOBILE CONTINUOUS MEADOW (390 x 844) ---
    console.log('\n--- 2. MOBILE CONTINUOUS MEADOW (390 x 844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    await mobilePage.goto('http://localhost:3333/', { waitUntil: 'networkidle0' });

    // Advance to Flowers
    await mobilePage.waitForFunction(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Bắt đầu hành trình')
      );
      return !!btn;
    }, { timeout: 10000 });

    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Bắt đầu hành trình')
      );
      btn?.click();
    });

    await mobilePage.waitForSelector('#chapter-flowers', { timeout: 5000 });
    await sleep(900);

    // Wait for full bloom on mobile
    let mFull = false;
    for (let i = 0; i < 40; i++) {
      const ready = await mobilePage.evaluate(() => {
        const cta = document.querySelector('button.group');
        const main = document.querySelector('[data-flower-main="true"]');
        const sec = document.querySelector('[data-flower-secondary="true"]');
        return !!cta && main?.getAttribute('data-bloom-frame') === '60' && sec?.getAttribute('data-bloom-frame') === '60';
      });
      if (ready) {
        mFull = true;
        break;
      }
      await sleep(250);
    }
    if (!mFull) throw new Error('Mobile full bloom timed out!');

    await sleep(800);

    // Check zero horizontal overflow
    const overflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (overflow) throw new Error('Horizontal scroll overflow detected on mobile!');
    console.log('  ✓ Mobile zero horizontal overflow confirmed.');

    // 5. Capture Mobile Final
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-grass-final.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/mobile-grass-final.png');

    await mobilePage.close();

    console.log('\n===========================================================');
    console.log('AUDIT SUMMARY');
    console.log('===========================================================');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);

    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      throw new Error('Audit encountered runtime or network errors!');
    }

    console.log('ALL CONTINUOUS GRASS MEADOW CHECKS PASSED!\n');
  } finally {
    await browser.close();
  }
}

runGrassGustsAudit().catch((err) => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});

