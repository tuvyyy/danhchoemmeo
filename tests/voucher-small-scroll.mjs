import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const mobile=process.argv.includes('--mobile'),frames=process.argv.includes('--frames');
const out=`docs/captures/voucher-small-scroll${mobile?'-mobile':''}`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.bringToFront();
 await p.setViewport({width:mobile?390:1440,height:mobile?844:900,isMobile:mobile,hasTouch:mobile});
 await p.goto(process.env.JOURNEY_URL||'http://127.0.0.1:3333',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 const stable=id=>p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff')),{timeout:7000},id);
 const edge=async(id,end=false)=>{await p.evaluate(({id,end})=>{const s=document.querySelector(`#chapter-${id}`);scrollTo({top:s.offsetTop+(end?Math.max(0,s.offsetHeight-innerHeight):0),behavior:'instant'});},{id,end});await wait(220);};
 await p.$eval('.cinematic-hero__cta',e=>e.click());await stable('flowers');
 await p.waitForSelector('.chapter-envelope-scene[data-ready="true"]');await edge('flowers',true);
 assert.equal(await p.$('.chapter-scroll-cue'),null,'No scroll indicator');
 await p.evaluate(()=>{
  window.voucherTrace=[];window.recordVoucher=true;const start=performance.now();
  const tick=()=>{const subject=document.querySelector('.nature-bloom'),scene=document.querySelector('.chapter-envelope-scene');
   window.voucherTrace.push({ms:performance.now()-start,progress:subject.dataset.handoffProgress===undefined?null:+subject.dataset.handoffProgress,active:['active','completing'].includes(document.querySelector('#chapter-wallet').dataset.chapterState),entered:scene.dataset.entered==='true',interactive:!document.querySelector('.envelope__seal').disabled});
   if(window.recordVoucher)requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
 });
 await p.mouse.wheel({deltaY:20});await stable('wallet');
 await p.waitForFunction(()=>!document.querySelector('.envelope__seal').disabled,{timeout:1000}).catch(async error=>{console.log('Arrival state',await p.evaluate(()=>({hidden:document.hidden,scene:document.querySelector('.chapter-envelope-scene').dataset,current:document.querySelector('[data-current-chapter]').dataset.currentChapter,trace:window.voucherTrace.slice(-12)})));throw error;});
 const trace=await p.evaluate(()=>{window.recordVoucher=false;return window.voucherTrace;});
 const first=trace.find(f=>f.progress!==null&&f.progress>0),landed=trace.find(f=>f.active),interactive=trace.find(f=>f.interactive);
 assert(first&&landed&&interactive);
 assert(interactive.ms-landed.ms<120,'The seal is ready on landing, without a second entrance');
 const beforeRelease=trace.filter(f=>f.progress!==null&&f.ms-first.ms<130).at(-1);
 assert(beforeRelease.progress>.01,`A small deliberate wheel starts the complete handoff before the idle timer: ${JSON.stringify(beforeRelease)}`);
 assert(landed.ms-first.ms<3000,'One small wheel settles in the existing handoff duration');
 const corners=await p.$$eval('.royal-corner',nodes=>nodes.map(e=>{const style=getComputedStyle(e),matrix=new DOMMatrix(style.transform);return {opacity:+style.opacity,scale:Math.hypot(matrix.a,matrix.b)};}));
 assert(corners.every(e=>e.opacity>.99&&Math.abs(e.scale-1)<.01),`The full voucher frame is already visible at landing: ${JSON.stringify(corners)}`);
 await fs.writeFile(`${out}/timing.json`,JSON.stringify({first,landed,interactive,corners,trace},null,2));
 await p.screenshot({path:`${out}/landed.png`});
 await edge('wallet');await p.mouse.wheel({deltaY:-60});await stable('flowers');
 await edge('flowers',true);await p.mouse.wheel({deltaY:60});await stable('wallet');
 assert.equal(await p.$eval('.envelope__seal',e=>e.disabled),false,'Returning does not replay arrival');
 await p.click('.envelope__seal');await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');
 await p.click('.envelope__seal');await p.waitForSelector('.chapter-envelope-scene[data-state="closed"]');
 if(frames) {
  for(const reverse of [false,true]) {
   await edge(reverse?'wallet':'flowers',!reverse);
   await p.evaluate(async reverse=>{const {flowersVoucherHandoff}=await import('/src/chapters/flowersVoucherHandoff.ts');window.review=flowersVoucherHandoff({flowers:document.querySelector('#chapter-flowers'),voucher:document.querySelector('#chapter-wallet'),gardenContent:document.querySelector('[data-chapter-content="flowers"]'),voucherContent:document.querySelector('[data-chapter-content="wallet"]'),reverse,scrollDelta:0,finish:()=>{}});},reverse);
   for(const progress of reverse?[100,80,60,50,40,20]:[0,20,40,50,60,80]) {
    if(progress!==(reverse?100:0)){await p.evaluate(n=>window.review.seek(n/100,false),progress);await p.waitForFunction(n=>Math.abs(+document.querySelector('.nature-bloom').dataset.handoffProgress-n/100)<.002,{},progress);}
    await p.screenshot({path:`${out}/${reverse?'reverse':'forward'}-${String(reverse?100-progress:progress).padStart(3,'0')}.png`});
   }
   await p.evaluate(()=>{window.review.dispose();delete window.review;});await edge(reverse?'flowers':'wallet',reverse);
   await p.screenshot({path:`${out}/${reverse?'reverse':'forward'}-100.png`});
  }
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS ${mobile?'mobile':'desktop'}: 20px wheel, starts before release, one arrival, full frame on landing, reverse, open/close, no indicator/errors. Arrival ${Math.round(landed.ms-first.ms)}ms; seal lag ${Math.round(interactive.ms-landed.ms)}ms.`);
}finally{await Promise.race([browser.close(),wait(3000).then(()=>browser.process()?.kill())]);}
