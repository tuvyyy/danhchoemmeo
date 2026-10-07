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
 const journeyURL=process.env.JOURNEY_URL||'http://127.0.0.1:3334';
 p.on('response',response=>{if(response.status()>=400&&new URL(response.url()).origin===new URL(journeyURL).origin)errors.push(`HTTP ${response.status()}: ${response.url()}`);});
 await p.setViewport({width:mobile?390:1440,height:mobile?844:900,isMobile:mobile,hasTouch:mobile});
 if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 const capture=async options=>{if(process.env.NO_CAPTURE!=='1')await p.screenshot(options);};
 const stable=id=>p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff')),{},id);
 const edge=id=>p.evaluate(id=>{const s=document.querySelector(`#chapter-${id}`);scrollTo({top:s.offsetTop+Math.max(0,s.offsetHeight-innerHeight),behavior:'instant'});},id);
 const click=selector=>p.$eval(selector,e=>e.click());
 const cursorShapes=new Set();
 const expectCursor=async (chapter,shape)=>{
  if(mobile||chapter===4){
   assert.equal(await p.$('[data-custom-cursor]'),null,'Touch devices and the finale keep their native cursor');
   assert.equal(await p.evaluate(()=>document.body.classList.contains('custom-cursor-enabled')),false);
   return;
  }
  await p.mouse.move(70,100);
  await p.waitForFunction(({chapter,shape})=>{
   const cursor=document.querySelector('[data-custom-cursor]');
   return cursor?.dataset.customCursor===shape&&+cursor.dataset.cursorChapter===chapter&&+getComputedStyle(cursor).opacity===1&&document.body.classList.contains('custom-cursor-enabled');
  },{},{chapter,shape});
  cursorShapes.add(await p.$$eval('[data-custom-cursor] svg path',paths=>paths.map(path=>path.getAttribute('d')).join('|')));
  assert.equal(await p.$eval('[data-custom-cursor]',e=>getComputedStyle(e).pointerEvents),'none','The cursor never blocks clicks');
 };
 const lightingSheet=async name=>{
  if(name==='flicker'){
   await p.evaluate(()=>{window.fireStyles=[...document.querySelectorAll('.candle-flame,.candle-room-glow i')].map(element=>({element,style:element.getAttribute('style')}));for(const {element} of window.fireStyles){element.style.animationName='none';element.style.animationPlayState='paused';}document.querySelector('.candle-flame').getBoundingClientRect();});
   for(const percent of [0,20,40,50,60,80,100]){
    await p.evaluate(percent=>{for(const {element} of window.fireStyles){element.style.animationName=element.matches('.candle-flame')?'flame-breathe':'candle-room-flicker';element.style.animationDelay=`${-2.8*percent/100}s`;}},percent);
    await capture({path:`${out}/${name}-${String(percent).padStart(3,'0')}.png`});
   }
   await p.evaluate(()=>{for(const {element,style} of window.fireStyles){if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);}delete window.fireStyles;});return;
  }
  await p.evaluate(()=>{window.lightingAnimations=document.querySelector('.celebration-scene').getAnimations({subtree:true}).filter(animation=>animation instanceof CSSTransition);window.lightingSpan=Math.max(...window.lightingAnimations.map(animation=>Number(animation.effect.getComputedTiming().duration)));for(const animation of window.lightingAnimations)animation.pause();});
  for(const percent of [0,20,40,50,60,80,100]){
   await p.evaluate(percent=>{for(const animation of window.lightingAnimations)animation.currentTime=Math.min(Number(animation.effect.getComputedTiming().duration),window.lightingSpan*percent/100);},percent);
   await capture({path:`${out}/${name}-${String(percent).padStart(3,'0')}.png`});
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
  const direction=reverse?'reverse':'forward';
  await capture({path:`${out}/${direction}-000.png`});
  await input((reverse?-1:1)*(mobile?90:120));
  await stable(reverse?'finale':'anniversary');
  await capture({path:`${out}/${direction}-100.png`});
 };
 await p.goto(journeyURL,{waitUntil:'networkidle2'});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 await expectCursor(0,'paw');
 await click('.cinematic-hero__cta');await stable('flowers');await expectCursor(1,'tulip');await edge('flowers');await click('.nature-bloom__footer button');
 await stable('wallet');await expectCursor(2,'gift');await p.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false);await p.click('.envelope__seal');
 await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');await click('.scene-next');await stable('letter');
 assert.equal(await p.$eval('.letter-atelier',e=>e.dataset.open),'true','the book handoff arrives with the letter open');
 await expectCursor(3,'quill');
 if(!mobile){
  await p.click('.letter-page__read');await p.waitForSelector('.letter-reader');
  await p.waitForFunction(()=>!document.body.classList.contains('custom-cursor-enabled')&&+getComputedStyle(document.querySelector('[data-custom-cursor]')).opacity===0);
  await p.keyboard.press('Escape');await p.waitForSelector('.letter-reader',{hidden:true});await expectCursor(3,'quill');
 }
 await edge('letter');await click('.letter-next');await stable('finale');
 assert.equal(await p.$('#chapter-moments'),null,'The journey skips the removed album');
 await expectCursor(4,'wind');
 await p.waitForFunction(()=>document.querySelector('.birthday-cake img')?.complete&&document.querySelector('.birthday-cake img')?.naturalWidth>0);
 await p.waitForFunction(()=>[...document.querySelectorAll('.butterfly-wing img')].every(e=>e.complete&&e.naturalWidth>0));
 assert.equal(await p.$$eval('.butterfly-flight',es=>es.length),6,'Add two butterflies');
 assert(await p.$eval('.finale-butterflies',e=>e.parentElement.classList.contains('celebration-scene')),'Butterflies span the whole chapter');
 for(const route of ['wander','roam']){
  const path=await p.$eval(`.butterfly-flight--${route}`,async e=>{
   const animation=e.getAnimations()[0];if(!animation)return null;
   const previous=animation.currentTime;animation.pause();await animation.ready;const timing=animation.effect.getComputedTiming(),duration=Number(timing.duration),points=[];
   // Sample the second loop so the staggered negative delays never seek before the animation starts.
   for(const part of [0,.2,.4,.6,.8]){animation.currentTime=Number(timing.delay)+duration*(1+part);const r=e.getBoundingClientRect();points.push({x:r.left,y:r.top});}
   animation.currentTime=previous;animation.play();return points;
  });
  if(!reduced){assert(path,'New butterfly route animates');assert(Math.max(...path.map(p=>p.x))-Math.min(...path.map(p=>p.x))>(mobile?390:1440)*.6,'Route traverses both sides of the page');assert(Math.max(...path.map(p=>p.y))-Math.min(...path.map(p=>p.y))>(mobile?844:900)*.5,'Route traverses top and bottom');}
 }
 await wait(350);await capture({path:`${out}/lit.png`});
 assert.equal(await p.$eval('.finale-lighting',e=>+getComputedStyle(e).opacity),1,'lit candles keep the room dark');
 const glowOpacity=()=>p.$eval('.candle-room-glow i',e=>getComputedStyle(e).opacity);
 const glow=await glowOpacity();
 const butterflyPose=()=>p.$eval('.butterfly-wing',e=>getComputedStyle(e).transform);
 const pose=await butterflyPose();await wait(420);
 if(reduced)assert.equal(await butterflyPose(),pose,'reduced motion keeps the wings still');
 else assert.notEqual(await butterflyPose(),pose,'butterflies flap rather than merely translating a flat image');
 if(reduced)assert.equal(await glowOpacity(),glow,'reduced motion keeps the light steady');
 else assert.notEqual(await glowOpacity(),glow,'the room light follows the flickering candle');
 await capture({path:`${out}/flight.png`});
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
 await p.waitForSelector('.celebration-scene[data-blown="true"]');if(lighting&&!reduced)await lightingSheet('brighten');await wait(500);await capture({path:`${out}/smoke.png`});
 assert.deepEqual(await position(),before,'the candle stays attached to the cake when the greeting changes');
 await p.waitForFunction(()=>['.candle-flame','.candle-aura'].every(selector=>+getComputedStyle(document.querySelector(selector)).opacity===0));
 assert.equal(await p.$eval('.candle-flame',e=>+getComputedStyle(e).opacity),0);
 assert.equal(await p.$eval('.candle-aura',e=>+getComputedStyle(e).opacity),0);
 await wait(2000);await capture({path:`${out}/wish.png`});
 assert.equal(await p.$eval('.finale-lighting',e=>+getComputedStyle(e).opacity),0,'extinguishing the candle reveals the bright room');
 assert.equal(await p.$eval('.candle-room-glow',e=>+getComputedStyle(e).opacity),0,'extinguished candles stop lighting the room');
 await p.focus('.reignite-btn');await p.keyboard.press('Enter');await p.waitForSelector('.celebration-scene[data-blown="false"]');
 if(lighting&&!reduced)await lightingSheet('darken');else await wait(reduced?180:1900);
 assert.equal(await p.$eval('.finale-lighting',e=>+getComputedStyle(e).opacity),1,'relighting restores the dark room');
 assert(await p.$eval('.candle-blow-action',e=>document.activeElement===e),'keyboard focus returns to the blow control');
 await p.keyboard.press('Space');await p.waitForSelector('.celebration-scene[data-blown="true"]');
 assert(await p.$eval('.reignite-btn',e=>document.activeElement===e),'keyboard focus follows the replacement control');
 await edge('finale');if(transitions)await boundary(false);else {await click('.wish-next');await stable('anniversary');}
 assert.equal(await p.$eval('.butterfly-flight',e=>getComputedStyle(e).animationPlayState),'paused','Flight stops after leaving the wish');
 await expectCursor(5,'heart');if(!mobile)assert.equal(cursorShapes.size,5,'Each decorated chapter has a distinct silhouette');
 await p.evaluate(()=>scrollTo({top:document.querySelector('#chapter-anniversary').offsetTop,behavior:'instant'}));
 if(transitions)await boundary(true);else {await input(-(mobile?90:120));await stable('finale');}
 assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'true','The wish persists across chapter re-entry');
 assert.equal(await p.$eval('.candle-flame',e=>+getComputedStyle(e).opacity),0);
 await click('.wish-next');await stable('anniversary');await click('.together-next');await stable('hero');assert.equal(await p.evaluate(()=>document.activeElement.id),'chapter-hero');
 await expectCursor(0,'paw');
 assert.deepEqual(errors,[]);
 console.log(`${out}: PASS chapter cursor routing, overlay restoration, wind gesture, anchored candle, keyboard focus, relight, retained wish, replay and reduced=${reduced}`);
}finally{await browser.close();}
