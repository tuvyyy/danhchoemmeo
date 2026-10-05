import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
const out='docs/captures/estate-first';await fs.mkdir(out,{recursive:true});
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const mobile of [false,true]){
 const p=await b.newPage();await p.setViewport({width:mobile?390:1440,height:mobile?844:900,isMobile:mobile,hasTouch:mobile});p.on('pageerror',e=>console.log('ERROR',e.message));
 await p.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await p.waitForSelector('.gallery-loader',{hidden:true});await new Promise(r=>setTimeout(r,400));
 await p.screenshot({path:`${out}/${mobile?'mobile':'desktop'}-closed.png`});
 if(!mobile){const r=await p.$eval('.garden-gate__hit',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width*.5,y:Math.min(innerHeight-100,r.y+r.height*.35)}});await p.mouse.move(r.x,r.y);}else await p.tap('.garden-gate__hit');
 await new Promise(r=>setTimeout(r,1700));await p.screenshot({path:`${out}/${mobile?'mobile':'desktop'}-open.png`});
 console.log(mobile,await p.$eval('.garden-gate',e=>({open:e.dataset.open,amount:getComputedStyle(e).getPropertyValue('--gate-open')})));
 await p.close();
}}finally{await b.close();}
