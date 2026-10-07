import assert from 'node:assert/strict';
import {scrollMotionDriver} from '../src/chapters/scrollMotionDriver.ts';
function harness(reverse=false){let time=0,id=0,cleanups=0,finishes=[];let callbacks=new Map(),values=[];const clock={now:()=>time,request:cb=>{callbacks.set(++id,cb);return id;},cancel:id=>callbacks.delete(id)};const driver=scrollMotionDriver({reverse,scrollDelta:reverse?-1:1,distance:1000,clock,paint:p=>values.push(p),cleanup:()=>cleanups++,finish:p=>finishes.push(p)});const step=(dt=16.6667)=>{time+=dt;const batch=[...callbacks.values()];callbacks.clear();batch.forEach(cb=>cb(time));};return {driver,step,values,callbacks,get cleanups(){return cleanups;},finishes};}
const h=harness();h.driver.move(499);for(let i=0;i<300;i++)h.step();assert.equal(h.values.at(-1),.5);assert.equal(h.callbacks.size,0,'idle driver does not keep rendering');
for(let i=0;i<180;i++){h.driver.move(i%2? -3:3);h.step(8.33);assert(h.callbacks.size<=1,'at most one pending frame');}for(let i=0;i<300;i++)h.step();assert(Math.abs(h.values.at(-1)-.5)<.0001);assert(h.values.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
h.driver.move(9999);for(let i=0;i<300;i++)h.step();assert.deepEqual(h.finishes,[false]);h.driver.dispose();h.driver.settle();assert.equal(h.cleanups,1);assert.equal(h.finishes.length,1);
const e=harness();e.driver.move(399);for(let i=0;i<30;i++)e.step();e.driver.cancel();for(let i=0;i<300;i++)e.step();assert.deepEqual(e.finishes,[true]);
const r=harness(true);r.driver.move(-199);for(let i=0;i<300;i++)r.step();r.driver.cancel();for(let i=0;i<300;i++)r.step();assert.deepEqual(r.finishes,[false]);
const d=harness();d.driver.move(NaN);d.driver.move(Infinity);d.step(20000);assert(d.values.every(Number.isFinite));d.driver.dispose();assert.equal(d.callbacks.size,0);
const short=harness();short.driver.move(119);for(let i=0;i<8;i++)short.step();short.driver.release();for(let i=0;i<60;i++)short.step();assert(short.values.at(-1)>.2&&short.values.at(-1)<.7,'After one second the handoff is still visible');assert.equal(short.finishes.length,0,'Release does not rush through the whole scene');for(let i=0;i<300;i++)short.step();assert.deepEqual(short.finishes,[false],'A short intentional wheel gesture completes the chapter');assert.equal(short.callbacks.size,0);
const tiny=harness();tiny.driver.move(5);tiny.driver.release();for(let i=0;i<300;i++)tiny.step();assert.deepEqual(tiny.finishes,[true],'Tiny accidental motion returns to the starting chapter');
const backwards=harness(true);backwards.driver.move(-119);backwards.driver.release();for(let i=0;i<300;i++)backwards.step();assert.deepEqual(backwards.finishes,[true],'A short reverse gesture reaches the previous chapter');
const turn=harness();turn.driver.move(399);for(let i=0;i<8;i++)turn.step();turn.driver.move(-80);turn.driver.release();for(let i=0;i<300;i++)turn.step();assert.deepEqual(turn.finishes,[true],'Deliberately reversing before release returns to the outgoing chapter');
const noise=harness();noise.driver.move(119);noise.driver.move(-2);noise.driver.release();for(let i=0;i<300;i++)noise.step();assert.deepEqual(noise.finishes,[false],'Small trackpad direction noise does not cancel an intentional gesture');
const paced=harness();paced.driver.move(99999);for(let i=0;i<60;i++)paced.step();assert(paced.values.at(-1)<=.501,'A huge wheel delta respects the half-chapter-per-second speed limit');assert.equal(paced.finishes.length,0);paced.driver.move(-99999);paced.driver.release();for(let i=0;i<300;i++)paced.step();assert.deepEqual(paced.finishes,[true],'Speed-limited motion still reverses and settles');
console.log('PASS: 180 reversals, one frame loop, idle sleep, bounded progress, endpoint once, Escape both directions, suspended frames and disposal');
{
 let time=0,id=0;const callbacks=new Map(),values=[],finishes=[];
 const clock={now:()=>time,request:cb=>{callbacks.set(++id,cb);return id;},cancel:id=>callbacks.delete(id)};
 const driver=scrollMotionDriver({reverse:false,scrollDelta:20,distance:1000,commitOnIntent:true,clock,paint:p=>values.push(p),cleanup:()=>{},finish:v=>finishes.push(v)});
 const step=()=>{time+=1000/60;const pending=[...callbacks.values()];callbacks.clear();pending.forEach(cb=>cb(time));};
 for(let i=0;i<60;i++)step();
 assert(values.at(-1)>.4&&values.at(-1)<=.501,'A 20px wheel begins the whole handoff immediately, without release and with the same speed cap');
 const beforeNoise=values.at(-1);driver.move(-2);for(let i=0;i<4;i++)step();assert(values.at(-1)>beforeNoise,'Tiny reversal noise does not restart arrival');
 driver.move(-20);for(let i=0;i<300;i++)step();assert.deepEqual(finishes,[true],'A deliberate small reverse remains responsive during the committed handoff');
 assert.equal(callbacks.size,0);
 console.log('PASS small voucher intent: starts without idle release, unchanged pacing, direction noise and deliberate reversal');
}
