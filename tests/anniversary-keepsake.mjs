import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced'),frames=process.argv.includes('--frames'),laptop=process.argv.includes('--laptop');
const dir=`docs/captures/anniversary-keepsake${mobile?'-mobile':''}${laptop?'-laptop':''}${reduced?'-reduced':''}`;await fs.mkdir(dir,{recursive:true});
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(18000);
 await p.setViewport({width:mobile?390:laptop?1366:1440,height:mobile?844:laptop?768:900,isMobile:mobile,hasTouch:mobile});
 if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await p.goto(process.env.JOURNEY_URL||'http://127.0.0.1:3333',{waitUntil:'domcontentloaded',timeout:60000});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 const click=s=>p.$eval(s,e=>e.click());
 const stable=id=>p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff')),{},id);
 const edge=(id,end=true)=>p.evaluate(({id,end})=>{const s=document.querySelector(`#chapter-${id}`);scrollTo({top:s.offsetTop+(end?Math.max(0,s.offsetHeight-innerHeight):0),behavior:'instant'});},{id,end});
 await click('.cinematic-hero__cta');await stable('flowers');await edge('flowers');await click('.nature-bloom__footer button');await stable('wallet');
 await p.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false);await click('.envelope__seal');await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');await click('.scene-next');await stable('letter');
 await edge('letter');await click('.letter-next');await stable('finale');
 assert.match(await p.$eval('.finale-header',e=>e.innerText),/CHƯƠNG 04/);
 assert.equal(await p.$('[data-custom-cursor]'),null,'The candle keeps its wind cursor');
 assert.equal(await p.$eval('nav button[aria-label^="Tụi mình"]',e=>e.disabled),true,'Keepsake starts locked');
 await p.mouse.wheel({deltaY:130});await wait(400);await stable('finale');
 await click('.candle-blow-action');await p.waitForSelector('.celebration-scene[data-blown="true"]');await wait(reduced?200:1900);
 await stable('finale');assert(await p.$('.wish-next'),'Visitor chooses when to leave the wish');
 await p.screenshot({path:`${dir}/wish.png`});
 await edge('finale');await click('.wish-next');await stable('anniversary');
 await p.waitForFunction(()=>document.querySelector('.together-photo img').complete&&document.querySelector('.together-photo img').naturalWidth>0);await p.evaluate(()=>document.fonts.ready);await wait(600);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
 await p.screenshot({path:`${dir}/desktop.png`,fullPage:false});
 if(mobile)await (await p.$('.together-scene')).screenshot({path:`${dir}/full-page.png`});
 for(let index=0;index<3;index++) { await edge('anniversary',false);await click(`.together-station:nth-child(${index+1})`);await wait(750);assert.equal(await p.$eval('.together-scene',e=>e.dataset.milestone),String(index));
  if(mobile)assert(await p.$eval('.together-copy',e=>Math.abs(e.getBoundingClientRect().top-50)<3),'Selecting a note brings the readable letter into view');
  assert(await p.$eval('.together-copy',e=>e.getBoundingClientRect().bottom<=e.closest('.together-paper').getBoundingClientRect().bottom+1),'Every note fits its paper');
  await p.screenshot({path:`${dir}/note-${index+1}.png`});
 }
 console.log('layout captured',dir);
 if(frames&&!reduced) {
  for(const reverse of [false,true]) {
   await edge(reverse?'anniversary':'finale',false);
   await p.evaluate(async reverse=>{const {wishAnniversaryHandoff}=await import('/src/chapters/wishAnniversaryHandoff.ts');window.review=wishAnniversaryHandoff({wish:document.querySelector('#chapter-finale'),anniversary:document.querySelector('#chapter-anniversary'),wishContent:document.querySelector('[data-chapter-content="finale"]'),anniversaryContent:document.querySelector('[data-chapter-content="anniversary"]'),reverse,scrollDelta:0,finish:()=>{}});},reverse);
   const percentages=reverse?[100,80,60,50,40,20]:[0,20,40,50,60,80];
   for(const progress of percentages) { if(progress!==percentages[0]) {await p.evaluate(v=>window.review.seek(v/100,false),progress);await p.waitForFunction(v=>Math.abs(+document.querySelector('.together-scene').dataset.handoffProgress-v/100)<.002,{},progress);}
    await p.screenshot({path:`${dir}/${reverse?'reverse':'forward'}-${String(reverse?100-progress:progress).padStart(3,'0')}.png`});
   }
   await p.evaluate(()=>{window.review.dispose();delete window.review;});await edge(reverse?'finale':'anniversary',false);
   await p.screenshot({path:`${dir}/${reverse?'reverse':'forward'}-100.png`});
  }
 }
 await edge('anniversary',false);await click('nav button[aria-label^="Ước"]');await stable('finale');
 assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'true','Wish survives return');
 await click('.reignite-btn');await p.waitForSelector('.celebration-scene[data-blown="false"]');await click('.candle-blow-action');await p.waitForSelector('.celebration-scene[data-blown="true"]');
 await click('.wish-next');await stable('anniversary');assert.equal(await p.$eval('.together-scene',e=>e.dataset.milestone),'2','Selected note survives return');
 await edge('anniversary',false);await wait(220);await p.mouse.wheel({deltaY:-180});await stable('finale');
 await edge('finale',false);await wait(220);await p.mouse.wheel({deltaY:-180});await stable('letter');
 assert.equal(await p.$eval('.letter-vines',e=>e.dataset.visible),'true','Reverse restores the letter vines');
 await click('.letter-next');await stable('finale');await click('.wish-next');await stable('anniversary');
 await click('.together-next');await stable('hero');assert.equal(await p.evaluate(()=>document.activeElement.id),'chapter-hero');
 assert.deepEqual(errors,[]);console.log(`PASS ${mobile?'mobile':'desktop'} reduced=${reduced}: chapter order, wish pause, relight, notes, reverse, state persistence, replay, no errors/overflow`);
}finally {await Promise.race([b.close(),wait(3000).then(()=>b.process()?.kill())]);}
