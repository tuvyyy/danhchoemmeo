import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced');
const out=`docs/captures/restored-entrance${mobile?'-mobile':''}${reduced?'-reduced':''}`;
await fs.mkdir(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const height=mobile?844:900;await p.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await p.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await p.waitForSelector('.gallery-loader',{hidden:true});
 assert.equal(await p.$eval('.hero-gallery',e=>e.inert),true);
 await p.screenshot({path:`${out}/gate.png`});
 const hit=await p.$eval('.garden-gate__hit',e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:Math.min(innerHeight-120,r.top+r.width*.75)}});
 if(mobile)await p.touchscreen.tap(hit.x,hit.y);else await p.mouse.move(hit.x,hit.y);
 await wait(reduced?50:1550);assert(await p.$eval('.garden-gate',e=>+getComputedStyle(e).getPropertyValue('--gate-open')>.99));
 if(mobile)await p.touchscreen.tap(hit.x,hit.y);else await p.mouse.move(90,700);
 await wait(reduced?50:1750);assert(await p.$eval('.garden-gate',e=>+getComputedStyle(e).getPropertyValue('--gate-open')<.01));
 const touch=mobile?await p.createCDPSession():null;
 async function input(delta){if(!mobile)return p.mouse.wheel({deltaY:delta});const y=delta>0?height-110:120;await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y}]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:y-delta}]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 if(!reduced){
  await input(height*.4);await p.waitForFunction(()=>Math.abs(+document.querySelector('.entrance-gate').dataset.progress-.4)<.002);
  await p.keyboard.press('Escape');await p.waitForFunction(()=>document.querySelector('.entrance-gate').dataset.entering==='false');
  await p.screenshot({path:`${out}/forward-000.png`});let previous=0;
  for(const percent of [20,40,50,60,80,100]){
   await input((percent-previous)/100*height);
   if(percent<100)await p.waitForFunction(n=>Math.abs(+document.querySelector('.entrance-gate').dataset.progress-n)<.002,{},percent/100);
   else await p.waitForSelector('.entrance-gate',{hidden:true});
   assert.equal(await p.$eval('#chapter-flowers',e=>e.dataset.chapterState),'locked','Gate must not skip gallery');
   await p.screenshot({path:`${out}/forward-${String(percent).padStart(3,'0')}.png`});previous=percent;
  }
 }else{await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});}
 assert.equal(await p.$eval('.hero-gallery',e=>e.inert),false);
 assert.notEqual(await p.evaluate(()=>document.body.style.overflow),'hidden');
 await p.waitForSelector('.hero-surface[data-ready="true"]');
 await p.mouse.move(mobile?285:1100,mobile?540:550);await wait(300);await p.screenshot({path:`${out}/white-relief.png`});
 await p.click('.hero-gallery__theme');await wait(reduced?100:1500);assert.equal(await p.$eval('.hero-gallery',e=>e.dataset.night),'true');await p.screenshot({path:`${out}/black-flowers.png`});
 await p.click('.hero-gallery__photograph');await p.waitForSelector('.hero-portrait[open]');await p.keyboard.press('Escape');await p.waitForSelector('.hero-portrait',{hidden:true});assert.equal(await p.evaluate(()=>document.activeElement.className),'hero-gallery__photograph');
 await p.click('.hero-gallery__back');await p.waitForSelector('.entrance-gate');
 await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 assert.equal(await p.$eval('.hero-gallery',e=>e.dataset.night),'true','Night choice survives returning to gate');
 await p.click('.hero-gallery .cinematic-hero__cta');await p.waitForFunction(()=>document.querySelector('#chapter-flowers').dataset.chapterState==='active');
 await p.evaluate(()=>document.querySelector('#chapter-flowers').scrollIntoView({behavior:'instant'}));
 await input(-height);await p.waitForFunction(()=>!document.documentElement.dataset.heroGardenHandoff);await wait(400);
 assert(['active','completing'].includes(await p.$eval('#chapter-hero',e=>e.dataset.chapterState)));
 assert.equal(await p.$('.entrance-gate'),null,'Reverse from flowers returns to gallery');
 assert.equal(await p.$eval('.hero-gallery',e=>e.dataset.night),'true');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log(`${out}: PASS gate -> restored white/black gallery -> video garden, Escape, back gate, theme preserved, portrait focus, reverse, no errors`);
}finally{await b.close();}
