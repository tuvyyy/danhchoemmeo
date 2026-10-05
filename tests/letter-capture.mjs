import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
const mobile=process.argv.includes('--mobile'),label=process.argv[2]||'before';
const out=`docs/captures/letter-${label}${mobile?'-mobile':''}`;await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const page=await browser.newPage();await page.setViewport({width:mobile?390:1440,height:mobile?844:900});
 await page.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});await page.waitForSelector('.cinematic-hero__cta');await wait(800);await page.click('.cinematic-hero__cta');await wait(2100);
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);document.querySelector('.nature-bloom__footer button').click();});
 await page.waitForFunction(()=>!document.querySelector('.envelope__seal').disabled);await wait(300);await page.click('.envelope__seal');await page.waitForSelector('.chapter-envelope-scene[data-state="open"]');await wait(200);
 await page.screenshot({path:`${out}/voucher-open.png`});await page.click('.scene-next');await wait(2200);
 await page.screenshot({path:`${out}/letter-closed.png`});
}finally {await browser.close();}
