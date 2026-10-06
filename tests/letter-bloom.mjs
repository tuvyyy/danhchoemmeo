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
 assert.equal(await p.$$eval('.letter-bloom-garden__flowers canvas', es => es.length), 9);
 assert.equal(await p.$eval('.letter-vines', e => e.dataset.visible), 'true', 'Vines remain hanging after the chapter transition settles');
 await p.waitForSelector('.letter-bloom-garden__pond[data-water-ready="true"]');
 await p.waitForFunction(()=>[...document.querySelectorAll('.letter-bloom-garden__pond img')].every(e=>e.complete&&e.naturalWidth>0));
 const pond=await p.$eval('.letter-bloom-garden__pond',e=>({swans:e.dataset.swans,z:+getComputedStyle(e).zIndex,width:e.getBoundingClientRect().width}));
 assert.equal(pond.swans,'2');assert(pond.width>200,'The distant pond remains visible at both viewport sizes');
 assert(await p.$eval('.letter-bloom-garden__flowers',e=>+getComputedStyle(e).zIndex>0),'Flowers sit in front of the pond');
 const staging=await p.evaluate(()=>{
  const pond=document.querySelector('.letter-bloom-garden__pond'),meadow=document.querySelector('.letter-bloom-garden__meadow'),flowers=document.querySelector('.letter-bloom-garden__flowers');
  const main=document.querySelector('[data-flower-main]'),front=[...document.querySelectorAll('.letter-bloom-garden__bloom--front')];
  return{shoreOverlap:pond.getBoundingClientRect().bottom-meadow.getBoundingClientRect().top,grassInFront:+getComputedStyle(meadow).zIndex>+getComputedStyle(flowers).zIndex,mainWidth:main.getBoundingClientRect().width,frontWidths:front.map(e=>e.getBoundingClientRect().width)};
 });
 assert(staging.shoreOverlap>0&&staging.grassInFront,'The lake shore joins foreground grass, which occludes the flower stems');
 assert(staging.frontWidths.every(w=>w<staging.mainWidth*.75),'Flower sizes form a cluster around one leading bloom');
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
 assert.deepEqual(await p.$$eval('[data-flower-color]',es=>Object.fromEntries(['pink','ivory','midnight'].map(color=>[color,es.filter(e=>e.dataset.flowerColor===color).length]))),{pink:3,ivory:3,midnight:3});
 assert(await p.$$eval('[data-flower-color="ivory"]',es=>es.every(e=>e.dataset.paletteRenderer==='webgl')),'The ivory pigment mask keeps stem colors intact');
 assert(await p.$$eval('[data-flower-color="midnight"]',es=>es.length===3&&es.every(e=>e.dataset.bloomSequence==='blue'&&e.dataset.paletteRenderer==='original')),'All three blue flowers use the native blue sequence without recoloring');
 assert.equal(new Set(requests.filter(url=>url.includes('/flowers/lily-blue-bloom/')&&url.endsWith('.webp'))).size,60,'The complete blue sequence loads once and is shared by three flowers');
 const pigment=await p.evaluate(async()=>{
  const image=new Image();image.src='/assets/flowers/lily-bloom-hd/lily_bloom_060.webp';await image.decode();
  const pixels=subject=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');c.drawImage(subject,0,0,64,64);return c.getImageData(0,0,64,64).data;};
  const original=pixels(image),ivory=pixels(document.querySelector('[data-flower-color="ivory"] canvas'));
  const blueImage=new Image();blueImage.src='/assets/flowers/lily-blue-bloom/lily_blue_060.webp';await blueImage.decode();
  const blueCanvas=document.querySelector('[data-flower-color="midnight"] canvas');
  // Match the displayed raster size before comparing, including the small back bloom.
  const expectedBlue=document.createElement('canvas');expectedBlue.width=blueCanvas.width;expectedBlue.height=blueCanvas.height;
  const expectedContext=expectedBlue.getContext('2d');expectedContext.imageSmoothingQuality='high';expectedContext.drawImage(blueImage,0,0,expectedBlue.width,expectedBlue.height);
  const blueSource=pixels(expectedBlue),blue=pixels(blueCanvas);
  const blueError=blue.reduce((sum,value,i)=>sum+Math.abs(value-blueSource[i]),0)/blue.length;
  let petals=0,green=0,ivoryLift=0,leafError=0,throats=0,ivorySeam=0;
  for(let i=0;i<original.length;i+=4){const [r,g,b,a]=original.slice(i,i+4);if(a<200)continue;
   if(r>Math.max(g,b)+20&&b>g+8){petals++;ivoryLift+=ivory[i+1]-g;}
   if(g>r+8&&g>b+10){green++;leafError+=(Math.abs(ivory[i]-r)+Math.abs(ivory[i+1]-g))/2;}
   if(r>g+35&&g>=b&&b/r>.45){throats++;ivorySeam+=Math.abs(ivory[i]-ivory[i+1]);}
  }
  return{petals,green,ivoryLift:ivoryLift/petals,leafError:leafError/green,throats,ivorySeam:ivorySeam/throats,blueError};
 });
 assert(pigment.petals>20&&pigment.green>10&&pigment.ivoryLift>15&&pigment.leafError<12,`Ivory petals change while the real green stem stays green: ${JSON.stringify(pigment)}`);
 assert(pigment.throats>5&&pigment.ivorySeam<12,`The ivory petal throat has no leftover pink stripe: ${JSON.stringify(pigment)}`);
 assert(pigment.blueError<4,`The blue flower matches the new source artwork: ${JSON.stringify(pigment)}`);
 if(!reduced){
  const encounters=await p.evaluate(()=>{
   const pond=document.querySelector('.letter-bloom-garden__pond'),birds=[...pond.querySelectorAll('.pond-swimmer')],heart=pond.querySelector('.pond-heart');
   const animations=[...birds.flatMap(e=>e.getAnimations({subtree:true})),...heart.getAnimations()];
   const saved=animations.map(a=>({time:a.currentTime,state:a.playState}));
   animations.forEach(a=>a.pause());
   const samples=[.05,.45,.75,.95].map(phase=>{
    animations.forEach(a=>a.currentTime=phase*30000);
    const bounds=pond.getBoundingClientRect();
    const feet=birds.map(bird=>{const b=bird.getBoundingClientRect();return{x:(b.left+b.width*.52-bounds.left)/bounds.width,y:(b.top+b.height*.84-bounds.top)/bounds.height};});
    return{phase,feet,separation:Math.abs(feet[0].x-feet[1].x),heart:+getComputedStyle(heart).opacity};
   });
   animations.forEach((a,i)=>{a.currentTime=saved[i].time;if(saved[i].state==='running')a.play();});
   return samples;
  });
  assert(encounters.every(s=>s.feet.every(f=>f.x>.42&&f.x<.75&&f.y>.54&&f.y<.7)),`Both swans stay on central open water: ${JSON.stringify(encounters)}`);
  assert(encounters[1].separation<encounters[0].separation*.5,'The swans approach each other instead of swimming unrelated loops');
  assert(encounters[1].heart>.25&&encounters.filter(s=>s.phase!==.45).every(s=>s.heart<.01),'A faint heart appears only while the pair meet');
 } else {
  assert(await p.$$eval('.pond-swimmer',es=>es.every(e=>getComputedStyle(e).animationName==='none')),'Reduced motion keeps both swans still');
  assert.equal(await p.$eval('.pond-heart',e=>+getComputedStyle(e).opacity),0);
 }
 const waterSnapshot=()=>p.$eval('.pond-water-canvas',e=>e.toDataURL());
 const waterBefore=await waterSnapshot();
 await wait(400);
 assert.equal((await waterSnapshot())!==waterBefore,!reduced,'Water refracts while active and remains still with reduced motion');
 assert.equal(await p.$eval('.pond-water-canvas',e=>e.dataset.running),String(!reduced));
 if(process.argv.includes('--water-frames')) {
  const started=Date.now();
  for(const percent of [0,20,40,50,60,80,100]) {
   await wait(Math.max(0,percent/100*5800-(Date.now()-started)));
   await capture({path:`${out}/water-${String(percent).padStart(3,'0')}.png`});
  }
 }
 if (mobile) await p.evaluate(() => document.querySelector('.letter-desk').scrollIntoView({ block: 'start', behavior: 'instant' }));
 await p.mouse.move(800, 60);
 await capture({ path: `${out}/04-letter-open.png` });
 await p.click('.letter-page__read'); await p.waitForSelector('.letter-reader');
 assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 assert(await p.$$eval('.letter-vines__sway',es=>es.every(e=>getComputedStyle(e).animationPlayState==='paused'||getComputedStyle(e).animationName==='none')),'Reading pauses the hanging vines');
 assert.equal(await p.$eval('.pond-water-canvas',e=>e.dataset.running),'false','Reading pauses the water renderer');
 const pausedWater=await waterSnapshot();await wait(250);
 assert.equal(await waterSnapshot(),pausedWater,'The water freezes while reading instead of running a hidden animation');
 assert(await p.$$eval('.pond-swimmer,.pond-wake',es=>es.every(e=>getComputedStyle(e).animationPlayState==='paused'||getComputedStyle(e).animationName==='none')),'Reading pauses the swans and their wakes');
 await p.keyboard.press('ArrowRight');
 assert.equal(await p.$eval('.letter-reader .letter-page', e => e.dataset.page), '1');
 await p.keyboard.press('Escape'); await p.waitForSelector('.letter-reader', { hidden: true });
 assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
 await p.click('.letter-next');
 await p.waitForFunction(() => document.querySelector('#chapter-moments').dataset.chapterState === 'active');
 assert.equal(await p.$eval('.letter-bloom-garden', e => e.dataset.running), 'false');
 assert.equal(await p.$eval('.letter-vines',e=>e.dataset.visible),'false','Vines leave with chapter three');
 assert.deepEqual(errors, []);
 console.log(`${out}: PASS 3 pink + 3 ivory + 3 native blue petal sequences, paired swans on open water, conditional heart, hanging vines, reading pause, preserved video, no overflow/errors`);
} catch(error){console.error('Letter garden check failed:',error);throw error;} finally { await browser.close(); }
