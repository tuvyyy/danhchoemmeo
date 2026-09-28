import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const baseURL = process.env.ENVELOPE_TEST_URL ?? 'http://127.0.0.1:3344';
const out = 'docs/screenshots/garden-video';
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844], ['tablet', 820, 1180]]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: width < 600, hasTouch: width < 600 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(baseURL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.cinematic-hero__cta', { visible: true });
    await pause(1300);
    await page.click('.cinematic-hero__cta');
    await page.waitForFunction(() => {
      const video = document.querySelector('.garden-video');
      return video && !video.paused && video.currentTime > .15 && video.videoWidth === 1920;
    });
    const videoState = await page.$eval('.garden-video', video => ({
      width: video.videoWidth, height: video.videoHeight, muted: video.muted,
      loop: video.loop, inline: video.playsInline, filter: getComputedStyle(video).filter,
      fit: getComputedStyle(video).objectFit,
    }));
    assert.equal(videoState.width, 1920);
    assert.equal(videoState.height, 1080);
    assert(videoState.muted && videoState.loop && videoState.inline);
    assert.equal(videoState.filter, 'none');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.garden-reel__rotor')).animationPlayState === 'running');
    const rotation = await page.$eval('.garden-reel__rotor', el => getComputedStyle(el).transform);
    await pause(200);
    assert.notEqual(await page.$eval('.garden-reel__rotor', el => getComputedStyle(el).transform), rotation, 'The reel actually rotates with playback');
    const reelPosition = await page.evaluate(() => {
      const reel = document.querySelector('.garden-reel').getBoundingClientRect();
      const frame = document.querySelector('.garden-video-frame').getBoundingClientRect();
      return { exposed: reel.right - frame.right, overlaps: reel.left < frame.right, contained: reel.right <= innerWidth };
    });
    assert(reelPosition.exposed > 10 && reelPosition.overlaps && reelPosition.contained, 'Reel peeks from behind the right edge and stays on screen');
    assert.equal(videoState.fit, width < height ? 'cover' : 'contain', 'Film frame adapts to the screen shape');
    const layout = await page.evaluate(() => {
      const video = document.querySelector('.garden-video-stage').getBoundingClientRect();
      const title = document.querySelector('.nature-bloom__intro').getBoundingClientRect();
      const message = document.querySelector('.nature-bloom__message').getBoundingClientRect();
      return { titleClear: title.bottom <= video.top, captionClear: message.top >= video.bottom };
    });
    assert(layout.titleClear && layout.captionClear, 'Typography stays outside the video');
    assert.equal(await page.$('.nature-bloom__flower-cluster'), null, 'Old flower layers do not cover the video');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const t = await page.$eval('.garden-video', el => el.currentTime);
    await pause(500);
    assert(await page.$eval('.garden-video', el => el.currentTime) > t, 'Autoplay advances decoded frames');
    await page.screenshot({ path: `${out}/${name}.png` });
    await page.click('.garden-video-toggle');
    assert(await page.$eval('.garden-video', el => el.paused), 'Pause control works');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.garden-reel__rotor')).animationPlayState === 'paused');
    await page.click('.garden-video-toggle');
    await page.waitForFunction(() => !document.querySelector('.garden-video').paused);
    await page.$eval('.garden-video', el => { el.currentTime = el.duration - .25; });
    await page.waitForFunction(() => document.querySelector('.garden-video').currentTime < 2);
    assert.equal(await page.$eval('.garden-video', el => el.ended), false, 'Video loops');
    await page.click('.nature-bloom__footer button');
    await page.waitForSelector('.chapter-envelope-scene[data-state="closed"][data-entered="true"]');
    assert(await page.$eval('.garden-video', el => el.paused), 'Video pauses off-chapter');
    await page.$eval('#chapter-flowers', el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await page.waitForFunction(() => !document.querySelector('.garden-video').paused);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.garden-reel__rotor')).animationName === 'none');
    assert.deepEqual(errors, []);
    console.log(`${name}: PASS — Full HD autoplay, loop, pause/resume, chapter lifecycle`);
    await page.close();
  }
} finally { await browser.close(); }
