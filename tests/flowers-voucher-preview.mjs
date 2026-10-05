import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const page=await browser.newPage();
 await page.setViewport({width:1440,height:900});
 await page.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});
 await page.waitForSelector('.cinematic-hero__cta');await wait(800);await page.click('.cinematic-hero__cta');await wait(1900);
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});
 await page.mouse.move(10,10);await wait(250);
 const recorder=await page.screencast({path:'docs/captures/flowers-voucher-refined-preview.mp4',format:'mp4',fps:30});
 await wait(900);
 await page.evaluate(()=>document.querySelector('.nature-bloom__footer button').click());
 await wait(1500);
 await page.mouse.wheel({deltaY:-120});
 await wait(1500);
 await page.mouse.wheel({deltaY:120});
 await wait(1500);
 await recorder.stop();
 console.log('Recorded live forward / reverse / forward handoffs');
} finally {await browser.close();}
