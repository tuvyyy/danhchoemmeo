import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots/flowers-grass-polish');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFlowersPolishAudit() {
  console.log('===========================================================');
  console.log('STARTING FLOWERS & GRASS POLISH ACCEPTANCE AUDIT');
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
  });

  try {
    console.log('\n--- 1. DESKTOP VIEWPORT (1440 x 900) ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('  Loaded http://localhost:3000/');

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

    // [Check 1: Marquee Removal & Initial Start (0%)]
    const marqueeCheck = await page.evaluate(() => {
      const marqueeEl = document.querySelector('[data-layer="marquee"]');
      const hasText = document.body.innerText.includes('growing with you');
      return { hasMarqueeEl: !!marqueeEl, hasMarqueeText: hasText };
    });

    if (marqueeCheck.hasMarqueeEl || marqueeCheck.hasMarqueeText) {
      throw new Error(`Marquee text or element still found in DOM: ${JSON.stringify(marqueeCheck)}`);
    }
    console.log('  ✓ Verified: Background marquee text completely removed.');

    const startState = await page.evaluate(() => {
      const main = document.querySelector('[data-flower-main="true"]');
      const sec = document.querySelector('[data-flower-secondary="true"]');
      const backGrass = document.querySelectorAll('[data-grass-layer="back"] [data-grass-cluster]').length;
      const midGrass = document.querySelectorAll('[data-grass-layer="mid"] [data-grass-cluster]').length;
      const frontGrass = document.querySelectorAll('[data-grass-layer="front"] [data-grass-cluster]').length;
      return {
        hasMain: !!main,
        mainFrame: main ? parseInt(main.getAttribute('data-bloom-frame') || '1') : null,
        hasSecondary: !!sec,
        secondaryFrame: sec ? parseInt(sec.getAttribute('data-bloom-frame') || '1') : null,
        grassClusters: { back: backGrass, mid: midGrass, front: frontGrass }
      };
    });

    console.log('  Initial state at 0%:', startState);
    if (!startState.hasMain || !startState.hasSecondary) {
      throw new Error('Missing main flower or secondary flower element in DOM!');
    }
    if (startState.grassClusters.back < 2 || startState.grassClusters.mid < 2 || startState.grassClusters.front < 2) {
      throw new Error(`Insufficient grass clusters in meadow: ${JSON.stringify(startState.grassClusters)}`);
    }
    console.log(`  ✓ Meadow confirmed with ${startState.grassClusters.back + startState.grassClusters.mid + startState.grassClusters.front} clusters across 3 depth planes.`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flowers-start.png') });
    console.log('  ✓ Captured docs/screenshots/flowers-grass-polish/desktop-flowers-start.png');

    // [Check 2: Mid Bloom & Staggered Delay (Main flower leads, secondary follows)]
    console.log('\n  [Check 2: Mid Bloom & Staggered Timing]');
    await sleep(2200);

    const midState = await page.evaluate(() => {
      const main = document.querySelector('[data-flower-main="true"]');
      const sec = document.querySelector('[data-flower-secondary="true"]');
      return {
        mainFrame: main ? parseInt(main.getAttribute('data-bloom-frame') || '1') : null,
        secFrame: sec ? parseInt(sec.getAttribute('data-bloom-frame') || '1') : null,
      };
    });

    console.log('  Mid bloom state:', midState);
    if (midState.secFrame >= midState.mainFrame) {
      throw new Error(`Second flower was not delayed! (sec: ${midState.secFrame}, main: ${midState.mainFrame})`);
    }
    console.log(`  ✓ Staggered timing confirmed: Main flower (frame ${midState.mainFrame}) leads secondary flower (frame ${midState.secFrame}).`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flowers-mid.png') });
    console.log('  ✓ Captured docs/screenshots/flowers-grass-polish/desktop-flowers-mid.png');

    // [Check 3: Full Bloom, Quote & CTA Unlock]
    console.log('\n  [Check 3: Full Bloom, Quote & CTA Unlock]');
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
        console.log('  Full bloom state reached:', status);
        break;
      }
      await sleep(250);
    }

    if (!fullReady) {
      throw new Error('Flowers full bloom or CTA unlock timed out!');
    }

    // Wait for CTA fade-in animation (0.6s) to finish
    await sleep(800);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flowers-full.png') });
    console.log('  ✓ Captured docs/screenshots/flowers-grass-polish/desktop-flowers-full.png');

    // [Check 4: Return-Visit Persistence]
    console.log('\n  [Check 4: Return-Visit Persistence]');
    console.log('  Advancing Flowers -> Wallet...');
    const ctaBtn = await page.$('button.group');
    if (ctaBtn) await ctaBtn.click();
    await sleep(600);

    console.log('  Backscrolling to Flowers...');
    await page.evaluate(() => {
      const el = document.getElementById('chapter-flowers');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(500);

    const returnState = await page.evaluate(() => {
      const main = document.querySelector('[data-flower-main="true"]');
      const sec = document.querySelector('[data-flower-secondary="true"]');
      const quote = document.querySelector('[data-layer="quote"] h2');
      const cta = document.querySelector('button.group');
      return {
        mainFrame: main ? parseInt(main.getAttribute('data-bloom-frame') || '1') : null,
        secFrame: sec ? parseInt(sec.getAttribute('data-bloom-frame') || '1') : null,
        hasQuote: !!quote,
        hasCta: !!cta,
      };
    });

    console.log('  Return visit state:', returnState);
    if (returnState.mainFrame !== 60 || returnState.secFrame !== 60 || !returnState.hasQuote || !returnState.hasCta) {
      throw new Error(`Return visit failed to retain state: ${JSON.stringify(returnState)}`);
    }
    console.log('  ✓ Return visit persisted: Both flowers retained frame 60 without replaying.');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flowers-return.png') });
    console.log('  ✓ Captured docs/screenshots/flowers-grass-polish/desktop-flowers-return.png');

    // --- 2. MOBILE VIEWPORT (390 x 844) ---
    console.log('\n--- 2. MOBILE VIEWPORT (390 x 844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

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

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-flowers-start.png') });
    console.log('  ✓ Captured docs/screenshots/flowers-grass-polish/mobile-flowers-start.png');

    // Wait for mobile full bloom
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

    // Wait for CTA fade-in animation
    await sleep(800);

    // Check zero horizontal overflow
    const overflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (overflow) throw new Error('Horizontal scroll overflow detected on mobile!');
    console.log('  ✓ Mobile zero horizontal overflow confirmed.');

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-flowers-full.png') });
    console.log('  ✓ Captured docs/screenshots/flowers-grass-polish/mobile-flowers-full.png');

    await mobilePage.close();

    console.log('\n===========================================================');
    console.log('AUDIT SUMMARY');
    console.log('===========================================================');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);

    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      throw new Error('Audit encountered runtime or network errors!');
    }

    console.log('ALL FLOWERS & GRASS POLISH CHECKS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

runFlowersPolishAudit().catch((err) => {
  console.error('\nAUDIT FAILED:', err.message);
  process.exit(1);
});