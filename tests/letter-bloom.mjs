import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const mobile = process.argv.includes('--mobile'), reduced = process.argv.includes('--reduced');
const out = process.env.LETTER_CAPTURE_DIR || `docs/captures/letter-bloom${mobile ? '-mobile' : ''}${reduced ? '-reduced' : ''}`;
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
 const p = await browser.newPage(), errors = [], requests = [];
 await p.evaluateOnNewDocument(()=>{
  window.bloomHistory={pink:[],ivory:[],midnight:[]};
  new MutationObserver(records=>{for(const {target} of records){const color=target.dataset?.flowerColor,frame=+target.dataset?.bloomFrame;if(window.bloomHistory[color]&&!window.bloomHistory[color].includes(frame))window.bloomHistory[color].push(frame);}}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-bloom-frame']});
 });
 const capture = async options => { if (process.env.NO_CAPTURE !== '1') await p.screenshot(options); };
 p.on('request', request => requests.push(request.url()));
 p.on('pageerror', error => { errors.push(error.message); console.log('PAGE ERROR',error.message); });
 await p.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
 await p.goto(process.env.TEST_URL || 'http://127.0.0.1:3333', { waitUntil: 'networkidle2' });
 await p.waitForSelector('.gallery-loader', { hidden: true });
 await p.click('.garden-gate__enter'); await p.waitForSelector('.entrance-gate', { hidden: true });
 await p.click('.hero-gallery .cinematic-hero__cta');
 await p.waitForFunction(() => document.querySelector('#chapter-flowers').dataset.chapterState === 'active');
 await p.waitForFunction(() => { const video = document.querySelector('#chapter-flowers .garden-video'); return video && video.videoWidth > 0 && !video.paused; });
 assert.equal(await p.$('#chapter-flowers .letter-bloom-garden'), null, 'Keep the video chapter separate from the restored garden');
 await p.evaluate(() => document.querySelector('.nature-bloom__footer button').scrollIntoView({block:'center',behavior:'instant'}));
 await wait(300);
 await p.click('.nature-bloom__footer button');
 await p.waitForFunction(() => document.querySelector('.envelope__seal')?.disabled === false).catch(async error => { console.log(await p.evaluate(()=>({state:document.querySelector('#chapter-wallet')?.dataset,scene:document.querySelector('.chapter-envelope-scene')?.dataset, text:document.body.innerText.slice(-1500)})));throw error; });
 await p.click('.envelope__seal'); await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');
 await p.waitForSelector('.letter-bloom-garden');
 if (!reduced) assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 if (reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
 if (process.argv.includes('--handoff') && !reduced) {
  await p.evaluate(() => document.querySelector('#chapter-wallet').scrollIntoView({ behavior: 'instant' }));
  await capture({ path: `${out}/handoff-000.png` });
  await p.mouse.wheel({ deltaY: 120 });
  await p.waitForFunction(() => !document.documentElement.dataset.voucherLetterHandoff && ['active','completing'].includes(document.querySelector('#chapter-letter').dataset.chapterState));
  await capture({ path: `${out}/handoff-100.png` });
 } else await p.click('.scene-next');
 await p.waitForFunction(() => document.querySelector('#chapter-letter').dataset.chapterState === 'active' && !document.documentElement.dataset.voucherLetterHandoff);
 if (mobile) await p.evaluate(() => document.querySelector('.letter-bloom-garden').scrollIntoView({ block: 'end', behavior: 'instant' }));
 await p.waitForSelector('.letter-bloom-garden[data-running="true"]');
 assert.equal(await p.$$eval('.letter-bloom-garden canvas', es => es.length), 7);
 await p.waitForFunction(()=>[...document.querySelectorAll('.letter-bloom-garden__pond img')].every(e=>e.complete&&e.naturalWidth>0));
 const pond=await p.$eval('.letter-bloom-garden__pond',e=>({swans:e.dataset.swans,z:+getComputedStyle(e).zIndex,width:e.getBoundingClientRect().width}));
 assert.equal(pond.swans,'2');assert(pond.width>200,'The distant pond remains visible at both viewport sizes');
 assert(await p.$eval('.letter-bloom-garden__flowers',e=>+getComputedStyle(e).zIndex>0),'Flowers sit in front of the pond');
 assert.equal(await p.$('.letter-cover'), null, 'The letter is a flat page, without a book cover');
 assert.equal(await p.$$eval('.letter-bloom-garden__grass', es => es.length), 3, 'The original three grass layers return');
 assert(await p.$$eval('.letter-bloom-garden__grass', es => es.every(e => e.complete && e.naturalWidth > 0)), 'Grass assets load');
 assert.equal(await p.$('.letter-atelier__intro'), null, 'Remove the left introduction');
 if (!mobile) assert(await p.evaluate(() => document.querySelector('.letter-keepsake').getBoundingClientRect().right < document.querySelector('[data-flower-main]').getBoundingClientRect().left), 'Letter left, garden right');
 assert.equal(requests.some(url => url.includes('/letter-garden/garden-dusk.webp')), false, 'The old full-scene background does not replace the flower cluster');
 await capture({ path: `${out}/01-buds.png` });
 if (!reduced && process.argv.includes('--frames')) {
  const started = Date.now();
  for (const percent of [0, 20, 40, 50, 60, 80, 100]) {
   await wait(Math.max(0, percent / 100 * 5000 - (Date.now() - started)));
   await capture({ path: `${out}/bloom-${String(percent).padStart(3, '0')}.png` });
  }
 } else if (!reduced) {
  await wait(2600);
  await capture({ path: `${out}/02-opening.png` });
 }
 await p.waitForSelector('.letter-bloom-garden[data-bloomed="true"]', { timeout: 20000 });
 if(!reduced){const history=await p.evaluate(()=>window.bloomHistory);assert(Object.values(history).every(frames=>frames.filter(f=>f>1&&f<60).length>=8),`All colors show many intermediate petal poses: ${JSON.stringify(history)}`);}
 await capture({ path: `${out}/03-bloomed.png` });
 assert.equal(await p.$('.letter-bloom-garden .nature-bloom__tulip'), null, 'Remove the small tinted flower pack');
 assert(await p.$$eval('.letter-bloom-garden [data-bloom-frame]', es => es.every(e => +e.dataset.bloomFrame >= 59)), 'All three colors finish their petal sequence');
 assert.deepEqual(await p.$$eval('[data-flower-color]',es=>Object.fromEntries(['pink','ivory','midnight'].map(color=>[color,es.filter(e=>e.dataset.flowerColor===color).length]))),{pink:3,ivory:2,midnight:2});
 assert(await p.$$eval('[data-flower-color="ivory"],[data-flower-color="midnight"]',es=>es.every(e=>e.dataset.paletteRenderer==='webgl')),'The GPU pigment mask keeps stem colors intact');
 const pigment=await p.evaluate(async()=>{
  const image=new Image();image.src='/assets/flowers/lily-bloom-hd/lily_bloom_060.webp';await image.decode();
  const pixels=subject=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');c.drawImage(subject,0,0,64,64);return c.getImageData(0,0,64,64).data;};
  const original=pixels(image),ivory=pixels(document.querySelector('[data-flower-color="ivory"] canvas')),blue=pixels(document.querySelector('[data-flower-color="midnight"] canvas'));
  let petals=0,green=0,ivoryLift=0,blueShift=0,leafError=0;
  for(let i=0;i<original.length;i+=4){const [r,g,b,a]=original.slice(i,i+4);if(a<200)continue;
   if(r>Math.max(g,b)+20&&b>g+8){petals++;ivoryLift+=ivory[i+1]-g;blueShift+=blue[i+2]-blue[i];}
   if(g>r+8&&g>b+10){green++;leafError+=(Math.abs(ivory[i]-r)+Math.abs(ivory[i+1]-g)+Math.abs(blue[i]-r)+Math.abs(blue[i+1]-g))/4;}
  }
  return{petals,green,ivoryLift:ivoryLift/petals,blueShift:blueShift/petals,leafError:leafError/green};
 });
 assert(pigment.petals>20&&pigment.green>10&&pigment.ivoryLift>15&&pigment.blueShift>15&&pigment.leafError<12,`Petal pigments change while the real green stem stays green: ${JSON.stringify(pigment)}`);
 const swimBefore=await p.$$eval('.pond-swimmer',es=>es.map(e=>getComputedStyle(e).transform));
 if(!reduced){await wait(700);assert(await p.$$eval('.pond-swimmer', (es,before)=>es.length===2&&es.every((e,i)=>getComputedStyle(e).transform!==before[i]),swimBefore),'Both swans swim independently');}
 else assert(await p.$$eval('.pond-swimmer',es=>es.every(e=>getComputedStyle(e).animationName==='none')),'Reduced motion keeps both swans still');
 if (mobile) await p.evaluate(() => document.querySelector('.letter-desk').scrollIntoView({ block: 'start', behavior: 'instant' }));
 await p.mouse.move(800, 60);
 await capture({ path: `${out}/04-letter-open.png` });
 await p.click('.letter-page__read'); await p.waitForSelector('.letter-reader');
 assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 assert(await p.$$eval('.pond-swimmer,.pond-wake',es=>es.every(e=>getComputedStyle(e).animationPlayState==='paused'||getComputedStyle(e).animationName==='none')),'Reading pauses the swans and their wakes');
 await p.keyboard.press('ArrowRight');
 assert.equal(await p.$eval('.letter-reader .letter-page', e => e.dataset.page), '1');
 await p.keyboard.press('Escape'); await p.waitForSelector('.letter-reader', { hidden: true });
 assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
 await p.click('.letter-next');
 await p.waitForFunction(() => document.querySelector('#chapter-moments').dataset.chapterState === 'active');
 assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 assert.deepEqual(errors, []);
 console.log(`${out}: PASS 3 pink + 2 ivory + 2 midnight real petal sequences, two swimming swans, reflections/wakes, reading pause, preserved video, no overflow/errors`);
} catch(error){console.error('Letter garden check failed:',error);throw error;} finally { await browser.close(); }
