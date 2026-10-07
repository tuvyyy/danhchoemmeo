import assert from 'node:assert/strict';
import { chapterScrollGesture } from '../src/chapters/chapterScrollGesture.ts';
let time=0,id=0,releases=0;const timers=new Map();
const gesture=chapterScrollGesture(()=>releases++,{
 now:()=>time,schedule:(callback,delay)=>{timers.set(++id,{callback,at:time+delay});return id;},cancel:id=>timers.delete(id),
});
const step=duration=>{time+=duration;for(const [id,timer] of [...timers])if(timer.at<=time){timers.delete(id);timer.callback();}};
assert(gesture.input('wheel'));step(100);assert.equal(releases,0);
assert(gesture.input('wheel'));step(139);assert.equal(releases,0);step(1);assert.equal(releases,1,'Release follows the last input, not the first');
gesture.landed();assert(gesture.input('wheel'),'Reading accepts input immediately after landing');assert.equal(gesture.canHandoff(),false,'A momentum tail cannot start another transition');
step(30);assert(gesture.input('wheel'));assert.equal(gesture.canHandoff(),false);
step(200);assert(gesture.input('wheel'),'A fresh gesture works after the pause');
gesture.startTouch();assert(gesture.input('touch'));step(219);assert.equal(releases,2,'Touch waits while the finger is moving');
gesture.landed();assert(gesture.input('touch'),'The finger can keep reading after landing');assert.equal(gesture.canHandoff(),false);gesture.end();assert.equal(releases,3);
gesture.startTouch();assert(gesture.input('touch'));gesture.end();assert.equal(releases,4,'A new touch gesture starts immediately');
gesture.startTouch();assert(gesture.input('touch'));step(1000);assert.equal(releases,4,'A stationary finger keeps ownership until pointer up/cancel');gesture.end();assert.equal(releases,5);
gesture.landed();assert.equal(gesture.input('key',true),false,'A held key cannot overrun the next chapter');assert(gesture.input('key',false),'A new key press works');
gesture.cancel();step(1000);assert.equal(releases,5,'Unmount and Escape clear pending timers');
gesture.settleIfReleased();assert.equal(releases,5);gesture.end();gesture.settleIfReleased();assert.equal(releases,7,'Delayed reading handoff can settle after the input has ended');
gesture.input('wheel',false,10000,80);gesture.landed();step(500);assert(gesture.input('wheel',false,10025,60));assert.equal(gesture.canHandoff(),false,'A queued falling packet remains a tail after a slow frame');assert(gesture.input('wheel',false,10300,40));assert(gesture.canHandoff(),'A real pause in event timestamps starts a new gesture');
gesture.landed();
for(let i=0;i<3;i++){assert(gesture.input('wheel',false,10335+i*35,40));if(i<2)assert.equal(gesture.canHandoff(),false);}
assert(gesture.canHandoff(),'Steady continued scrolling works without an artificial pause');
gesture.landed();
for(const [i,delta] of [30,20,10,5,2].entries()){assert(gesture.input('wheel',false,10450+i*35,delta));assert.equal(gesture.canHandoff(),false,'A decaying tail reads without skipping the next chapter');}
gesture.startTouch();assert(gesture.canHandoff());gesture.cancel();
time=20000;gesture.input('wheel',false,20000,40);time=22500;gesture.landed();
for(let i=1;i<=12;i++){assert(gesture.input('wheel',false,20000+i*35,40));assert.equal(gesture.canHandoff(),false,'Packets generated before arrival cannot chain a transition even if delivered late');}
for(let i=0;i<3;i++)gesture.input('wheel',false,22535+i*35,40);
assert(gesture.canHandoff(),'Actual input after arrival resumes without waiting for a gap');gesture.cancel();
console.log('PASS immediate reading after landing, continued wheel intent, decaying tails, touch ownership, held keys, timestamps and cleanup');
