import assert from 'node:assert/strict';
import { smoothChapterScroll } from '../src/chapters/smoothChapterScroll.ts';

let time=0, id=0, reduced=false, blocked=false;
const frames=new Map(), handoffs=[], positions=[];
globalThis.scrollY=100;
globalThis.window={scrollTo:({top})=>{globalThis.scrollY=top;positions.push(top);}};
globalThis.performance={now:()=>time};
globalThis.requestAnimationFrame=callback=>{frames.set(++id,callback);return id;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
globalThis.matchMedia=()=>({matches:reduced});
const step=(duration=1000/60)=>{time+=duration;const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(time));};
const settle=()=>{for(let i=0;frames.size&&i<120;i++)step();assert.equal(frames.size,0);};
const scroll=smoothChapterScroll({bounds:()=>({top:100,bottom:500}),blocked:()=>blocked,handoff:delta=>handoffs.push(delta)});

scroll.move(120);step();assert(scrollY>100&&scrollY<220,'wheel motion starts gradually');
settle();assert.equal(scrollY,220);assert.deepEqual(handoffs,[]);
assert(positions.every((p,i)=>!i||p>=positions[i-1]),'no overshoot during reading');
scroll.move(380);step();assert.deepEqual(handoffs,[],'chapter waits for reading motion to reach the edge');
settle();assert.equal(scrollY,500);assert.deepEqual(handoffs,[100],'only unused distance advances the chapter');

scroll.move(80);scroll.move(-120);settle();assert.equal(scrollY,380);assert.deepEqual(handoffs,[100],'reversing clears pending forward travel');
for(let i=0;i<180;i++){scroll.move(i%2? -2:2);step(8.33);assert(frames.size<=1);}
settle();assert.equal(scrollY,380);

scroll.move(100);step();blocked=true;const paused=scrollY;step();assert.equal(scrollY,paused);assert.equal(frames.size,0,'dialog cancels reading inertia');
blocked=false;scrollY=200;scroll.move(40);settle();assert.equal(scrollY,240,'external navigation resets the scroll anchor');
scroll.move(50);scroll.cancel();assert.equal(frames.size,0);assert.equal(scrollY,240);
reduced=true;scroll.move(-300);assert.equal(scrollY,100);assert.equal(handoffs.at(-1),-160);assert.equal(frames.size,0);
scroll.move(NaN);scroll.move(Infinity);assert.equal(frames.size,0);
console.log('PASS: gradual reading, edge distance, rapid reversals, dialog isolation, external jumps, cancellation and reduced motion');
