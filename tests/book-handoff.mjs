import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),height=mobile?844:900;
const out=process.env.BOOK_CAPTURE_DIR||`docs/captures/chapter-page-turn${mobile?'-mobile':''}`;
await fs.mkdir(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 const stable=id=>p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!document.documentElement.dataset.voucherLetterHandoff,{},id);
 await p.goto(process.env.JOURNEY_URL||'http://127.0.0.1:3334',{waitUntil:'networkidle2'});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 await p.$eval('.cinematic-hero__cta',e=>e.click());await stable('flowers');
 await p.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo({top:s.offsetTop+s.offsetHeight-innerHeight,behavior:'instant'});document.querySelector('.nature-bloom__footer button').click();});
 await p.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false);
 await p.click('.envelope__seal');await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');
 const input=async delta=>{
  if(!mobile)return p.mouse.wheel({deltaY:delta});
  const cdp=await p.createCDPSession(),start=delta>0?height-130:130;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:start}]});
  for(let i=1;i<=5;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:start-delta*i/5}]});await wait(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 };
 const measurements=[];
 for(const direction of ['forward','reverse']){
  await p.evaluate(id=>scrollTo({top:document.querySelector(`#chapter-${id}`).offsetTop,behavior:'instant'}),direction==='forward'?'wallet':'letter');await wait(250);
  await p.screenshot({path:`${out}/${direction}-000.png`});let last=0;
  for(const percent of [20,40,50,60,80,100]){
   await input((percent-last)/100*height*(direction==='forward'?1:-1));
   if(percent<100){
    const target=(direction==='forward'?percent:100-percent)/100;
    await p.waitForFunction(target=>Math.abs(+document.querySelector('.letter-atelier').dataset.handoffProgress-target)<.003,{},target);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const state=await p.evaluate(()=>{
     const paper=document.querySelector('.letter-keepsake'),r=paper.getBoundingClientRect();
     const flat=new DOMMatrix(getComputedStyle(paper).transform),page=new DOMMatrix(getComputedStyle(document.querySelector('[data-chapter-content="wallet"]')).transform);
     return{left:r.left,top:r.top,width:r.width,height:r.height,paperDepth:flat.m13,pageDepth:page.m13};
    });
    assert(Math.abs(state.paperDepth)<.0001,'The letter itself never hinges open');
    assert(Math.abs(state.pageDepth)>.01,'The outgoing chapter is the turning page');
    measurements.push({direction,percent,...state});
    if(percent===50){await wait(450);assert(Math.abs(await p.$eval('.letter-atelier',e=>+e.dataset.handoffProgress)-target)<.003);}
   }else await stable(direction==='forward'?'letter':'wallet');
   await p.screenshot({path:`${out}/${direction}-${String(percent).padStart(3,'0')}.png`});last=percent;
  }
  assert.equal(await p.$('.letter-book-back'),null,'No blank reverse face attached to the letter');
  assert.equal(await p.$('.chapter-page-turn-shade'),null,'Page shade is removed after each handoff');
  assert.equal(await p.$('.letter-cover'),null,'No book cover in chapter three');
  if(direction==='forward')assert.equal(await p.$eval('.letter-atelier',e=>e.dataset.open),'true');
 }
 // Capture frame cadence without screenshots/readback during the CTA animation.
 await p.evaluate(()=>{
  window.__pageTurnFrames=[];let previous=performance.now();
  const tick=time=>{window.__pageTurnFrames.push(time-previous);previous=time;if(document.documentElement.dataset.voucherLetterHandoff)requestAnimationFrame(tick);};
  document.querySelector('.scene-next').click();requestAnimationFrame(tick);
 });
 await stable('letter');
 const cadence=await p.evaluate(()=>window.__pageTurnFrames);
 const final=await p.$eval('.letter-keepsake',e=>{const r=e.getBoundingClientRect();return{left:r.left,top:r.top,width:r.width,height:r.height};});
 const held=measurements.find(m=>m.direction==='forward'&&m.percent===80);
 for(const key of ['left','top','width','height'])assert(Math.abs(final[key]-held[key])<1,'No arrival geometry jump');
 await fs.writeFile(`${out}/measurements.json`,JSON.stringify({measurements,cadence:{frames:cadence.length,meanMs:cadence.reduce((a,b)=>a+b,0)/cadence.length,maxMs:Math.max(...cadence),over50Ms:cadence.filter(t=>t>50).length}},null,2));
 assert.deepEqual(errors,[]);console.log(`${out}: PASS whole-chapter page turn, flat letter, forward/reverse/hold, stable arrival, cleanup and no overflow/errors`);
}finally{await browser.close();}
