import assert from 'node:assert/strict';
import {scrollMotionDriver} from '../src/chapters/scrollMotionDriver.ts';
function harness(reverse=false){let time=0,id=0,cleanups=0,finishes=[];let callbacks=new Map(),values=[];const clock={now:()=>time,request:cb=>{callbacks.set(++id,cb);return id;},cancel:id=>callbacks.delete(id)};const driver=scrollMotionDriver({reverse,scrollDelta:reverse?-1:1,distance:1000,clock,paint:p=>values.push(p),cleanup:()=>cleanups++,finish:p=>finishes.push(p)});const step=(dt=16.6667)=>{time+=dt;const batch=[...callbacks.values()];callbacks.clear();batch.forEach(cb=>cb(time));};return {driver,step,values,callbacks,get cleanups(){return cleanups;},finishes};}
const h=harness();h.driver.move(499);for(let i=0;i<100;i++)h.step();assert.equal(h.values.at(-1),.5);assert.equal(h.callbacks.size,0,'idle driver does not keep rendering');
for(let i=0;i<180;i++){h.driver.move(i%2? -3:3);h.step(8.33);assert(h.callbacks.size<=1,'at most one pending frame');}for(let i=0;i<100;i++)h.step();assert(Math.abs(h.values.at(-1)-.5)<.0001);assert(h.values.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
h.driver.move(9999);for(let i=0;i<100;i++)h.step();assert.deepEqual(h.finishes,[false]);h.driver.dispose();h.driver.settle();assert.equal(h.cleanups,1);assert.equal(h.finishes.length,1);
const e=harness();e.driver.move(399);for(let i=0;i<30;i++)e.step();e.driver.cancel();for(let i=0;i<100;i++)e.step();assert.deepEqual(e.finishes,[true]);
const r=harness(true);r.driver.move(-199);for(let i=0;i<100;i++)r.step();r.driver.cancel();for(let i=0;i<100;i++)r.step();assert.deepEqual(r.finishes,[false]);
const d=harness();d.driver.move(NaN);d.driver.move(Infinity);d.step(20000);assert(d.values.every(Number.isFinite));d.driver.dispose();assert.equal(d.callbacks.size,0);
console.log('PASS: 180 reversals, one frame loop, idle sleep, bounded progress, endpoint once, Escape both directions, suspended frames and disposal');
