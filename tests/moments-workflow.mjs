import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced'),label=process.argv[2]||'iteration1';
const out=`docs/captures/moments-${label}${mobile?'-mobile':''}`;await fs.mkdir(out,{recursive:true});
const height=mobile?844:900;const wait=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 if(reduced)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:3333',{waitUntil:'networkidle2'});await page.waitForSelector('.gallery-loader',{hidden:true});await page.click('.garden-gate__enter');await page.waitForSelector('.entrance-gate',{hidden:true});await page.click('.hero-gallery .cinematic-hero__cta');await page.waitForFunction(()=>['active','completing'].includes(document.querySelector('#chapter-flowers').dataset.chapterState));
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);document.querySelector('.nature-bloom__footer button').click();});
 try{await page.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false,{timeout:45000});}catch(e){console.log(await page.evaluate(()=>({html:document.documentElement.dataset,stages:[...document.querySelectorAll('[data-chapter-state]')].map(e=>({id:e.id,state:e.dataset.chapterState,top:e.getBoundingClientRect().top})),viewport:[innerWidth,innerHeight],seal:document.querySelector('.envelope__seal').disabled})));throw e;}await wait(200);await page.waitForFunction(()=>['active','completing'].includes(document.querySelector('#chapter-wallet').dataset.chapterState));await page.click('.envelope__seal');await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');await page.click('.scene-next');await page.waitForFunction(()=>document.querySelector('#chapter-letter')?.dataset.chapterState==='active'&&!document.documentElement.dataset.voucherLetterHandoff);
 await page.mouse.move(310,220);await wait(300);
 if(!mobile){assert(await page.$eval('[data-custom-cursor]',e=>getComputedStyle(e).visibility==='visible'&&+getComputedStyle(e).opacity>0),'Chapter 03 custom cursor restored');await page.screenshot({path:`${out}/letter-cursor.png`});}
 if(await page.$eval('.letter-atelier',e=>e.dataset.open)!=='true')await page.click('.letter-cover');await wait(reduced?100:1150);
 await page.evaluate(()=>{const s=document.querySelector('#chapter-letter');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});await wait(250);
 const record=process.argv.includes('--record')?await page.screencast({path:`${out}/workflow.mp4`,format:'mp4',fps:30}):null;
 const measurements=[];
 async function capture(direction){
  await page.screenshot({path:`${out}/${direction}-000.png`});let previous=0;
  for(const p of (reduced?[100]:process.argv.includes('--dense')?Array.from({length:20},(_,i)=>(i+1)*5):[20,40,50,60,80,100])){
   const delta=(p-previous)/100*height*(direction==='forward'?1:-1);
   if(mobile){const cdp=await page.createCDPSession();const start=delta>0?height-160:150;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:start}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:start-delta}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
   else await page.mouse.wheel({deltaY:delta});await wait(260);
   if(p<100){
    const expected=(direction==='forward'?p:100-p)/100;
    await page.waitForFunction(expected=>Math.abs(+document.querySelector('.memory-table').dataset.handoffProgress-expected)<.003,{},expected);
    const state=await page.evaluate(()=>{const r=document.querySelector('.letter-keepsake').getBoundingClientRect();const visible=r=>Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));return{fragmentReady:document.querySelector('.letter-fragments').dataset.ready,fragmentRasterMs:+document.querySelector('.letter-fragments').dataset.rasterMs,fragmentSetupMs:+document.querySelector('.letter-fragments').dataset.setupMs,fragmentCount:+document.querySelector('.letter-fragments').dataset.count,flying:+document.querySelector('.letter-fragments').dataset.flying,progress:+document.querySelector('.memory-table').dataset.handoffProgress,paper:visible(r),paperOpacity:+getComputedStyle(document.querySelector('.letter-keepsake')).opacity,paperTransform:getComputedStyle(document.querySelector('.letter-keepsake')).transform,cards:[...document.querySelectorAll('.memory-print')].map(e=>({height:visible(e.getBoundingClientRect()),transform:getComputedStyle(e).transform,opacity:+getComputedStyle(e).opacity})),overflow:document.documentElement.scrollWidth>innerWidth,ui:getComputedStyle(document.querySelector('[data-journey-ui]')).visibility};});
    assert(!state.overflow);assert.equal(state.ui,'hidden');
    assert((state.paper>80&&state.paperOpacity>.25)||state.cards.some(c=>c.height>80&&c.opacity>.5),'No empty transition frame');
    if(p===50){assert.equal(state.fragmentReady,'true','Source pixels are rasterized before the handoff midpoint');assert(state.fragmentCount>100&&state.flying>50,'Actual source fragments separate and fly');assert(state.cards.some(c=>c.height>100&&c.opacity>.5),'Photos establish themselves by midpoint');await wait(600);assert(Math.abs(await page.$eval('.memory-table',e=>+e.dataset.handoffProgress)-state.progress)<.003,'Scroll stop holds frame');
     await page.mouse.wheel({deltaY:-height*.05});await page.waitForFunction(target=>Math.abs(+document.querySelector('.memory-table').dataset.handoffProgress-target)<.003,{},expected-.05);assert(Math.abs(await page.$eval('.memory-table',e=>+e.dataset.handoffProgress)-(expected-.05))<.003);await page.mouse.wheel({deltaY:height*.05});await page.waitForFunction(target=>Math.abs(+document.querySelector('.memory-table').dataset.handoffProgress-target)<.003,{},expected);
    }
    measurements.push({direction,p,...state});
   }else await page.waitForFunction(()=>!document.documentElement.dataset.letterMomentsHandoff);
   await page.screenshot({path:`${out}/${direction}-${String(p).padStart(3,'0')}.png`});previous=p;
  }
 }
 await capture('forward');await wait(300);await page.screenshot({path:`${out}/moments-closed.png`});
 for(let i=0;i<4;i++){await page.click(`.memory-print[data-index="${i}"]`);await wait(reduced?50:920);assert.equal(await page.$eval(`.memory-print[data-index="${i}"]`,e=>e.getAttribute('aria-pressed')),'true');}
 assert.equal(await page.$eval('.memory-table',e=>e.dataset.seen),'4');await page.waitForSelector('.moments-next');
 await page.evaluate(()=>document.querySelector('#chapter-moments').scrollIntoView({behavior:'instant'}));await wait(200);await page.screenshot({path:`${out}/moments-open.png`});
 const images=await page.$$eval('.memory-print__photo img',els=>els.map(e=>({loaded:e.complete&&e.naturalWidth>0,src:e.currentSrc})));console.log({images});
 await page.click('.memory-print[data-index="0"]');await wait(reduced?50:900);assert.equal(await page.$eval('.memory-print[data-index="0"]',e=>e.getAttribute('aria-pressed')),'false');assert.equal(await page.$eval('.memory-table',e=>e.dataset.seen),'4');
 await page.evaluate(()=>document.querySelector('#chapter-moments').scrollIntoView({behavior:'instant'}));await wait(200);await capture('reverse');
 assert.equal(await page.$eval('.letter-atelier',e=>e.dataset.open),'true','Return preserves open letter');
 if(!mobile){await page.mouse.move(300,250);await wait(200);assert.equal(await page.$eval('[data-custom-cursor]',e=>getComputedStyle(e).visibility),'visible');}
 await page.click('.letter-next');await page.waitForFunction(()=>!document.documentElement.dataset.letterMomentsHandoff);await wait(250);assert.equal(await page.$eval('.memory-table',e=>e.dataset.seen),'4','Seen memories persist');
 if(record)await record.stop();
 await page.click('.moments-next');await page.waitForFunction(()=>document.querySelector('#chapter-anniversary')?.dataset.chapterState==='active');
 await wait(100);await page.screenshot({path:`${out}/next-chapter.png`});
 assert(Math.abs(await page.$eval('#chapter-anniversary',e=>e.getBoundingClientRect().top))<2,'Chapter 04 CTA reaches next chapter');
 assert.equal(await page.$('.letter-fragments'),null,'Fragment layers are cleaned up');assert.deepEqual(errors,[]);await fs.writeFile(`${out}/measurements.json`,JSON.stringify(measurements,null,2));console.log(`${out}: PASS cursor, real scroll, hold, reversal, four flips, native scroll, CTA, state persistence`);
}finally{await browser.close();}
