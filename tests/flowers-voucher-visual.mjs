import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const label = process.argv[2] || 'current';
const mobile = process.argv.includes('--mobile');
const out = `docs/captures/flowers-voucher-${label}${mobile ? '-mobile' : ''}`;
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
const page = await browser.newPage();
await page.setViewport(mobile ? {width:390,height:844} : {width:1440,height:900});
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
const wait = ms => new Promise(r=>setTimeout(r,ms));
await page.goto('http://127.0.0.1:3333', {waitUntil:'networkidle2'});
await page.waitForSelector('.cinematic-hero__cta');
await wait(800);
await page.click('.cinematic-hero__cta');
await wait(2100);
await page.evaluate(async()=>{ window.auditGsap=(await import(performance.getEntriesByType('resource').find(e=>e.name.includes('/deps/gsap.js')).name)).gsap;
 const s=document.querySelector('#chapter-flowers'); scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);
 const v=document.querySelector('.garden-video'); v.pause(); v.currentTime=2;
});
await wait(250);
const flowerY=await page.evaluate(()=>scrollY);
await page.screenshot({path:`${out}/forward-000.png`});
await page.evaluate(()=>{ document.querySelector('.nature-bloom__footer button').click(); });
await page.waitForFunction(()=>!!window.auditGsap.getById('flowers-voucher-handoff') || window.auditGsap.globalTimeline.getChildren(false,true,true).some(t=>t.duration()>1 && t.getChildren));
await page.evaluate(()=>{
 window.auditTimeline=window.auditGsap.getById('flowers-voucher-handoff') || window.auditGsap.globalTimeline.getChildren(false,true,true).filter(t=>t.getChildren && t.duration()>1).at(-1);
 window.auditTimeline.pause(0);
});
const samples = label === 'final' || process.argv.includes('--dense') ? Array.from({length:20},(_,i)=>(i+1)*5) : [20,40,50,60,80,100];
const evidence=[];
async function checkFrame(direction,p) {
 if(label==='current' || p===100) return;
 const s=await page.evaluate(()=>{
  const envelope=document.querySelector('.envelope__pocket').getBoundingClientRect();
  const garden=document.querySelector('.garden-video-stage').getBoundingClientRect();
  const visible=r=>Math.max(0, Math.min(r.bottom,innerHeight)-Math.max(0,r.top));
  return {envelopeHeight:visible(envelope),gardenHeight:visible(garden),gardenOpacity:+getComputedStyle(document.querySelector('.garden-video-stage')).opacity,
   chapterOpacity:+getComputedStyle(document.querySelector('[data-chapter-content="flowers"]')).opacity,
   chapterFilter:getComputedStyle(document.querySelector('[data-chapter-content="flowers"]')).filter,
   ui:getComputedStyle(document.querySelector('[data-journey-ui]')).visibility};
 });
 assert.equal(s.ui,'hidden','No orphaned global UI during handoff');
 assert.equal(s.chapterOpacity,1,'Never fade the Flowers chapter as a block');
 assert.equal(s.chapterFilter,'none','Never blur the Flowers chapter as a block');
 if(direction==='forward' && p>=20) assert(s.envelopeHeight>100,'Envelope visible by 20%');
 if(p===50) assert(s.gardenHeight>150 && s.gardenOpacity>.9,'Midpoint retains the garden');
 evidence.push({direction,progress:p,...s});
}
for(const p of samples){
 await page.evaluate(p=>{window.auditTimeline.progress(p/100,false);},p);
 await wait(60);
 await checkFrame('forward',p);
 await page.screenshot({path:`${out}/forward-${String(p).padStart(3,'0')}.png`});
}
await wait(1900);
await page.screenshot({path:`${out}/forward-100.png`});
await page.screenshot({path:`${out}/reverse-000.png`});
const voucherY=await page.evaluate(()=>scrollY);
if(label==='current') {
 for(const p of [20,40,50,60,80,100]) { await page.evaluate(y=>scrollTo(0,y),voucherY+(flowerY-voucherY)*p/100); await wait(80); await page.screenshot({path:`${out}/reverse-${String(p).padStart(3,'0')}.png`}); }
} else {
 await page.mouse.wheel({deltaY:-(mobile ? 844 : 900)});
 await page.waitForSelector('html[data-flowers-voucher-handoff]');
 // The wheel now holds a partial scroll-driven scene. Use the accessible first
 // milestone to sample the complete automatic reverse journey in this audit.
 await page.evaluate(()=>document.querySelector('.memory-flow__step')?.click());
 await page.waitForFunction(()=>!!window.auditGsap.getById('flowers-voucher-handoff'));
 await page.evaluate(()=>{window.auditTimeline=window.auditGsap.getById('flowers-voucher-handoff');window.auditTimeline.pause(0);});
 for(const p of samples) {await page.evaluate(p=>{window.auditTimeline.progress(p/100,false);},p);await wait(60);await checkFrame('reverse',p);await page.screenshot({path:`${out}/reverse-${String(p).padStart(3,'0')}.png`});}
}
await fs.writeFile(`${out}/measurements.json`,JSON.stringify(evidence,null,2));
assert.deepEqual(errors,[]);
console.log(JSON.stringify({out,errors}));
} finally { await browser.close(); }



