import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),height=mobile?844:900;
const out=`docs/captures/book-opening${mobile?'-mobile':''}`;
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
 for(const direction of ['forward','reverse']){
  await p.evaluate(id=>scrollTo({top:document.querySelector(`#chapter-${id}`).offsetTop,behavior:'instant'}),direction==='forward'?'wallet':'letter');await wait(250);
  await p.screenshot({path:`${out}/${direction}-000.png`});let last=0;
  for(const percent of [20,40,50,60,80,100]){
   await input((percent-last)/100*height*(direction==='forward'?1:-1));
   if(percent<100){
    const target=(direction==='forward'?percent:100-percent)/100;
    await p.waitForFunction(target=>Math.abs(+document.querySelector('.letter-atelier').dataset.handoffProgress-target)<.003,{},target);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(percent===50){await wait(450);assert(Math.abs(await p.$eval('.letter-atelier',e=>+e.dataset.handoffProgress)-target)<.003);}
   }else await stable(direction==='forward'?'letter':'wallet');
   await p.screenshot({path:`${out}/${direction}-${String(percent).padStart(3,'0')}.png`});last=percent;
  }
  assert.equal(await p.$('.letter-book-back'),null,'temporary reverse paper face must be removed');
  if(direction==='forward')assert.equal(await p.$eval('.letter-atelier',e=>e.dataset.open),'true');
 }
 assert.deepEqual(errors,[]);console.log(`${out}: PASS book opening/closing, pause, open arrival, cleanup, no overflow and no errors`);
}finally{await browser.close();}
