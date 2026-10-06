import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const mobile=process.argv.includes('--mobile'),reduced=process.argv.includes('--reduced');
const height=mobile?844:900,ids=['hero','flowers','wallet','letter','moments','anniversary','finale'];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await browser.newPage(),errors=[],landings=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.setViewport({width:mobile?390:1440,height,isMobile:mobile,hasTouch:mobile});
 if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await p.evaluateOnNewDocument(()=>{
  window.audit={label:'boot',frames:[],tasks:[],samples:[],touches:[]};
  for(const type of ['touchstart','touchmove','touchend','touchcancel'])window.addEventListener(type,event=>{window.audit.touches.push({type,y:event.touches[0]?.clientY,cancelable:event.cancelable,target:event.target.tagName,label:window.audit.label,scrollY});if(window.audit.touches.length>30)window.audit.touches.shift();},{capture:true,passive:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.audit.tasks.push({label:window.audit.label,ms:e.duration});}).observe({type:'longtask',buffered:true});
  let last=0;const sampled=new Set();const tick=time=>{
   if(last)window.audit.frames.push({label:window.audit.label,ms:time-last});last=time;
   const subject=document.querySelector('[data-handoff-progress]'),progress=+(subject?.dataset.handoffProgress??-1),label=window.audit.label;
   if(progress>=.4&&progress<=.7&&!sampled.has(label)&&label!=='idle'){
    sampled.add(label);const paper=document.querySelector('.letter-keepsake'),page=document.querySelector('[data-chapter-content="wallet"]'),fragments=document.querySelector('.letter-fragments');
    const vines=[...document.querySelectorAll('.letter-vines__strand')].filter(e=>e.offsetHeight>0).map(e=>({offset:new DOMMatrix(getComputedStyle(e).transform).m42/e.offsetHeight,opacity:+getComputedStyle(e).opacity}));
    window.audit.samples.push({label,progress,vines,paperDepth:paper?new DOMMatrix(getComputedStyle(paper).transform).m13:0,pageDepth:page?new DOMMatrix(getComputedStyle(page).transform).m13:0,fragments:fragments?{ready:fragments.dataset.ready,count:+fragments.dataset.count,flying:+fragments.dataset.flying}:null});
   }
   requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
 });
 await p.goto(process.env.JOURNEY_URL||'http://127.0.0.1:3334',{waitUntil:'networkidle2'});
 await p.waitForSelector('.gallery-loader',{hidden:true});await p.click('.garden-gate__enter');await p.waitForSelector('.entrance-gate',{hidden:true});
 const click=selector=>p.$eval(selector,e=>e.click());
 const stable=id=>p.waitForFunction(id=>['active','completing'].includes(document.querySelector(`#chapter-${id}`)?.dataset.chapterState)&&!Object.keys(document.documentElement.dataset).some(k=>k.endsWith('Handoff')),{timeout:5000},id);
 const edge=async(id,end)=>{await p.evaluate(({id,end})=>{const s=document.querySelector(`#chapter-${id}`);scrollTo({top:s.offsetTop+(end?Math.max(0,s.offsetHeight-innerHeight):0),behavior:'instant'});},{id,end});await wait(230);};
 const input=async delta=>{
  if(!mobile)return p.mouse.wheel({deltaY:delta});
  const cdp=await p.createCDPSession(),start=delta>0?height-150:150;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:start}]});
  for(let i=1;i<=5;i++){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:start-delta*i/5}]});
   if(i===1&&await p.evaluate(()=>window.audit.label==='1-forward')){
    await p.evaluate(()=>{window.audit.caption=document.querySelector('.nature-bloom__message p');window.audit.captionEm=window.audit.caption.querySelector('em');const video=document.querySelector('.garden-video');video.currentTime=video.duration*.99;video.dispatchEvent(new Event('timeupdate'));});
    await wait(25);
    assert(await p.evaluate(()=>window.audit.caption===document.querySelector('.nature-bloom__message p')&&window.audit.captionEm===document.querySelector('.nature-bloom__message p em')),'Changing video captions preserves the active touch target');
    await p.evaluate(()=>{delete window.audit.caption;delete window.audit.captionEm;});
   }
   await wait(20);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 };
 const landing=async(pair,reverse=false,burst=false)=>{
  const source=pair+(reverse?1:0),destination=pair+(reverse?0:1),direction=reverse?-1:1;
  await edge(ids[source],!reverse);
  const label=`${pair}-${reverse?'reverse':'forward'}`;
  await p.evaluate(label=>window.audit.label=label,label);const began=Date.now();
  await input(direction*(mobile?90:120));
  if(burst){
   const cdp=await p.createCDPSession(),packets=[];
   for(let i=0;i<40;i++){packets.push(cdp.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:70,y:100,deltaY:direction*120,deltaX:0,timestamp:Date.now()/1000}));await wait(25);}
   await Promise.all(packets);await cdp.detach();
  }
  await stable(ids[destination]).catch(async error=>{console.log('Failed landing',label,JSON.stringify(await p.evaluate(()=>({scrollY,html:{...document.documentElement.dataset},chapters:[...document.querySelectorAll('[data-chapter-state]')].map(e=>[e.id,e.dataset.chapterState]),progress:[...document.querySelectorAll('[data-handoff-progress]')].map(e=>[e.className,e.dataset.handoffProgress]),touches:window.audit.touches}))));throw error;});
  const endpoint=await p.$eval(`#chapter-${ids[destination]}`,e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom};});
  assert(Math.abs(reverse&&pair!==0?endpoint.bottom-height:endpoint.top)<2,'Arrival lands on the exact chapter edge');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await p.$('.garden-video-fold,.letter-fragments,.chapter-page-turn-shade'),null,'Temporary transition layers are released');
  assert.equal(await p.evaluate(()=>document.querySelector('.letter-vines')?.dataset.visible??'false'),String(destination===3),'Vine visibility settles correctly when entering or leaving chapter three');
  assert.equal(await p.$eval(`[data-chapter-content="${ids[destination]}"]`,e=>getComputedStyle(e).position),'relative','Native document geometry is restored');
  const elapsed=Date.now()-began;
  if(!reduced)assert(elapsed>=1800,'The full chapter handoff gives the viewer time to see its choreography');
  landings.push({label,ms:elapsed,burst,endpoint});
  await p.evaluate(()=>window.audit.label='idle');
 };
 await edge('hero',true);
 if(!mobile&&!reduced){await input(3);await wait(1000);await stable('hero');}
 for(let pair=0;pair<6;pair++){
  if(pair===2){await p.waitForFunction(()=>document.querySelector('.envelope__seal')?.disabled===false);await p.click('.envelope__seal');await p.waitForSelector('.chapter-envelope-scene[data-state="open"]');}
  if(pair===3){
   await p.click('.letter-page__read');await p.waitForSelector('.letter-reader');const before=await p.evaluate(()=>scrollY);
   await input(180);await p.keyboard.press('PageDown');await wait(250);assert.equal(await p.evaluate(()=>scrollY),before,'Reading dialog isolates chapter scrolling');
   await p.keyboard.press('Escape');await p.waitForSelector('.letter-reader',{hidden:true});
   await edge('letter',true);await p.waitForSelector('.letter-bloom-garden[data-bloomed="true"]',{timeout:20000});await wait(1400);
  }
  if(pair===4){for(let i=0;i<4;i++)await click(`.memory-print[data-index="${i}"]`);await wait(950);}
  if(pair===2&&!mobile&&!reduced){
   await edge('wallet',true);await input(120);await wait(35);await input(-90);await stable('wallet');
   await edge('wallet',true);await input(120);await wait(35);await p.keyboard.press('Escape');await stable('wallet');
  }
  if(pair===4&&!mobile&&!reduced){
   await edge('moments',true);await input(height*.65);await p.waitForFunction(()=>+document.querySelector('.together-scene').dataset.handoffProgress>.55);
   await p.setViewport({width:1200,height:height-40});await stable('anniversary');
   await p.setViewport({width:1440,height});await landing(4,true);
  }
  if(pair===5){for(let i=0;i<3;i++){await click(`.together-station:nth-child(${i+1})`);assert.equal(await p.$eval('.together-scene',e=>e.dataset.milestone),String(i));}}
  await landing(pair,false,pair===2&&!mobile);
  if(pair===2&&!mobile&&!reduced){await edge('letter',false);await input(-120);await wait(35);await p.keyboard.press('Escape');await stable('letter');}
  await landing(pair,true);
  if(pair===5)assert.equal(await p.$eval('.together-scene',e=>e.dataset.milestone),'2','Anniversary selection survives a chapter round trip');
  await landing(pair);
 }
 assert.deepEqual(errors,[]);
 const audit=await p.evaluate(()=>window.audit),summary={};
 if(!reduced){
  const turns=audit.samples.filter(s=>s.label.startsWith('2-'));assert(turns.length>=2);assert(turns.every(s=>Math.abs(s.paperDepth)<.0001&&Math.abs(s.pageDepth)>.01),'The chapter turns as a page while the letter stays flat');
  assert(turns.every(s=>s.vines.some(v=>v.offset> -1.05&&v.offset< -.001&&v.opacity>0)),'Vines fall during the page turn and retract during reverse scrolling');
  const vineReturns=audit.samples.filter(s=>s.label==='3-reverse');
  assert(vineReturns.length&&vineReturns.every(s=>s.vines.some(v=>v.offset> -1.05&&v.offset< -.001&&v.opacity>0)),'Returning from chapter four drops the vines again');
  assert(audit.samples.some(s=>s.label==='3-forward'&&s.fragments?.count>100&&s.fragments.flying>50),'The dissolve still uses individual flying fragments');
 }
 for(const label of new Set(landings.map(l=>l.label))){const frames=audit.frames.filter(f=>f.label===label).map(f=>f.ms).sort((a,b)=>a-b);summary[label]={frames:frames.length,p95Ms:+(frames[Math.floor(frames.length*.95)]||0).toFixed(1),maxMs:+(frames.at(-1)||0).toFixed(1),over50:frames.filter(f=>f>50).length,longTasks:audit.tasks.filter(t=>t.label===label)};}
 const out=`docs/captures/scroll-settle${mobile?'-mobile':''}${reduced?'-reduced':''}`;await fs.mkdir(out,{recursive:true});await fs.writeFile(`${out}/performance.json`,JSON.stringify({landings,summary,samples:audit.samples,errors},null,2));
 console.log(`PASS ${mobile?'touch':'wheel'} ${reduced?'reduced motion':''}: all six boundaries settle forward/reverse, exact edges, no momentum overrun, reader isolation, layers cleaned`);
 console.log(JSON.stringify(summary));
}finally{await browser.close();}
