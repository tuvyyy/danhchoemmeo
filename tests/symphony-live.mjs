import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
const out='docs/captures/symphony-live';await fs.mkdir(out,{recursive:true});
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const p=await b.newPage();await p.setViewport({width:1440,height:900});
const resources=[];p.on('response',r=>{if(/\.(woff|glb|gltf|png|jpg|webp)/.test(r.url()))resources.push(r.url());});
await p.goto('https://symphonyofvines.unseen.co/',{waitUntil:'networkidle2',timeout:60000});
await new Promise(r=>setTimeout(r,12000));await p.screenshot({path:`${out}/idle.png`});
console.log(await p.evaluate(()=>({text:document.body.innerText.slice(0,2000),buttons:[...document.querySelectorAll('button,a')].map(e=>({text:e.textContent,cls:e.className})),canvases:[...document.querySelectorAll('canvas')].map(e=>[e.width,e.height])})));
await p.mouse.move(1000,500);await new Promise(r=>setTimeout(r,1800));await p.screenshot({path:`${out}/hover.png`});
await p.mouse.move(100,700);await new Promise(r=>setTimeout(r,1800));await p.screenshot({path:`${out}/leave.png`});
await fs.writeFile(`${out}/resources.json`,JSON.stringify(resources,null,2));
}finally{await b.close();}
