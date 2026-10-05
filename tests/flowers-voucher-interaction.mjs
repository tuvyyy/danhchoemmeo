import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 for(const [name,width,height,reduced] of (process.argv.includes('--cold') ? [] : [['desktop',1440,900,false],['mobile',390,844,false],['reduced',390,844,true]])) {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]);
  await page.goto('http://127.0.0.1:3333',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.cinematic-hero__cta');await wait(800);await page.click('.cinematic-hero__cta');await wait(1900);
  await page.evaluate(()=>document.querySelector('#chapter-flowers').scrollIntoView({behavior:'instant'}));await wait(200);
  const gap=await page.$eval('#chapter-flowers',e=>e.getBoundingClientRect().bottom-innerHeight);
  if(gap>10) {
   const start=await page.evaluate(()=>scrollY);await page.mouse.wheel({deltaY:Math.min(40,gap/2)});await wait(180);
   assert(await page.evaluate(()=>scrollY)>start,'Native inner-chapter scroll remains usable');
  }
  await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});await wait(150);
  await page.mouse.wheel({deltaY:120});
  if(!reduced) {
   await page.waitForSelector('html[data-flowers-voucher-handoff]');await wait(350);
   assert.equal(await page.$('.memory-flow__dock'),null,'The workflow dock is removed');
   await page.mouse.wheel({deltaY:height});
  }
  await page.waitForFunction(()=>!document.querySelector('.envelope__seal').disabled);
  await wait(120);
  assert.equal(await page.$eval('.chapter-envelope-scene',e=>e.dataset.state),'closed');
  assert(Math.abs(await page.$eval('#chapter-wallet',e=>e.getBoundingClientRect().top))<2);
  await page.click('.envelope__seal');
  try {await page.waitForSelector('.chapter-envelope-scene[data-state="open"]',{timeout:7000});}
  catch(error) {await page.screenshot({path:'docs/captures/workflow-interaction-error.png'});console.log(await page.evaluate(()=>{const s=document.querySelector('.envelope__seal'),r=s.getBoundingClientRect();return {scene:document.querySelector('.chapter-envelope-scene').dataset,transition:document.documentElement.dataset.flowersVoucherHandoff,seal:s.disabled,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,600),scrollY};}));console.log(errors);throw error;}

  for(const id of ['food','coffee','movie','anywhere']) {
   await page.$eval(`[data-voucher="${id}"]`,e=>e.scrollIntoView({behavior:'instant',block:'nearest',inline:'center'}));
   // Find an exposed point on the actual paper hit target (tickets overlap).
   const point=await page.$eval(`[data-voucher="${id}"]`,e=>{const r=e.getBoundingClientRect();for(let y=.12;y<.75;y+=.1)for(let x=.12;x<.95;x+=.1){const px=r.x+r.width*x,py=r.y+r.height*y;if(document.elementFromPoint(px,py)===e)return {x:px,y:py};}return null;});
   assert(point,`${id} is tappable`);await page.mouse.click(point.x,point.y);
   await page.waitForSelector('.ticket-inspection');await wait(550);
   await page.keyboard.press('Escape');await page.waitForSelector('.ticket-inspection',{hidden:true});
  }
  await page.evaluate(()=>document.querySelector('#chapter-wallet').scrollIntoView({behavior:'instant'}));await wait(120);
  if(name==='mobile') {
   const cdp=await page.createCDPSession();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:250}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:370}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await cdp.detach();
  } else await page.mouse.wheel({deltaY:-120});
  if(!reduced) {
   await wait(350);const reverse=await page.$eval('.nature-bloom',e=>+e.dataset.handoffProgress);assert(reverse>.7&&reverse<1,'Reverse gesture scrubs, rather than autoplaying');
   await page.mouse.wheel({deltaY:-height});
  }
  await wait(900);
  assert(Math.abs(await page.$eval('#chapter-flowers',e=>e.getBoundingClientRect().bottom-innerHeight))<2,'Reverse returns to garden boundary');
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.flowersVoucherHandoff),undefined);
  assert.equal(await page.$eval('[data-journey-ui]',e=>getComputedStyle(e).visibility),'visible');
  if(!reduced) {
   await page.keyboard.press('ArrowDown');await wait(300);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.flowersVoucherHandoff),'forward');
   await page.keyboard.press('Escape');await wait(900);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.flowersVoucherHandoff),undefined,'Escape returns to the starting scene');
  }
  await page.mouse.wheel({deltaY:120});
  if(!reduced){await wait(300);await page.mouse.wheel({deltaY:height});}
  await page.waitForFunction(()=>!document.querySelector('.envelope__seal').disabled);
  assert.equal(await page.$eval('.chapter-envelope-scene',e=>e.dataset.state),'closed','Round trip retains a usable closed seal');
  if(name==='desktop') {
   await page.mouse.wheel({deltaY:-180});await wait(350);
   await page.setViewport({width:1024,height:768});await wait(350);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.flowersVoucherHandoff),undefined,'Resize releases held geometry');
   assert(Math.abs(await page.$eval('#chapter-wallet',e=>e.getBoundingClientRect().top))<2,'Resize settles at the nearer scene');
   assert.notEqual(await page.$eval('[data-chapter-content="wallet"]',e=>getComputedStyle(e).position),'fixed');
  }
  assert.deepEqual(errors,[]);console.log(`${name}: PASS native scroll, partial wheel, removed dock, keyboard, Escape, seal, four inspections, touch reverse, repeat, UI restoration`);await page.close();
 }
 const cold=await browser.newPage();
 await cold.setViewport({width:1440,height:900});
 await cold.setRequestInterception(true);
 const held=[];let released=false;
 cold.on('request',r=>{if(r.url().includes('/assets/envelope-voucher/')&&!released)held.push(r);else void r.continue();});
 await cold.goto('http://127.0.0.1:3333',{waitUntil:'domcontentloaded'});
 await cold.waitForSelector('.cinematic-hero__cta');await wait(800);await cold.click('.cinematic-hero__cta');await wait(1900);
 await cold.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);document.querySelector('.nature-bloom__footer button').click();});
 await wait(600);
 assert.equal(await cold.$eval('.chapter-envelope-scene',e=>e.dataset.ready),'false');
 assert.equal(await cold.$eval('[data-chapter-content="flowers"]',e=>getComputedStyle(e).opacity),'1','Garden holds while envelope assets load');
 assert(Math.abs(await cold.$eval('#chapter-flowers',e=>e.getBoundingClientRect().bottom-innerHeight))<2);
 released=true;await Promise.all(held.map(r=>r.continue()));
 try { await cold.waitForFunction(()=>document.querySelector('.envelope__seal') && !document.querySelector('.envelope__seal').disabled,{timeout:12000}); }
 catch(e) { console.log(await cold.evaluate(()=>({scene:document.querySelector('.chapter-envelope-scene').outerHTML.slice(0,350),chapter:document.querySelector('#chapter-wallet').dataset,flower:document.querySelector('#chapter-flowers').dataset,transition:document.documentElement.dataset.flowersVoucherHandoff,scrollY,seal:document.querySelector('.envelope__seal')?.outerHTML.slice(0,300)})));throw e; }
 console.log('cold cache: PASS garden holds until the envelope is ready');await cold.close();
} finally {await browser.close();}
