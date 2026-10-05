import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const pause = (ms) => new Promise((res) => setTimeout(res, ms));

const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const APP_URL = process.env.APP_URL || 'http://localhost:3333/';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: APP_URL,
    outDir: 'docs/captures/flowers-to-voucher',
    viewport: '1440x900',
    reverseOutDir: 'docs/captures/voucher-to-flowers',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) options.url = args[++i];
    else if (args[i] === '--outDir' && args[i + 1]) options.outDir = args[++i];
    else if (args[i] === '--reverseOutDir' && args[i + 1]) options.reverseOutDir = args[++i];
    else if (args[i] === '--viewport' && args[i + 1]) options.viewport = args[++i];
  }

  const [w, h] = options.viewport.split('x').map(Number);
  options.width = w || 1440;
  options.height = h || 900;
  return options;
}

async function runAuditCapture() {
  const options = parseArgs();
  console.log(`[capture-states] Starting audit capture on ${options.url} (${options.width}x${options.height})...`);

  await fs.mkdir(options.outDir, { recursive: true });
  await fs.mkdir(options.reverseOutDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: options.width, height: options.height });

  console.log(`[capture-states] Navigating to ${options.url}...`);
  await page.goto(options.url, { waitUntil: 'networkidle2' });

  // 1. Wait for loading screen to finish
  await page.waitForSelector('[data-chapter-id="hero"]', { timeout: 15000 });
  await page.waitForFunction(() => !document.querySelector('.loading-screen'), { timeout: 15000 });
  await pause(1000);

  // 2. Advance from Hero to Flowers
  console.log(`[capture-states] Advancing from Hero to Flowers...`);
  const heroCta = await page.$('.cinematic-hero__cta');
  if (heroCta) {
    await heroCta.click();
    await pause(1600); // Wait for transition into Flowers to complete
  }

  await page.waitForSelector('[data-chapter-id="flowers"]', { timeout: 10000 });
  await pause(1000);

  // 3. CAPTURE FORWARD TRANSITION: Flowers -> Voucher
  console.log(`\n======================================================`);
  console.log(`[capture-states] Auditing Forward: Flowers -> Voucher`);
  console.log(`======================================================`);

  // Frame 0: Flowers stable
  const f0Path = path.join(options.outDir, '00-flowers-stable.png');
  await page.screenshot({ path: f0Path });
  console.log(`Saved Frame 0 (Flowers stable): ${f0Path}`);

  // Scroll to Flowers CTA at bottom
  await page.evaluate(() => {
    const footerBtn = document.querySelector('.nature-bloom__footer button');
    if (footerBtn) {
      footerBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await pause(300);

  // Frame 1: Transition beginning (right before / at click)
  const f1Path = path.join(options.outDir, '01-transition-beginning-0pct.png');
  await page.screenshot({ path: f1Path });
  console.log(`Saved Frame 1 (Transition beginning 0%): ${f1Path}`);

  // Click CTA to start transition
  console.log(`[capture-states] Triggering Flowers CTA click to initiate transition...`);
  await page.evaluate(() => {
    const btn = document.querySelector('.nature-bloom__footer button');
    if (btn) btn.click();
  });

  // Capture timed progression frames
  const timeSteps = [
    { delay: 180, name: '02-progress-20pct.png', desc: '~20% (outgoing fade & blur)' },
    { delay: 220, name: '03-progress-40pct.png', desc: '~40% (overlay entering)' },
    { delay: 180, name: '04-progress-50pct-midpoint.png', desc: '~50% (midpoint interval)' },
    { delay: 180, name: '05-progress-60pct.png', desc: '~60% (overlay hold / blank gap)' },
    { delay: 250, name: '06-progress-80pct.png', desc: '~80% (incoming starting reveal)' },
    { delay: 800, name: '07-voucher-stable-100pct.png', desc: '100% (Voucher stable)' },
  ];

  for (const step of timeSteps) {
    await pause(step.delay);
    const stepPath = path.join(options.outDir, step.name);
    await page.screenshot({ path: stepPath });
    console.log(`Saved ${step.desc}: ${stepPath}`);
  }

  // 4. CAPTURE REVERSE INTERACTION: Voucher -> Flowers
  console.log(`\n======================================================`);
  console.log(`[capture-states] Auditing Reverse: Voucher -> Flowers`);
  console.log(`======================================================`);

  // Ensure Voucher is stable and get scroll bounds
  const voucherScrollTop = await page.evaluate(() => window.scrollY);
  console.log(`Current scroll position at Voucher: ${voucherScrollTop}px`);

  // Reverse Frame 0: Voucher stable
  const r0Path = path.join(options.reverseOutDir, '00-voucher-stable.png');
  await page.screenshot({ path: r0Path });
  console.log(`Saved Reverse Frame 0 (Voucher stable): ${r0Path}`);

  // Perform reverse scroll upward in steps
  const reverseSteps = [
    { delta: -150, name: '01-reverse-scroll-150px.png', desc: 'Reverse -150px' },
    { delta: -200, name: '02-reverse-scroll-350px.png', desc: 'Reverse -350px' },
    { delta: -200, name: '03-reverse-midpoint-seam.png', desc: 'Reverse midpoint (section boundary)' },
    { delta: -250, name: '04-reverse-scroll-800px.png', desc: 'Reverse -800px' },
    { delta: -350, name: '05-reverse-flowers-stable.png', desc: 'Reverse back to Flowers' },
  ];

  let currentY = voucherScrollTop;
  for (const rStep of reverseSteps) {
    currentY = Math.max(0, currentY + rStep.delta);
    await page.evaluate((y) => window.scrollTo(0, y), currentY);
    await pause(300);
    const rPath = path.join(options.reverseOutDir, rStep.name);
    await page.screenshot({ path: rPath });
    console.log(`Saved ${rStep.desc} (scrollY=${currentY}): ${rPath}`);
  }

  await browser.close();
  console.log(`\n[capture-states] All audit captures completed!`);
}

runAuditCapture().catch((err) => {
  console.error('[capture-states] ERROR:', err);
  process.exit(1);
});
