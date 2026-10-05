import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const mobile = process.argv.includes('--mobile');
const label = process.argv[2] || 'audit';
const out = `docs/captures/scroll-${label}${mobile ? '-mobile' : ''}`;
const height = mobile ? 844 : 900;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const ids = ['hero','flowers','wallet','letter','moments','anniversary','finale'];
const subjects = ['#chapter-hero','.nature-bloom','.letter-atelier','.memory-table','.together-scene','.celebration-scene'];
await fs.mkdir(out,{recursive:true});
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const p = await browser.newPage(), errors = [];
 p.on('pageerror',e=>errors.push(e.message));
 await p.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 await p.evaluateOnNewDocument(()=>{
  window.audit = {label:'boot',frames:[],tasks:[]};
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.audit.tasks.push({label:window.audit.label,ms:e.duration});}).observe({type:'longtask',buffered:true});
  let last=0;
  function tick(time){if(last)window.audit.frames.push({label:window.audit.label,ms:time-last});last=time;requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
 });
 await p.goto(process.env.JOURNEY_URL || 'http://127.0.0.1:3333',{waitUntil:'networkidle2'});
 await p.waitForSelector('.gallery-loader',{hidden:true});
 await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 await wait(300);
 const input = async delta => {
  if(!mobile)return p.mouse.wheel({deltaY:delta});
  const cdp = await p.createCDPSession(), start=delta>0?height-130:130;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:start}]});
  for(let i=1;i<=5;i++){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:start-delta*i/5}]});
   await wait(20);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 };
 const edge = async (id,end) => {
  await p.evaluate(({id,end})=>{const s=document.querySelector(`#chapter-${id}`);scrollTo({top:s.offsetTop+(end?Math.max(0,s.offsetHeight-innerHeight):0),behavior:'instant'});},{id,end});await wait(250);
 };
 const stable = async id => p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff')),{},id);
 const record=[];
 async function boundary(pair,reverse=false){
  const direction=reverse?'reverse':'forward';
  await edge(ids[pair+(reverse?1:0)],!reverse);
  await p.evaluate(label=>{window.audit.label=label;},`${pair}-${direction}`);
  await p.screenshot({path:`${out}/${pair}-${direction}-000.png`});
  let last=0;
  for(const percent of [20,40,50,60,80,100]){
   await input((percent-last)/100*height*(reverse?-1:1));
   if(percent<100){
    const target=(reverse?100-percent:percent)/100;
    await p.waitForFunction(({selector,target})=>Math.abs(+(document.querySelector(selector)?.dataset.handoffProgress??document.querySelector(selector)?.dataset.progress)-target)<.003,{}, {selector:subjects[pair],target}).catch(async error=>{
     console.log('Failed scrub',pair,direction,percent,await p.evaluate(selector=>({html:document.documentElement.dataset,subject:document.querySelector(selector)?.dataset,scrollY,states:[...document.querySelectorAll('[data-chapter-state]')].map(e=>[e.id,e.dataset.chapterState])}),subjects[pair]));throw error;
    });
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(percent===50){
     await wait(350);
     await input(-height*.04);await wait(350);
     await input(height*.04);
     await p.waitForFunction(({selector,target})=>Math.abs(+(document.querySelector(selector)?.dataset.handoffProgress??document.querySelector(selector)?.dataset.progress)-target)<.003,{}, {selector:subjects[pair],target});
    }
   }else await stable(ids[pair+(reverse?0:1)]);
   await p.screenshot({path:`${out}/${pair}-${direction}-${String(percent).padStart(3,'0')}.png`});last=percent;
  }
  record.push({pair,direction});
 }
 // Test wheel easing in the tall letter scene separately from chapter effects.
 for(let pair=0;pair<6;pair++){
  if(pair===1)await p.waitForFunction(()=>document.querySelector('.garden-video')?.readyState>=2&&!!document.querySelector('.envelope__pocket'));
  if(pair===2){
   await p.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false);
   await p.click('.envelope__seal');await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');
  }
  if(pair===3){
   if(await p.$eval('.letter-atelier',e=>e.dataset.open)!=='true')await p.click('.letter-open-action');
   await wait(1500);
   await p.click('.letter-open-action');await p.waitForSelector('.letter-reader');
   const outerScroll=await p.evaluate(()=>scrollY);
   await input(180);await p.keyboard.press('PageDown');await wait(350);
   assert.equal(await p.evaluate(()=>scrollY),outerScroll,'reading dialog must not scroll or advance the chapter');
   assert.equal(await p.evaluate(()=>Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff'))),false);
   await p.keyboard.press('Escape');await p.waitForSelector('.letter-reader',{hidden:true});
   await edge('letter',true);
   await p.waitForSelector('.letter-bloom-garden[data-bloomed="true"]',{timeout:20000});
   await wait(1200);
   if(!mobile){
    await edge('letter',false);
    await p.evaluate(()=>{document.querySelector('#chapter-letter').style.minHeight='160vh';window.audit.label='reading';window.audit.reading=[];window.audit.readingBase=scrollY;});
    await p.mouse.wheel({deltaY:120});
    for(let i=0;i<20;i++){await wait(25);await p.evaluate(()=>window.audit.reading.push(scrollY));}
    await p.evaluate(()=>document.querySelector('#chapter-letter').style.minHeight='');
   }
  }
  if(pair===4){for(let i=0;i<4;i++){await p.$eval(`.memory-print[data-index="${i}"]`,e=>e.click());}await wait(950);}
  await boundary(pair);await boundary(pair,true);
  await edge(ids[pair],true);
  // Scrub once back into the incoming chapter for the next boundary.
  await input(height);await stable(ids[pair+1]);
 }
 await p.screenshot({path:`${out}/finale-lit.png`});
 assert.equal(await p.$('.memory-thread'),null,'the removed gold thread must not return');
 const candle=await p.$eval('.candle-flame-wrap',e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
 if(!mobile){
  await p.mouse.move(candle.x,candle.y-100);await p.mouse.move(candle.x,candle.y+100,{steps:8});await wait(300);
  assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'false','vertical movement must not extinguish the candle');
  await p.mouse.move(candle.x-80,candle.y);await wait(220);
  await p.mouse.move(candle.x+80,candle.y,{steps:6});
 }else{
  const cdp=await p.createCDPSession();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:candle.x-70,y:candle.y}]});
  for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:candle.x-70+140*i/6,y:candle.y}]});await wait(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }
 await p.waitForSelector('.celebration-scene[data-blown="true"]');
 await p.screenshot({path:`${out}/finale-smoke.png`});await wait(1500);
 await p.screenshot({path:`${out}/finale-wish.png`});
 await p.click('.reignite-btn');assert.equal(await p.$eval('.celebration-scene',e=>e.dataset.blown),'false');
 await p.click('.candle-blow-action');await p.waitForSelector('.celebration-scene[data-blown="true"]');
 assert.deepEqual(errors,[]);
 const audit=await p.evaluate(()=>window.audit);
 if(!mobile){
  assert(audit.reading[0]>audit.readingBase&&audit.reading[0]<audit.readingBase+120,'wheel reading should advance gradually');
  assert(Math.abs(audit.reading.at(-1)-audit.readingBase-120)<1,'wheel distance must be preserved');
  assert(audit.reading.every((value,i)=>!i||value>=audit.reading[i-1]),'reading must settle without oscillation');
 }
 const summary={};
 for(const label of [...new Set(audit.frames.map(f=>f.label))]){
  const frames=audit.frames.filter(f=>f.label===label).map(f=>f.ms).sort((a,b)=>a-b);
  summary[label]={frames:frames.length,p95:+frames[Math.floor(frames.length*.95)].toFixed(1),max:+frames.at(-1).toFixed(1),over50:frames.filter(f=>f>50).length,longTasks:audit.tasks.filter(t=>t.label===label)};
 }
 await fs.writeFile(`${out}/performance.json`,JSON.stringify({summary,reading:audit.reading,readingBase:audit.readingBase,record,errors},null,2));
 console.log(out,JSON.stringify(summary));
}finally{await browser.close();}
