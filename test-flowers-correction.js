import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots/phase-3');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFlowersTest() {
  console.log('===========================================================');
  console.log('STARTING FLOWERS CORRECTION AUDIT & VERIFICATION');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const logMessages = [];

  // -------------------------------------------------------------
  // SUITE 1: DESKTOP FLOWERS AUDIT (1440 x 900)
  // -------------------------------------------------------------
  console.log('\n--- 1. DESKTOP VIEWPORT (1440 x 900) ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  desktopPage.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('[Browser Error]:', text);
      errors.push(`Console error: ${text}`);
    } else {
      logMessages.push(text);
    }
  });

  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  console.log('  Loaded http://localhost:3000/');

  // Advance Hero -> Flowers
  await desktopPage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Bắt đầu hành trình')
    );
    return !!btn;
  });

  await desktopPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Bắt đầu hành trình')
    );
    btn?.click();
  });

  await desktopPage.waitForSelector('#chapter-flowers', { timeout: 5000 });
  // Wait for scroll animation to bring #chapter-flowers into viewport
  await desktopPage.waitForFunction(() => {
    const el = document.querySelector('#chapter-flowers');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return Math.abs(rect.top) < 50;
  }, { timeout: 5000 });

  // Check 0% (start)
  console.log('  [0%] Checking initial Flowers state at chapter entry...');
  const state0 = await desktopPage.evaluate(() => {
    const bloomLayer = document.querySelector('[data-layer="flower-bloom"]');
    const mode = bloomLayer?.getAttribute('data-bloom-mode');
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return {
      hasBloomLayer: !!bloomLayer,
      mode,
      hasQuote: !!quoteHeading,
      hasCta: !!ctaBtn,
    };
  });
  console.log('  0% State:', state0);
  if (!state0.hasBloomLayer) {
    errors.push('Flower bloom layer [data-layer="flower-bloom"] not found!');
  }
  if (state0.hasCta) {
    errors.push('CTA was prematurely available at 0%!');
  }

  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-00.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-00.png');

  // Check 25% (t = 800ms)
  await sleep(800);
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-25.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-25.png');

  // Check 50% (t = 1600ms)
  await sleep(800);
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-50.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-50.png');

  // Check 75% (t = 2400ms - quote should be revealed)
  await sleep(800);
  const state75 = await desktopPage.evaluate(() => {
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    return {
      hasQuote: !!quoteHeading,
      quoteText: quoteHeading?.textContent?.trim(),
    };
  });
  console.log('  75% State:', state75);
  if (!state75.hasQuote) {
    errors.push('Quote was not revealed by 75% progress!');
  } else {
    console.log('  ✓ Romantic quote revealed correctly:', state75.quoteText);
  }
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-75.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-75.png');

  // Check 100% (t = 3600ms - bloom complete & CTA unlocked)
  await sleep(1200);
  const state100 = await desktopPage.evaluate(() => {
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return {
      hasQuote: !!quoteHeading,
      hasCta: !!ctaBtn,
    };
  });
  console.log('  100% State:', state100);
  if (!state100.hasCta) {
    errors.push('CTA was not unlocked at 100% bloom completion!');
  } else {
    console.log('  ✓ Next Chapter CTA unlocked correctly.');
  }
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-100.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-100.png');

  // Check Return-Visit Persistence: Advance to Wallet then backscroll to Flowers
  console.log('\n  [Return Visit] Advancing to Wallet then scrolling back to Flowers...');
  await desktopPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    btn?.click();
  });
  await desktopPage.waitForSelector('#chapter-wallet', { timeout: 5000 });
  await sleep(800);

  await desktopPage.evaluate(() => {
    document.querySelector('#chapter-flowers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(1200);

  const returnState = await desktopPage.evaluate(() => {
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return {
      hasQuote: !!quoteHeading,
      hasCta: !!ctaBtn,
    };
  });
  console.log('  Return Visit State:', returnState);
  if (!returnState.hasQuote || !returnState.hasCta) {
    errors.push('Return visit failed to retain full bloom quote and CTA!');
  } else {
    console.log('  ✓ Return visit retained mature flower, quote, and unlocked CTA without replay.');
  }
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-return.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-return.png');

  await desktopPage.close();

  // -------------------------------------------------------------
  // SUITE 2: MOBILE VIEWPORT (390 x 844)
  // -------------------------------------------------------------
  console.log('\n--- 2. MOBILE VIEWPORT (390 x 844) ---');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });

  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await mobilePage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Bắt đầu hành trình')
    );
    btn?.click();
  });
  await mobilePage.waitForSelector('#chapter-flowers', { timeout: 5000 });
  await mobilePage.waitForFunction(() => {
    const el = document.querySelector('#chapter-flowers');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return Math.abs(rect.top) < 50;
  }, { timeout: 5000 });

  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-flower-00.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/mobile-flower-00.png');

  // Wait for bloom completion & CTA unlock on mobile
  await mobilePage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return !!btn;
  }, { timeout: 6000 });

  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-flower-100.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/mobile-flower-100.png');

  await mobilePage.close();

  // -------------------------------------------------------------
  // SUITE 3: PREFERS-REDUCED-MOTION
  // -------------------------------------------------------------
  console.log('\n--- 3. REDUCED MOTION AUDIT ---');
  const motionPage = await browser.newPage();
  await motionPage.setViewport({ width: 1440, height: 900 });
  await motionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  await motionPage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await motionPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Bắt đầu hành trình')
    );
    btn?.click();
  });
  await motionPage.waitForSelector('#chapter-flowers', { timeout: 5000 });
  await motionPage.waitForFunction(() => {
    const el = document.querySelector('#chapter-flowers');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return Math.abs(rect.top) < 50;
  }, { timeout: 5000 });
  await sleep(300); // Check immediate unlock

  const motionState = await motionPage.evaluate(() => {
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return {
      hasQuote: !!quoteHeading,
      hasCta: !!ctaBtn,
    };
  });
  console.log('  Reduced Motion State (immediate):', motionState);
  if (!motionState.hasQuote || !motionState.hasCta) {
    errors.push('Reduced motion failed to immediately unlock quote and CTA!');
  } else {
    console.log('  ✓ Reduced motion immediately displayed mature flower, quote, and CTA.');
  }

  await motionPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-flower-reduced-motion.png') });
  console.log('  ✓ Captured docs/screenshots/phase-3/desktop-flower-reduced-motion.png');

  await motionPage.close();
  await browser.close();

  console.log('\n===========================================================');
  console.log(`AUDIT COMPLETE. Errors encountered: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors:', errors);
    process.exit(1);
  } else {
    console.log('ALL AUDITS PASSED WITH ZERO ERRORS.');
  }
}

runFlowersTest().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
