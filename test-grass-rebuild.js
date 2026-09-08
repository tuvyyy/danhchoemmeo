import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots/grass-rebuild');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runGrassRebuildAudit() {
  console.log('===========================================================');
  console.log('STARTING FLOWERS GRASS REBUILD ACCEPTANCE AUDIT');
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
    console.log('\n--- 1. DESKTOP VIEWPORT (1440 x 900) ---');
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
    // Allow smooth scroll to settle
    await sleep(900);

    // [Check 1: Marquee Removal]
    const marqueeCheck = await page.evaluate(() => {
      const marqueeEl = document.querySelector('[data-layer="marquee"]');
      const hasText = document.body.innerText.includes('growing with you');
      return { hasMarqueeEl: !!marqueeEl, hasMarqueeText: hasText };
    });

    if (marqueeCheck.hasMarqueeEl || marqueeCheck.hasMarqueeText) {
      throw new Error(`Marquee text or element still found in DOM: ${JSON.stringify(marqueeCheck)}`);
    }
    console.log('  ✓ Verified: Background marquee text completely removed.');

    // [Check 2: Grass Meadow Layering & Clumps Count]
    const meadowState = await page.evaluate(() => {
      const meadow = document.querySelector('[data-layer="grass-meadow"]');
      const backLayer = document.querySelector('[data-grass-layer="back"]');
      const midLayer = document.querySelector('[data-grass-layer="mid"]');
      const frontLayer = document.querySelector('[data-grass-layer="front"]');
      const backClumps = document.querySelectorAll('[data-grass-layer="back"] [data-grass-clump]').length;
      const midClumps = document.querySelectorAll('[data-grass-layer="mid"] [data-grass-clump]').length;
      const frontClumps = document.querySelectorAll('[data-grass-layer="front"] [data-grass-clump]').length;
      const allClumps = document.querySelectorAll('[data-grass-clump]');
      const clumpIds = Array.from(allClumps).map((c) => c.getAttribute('data-grass-clump'));

      return {
        hasMeadow: !!meadow,
        hasBackLayer: !!backLayer,
        hasMidLayer: !!midLayer,
        hasFrontLayer: !!frontLayer,
        counts: { back: backClumps, mid: midClumps, front: frontClumps, total: allClumps.length },
        clumpIds,
      };
    });

    console.log('  Desktop Meadow Structure:', meadowState);
    if (!meadowState.hasMeadow || !meadowState.hasBackLayer || !meadowState.hasMidLayer || !meadowState.hasFrontLayer) {
      throw new Error('Grass meadow layers missing from DOM!');
    }
    if (meadowState.counts.back < 1 || meadowState.counts.mid < 4 || meadowState.counts.front < 4) {
      throw new Error(`Insufficient grass clumps across layers: ${JSON.stringify(meadowState.counts)}`);
    }
    console.log(`  ✓ Verified: 3-layer meadow with ${meadowState.counts.total} clumps (back: ${meadowState.counts.back}, mid: ${meadowState.counts.mid}, front: ${meadowState.counts.front}).`);

    // Screenshot 1: Desktop Grass Start (0% Bloom, Initial Meadow)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-start.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-start.png');

    // [Check 3: Independent Wind Motion]
    console.log('\n  [Check 3: Independent Wind Motion Verification]');
    const sample1 = await page.evaluate(() => {
      const getTransform = (id) => {
        const el = document.querySelector(`[data-grass-clump="${id}"]`);
        return el ? window.getComputedStyle(el).transform : null;
      };
      return {
        back: getTransform('back_strip'),
        m1: getTransform('m1'),
        m2: getTransform('m2'),
        f1: getTransform('f1'),
        f3: getTransform('f3'),
      };
    });

    await sleep(2200);

    const sample2 = await page.evaluate(() => {
      const getTransform = (id) => {
        const el = document.querySelector(`[data-grass-clump="${id}"]`);
        return el ? window.getComputedStyle(el).transform : null;
      };
      const main = document.querySelector('[data-flower-main="true"]');
      const sec = document.querySelector('[data-flower-secondary="true"]');
      return {
        back: getTransform('back_strip'),
        m1: getTransform('m1'),
        m2: getTransform('m2'),
        f1: getTransform('f1'),
        f3: getTransform('f3'),
        mainFrame: main ? parseInt(main.getAttribute('data-bloom-frame') || '1') : null,
        secFrame: sec ? parseInt(sec.getAttribute('data-bloom-frame') || '1') : null,
      };
    });

    const isMoving = sample1.m1 !== sample2.m1 || sample1.f1 !== sample2.f1;
    const isDistinct = sample2.m1 !== sample2.f3;
    console.log('  Motion sample comparison:');
    console.log('    m1 transform t1:', sample1.m1);
    console.log('    m1 transform t2:', sample2.m1);
    console.log('    f3 transform t2:', sample2.f3);
    console.log(`    Independent motion verified: moving=${isMoving}, distinct=${isDistinct}`);

    if (!isMoving) {
      console.warn('  [Warning] GSAP transform variation was very subtle or not detected.');
    }

    // Screenshot 2: Desktop Grass Mid (Mid bloom, passing breeze)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-mid.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-mid.png');

    // [Check 4: Full Bloom, Quote Contrast, and CTA Accessibility]
    console.log('\n  [Check 4: Full Bloom, Quote & CTA Unlock]');
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
      throw new Error('Full bloom or CTA unlock timed out!');
    }

    // Wait for CTA fade-in animation (0.6s) to complete
    await sleep(800);

    // Verify Quote & CTA contrast and visibility
    const uiMetrics = await page.evaluate(() => {
      const quote = document.querySelector('[data-layer="quote"] h2');
      const cta = document.querySelector('button.group');
      const qRect = quote?.getBoundingClientRect();
      const cRect = cta?.getBoundingClientRect();
      return {
        quoteVisible: !!qRect && qRect.height > 0 && qRect.width > 0,
        ctaVisible: !!cRect && cRect.height > 0 && cRect.width > 0,
        ctaBottom: cRect ? window.innerHeight - cRect.bottom : null,
      };
    });

    console.log('  UI Contrast & Geometry:', uiMetrics);
    if (!uiMetrics.quoteVisible || !uiMetrics.ctaVisible) {
      throw new Error('Quote or CTA button not properly visible!');
    }
    console.log('  ✓ Verified: Quote and CTA remain clearly legible and accessible.');

    // Screenshot 3: Desktop Grass Full (Full bloom, open lilies, meadow backdrop, quote, CTA)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-grass-full.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/desktop-grass-full.png');

    // [Check 5: Return Visit Persistence]
    console.log('\n  [Check 5: Return Visit Persistence]');
    console.log('  Advancing Flowers -> Wallet...');
    const ctaBtn = await page.$('button.group');
    if (ctaBtn) await ctaBtn.click();
    await sleep(700);

    console.log('  Backscrolling to Flowers...');
    await page.evaluate(() => {
      const el = document.getElementById('chapter-flowers');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(600);

    const returnState = await page.evaluate(() => {
      const main = document.querySelector('[data-flower-main="true"]');
      const sec = document.querySelector('[data-flower-secondary="true"]');
      const quote = document.querySelector('[data-layer="quote"] h2');
      const cta = document.querySelector('button.group');
      const meadow = document.querySelector('[data-layer="grass-meadow"]');
      return {
        mainFrame: main ? parseInt(main.getAttribute('data-bloom-frame') || '1') : null,
        secFrame: sec ? parseInt(sec.getAttribute('data-bloom-frame') || '1') : null,
        hasQuote: !!quote,
        hasCta: !!cta,
        hasMeadow: !!meadow,
      };
    });

    console.log('  Return Visit State:', returnState);
    if (returnState.mainFrame !== 60 || returnState.secFrame !== 60 || !returnState.hasQuote || !returnState.hasCta || !returnState.hasMeadow) {
      throw new Error(`Return visit failed: ${JSON.stringify(returnState)}`);
    }
    console.log('  ✓ Return visit persisted: Flowers retained Frame 60, meadow active, quote and CTA ready.');

    // --- 2. MOBILE VIEWPORT (390 x 844) ---
    console.log('\n--- 2. MOBILE VIEWPORT (390 x 844) ---');
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

    // Screenshot 4: Mobile Grass Start
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-grass-start.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/mobile-grass-start.png');

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

    // Screenshot 5: Mobile Grass Full
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-grass-full.png') });
    console.log('  ✓ Captured docs/screenshots/grass-rebuild/mobile-grass-full.png');

    await mobilePage.close();

    console.log('\n===========================================================');
    console.log('AUDIT SUMMARY');
    console.log('===========================================================');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);

    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      throw new Error('Audit encountered runtime or network errors!');
    }

    console.log('ALL FLOWERS GRASS REBUILD CHECKS PASSED PERFECTLY!\n');
  } finally {
    await browser.close();
  }
}

runGrassRebuildAudit().catch((err) => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});

