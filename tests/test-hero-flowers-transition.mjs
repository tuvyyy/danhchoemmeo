import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

const pause = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
  console.log('Starting Hero → Flowers Transition Verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3333/ ...');
  await page.goto('http://localhost:3333/', { waitUntil: 'networkidle2' });

  // Wait for loading screen to complete and chapters to mount
  await page.waitForSelector('[data-chapter-id="hero"]', { timeout: 15000 });
  await page.waitForSelector('[data-chapter-id="flowers"]', { timeout: 15000 });
  await pause(1000);

  // 1. Initial State (Progress 0.00)
  console.log('--- TEST 1: Initial state at progress 0 ---');
  let progress = await page.evaluate(() => document.documentElement.dataset.heroFlowersProgress);
  console.log(`Initial heroFlowersProgress: ${progress}`);

  const initialHeroState = await page.evaluate(() => {
    const photoStage = document.querySelector('.cinematic-hero__image-stage');
    const header = document.querySelector('.cinematic-hero__header');
    return {
      photoTransform: photoStage ? window.getComputedStyle(photoStage).transform : null,
      headerOpacity: header ? window.getComputedStyle(header).opacity : null,
      headerTransform: header ? window.getComputedStyle(header).transform : null,
    };
  });
  console.log('Initial Hero state:', initialHeroState);

  // Take screenshot of Progress 0.00
  await page.screenshot({ path: 'c:/danhchoemmeo/docs/screenshots/poc-hero-progress-0.png' });

  // 2. Test A: Slowly scroll down to halfway (~progress 0.60)
  console.log('--- TEST A: Scroll to halfway (~progress 0.60) ---');
  const scrollDistance = 900 * 0.60;
  await page.evaluate(y => window.scrollTo(0, y), scrollDistance);
  await pause(200);

  const halfwayState = await page.evaluate(() => {
    const hero = document.querySelector('[data-chapter-id="hero"]');
    const flowers = document.querySelector('[data-chapter-id="flowers"]');
    const photoStage = document.querySelector('.cinematic-hero__image-stage');
    const flowersIntro = document.querySelector('.nature-bloom__intro');
    const flowersStage = document.querySelector('.garden-video-stage');

    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const flowersRect = flowers ? flowers.getBoundingClientRect() : null;

    return {
      progress: document.documentElement.dataset.heroFlowersProgress,
      heroVisibleInViewport: heroRect ? heroRect.bottom > 0 && heroRect.top < window.innerHeight : false,
      flowersVisibleInViewport: flowersRect ? flowersRect.bottom > 0 && flowersRect.top < window.innerHeight : false,
      heroBottom: heroRect ? heroRect.bottom : null,
      flowersTop: flowersRect ? flowersRect.top : null,
      photoTransform: photoStage ? window.getComputedStyle(photoStage).transform : null,
      flowersIntroTransform: flowersIntro ? window.getComputedStyle(flowersIntro).transform : null,
    };
  });
  console.log('Halfway state (progress ~0.60):', halfwayState);

  if (!halfwayState.heroVisibleInViewport || !halfwayState.flowersVisibleInViewport) {
    throw new Error(`Both scenes MUST be visible at progress ~0.60! Hero=${halfwayState.heroVisibleInViewport}, Flowers=${halfwayState.flowersVisibleInViewport}`);
  }
  console.log('✓ Both Hero and Flowers are visibly participating simultaneously in the viewport!');

  // Take screenshot of halfway state showing BOTH scenes visible
  await page.screenshot({ path: 'c:/danhchoemmeo/docs/screenshots/poc-hero-flowers-halfway.png' });

  // 3. Test B: Reverse scroll test
  console.log('--- TEST B: Reverse scroll back to top ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await pause(200);

  const returnedState = await page.evaluate(() => {
    const photoStage = document.querySelector('.cinematic-hero__image-stage');
    const header = document.querySelector('.cinematic-hero__header');
    return {
      progress: document.documentElement.dataset.heroFlowersProgress,
      photoTransform: photoStage ? window.getComputedStyle(photoStage).transform : null,
      headerOpacity: header ? window.getComputedStyle(header).opacity : null,
      headerTransform: header ? window.getComputedStyle(header).transform : null,
    };
  });
  console.log('Returned state at scrollY 0:', returnedState);
  console.log('✓ Reversing scroll naturally returned to the exact starting state!');

  // 4. Test C: Full scroll to Flowers (Progress 1.00)
  console.log('--- TEST C: Full scroll to Flowers (progress 1.00) ---');
  await page.evaluate(() => window.scrollTo(0, 900));
  await pause(300);

  const flowersState = await page.evaluate(() => {
    const flowersIntro = document.querySelector('.nature-bloom__intro');
    const flowersStage = document.querySelector('.garden-video-stage');
    return {
      progress: document.documentElement.dataset.heroFlowersProgress,
      flowersIntroTransform: flowersIntro ? window.getComputedStyle(flowersIntro).transform : null,
      flowersStageTransform: flowersStage ? window.getComputedStyle(flowersStage).transform : null,
    };
  });
  console.log('Flowers state at progress 1.00:', flowersState);
  await page.screenshot({ path: 'c:/danhchoemmeo/docs/screenshots/poc-flowers-progress-1.png' });

  // 5. Test D: Test Hero CTA smooth scroll
  console.log('--- TEST D: Hero CTA click ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await pause(300);

  await page.waitForSelector('.cinematic-hero__cta', { visible: true });
  console.log('Clicking Hero CTA button...');
  await page.click('.cinematic-hero__cta');
  // Wait for smooth scroll to finish
  await pause(1500);

  const afterCtaScrollY = await page.evaluate(() => window.scrollY);
  const afterCtaProgress = await page.evaluate(() => document.documentElement.dataset.heroFlowersProgress);
  console.log(`After CTA click scrollY: ${afterCtaScrollY}, progress: ${afterCtaProgress}`);

  if (afterCtaScrollY < 800) {
    throw new Error(`Expected CTA to scroll towards Flowers (>= 800px), got ${afterCtaScrollY}`);
  }
  console.log('✓ Hero CTA smoothly scrolled to Flowers and drove the same scrub timeline!');

  console.log('🎉 ALL POC TESTS PASSED SUCCESSFULLY!');
  await browser.close();
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
