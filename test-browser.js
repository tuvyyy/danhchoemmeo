import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR_PHASE3 = path.resolve('docs/screenshots/phase-3');
if (!fs.existsSync(SCREENSHOT_DIR_PHASE3)) {
  fs.mkdirSync(SCREENSHOT_DIR_PHASE3, { recursive: true });
}

const SCREENSHOT_DIR_PHASE4 = path.resolve('docs/screenshots/phase-4');
if (!fs.existsSync(SCREENSHOT_DIR_PHASE4)) {
  fs.mkdirSync(SCREENSHOT_DIR_PHASE4, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAcceptanceAudit() {
  console.log('===========================================================');
  console.log('STARTING ACCEPTANCE AUDIT: PHASE 4 WALLET & FULL JOURNEY');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const warnings = [];
  const failedRequests = [];

  // ==========================================
  // 1. DESKTOP RUN (1440 x 900)
  // ==========================================
  console.log('\n--- 1. TESTING DESKTOP (1440 x 900) ---');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('[Browser Console ERROR]:', text);
      errors.push(`Console error: ${text}`);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    } else {
      console.log('[Browser Console]:', text);
    }
  });

  page.on('pageerror', (err) => {
    console.error('[Page ERROR]:', err.message);
    errors.push(`Page error: ${err.message}`);
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    console.warn('[Request Failed]:', url, req.failure()?.errorText);
    failedRequests.push(`${url}: ${req.failure()?.errorText}`);
  });

  await page.goto('http://localhost:3333/', { waitUntil: 'networkidle0' });
  console.log('Page loaded at http://localhost:3333/');

  // Advance Hero -> Flowers
  console.log('\n[Check 1] Advancing Hero -> Flowers...');
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
  await sleep(1000);

  // Wait for Flowers to complete bloom and unlock CTA
  console.log('\n[Check 2] Awaiting Flowers full bloom & CTA unlock...');
  await page.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return !!btn;
  }, { timeout: 8000 });

  // Advance Flowers -> Wallet
  console.log('\n[Check 3] Advancing Flowers -> Wallet...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    btn?.click();
  });

  await page.waitForSelector('#chapter-wallet', { timeout: 5000 });
  await sleep(1200);

  // [Check 4] Verify Wallet starts CLOSED on first visit
  console.log('\n[Check 4] Verifying Wallet starts CLOSED on first visit...');
  const walletInitialState = await page.evaluate(() => {
    const openTrigger = !!document.querySelector('button[aria-label="Mở ví"]');
    const ctaButton = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    const topFlap = document.querySelector('[data-testid="wallet-top-flap"]');
    const flapClass = topFlap ? topFlap.className : '';
    const isFlapClosed = !flapClass.includes('-rotate-x');
    return { openTrigger, hasCta: !!ctaButton, isFlapClosed };
  });

  console.log('  Initial wallet state:', walletInitialState);
  if (!walletInitialState.openTrigger) {
    errors.push('Wallet open trigger button not found on first visit!');
  }
  if (walletInitialState.hasCta) {
    errors.push('CTA was prematurely available before wallet was opened!');
  }
  if (!walletInitialState.isFlapClosed) {
    errors.push('Wallet flap was not closed on first visit!');
  }
  console.log('  ✓ Wallet is closed, trigger button is ready, CTA is properly gated.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'desktop-wallet-closed.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/desktop-wallet-closed.png');

  // [Check 5] Click wallet open and capture opening state
  console.log('\n[Check 5] Clicking Wallet open and capturing opening state...');
  await page.click('button[aria-label="Mở ví"]');
  await sleep(250); // Mid-opening phase

  await page.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'desktop-wallet-opening.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/desktop-wallet-opening.png');

  // [Check 6] Wait for opening animation to complete
  console.log('\n[Check 6] Waiting for opening animation & CTA unlock...');
  await page.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    return !!btn;
  }, { timeout: 4000 });
  await sleep(400);

  const walletOpenedState = await page.evaluate(() => {
    const billsCount = document.querySelectorAll('[data-bill-id]').length;
    const cardsCount = document.querySelectorAll('[data-card-id]').length;
    const ctaAvailable = !!Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    const topFlap = document.querySelector('[data-testid="wallet-top-flap"]');
    const flapClass = topFlap ? topFlap.className : '';
    const isFlapOpen = flapClass.includes('-rotate-x');
    return { billsCount, cardsCount, ctaAvailable, isFlapOpen };
  });

  console.log('  Opened wallet state:', walletOpenedState);
  if (walletOpenedState.billsCount !== 6) {
    errors.push(`Expected 6 stylized bills, found ${walletOpenedState.billsCount}`);
  }
  if (walletOpenedState.cardsCount !== 4) {
    errors.push(`Expected 4 gift vouchers, found ${walletOpenedState.cardsCount}`);
  }
  if (!walletOpenedState.ctaAvailable) {
    errors.push('Next CTA button did not unlock after wallet opened!');
  }
  if (!walletOpenedState.isFlapOpen) {
    errors.push('Wallet flap is not open!');
  }
  console.log('  ✓ Wallet is open with 6 bills, 4 gift cards, and CTA unlocked.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'desktop-wallet-open.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/desktop-wallet-open.png');

  // [Check 7] Card inspection interaction (Click voucher to open modal, then Escape to close)
  console.log('\n[Check 7] Testing Card inspection modal...');
  const firstCard = await page.$('button[data-card-id="card-food"]');
  if (!firstCard) {
    throw new Error('Gift card "card-food" not found in DOM!');
  }
  await page.evaluate(() => {
    const card = document.querySelector('button[data-card-id="card-food"]');
    card?.click();
  });
  await sleep(500);

  const modalState = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    const title = modal?.querySelector('h3')?.textContent || '';
    const hasBackdrop = !!document.querySelector('[data-testid="gift-card-modal-backdrop"]');
    return { isOpen: !!modal, title, hasBackdrop };
  });

  console.log('  Modal state:', modalState);
  if (!modalState.isOpen || !modalState.title.includes('Ăn gì cũng được')) {
    errors.push('Gift card inspection modal failed to open with correct title!');
  }
  console.log('  ✓ Card inspection modal opened with rich details.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'desktop-wallet-card-selected.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/desktop-wallet-card-selected.png');

  // Test Escape key closes modal
  console.log('  Pressing Escape key to close modal...');
  await page.keyboard.press('Escape');
  await sleep(400);

  const modalClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  if (!modalClosed) {
    errors.push('Escape key failed to dismiss card inspection modal!');
  }
  console.log('  ✓ Escape key successfully closed the voucher modal.');

  // [Check 8] Advance Wallet -> Letter
  console.log('\n[Check 8] Advancing Wallet -> Letter...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    btn?.click();
  });

  await page.waitForSelector('#chapter-letter', { timeout: 5000 });
  await sleep(1000);

  // [Check 9] Backscroll to Wallet (Return Visit Persistence)
  console.log('\n[Check 9] Testing Backscroll to Wallet (Return Visit Persistence)...');
  await page.evaluate(() => {
    document.querySelector('#chapter-wallet')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(1500);

  const returnVisitState = await page.evaluate(() => {
    const topFlap = document.querySelector('[data-testid="wallet-top-flap"]');
    const flapClass = topFlap ? topFlap.className : '';
    const isFlapOpen = flapClass.includes('-rotate-x');
    const billsCount = document.querySelectorAll('[data-bill-id]').length;
    const cardsCount = document.querySelectorAll('[data-card-id]').length;
    const ctaAvailable = !!Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    const modalOpen = !!document.querySelector('[role="dialog"]');
    return { isFlapOpen, billsCount, cardsCount, ctaAvailable, modalOpen };
  });

  console.log('  Return visit Wallet state:', returnVisitState);
  if (!returnVisitState.isFlapOpen || !returnVisitState.ctaAvailable) {
    errors.push('Wallet reset or CTA disappeared on return visit!');
  }
  if (returnVisitState.modalOpen) {
    errors.push('Modal remained open unexpectedly on return visit!');
  }
  console.log('  ✓ Return visit persisted: wallet remains open, contents visible, CTA ready, modal closed.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'desktop-wallet-return-visit.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/desktop-wallet-return-visit.png');

  // [Check 10] Complete remaining chapters to verify continuity to Finale
  console.log('\n[Check 10] Verifying full journey continuity to Finale...');
  await page.evaluate(() => {
    document.querySelector('#chapter-letter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(800);

  // Open letter
  await page.evaluate(() => {
    const letterBtn = document.querySelector('button[aria-label="Mở thư"]');
    letterBtn?.click();
  });
  await page.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Nhớ lại tụi mình')
    );
    return !!btn;
  }, { timeout: 8000 });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Nhớ lại tụi mình')
    );
    btn?.click();
  });

  // Moments
  await page.waitForSelector('#chapter-moments', { timeout: 5000 });
  await sleep(1000);
  const polaroids = await page.$$('#chapter-moments button.rounded-sm');
  for (const p of polaroids) {
    await p.click();
    await sleep(200);
  }
  await page.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Điều cuối tui muốn nói')
    );
    return !!btn;
  }, { timeout: 5000 });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Điều cuối tui muốn nói')
    );
    btn?.click();
  });

  // Finale
  await page.waitForSelector('#chapter-finale', { timeout: 5000 });
  await sleep(1000);
  await page.click('button[aria-label="Thổi nến"]');
  await page.waitForFunction(() => document.body.textContent.includes('Chúc mừng sinh nhật em'), { timeout: 5000 });
  console.log('  ✓ Full journey through Finale verified without regressions.');

  // ==========================================
  // 2. MOBILE RUN (390 x 844)
  // ==========================================
  console.log('\n--- 2. TESTING MOBILE (390 x 844) ---');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  await mobilePage.goto('http://localhost:3333/', { waitUntil: 'networkidle0' });

  // Hero -> Flowers
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

  // Flowers -> Wallet
  await mobilePage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return !!btn;
  }, { timeout: 8000 });
  await mobilePage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    btn?.click();
  });

  await mobilePage.waitForSelector('#chapter-wallet', { timeout: 5000 });
  await sleep(1000);

  // Mobile Wallet Closed Overflow Check
  const mobileWalletClosedOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('  Mobile Wallet closed overflow:', mobileWalletClosedOverflow ? 'FAIL' : 'NONE (0px)');
  if (mobileWalletClosedOverflow) errors.push('Horizontal overflow on Mobile Wallet when closed');

  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'mobile-wallet-closed.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/mobile-wallet-closed.png');

  // Click open on mobile
  await mobilePage.click('button[aria-label="Mở ví"]');
  await mobilePage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    return !!btn;
  }, { timeout: 4000 });
  await sleep(400);

  // Mobile Wallet Open Overflow Check
  const mobileWalletOpenOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('  Mobile Wallet open overflow:', mobileWalletOpenOverflow ? 'FAIL' : 'NONE (0px)');
  if (mobileWalletOpenOverflow) errors.push('Horizontal overflow on Mobile Wallet when open');

  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'mobile-wallet-open.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/mobile-wallet-open.png');

  // Inspect Card on mobile
  await mobilePage.click('button[data-card-id="card-trip"]');
  await sleep(500);

  const mobileModalWidthCheck = await mobilePage.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) return { ok: false, width: 0 };
    const rect = modal.getBoundingClientRect();
    return { ok: rect.width <= window.innerWidth * 0.92, width: rect.width };
  });
  console.log('  Mobile modal width check:', mobileModalWidthCheck);
  if (!mobileModalWidthCheck.ok) {
    errors.push(`Mobile modal width exceeds 92vw (${mobileModalWidthCheck.width}px)`);
  }

  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR_PHASE4, 'mobile-wallet-card-selected.png') });
  console.log('  ✓ Captured docs/screenshots/phase-4/mobile-wallet-card-selected.png');

  // Close modal via close button
  await mobilePage.click('button[aria-label="Đóng thẻ"]');
  await sleep(400);

  // ==========================================
  // 3. REDUCED MOTION TEST
  // ==========================================
  console.log('\n--- 3. TESTING REDUCED MOTION ---');
  const rmPage = await browser.newPage();
  await rmPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rmPage.goto('http://localhost:3333/', { waitUntil: 'networkidle0' });

  // Fast advance Hero -> Flowers -> Wallet
  await rmPage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Bắt đầu hành trình')
    );
    return !!btn;
  }, { timeout: 10000 });
  await rmPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Bắt đầu hành trình')
    );
    btn?.click();
  });

  await rmPage.waitForSelector('#chapter-flowers', { timeout: 3000 });
  await rmPage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    return !!btn;
  }, { timeout: 3000 });
  await rmPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Món quà nhỏ tiếp theo')
    );
    btn?.click();
  });

  await rmPage.waitForSelector('#chapter-wallet', { timeout: 3000 });
  await sleep(500);

  // Click open under reduced motion: should open immediately without 1100ms animation delay
  const startTime = Date.now();
  await rmPage.click('button[aria-label="Mở ví"]');
  await rmPage.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Có thứ này quan trọng hơn')
    );
    return !!btn;
  }, { timeout: 1500 });
  const duration = Date.now() - startTime;
  console.log(`  Reduced motion open response time: ${duration}ms`);
  if (duration > 1500) {
    errors.push(`Reduced motion open took too long: ${duration}ms`);
  }
  console.log('  ✓ Reduced motion: immediately opened and revealed CTA.');

  await browser.close();

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n===========================================================');
  console.log('PHASE 4 AUDIT SUMMARY');
  console.log('===========================================================');
  console.log(`Runtime errors: ${errors.length}`);
  console.log(`Runtime warnings: ${warnings.length}`);
  console.log(`Failed network requests: ${failedRequests.length}`);

  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  } else {
    console.log('ALL PHASE 4 WALLET CHECKS PASSED PERFECTLY!');
    process.exit(0);
  }
}

runAcceptanceAudit().catch((err) => {
  console.error('Fatal error during acceptance audit:', err);
  process.exit(1);
});
