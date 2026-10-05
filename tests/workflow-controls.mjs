import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced'),label=process.argv[2]||'iteration1';
const out=`docs/captures/anniversary-${label}${mobile?'-mobile':''}`;await fs.mkdir(out,{recursive:true});
const height=mobile?844:900;const wait=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
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
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await wait(150);await page.mouse.wheel({deltaY:height*.35});await page.waitForFunction(()=>+document.querySelector('.together-scene').dataset.handoffProgress>.34);
 for(let i=0;i<24;i++)await page.mouse.wheel({deltaY:i%2?-7:7});await wait(450);assert(Math.abs(await page.$eval('.together-scene',e=>+e.dataset.handoffProgress)-.35)<.003,'Rapid direction changes preserve scroll distance');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.documentElement.dataset.momentsAnniversaryHandoff);assert.equal(await page.$eval('#chapter-moments',e=>e.dataset.chapterState),'completing');
 await page.mouse.wheel({deltaY:height*.65});await page.waitForFunction(()=>+document.querySelector('.together-scene').dataset.handoffProgress>.64);
 await page.setViewport({width:1000,height:800});await page.waitForFunction(()=>!document.documentElement.dataset.momentsAnniversaryHandoff);
 assert.equal(await page.$eval('#chapter-anniversary',e=>e.dataset.chapterState),'active');assert(Math.abs(await page.$eval('#chapter-anniversary',e=>e.getBoundingClientRect().top))<2);
 await page.mouse.move(500,400);await wait(150);await page.mouse.wheel({deltaY:-160});await page.waitForFunction(()=>document.documentElement.dataset.momentsAnniversaryHandoff==='reverse');await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.documentElement.dataset.momentsAnniversaryHandoff);
 assert.equal(await page.$eval('#chapter-anniversary',e=>e.dataset.chapterState),'active');await page.screenshot({path:`${out}/tablet.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await page.mouse.wheel({deltaY:-100});await wait(300);assert.equal(await page.$eval('#chapter-moments',e=>e.dataset.chapterState),'completing');
 await page.click('.moments-next');await wait(200);assert.equal(await page.$eval('#chapter-anniversary',e=>e.dataset.chapterState),'active');assert.equal(await page.evaluate(()=>document.documentElement.dataset.momentsAnniversaryHandoff),undefined);
 assert.deepEqual(errors,[]);console.log('PASS Escape both directions, resize during hold, native layout restored, reduced motion navigation');
}finally{await browser.close();}
