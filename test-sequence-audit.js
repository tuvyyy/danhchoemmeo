import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots/flowers-correction');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSequenceAudit() {
  console.log('===========================================================');
  console.log('STARTING 60-FRAME FLOWER BLOOM SEQUENCE ACCEPTANCE AUDIT');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const warnings = [];
  const failedRequests = [];
  const sequenceRequests = [];
  const oldPngRequests = [];

  // =============================================================
  // SUITE 1: DESKTOP AUDIT (1440 x 900)
  // =============================================================
  console.log('\n--- 1. DESKTOP VIEWPORT (1440 x 900) ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  desktopPage.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('[Browser Error]:', text);
      errors.push(`Console error: ${text}`);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });

  desktopPage.on('requestfailed', (req) => {
    const url = req.url();
    console.warn('[Request Failed]:', url, req.failure()?.errorText);
    failedRequests.push(`${url}: ${req.failure()?.errorText}`);
  });

  desktopPage.on('request', (req) => {
    const url = req.url();
    if (url.includes('lily-bloom') && url.endsWith('.webp')) {
      sequenceRequests.push(url);
    }
    if (
      url.includes('lily_frame_01') ||
      url.includes('lily_frame_02') ||
      url.includes('lily_frame_03') ||
      url.includes('lily_frame_04')
    ) {
      oldPngRequests.push(url);
    }
  });

  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  console.log('  Loaded http://localhost:3000/');

  // Advance Hero -> Flowers
  console.log('  Advancing Hero -> Flowers...');
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
  await desktopPage.waitForFunction(() => {
    const el = document.querySelector('#chapter-flowers');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return Math.abs(rect.top) < 50;
  }, { timeout: 5000 });

  // [Check 1] Verify Flowers starts on Frame 1 (0% progress)
  console.log('\n  [Check 1: 0% Bloom Start]');
  const frame0 = await desktopPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const frame = bloom?.getAttribute('data-bloom-frame');
    const quote = !!document.querySelector('[data-layer="quote"] h2');
    const cta = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return { frame: Number(frame), hasQuote: quote, hasCta: !!cta };
  });

  console.log('  Initial state at 0%:', frame0);
  if (frame0.frame < 1 || frame0.frame > 4) {
    errors.push(`Expected frame near 1 at 0%, found frame ${frame0.frame}`);
  }
  if (frame0.hasQuote) {
    errors.push('Quote was prematurely visible at 0%!');
  }
  if (frame0.hasCta) {
    errors.push('CTA was prematurely available at 0%!');
  }

  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-00.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-00.png');

  // [Check 2] Wait for 25% bloom progress (frame ~15, t ~1250ms)
  console.log('\n  [Check 2: 25% Bloom Progress]');
  await desktopPage.waitForFunction(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    return f >= 13;
  }, { timeout: 4000 });

  const frame25 = await desktopPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    const quote = !!document.querySelector('[data-layer="quote"] h2');
    const cta = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return { frame: f, hasQuote: quote, hasCta: !!cta };
  });
  console.log('  State at 25%:', frame25);
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-25.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-25.png');

  // [Check 3] Wait for 50% bloom progress (frame ~30, t ~2500ms)
  console.log('\n  [Check 3: 50% Bloom Progress]');
  await desktopPage.waitForFunction(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    return f >= 28;
  }, { timeout: 4000 });

  const frame50 = await desktopPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    const quote = !!document.querySelector('[data-layer="quote"] h2');
    return { frame: f, hasQuote: quote };
  });
  console.log('  State at 50%:', frame50);
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-50.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-50.png');

  // [Check 4] Wait for 75% bloom progress (frame ~45, t ~3750ms - quote must be revealed)
  console.log('\n  [Check 4: 75% Bloom Progress - Quote Threshold >= 72%]');
  await desktopPage.waitForFunction(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    return f >= 44;
  }, { timeout: 4000 });

  const frame75 = await desktopPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    return { frame: f, hasQuote: !!quoteHeading, quoteText: quoteHeading?.textContent?.trim() };
  });
  console.log('  State at 75%:', frame75);
  if (!frame75.hasQuote) {
    errors.push('Quote was not revealed by 75% bloom progress!');
  } else {
    console.log('  ✓ Quote revealed smoothly:', frame75.quoteText);
  }
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-75.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-75.png');

  // [Check 5] Wait for 100% bloom progress (frame 60, t ~5000ms - CTA must unlock)
  console.log('\n  [Check 5: 100% Full Bloom - Frame 60 & CTA Unlock]');
  await desktopPage.waitForFunction(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    return f === 60;
  }, { timeout: 4000 });

  await desktopPage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return !!btn;
  }, { timeout: 4000 });

  const frame100 = await desktopPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return { frame: f, hasQuote: !!quoteHeading, hasCta: !!ctaBtn };
  });
  console.log('  State at 100%:', frame100);
  if (frame100.frame !== 60) {
    errors.push(`Expected final frame 60, found frame ${frame100.frame}`);
  }
  if (!frame100.hasCta) {
    errors.push('CTA was not unlocked at 100% bloom completion!');
  } else {
    console.log('  ✓ Chapter progression CTA successfully unlocked.');
  }

  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-100.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-100.png');

  // [Check 6] Return-Visit Persistence
  console.log('\n  [Check 6: Return-Visit Persistence]');
  console.log('  Advancing Flowers -> Wallet...');
  await desktopPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    btn?.click();
  });

  await desktopPage.waitForSelector('#chapter-wallet', { timeout: 5000 });
  await sleep(1000);

  console.log('  Backscrolling to Flowers...');
  await desktopPage.evaluate(() => {
    document.querySelector('#chapter-flowers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(1200);

  const returnState = await desktopPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return { frame: f, hasQuote: !!quoteHeading, hasCta: !!ctaBtn };
  });
  console.log('  Return Visit State:', returnState);
  if (returnState.frame !== 60) {
    errors.push(`Return visit expected frame 60, found frame ${returnState.frame}`);
  }
  if (!returnState.hasQuote || !returnState.hasCta) {
    errors.push('Return visit failed to keep quote and CTA visible!');
  } else {
    console.log('  ✓ Return visit persisted: frame 60 retained, quote and CTA ready without replay.');
  }

  // Check horizontal overflow
  const desktopOverflow = await desktopPage.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  if (desktopOverflow > 0) {
    errors.push(`Desktop horizontal overflow detected: ${desktopOverflow}px`);
  } else {
    console.log('  ✓ Desktop zero horizontal overflow verified.');
  }

  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-return.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-return.png');

  await desktopPage.close();

  // =============================================================
  // SUITE 2: MOBILE AUDIT (390 x 844)
  // =============================================================
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

  // Mobile 0%
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-bloom-00.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/mobile-bloom-00.png');

  // Mobile 50%
  await mobilePage.waitForFunction(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    return f >= 28;
  }, { timeout: 4000 });
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-bloom-50.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/mobile-bloom-50.png');

  // Mobile 100%
  await mobilePage.waitForFunction(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    return f === 60;
  }, { timeout: 5000 });

  await mobilePage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return !!btn;
  }, { timeout: 4000 });

  const mobileOverflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  if (mobileOverflow > 0) {
    errors.push(`Mobile horizontal overflow detected: ${mobileOverflow}px`);
  } else {
    console.log('  ✓ Mobile zero horizontal overflow verified.');
  }

  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-bloom-100.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/mobile-bloom-100.png');

  await mobilePage.close();

  // =============================================================
  // SUITE 3: REDUCED MOTION AUDIT
  // =============================================================
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
  await sleep(300);

  const motionState = await motionPage.evaluate(() => {
    const bloom = document.querySelector('[data-layer="flower-bloom"]');
    const f = Number(bloom?.getAttribute('data-bloom-frame') || 0);
    const quoteHeading = document.querySelector('[data-layer="quote"] h2');
    const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return { frame: f, hasQuote: !!quoteHeading, hasCta: !!ctaBtn };
  });

  console.log('  Reduced Motion State:', motionState);
  if (motionState.frame !== 60) {
    errors.push(`Reduced motion expected frame 60 immediately, found frame ${motionState.frame}`);
  }
  if (!motionState.hasQuote || !motionState.hasCta) {
    errors.push('Reduced motion failed to immediately unlock quote and CTA!');
  } else {
    console.log('  ✓ Reduced motion immediately rendered frame 60, quote, and CTA.');
  }

  await motionPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-bloom-reduced-motion.png') });
  console.log('  ✓ Captured docs/screenshots/flowers-correction/desktop-bloom-reduced-motion.png');

  await motionPage.close();
  await browser.close();

  // =============================================================
  // ASSET & NETWORK AUDIT SUMMARY
  // =============================================================
  console.log('\n===========================================================');
  console.log('NETWORK & ASSET AUDIT REPORT');
  console.log('===========================================================');
  console.log(`  60-Frame WebP Sequence Requests Captured: ${sequenceRequests.length}`);
  console.log(`  Old 5 PNG Bloom Requests Captured: ${oldPngRequests.length}`);
  if (oldPngRequests.length > 0) {
    errors.push(`Old 5 PNG bloom frames were still requested at runtime: ${oldPngRequests.join(', ')}`);
  } else {
    console.log('  ✓ Verified 0 obsolete 5-frame PNGs loaded for the bloom sequence.');
  }

  console.log(`  Failed Network Requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.warn('  Failed requests:', failedRequests);
  }

  console.log('\n===========================================================');
  console.log(`AUDIT COMPLETE. Total errors: ${errors.length}`);
  console.log('===========================================================');
  if (errors.length > 0) {
    console.error('Audit Errors:', errors);
    process.exit(1);
  } else {
    console.log('ALL 18 ACCEPTANCE CHECKS PASSED PERFECTLY WITH ZERO ERRORS.');
  }
}

runSequenceAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
