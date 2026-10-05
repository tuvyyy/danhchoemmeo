import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced');
const label=process.argv[2]||'final';const height=mobile?844:900;
const out=`docs/captures/letter-${label}${mobile?'-mobile':''}`;await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:mobile?390:1440,height});
 if(reduced)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await page.waitForSelector('.cinematic-hero__cta');await wait(800);await page.click('.cinematic-hero__cta');await page.waitForFunction(()=>document.querySelector('#chapter-flowers').dataset.chapterState==='active');
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});await wait(400);
 const initial=await page.$eval('.garden-video',e=>e.currentTime);await wait(500);
 assert(await page.$eval('.garden-video',e=>e.currentTime)>initial,'Video autoplays');
 assert.equal(await page.$eval('.garden-reel',e=>e.dataset.running),'true','Reel rotates automatically');
 await page.mouse.wheel({deltaY:height*.5});await wait(400);
 if(!reduced){
  assert.equal(await page.$('.memory-flow__dock'),null,'Requested dock removed');
  assert(await page.$eval('.memory-flow',e=>e.parentElement.matches('.chapter-envelope-scene')),'Thread belongs behind envelope');
  const stack=await page.evaluate(()=>({thread:+getComputedStyle(document.querySelector('.memory-flow')).zIndex,paper:+getComputedStyle(document.querySelector('.scene-pan')).zIndex}));assert(stack.thread<stack.paper);
  assert(await page.$eval('.memory-thread__line',e=>e.getPointAtLength(0).x)<0,'Thread begins outside viewport edge');
  await page.screenshot({path:`${out}/garden-handoff-050.png`});
  await page.mouse.wheel({deltaY:height*.5});
 }
 await page.waitForFunction(()=>!document.querySelector('.envelope__seal').disabled);await wait(250);
 await page.click('.envelope__seal');await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');await wait(300);
 const record=process.argv.includes('--record')?await page.screencast({path:`${out}/workflow.mp4`,format:'mp4',fps:30}):null;
 const samples=process.argv.includes('--dense')?Array.from({length:20},(_,i)=>(i+1)*5):[20,40,50,60,80,100];
 const measurements=[];
 async function capture(direction) {
  await page.screenshot({path:`${out}/${direction}-000.png`});let previous=0;
  for(const p of (reduced?[100]:samples)) {
   await page.mouse.wheel({deltaY:(p-previous)/100*height*(direction==='forward'?1:-1)});await wait(240);
   if(p<100){
    const expected=(direction==='forward'?p:100-p)/100;
    await page.waitForFunction(expected=>Math.abs(+document.querySelector('.letter-atelier').dataset.handoffProgress-expected)<.003,{},expected);
    const state=await page.evaluate(()=>{const p=document.querySelector('.letter-keepsake'),r=p.getBoundingClientRect();return{progress:+document.querySelector('.letter-atelier').dataset.handoffProgress,paperHeight:Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(0,r.top)),paperOpacity:+getComputedStyle(p).opacity,overflow:document.documentElement.scrollWidth>innerWidth};});
    assert(state.paperHeight>50&&state.paperOpacity>.1,'Incoming letter stays identifiable');assert(!state.overflow);
    if(p===50){await wait(550);assert(Math.abs(await page.$eval('.letter-atelier',e=>+e.dataset.handoffProgress)-state.progress)<.003,'Pause holds composition');}
    measurements.push({direction,p,...state});
   }else await page.waitForFunction(()=>!document.documentElement.dataset.voucherLetterHandoff);
   await page.screenshot({path:`${out}/${direction}-${String(p).padStart(3,'0')}.png`});previous=p;
  }
 }
 await capture('forward');await wait(300);await page.screenshot({path:`${out}/letter-closed.png`});
 await page.click('.letter-open-action');await wait(reduced?100:1200);
 assert.equal(await page.$eval('.letter-atelier',e=>e.dataset.open),'true');
 await page.screenshot({path:`${out}/letter-open.png`,fullPage:false});
 await page.click('.letter-desk__controls button');await wait(150);
 assert.match(await page.$eval('.letter-keepsake .letter-page h3',e=>e.textContent),/Mong em/);
 await page.screenshot({path:`${out}/letter-page02.png`});
 assert(await page.evaluate(()=>document.querySelector('.letter-keepsake .letter-page').getBoundingClientRect().bottom<document.querySelector('.letter-desk__controls').getBoundingClientRect().top),'Page text clears navigation');
 await page.click('.letter-page__read');await page.waitForSelector('.letter-reader');await wait(150);
 await page.screenshot({path:`${out}/letter-reader.png`});
 await page.keyboard.press('ArrowLeft');assert.match(await page.$eval('.letter-reader h3',e=>e.textContent),/Gửi em/);
 await page.keyboard.press('Escape');await page.waitForSelector('.letter-reader',{hidden:true});
 await page.evaluate(()=>document.querySelector('#chapter-letter').scrollIntoView({behavior:'instant'}));await wait(250);
 await capture('reverse');
 assert.equal(await page.$eval('.chapter-envelope-scene',e=>e.dataset.state),'open','Envelope stays open for a continuous return');
 await page.click('.scene-next');await page.waitForSelector('.letter-atelier');await page.waitForFunction(()=>!document.documentElement.dataset.voucherLetterHandoff);await wait(200);
 assert.equal(await page.$eval('.letter-atelier',e=>e.dataset.open),'false','Return starts with folded letter');
 if(record)await record.stop();
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/measurements.json`,JSON.stringify(measurements,null,2));console.log(`${out}: PASS autoplay, rear thread, removed dock, scroll forward/reverse/hold, letter pages, reader/Escape, CTA, repeated navigation`);
}finally{await browser.close();}
