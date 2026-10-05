import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced');
const transitions=process.argv.includes('--transition')&&!reduced;
const lighting=process.argv.includes('--lighting');
const label=process.argv[2]||'wind';
const out=`docs/captures/finale-${label}${mobile?'-mobile':''}`;
await fs.mkdir(out,{recursive:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setViewport({width:mobile?390:1440,height:mobile?844:900,isMobile:mobile,hasTouch:mobile});
 if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 const stable=id=>p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff')),{},id);
 const edge=id=>p.evaluate(id=>{const s=document.querySelector(`#chapter-${id}`);scrollTo({top:s.offsetTop+Math.max(0,s.offsetHeight-innerHeight),behavior:'instant'});},id);
 const click=selector=>p.$eval(selector,e=>e.click());
 const lightingSheet=async name=>{
  if(name==='flicker'){
   await p.evaluate(()=>{window.fireStyles=[...document.querySelectorAll('.candle-flame,.candle-room-glow i')].map(element=>({element,style:element.getAttribute('style')}));for(const {element} of window.fireStyles){element.style.animationName='none';element.style.animationPlayState='paused';}document.querySelector('.candle-flame').getBoundingClientRect();});
   for(const percent of [0,20,40,50,60,80,100]){
    await p.evaluate(percent=>{for(const {element} of window.fireStyles){element.style.animationName=element.matches('.candle-flame')?'flame-breathe':'candle-room-flicker';element.style.animationDelay=`${-2.8*percent/100}s`;}},percent);
    await p.screenshot({path:`${out}/${name}-${String(percent).padStart(3,'0')}.png`});
   }
   await p.evaluate(()=>{for(const {element,style} of window.fireStyles){if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);}delete window.fireStyles;});return;
  }
  await p.evaluate(()=>{window.lightingAnimations=document.querySelector('.celebration-scene').getAnimations({subtree:true}).filter(animation=>animation instanceof CSSTransition);window.lightingSpan=Math.max(...window.lightingAnimations.map(animation=>Number(animation.effect.getComputedTiming().duration)));for(const animation of window.lightingAnimations)animation.pause();});
  for(const percent of [0,20,40,50,60,80,100]){
   await p.evaluate(percent=>{for(const animation of window.lightingAnimations)animation.currentTime=Math.min(Number(animation.effect.getComputedTiming().duration),window.lightingSpan*percent/100);},percent);
   await p.screenshot({path:`${out}/${name}-${String(percent).padStart(3,'0')}.png`});
  }
  await p.evaluate(()=>{for(const animation of window.lightingAnimations)animation.finish();delete window.lightingAnimations;delete window.lightingSpan;});
 };
 const input=async delta=>{
  if(!mobile)return p.mouse.wheel({deltaY:delta});
  const cdp=await p.createCDPSession(),height=844,start=delta>0?height-130:130;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:start}]});
  for(let i=1;i<=5;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:start-delta*i/5}]});await wait(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 };
 const boundary=async reverse=>{
  const direction=reverse?'reverse':'forward',height=mobile?844:900;
  await p.screenshot({path:`${out}/${direction}-000.png`});let last=0;
  for(const percent of [20,40,50,60,80,100]){
   await input((percent-last)/100*height*(reverse?-1:1));
   if(percent<100){
    await p.waitForFunction(target=>Math.abs(+(document.querySelector('.celebration-scene')?.dataset.handoffProgress??-1)-target)<.003,{},(reverse?100-percent:percent)/100);
    assert.equal(await p.$eval('.butterfly-wing',e=>getComputedStyle(e).animationPlayState),'paused','butterflies pause while scrubbing');
    if(percent===50){const pose=await p.$eval('.butterfly-wing',e=>getComputedStyle(e).transform);await wait(350);assert.equal(await p.$eval('.butterfly-wing',e=>getComputedStyle(e).transform),pose,'stopped scroll holds the wing pose');}
   }else await stable(reverse?'anniversary':'finale');
   await p.screenshot({path:`${out}/${direction}-${String(percent).padStart(3,'0')}.png`});last=percent;
  }
 };
 await p.goto(process.env.JOURNEY_URL||'http://127.0.0.1:3334',{waitUntil:'networkidle2'});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 await click('.cinematic-hero__cta');await stable('flowers');await edge('flowers');await click('.nature-bloom__footer button');
 await stable('wallet');await p.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false);await p.click('.envelope__seal');
 await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');await click('.scene-next');await stable('letter');
 assert.equal(await p.$eval('.letter-atelier',e=>e.dataset.open),'true','the book handoff arrives with the letter open');
 await edge('letter');await click('.letter-next');await stable('moments');
 for(let i=0;i<4;i++)await click(`.memory-print[data-index="${i}"]`);
 await wait(reduced?100:950);await edge('moments');await click('.moments-next');await stable('anniversary');
 await edge('anniversary');if(transitions)await boundary(false);else {await click('.together-next');await stable('finale');}
 await p.waitForFunction(()=>document.querySelector('.birthday-cake img')?.complete&&document.querySelector('.birthday-cake img')?.naturalWidth>0);
 await p.waitForFunction(()=>[...document.querySelectorAll('.butterfly-wing img')].every(e=>e.complete&&e.naturalWidth>0));
 await wait(350);await p.screenshot({path:`${out}/lit.png`});
 assert.equal(await p.$eval('.finale-lighting',e=>+getComputedStyle(e).opacity),1,'lit candles keep the room dark');
 const glowOpacity=()=>p.$eval('.candle-room-glow i',e=>getComputedStyle(e).opacity);
 const glow=await glowOpacity();
 const butterflyPose=()=>p.$eval('.butterfly-wing',e=>getComputedStyle(e).transform);
 const pose=await butterflyPose();await wait(420);
 if(reduced)assert.equal(await butterflyPose(),pose,'reduced motion keeps the wings still');
 else assert.notEqual(await butterflyPose(),pose,'butterflies flap rather than merely translating a flat image');
 if(reduced)assert.equal(await glowOpacity(),glow,'reduced motion keeps the light steady');
 else assert.notEqual(await glowOpacity(),glow,'the room light follows the flickering candle');
 await p.screenshot({path:`${out}/flight.png`});
 if(lighting&&!reduced)await lightingSheet('flicker');
 assert.equal(await p.$('[data-custom-cursor]'),null,'the wind cursor replaces the pink cursor');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const position=()=>p.$eval('.birthday-candle',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y};});
 const before=await position();
 const f=await p.$eval('.candle-flame-wrap',e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
 if(mobile){
  const cdp=await p.createCDPSession();
  const swipe=async y=>{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:f.x-70,y}]});
   for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:f.x-70+140*i/6,y}]});await wait(20);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await swipe(f.y-150);await wait(350);assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'false','a swipe elsewhere is harmless');
  await swipe(f.y);await cdp.detach();
 }else{
  await p.mouse.move(f.x,f.y-100);await p.mouse.move(f.x,f.y+100,{steps:8});await wait(300);
  assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'false','vertical pointer motion is harmless');
  await p.mouse.move(f.x-90,f.y);await wait(220);await p.mouse.move(f.x+90,f.y,{steps:6});
 }
 await p.waitForSelector('.celebration-scene[data-blown="true"]');if(lighting&&!reduced)await lightingSheet('brighten');await wait(500);await p.screenshot({path:`${out}/smoke.png`});
 assert.deepEqual(await position(),before,'the candle stays attached to the cake when the greeting changes');
 assert.equal(await p.$eval('.candle-flame',e=>+getComputedStyle(e).opacity),0);
 assert.equal(await p.$eval('.candle-aura',e=>+getComputedStyle(e).opacity),0);
 await wait(2000);await p.screenshot({path:`${out}/wish.png`});
 assert.equal(await p.$eval('.finale-lighting',e=>+getComputedStyle(e).opacity),0,'extinguishing the candle reveals the bright room');
 assert.equal(await p.$eval('.candle-room-glow',e=>+getComputedStyle(e).opacity),0,'extinguished candles stop lighting the room');
 await p.focus('.reignite-btn');await p.keyboard.press('Enter');await p.waitForSelector('.celebration-scene[data-blown="false"]');
 if(lighting&&!reduced)await lightingSheet('darken');else await wait(reduced?180:1900);
 assert.equal(await p.$eval('.finale-lighting',e=>+getComputedStyle(e).opacity),1,'relighting restores the dark room');
 assert(await p.$eval('.candle-blow-action',e=>document.activeElement===e),'keyboard focus returns to the blow control');
 await p.keyboard.press('Space');await p.waitForSelector('.celebration-scene[data-blown="true"]');
 assert(await p.$eval('.reignite-btn',e=>document.activeElement===e),'keyboard focus follows the replacement control');
 await p.evaluate(()=>scrollTo({top:document.querySelector('#chapter-finale').offsetTop,behavior:'instant'}));
 if(transitions)await boundary(true);else {await p.mouse.wheel({deltaY:-(mobile?844:900)});await stable('anniversary');}
 assert.equal(await p.$eval('.butterfly-flight',e=>getComputedStyle(e).animationPlayState),'paused','flight stops after leaving the finale');
 await click('.together-next');await stable('finale');
 assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'true','the wish persists across chapter re-entry');
 assert.equal(await p.$eval('.candle-flame',e=>+getComputedStyle(e).opacity),0);
 await p.click('.revisit-btn');await stable('hero');assert.equal(await p.evaluate(()=>document.activeElement.id),'chapter-hero');
 assert.deepEqual(errors,[]);
 console.log(`${out}: PASS wind gesture, harmless motion, anchored candle, keyboard focus, relight, retained wish, replay and reduced=${reduced}`);
}finally{await browser.close();}
