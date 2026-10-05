import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const label=process.argv[2]||'workflow1';
const mobile=process.argv.includes('--mobile');
const fallback=process.argv.includes('--fallback');
const out=`docs/captures/flowers-voucher-${label}${mobile?'-mobile':''}`;
await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const height=mobile?844:900;await page.setViewport({width:mobile?390:1440,height});
 if(fallback)await page.evaluateOnNewDocument(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...options){
   if(this.classList.contains('garden-video-fold')&&type==='webgl')return null;
   return original.call(this,type,...options);
  };
 });
 await page.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});
 await page.waitForSelector('.gallery-loader',{hidden:true});await page.click('.garden-gate__enter');await page.waitForSelector('.entrance-gate',{hidden:true});await page.click('.hero-gallery .cinematic-hero__cta');await page.waitForFunction(()=>document.querySelector('#chapter-flowers').dataset.chapterState==='active');
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);const v=document.querySelector('.garden-video');v.pause();v.currentTime=2;});await wait(200);
 await page.waitForSelector('.envelope__pocket');
 await page.waitForFunction(()=>{const v=document.querySelector('.garden-video');return v.readyState>=2&&!v.seeking;});
 const evidence=[];
 for(const direction of ['forward','reverse']) {
  await page.screenshot({path:`${out}/${direction}-000.png`});
  let previous=0;
  for(const p of (process.argv.includes('--dense')?Array.from({length:20},(_,i)=>(i+1)*5):[20,40,50,60,80,100])) {
   await page.mouse.wheel({deltaY:(p-previous)/100*height*(direction==='forward'?1:-1)});await wait(240);
   if(p<100)await page.waitForFunction(target=>Math.abs(+document.querySelector('.memory-flow').dataset.progress-target)<.003,{},(direction==='forward'?p:100-p)/100);
   if(p<100) {
    const state=await page.evaluate(()=>{
     const flow=document.querySelector('.memory-flow'), path=document.querySelector('.memory-thread__line');
     const garden=document.querySelector('.garden-video-stage');const gr=garden.getBoundingClientRect();
     const er=document.querySelector('.envelope__pocket').getBoundingClientRect();
     const visible=r=>Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(0,r.top));
     return {progress:+flow.dataset.progress,dash:parseFloat(getComputedStyle(path).strokeDashoffset.replace('calc(','')),gardenHeight:visible(gr),gardenOpacity:+getComputedStyle(garden).opacity,envelopeHeight:visible(er),ui:getComputedStyle(document.querySelector('[data-journey-ui]')).visibility,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    const target=(direction==='forward'?p:100-p)/100;
    assert(Math.abs(state.progress-target)<.003,`input controls progress: ${JSON.stringify(state)}`);
    assert(Math.abs(state.dash-(1-target))<.003,'Thread length follows scroll');
    assert.equal(state.ui,'hidden');assert(!state.overflow,'No horizontal overflow');
    if(target>=.2)assert(state.envelopeHeight>100,'Envelope arriving early');
    if(p===50){assert(state.gardenOpacity>.2&&state.gardenOpacity<.8,'Video fades gradually at midpoint');assert(state.envelopeHeight>100,'Envelope carries focus');if(!fallback)assert(+await page.$eval('.garden-video-fold',e=>e.dataset.fold)>.3,'Video bends into cloth');else assert.equal(await page.$eval('.garden-video-frame',e=>+getComputedStyle(e).opacity),1,'Native video remains visible without WebGL');}
    if(p===40) {
     await wait(700);assert(Math.abs(await page.$eval('.memory-flow',e=>+e.dataset.progress)-state.progress)<.003,'Hands off holds the scene');
     await page.mouse.wheel({deltaY:-height*.05});await wait(220);
     assert(Math.abs(await page.$eval('.memory-flow',e=>+e.dataset.progress)-(target-.05))<.003,'Immediate reverse');
     await page.mouse.wheel({deltaY:height*.05});await wait(220);
    }
    evidence.push({direction,p,...state});
   } else {await wait(200);assert.equal(await page.evaluate(()=>document.documentElement.dataset.flowersVoucherHandoff),undefined,'Endpoint releases scroll');}
   await page.screenshot({path:`${out}/${direction}-${String(p).padStart(3,'0')}.png`});previous=p;
  }
 }
 assert.equal(await page.$('.garden-video-fold'),null,'Temporary mesh is cleaned up');assert.deepEqual(errors,[]);await fs.writeFile(`${out}/measurements.json`,JSON.stringify(evidence,null,2));console.log(`${out}: PASS real wheel progress, hold, reverse, thread length, layers, no overflow`);
} finally {await browser.close();}
