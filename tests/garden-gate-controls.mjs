import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='docs/captures/estate-controls';await fs.mkdir(out,{recursive:true});
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width:1440,height:900});
 await p.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await p.waitForSelector('.gallery-loader',{hidden:true});
 await p.focus('.garden-gate__hit');await wait(1500);assert(await p.$eval('.garden-gate',e=>+getComputedStyle(e).getPropertyValue('--gate-open')>.99),'Keyboard focus previews the gate');
 await p.keyboard.press('Escape');await wait(1750);assert(await p.$eval('.garden-gate',e=>+getComputedStyle(e).getPropertyValue('--gate-open')<.01),'Escape closes the preview');
 await p.click('.garden-gate__photo');await p.waitForSelector('.hero-portrait[open]');await p.keyboard.press('Escape');await p.waitForSelector('.hero-portrait',{hidden:true});
 assert(await p.$eval('.garden-gate__photo',e=>e===document.activeElement),'Photo dialog returns focus');
 await p.mouse.wheel({deltaY:405});await p.waitForFunction(()=>+document.querySelector('.entrance-gate').dataset.progress>.449);
 assert(await p.$eval('.hero-gallery',e=>e.inert));assert(await p.$eval('[data-chapter-content="flowers"]',e=>e.inert));
 await p.keyboard.press('Tab');assert(await p.evaluate(()=>!document.activeElement.closest('.hero-gallery,[data-chapter-content="flowers"]')),'No hidden control can be tabbed during passage');
 await p.keyboard.press('Escape');await p.waitForFunction(()=>document.querySelector('.entrance-gate').dataset.entering==='false');
 await p.mouse.wheel({deltaY:900*.65});await p.waitForFunction(()=>+document.querySelector('.entrance-gate').dataset.progress>.649);
 await p.setViewport({width:1000,height:800});await p.waitForSelector('.entrance-gate',{hidden:true});assert.equal(await p.$eval('.hero-gallery',e=>e.inert),false);await p.click('.hero-gallery .cinematic-hero__cta');await p.waitForFunction(()=>document.querySelector('#chapter-flowers').dataset.chapterState==='active');assert.equal(await p.$eval('[data-chapter-content="flowers"]',e=>e.style.position),'');
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.evaluate(()=>document.querySelector('#chapter-flowers').scrollIntoView({behavior:'instant'}));await p.keyboard.press('ArrowUp');
 await p.waitForFunction(()=>document.querySelector('#chapter-hero').dataset.chapterState==='completing');await p.click('.cinematic-hero__cta');await p.waitForFunction(()=>document.querySelector('#chapter-flowers').dataset.chapterState==='active');assert.equal(await p.evaluate(()=>document.documentElement.dataset.heroGardenHandoff),undefined);await p.screenshot({path:`out/reduced.png`.replace('out/',`${out}/`)});
 const phone=await b.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await phone.setRequestInterception(true);phone.on('request',r=>r.url().includes('estate-sunset.webp')?r.abort():r.continue());
 await phone.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await phone.waitForSelector('.gallery-loader',{hidden:true});await phone.waitForSelector('.garden-gate[data-art="fallback"]');await phone.screenshot({path:`${out}/missing-art-mobile.png`});
 await phone.click('.garden-gate__enter');await phone.waitForSelector('.entrance-gate',{hidden:true});assert.equal(await phone.$eval('.hero-gallery',e=>e.inert),false);await phone.click('.hero-gallery .cinematic-hero__cta');await phone.waitForFunction(()=>document.querySelector('#chapter-flowers').dataset.chapterState==='active');assert.equal(await phone.$eval('[data-chapter-content="flowers"]',e=>e.inert),false);
 assert.deepEqual(errors,[]);console.log('PASS keyboard hover, Escape, photograph/focus, inert controls, resize during passage, reduced motion both directions, missing artwork fallback');
}finally{await b.close();}

