import puppeteer from 'puppeteer-core';
const mobile=process.argv.includes('--mobile');
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const page=await browser.newPage();const height=mobile?844:900;
 await page.setViewport({width:mobile?390:1440,height});
 await page.goto('http://127.0.0.1:3333',{waitUntil:'networkidle2'});
 await page.waitForSelector('.cinematic-hero__cta');await wait(800);await page.click('.cinematic-hero__cta');await wait(2100);
 await page.evaluate(()=>{const s=document.querySelector('#chapter-flowers');scrollTo(0,s.offsetTop+s.offsetHeight-innerHeight);});
 await page.mouse.move(8,8);await wait(250);
 const recorder=await page.screencast({path:`docs/captures/flowers-voucher-workflow-preview${mobile?'-mobile':''}.mp4`,format:'mp4',fps:30});
 await wait(500);
 const scroll=async(amount,steps)=>{for(let i=0;i<steps;i++){await page.mouse.wheel({deltaY:height*amount/steps});await wait(75);}await wait(250);};
 await scroll(.5,16);await wait(700);
 await scroll(-.15,6);await wait(350);
 await scroll(.65,20);await wait(1000);
 await scroll(-1,30);await wait(650);
 await scroll(.2,7);await scroll(.3,8);await wait(1000);
 await scroll(.5,15);await wait(1100);
 await recorder.stop();console.log('Recorded real wheel, midpoint hold, immediate reverse, forward/reverse journey');
} finally {await browser.close();}
