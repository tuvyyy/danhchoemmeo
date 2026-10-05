import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced'),label=process.argv[2]||'iteration1';
const out=`docs/captures/anniversary-${label}${mobile?'-mobile':''}`;await fs.mkdir(out,{recursive:true});
const height=mobile?844:900;const wait=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 if(reduced)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await page.waitForSelector('.cinematic-hero__cta');await wait(800);await page.click('.cinematic-hero__cta');await wait(2100);await page.waitForFunction(()=>['active','completing'].includes(document.querySelector('#chapter-flowers').dataset.chapterState));
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);document.querySelector('.nature-bloom__footer button').click();});
 try{await page.waitForFunction(()=>!document.querySelector('.envelope__seal').disabled,{timeout:45000});}catch(e){console.log(await page.evaluate(()=>({html:document.documentElement.dataset,stages:[...document.querySelectorAll('[data-chapter-state]')].map(e=>({id:e.id,state:e.dataset.chapterState,top:e.getBoundingClientRect().top})),viewport:[innerWidth,innerHeight],seal:document.querySelector('.envelope__seal').disabled})));throw e;}await wait(200);await page.waitForFunction(()=>['active','completing'].includes(document.querySelector('#chapter-wallet').dataset.chapterState));await page.click('.envelope__seal');await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');await page.click('.scene-next');await page.waitForSelector('#chapter-letter');await wait(1500);
 await page.mouse.move(310,220);await wait(300);
 if(!mobile){assert(await page.$eval('[data-custom-cursor]',e=>getComputedStyle(e).visibility==='visible'&&+getComputedStyle(e).opacity>0),'Chapter 03 custom cursor restored');await page.screenshot({path:`${out}/letter-cursor.png`});}
 await page.click('.letter-open-action');await wait(reduced?100:1150);
 await page.evaluate(()=>{const s=document.querySelector('#chapter-letter');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});await wait(250);
 await page.click('.letter-next');await page.waitForFunction(()=>!document.documentElement.dataset.letterMomentsHandoff);await wait(300);
 for(let i=0;i<4;i++){await page.click(`.memory-print[data-index="${i}"]`);await wait(reduced?30:900);}
 await page.evaluate(()=>{const s=document.querySelector('#chapter-moments');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});await wait(200);
 const recording=process.argv.includes('--record')?await page.screencast({path:`${out}/workflow.mp4`,format:'mp4',fps:30}):null;
 async function input(delta){
  if(!mobile)return page.mouse.wheel({deltaY:delta});
  const cdp=await page.createCDPSession(),start=delta>0?height-160:140;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:start}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:start-delta}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }
 async function capture(direction){
  await page.screenshot({path:`${out}/${direction}-000.png`});let last=0;
  for(const p of reduced?[100]:process.argv.includes('--dense')?Array.from({length:20},(_,i)=>(i+1)*5):[20,40,50,60,80,100]){
   await input((p-last)/100*height*(direction==='forward'?1:-1));await wait(280);
   if(p<100){const expected=(direction==='forward'?p:100-p)/100;
    await page.waitForFunction(p=>Math.abs(+document.querySelector('.together-scene').dataset.handoffProgress-p)<.003,{},expected);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
    if(p===50){const before=await page.$eval('.together-scene',e=>e.dataset.handoffProgress);await wait(500);assert(Math.abs(await page.$eval('.together-scene',e=>+e.dataset.handoffProgress)-Number(before))<.003,'Scroll stop holds frame');await input(-height*.05);await wait(250);assert(Math.abs(await page.$eval('.together-scene',e=>+e.dataset.handoffProgress)-(expected-.05))<.003);await input(height*.05);await wait(250);}
   }else await page.waitForFunction(()=>!document.documentElement.dataset.momentsAnniversaryHandoff);
   await page.screenshot({path:`${out}/${direction}-${String(p).padStart(3,'0')}.png`});last=p;
  }
 }
 await capture('forward');await page.screenshot({path:`${out}/anniversary.png`,fullPage:false});
 for(let i=0;i<3;i++){await page.click(`.together-station:nth-child(${i+1})`);await wait(380);assert.equal(await page.$eval('.together-scene',e=>e.dataset.milestone),String(i));assert.equal(await page.$eval(`.together-station:nth-child(${i+1})`,e=>e.getAttribute('aria-pressed')),'true');}
 await page.screenshot({path:`${out}/stations.png`});
 await page.evaluate(()=>document.querySelector('#chapter-anniversary').scrollIntoView({behavior:'instant'}));await wait(200);await capture('reverse');
 assert.equal(await page.$eval('.memory-table',e=>e.dataset.seen),'4');
 await page.click('.moments-next');await page.waitForFunction(()=>!document.documentElement.dataset.momentsAnniversaryHandoff);await wait(250);
 assert.equal(await page.$eval('.together-scene',e=>e.dataset.milestone),'2');
 if(recording)await recording.stop();
 await page.click('.together-next');await page.waitForFunction(()=>document.querySelector('#chapter-finale')?.dataset.chapterState==='active');
 assert.deepEqual(errors,[]);console.log(`${out}: PASS scroll, hold, reverse, station interaction, retained state, CTA, no browser errors`);
}finally{await browser.close();}
