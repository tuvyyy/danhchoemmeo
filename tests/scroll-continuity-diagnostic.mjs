import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile');
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const p=await b.newPage();await p.setViewport({width:mobile?390:1440,height:mobile?844:900,isMobile:mobile,hasTouch:mobile});
 await p.goto('http://127.0.0.1:3333',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 await fs.mkdir('docs/captures/scroll-continuity',{recursive:true});
 const suffix=mobile?'mobile':'desktop';
 assert.equal(await p.$('.chapter-scroll-cue'),null,'The rejected scroll indicator is removed');
 await p.screenshot({path:`docs/captures/scroll-continuity/${suffix}-ready.png`});
 const report=await p.evaluate(async()=>{
  const frames=[],packets=[];const start=performance.now();let recording=true;
  const snapshot=()=>({ms:Math.round(performance.now()-start),y:scrollY,chapter:document.querySelector('[data-current-chapter]')?.dataset.currentChapter,progress:document.querySelector('[data-handoff-progress]')?.dataset.handoffProgress});
  const loop=()=>{frames.push(snapshot());if(recording)requestAnimationFrame(loop);};requestAnimationFrame(loop);
  for(let i=0;i<200;i++) {const e=new WheelEvent('wheel',{deltaY:40,bubbles:true,cancelable:true});window.dispatchEvent(e);packets.push({...snapshot(),prevented:e.defaultPrevented});await new Promise(r=>setTimeout(r,35));}
  await new Promise(r=>setTimeout(r,900));recording=false;return {frames,packets,chapters:[...document.querySelectorAll('[data-chapter-state]')].map(e=>({id:e.id,height:e.offsetHeight,top:e.offsetTop,state:e.dataset.chapterState}))};
 });
 await fs.mkdir('docs/captures/scroll-continuity',{recursive:true});await fs.writeFile(`docs/captures/scroll-continuity/${suffix}-after.json`,JSON.stringify(report,null,2));
 assert(report.packets.some(e=>e.chapter==='wallet'),'Continuous scrolling reaches the envelope without a forced pause');
 await p.waitForSelector('#chapter-wallet[data-chapter-state="active"]');
 assert.equal(await p.$eval('.chapter-envelope-scene',e=>e.dataset.state),'closed','Continued scrolling keeps the seal interaction required');
 await p.screenshot({path:`docs/captures/scroll-continuity/${suffix}-waiting.png`});
 const landed=report.packets.find(e=>e.chapter==='flowers');const stalls=landed&&report.packets.filter(e=>e.ms>landed.ms+300&&e.chapter==='flowers');
 console.log('PASS continuous scrolling, interaction gate and no scroll indicator');
 console.log(JSON.stringify({landed,afterLandingPackets:stalls?.length,positionsAfterLanding:[...new Set(stalls?.map(e=>e.y))],chapters:report.chapters}));
}finally{await Promise.race([b.close(),new Promise(r=>setTimeout(r,3000)).then(()=>b.process()?.kill())]);}
