import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced'),label=process.argv[2]||'iteration1';
const out=`docs/captures/album-${label}${mobile?'-mobile':''}`;await fs.mkdir(out,{recursive:true});
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
 await page.evaluate(()=>document.querySelector('#chapter-moments').scrollIntoView({behavior:'instant'}));await wait(100);
 if(!mobile){await page.evaluate(()=>{const ctx=document.querySelector('[data-custom-cursor]').previousElementSibling.getContext('2d');const clear=ctx.clearRect.bind(ctx);window.cursorClears=0;ctx.clearRect=(...args)=>{window.cursorClears++;return clear(...args);};});await page.mouse.move(580,300);await wait(2200);const count=await page.evaluate(()=>window.cursorClears);await wait(400);assert.equal(await page.evaluate(()=>window.cursorClears),count,'Idle cursor canvas sleeps');await page.mouse.move(630,350);await wait(100);assert(await page.evaluate(()=>window.cursorClears)>count,'Pointer wakes canvas');}
 await page.click('.memory-album-open');await page.waitForSelector('dialog.memory-viewer[open]');await wait(180);await page.screenshot({path:`${out}/opening.png`});await wait(850);
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
 assert(await page.evaluate(()=>document.querySelector('.memory-viewer').contains(document.activeElement)),'Focus inside modal');
 await page.screenshot({path:`${out}/album-01.png`});
 const y=await page.evaluate(()=>scrollY);await page.mouse.wheel({deltaY:800});await wait(300);assert.equal(await page.evaluate(()=>scrollY),y,'Background scroll locked');assert.equal(await page.evaluate(()=>document.documentElement.dataset.momentsAnniversaryHandoff),undefined);
 await page.keyboard.press('ArrowRight');await wait(500);assert.equal(await page.$eval('.memory-viewer__strip button:nth-child(2)',e=>e.getAttribute('aria-pressed')),'true');
 await page.click('.memory-viewer__strip button:nth-child(3)');await wait(500);await page.screenshot({path:`${out}/album-03.png`});
 if(mobile){const cdp=await page.createCDPSession();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:280,y:270}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:272}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}else await page.click('.memory-viewer__arrows button:last-child');
 await wait(500);assert.equal(await page.$eval('.memory-viewer__strip button:nth-child(4)',e=>e.getAttribute('aria-pressed')),'true');assert.equal(await page.$eval('.memory-table',e=>e.dataset.seen),'4');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog.memory-viewer'));assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.evaluate(()=>document.activeElement.className),'memory-album-open');
 await page.screenshot({path:`${out}/returned.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.click('.memory-album-open');await wait(900);await page.click('.memory-viewer__header button');await page.waitForFunction(()=>!document.querySelector('dialog.memory-viewer'));
 await page.click('.memory-album-open');await wait(80);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog.memory-viewer'));assert.equal(await page.evaluate(()=>document.body.style.overflow),'','Early close releases body');
 await page.click('.moments-next');await page.waitForFunction(()=>document.querySelector('#chapter-anniversary').dataset.chapterState==='active');assert.deepEqual(errors,[]);
 console.log(`${out}: PASS opening, focus, scroll lock, keyboard, thumbnails, swipe/arrows, Escape, focus return, reopen, CTA`);
}finally{await browser.close();}
