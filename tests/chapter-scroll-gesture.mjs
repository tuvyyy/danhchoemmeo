import assert from 'node:assert/strict';
import { chapterScrollGesture } from '../src/chapters/chapterScrollGesture.ts';
let time=0,id=0,releases=0;const timers=new Map();
const gesture=chapterScrollGesture(()=>releases++,{
 now:()=>time,schedule:(callback,delay)=>{timers.set(++id,{callback,at:time+delay});return id;},cancel:id=>timers.delete(id),
});
const step=duration=>{time+=duration;for(const [id,timer] of [...timers])if(timer.at<=time){timers.delete(id);timer.callback();}};
assert(gesture.input('wheel'));step(100);assert.equal(releases,0);
assert(gesture.input('wheel'));step(139);assert.equal(releases,0);step(1);assert.equal(releases,1,'Release follows the last input, not the first');
gesture.landed();assert.equal(gesture.input('wheel'),false,'The same gesture cannot continue into another chapter');
step(30);assert.equal(gesture.input('wheel'),false,'Trackpad momentum is consumed after landing');
step(200);assert(gesture.input('wheel'),'A fresh gesture works after the pause');
gesture.startTouch();assert(gesture.input('touch'));step(219);assert.equal(releases,2,'Touch waits while the finger is moving');
gesture.landed();assert.equal(gesture.input('touch'),false);gesture.end();assert.equal(releases,3);
gesture.startTouch();assert(gesture.input('touch'));gesture.end();assert.equal(releases,4,'A new touch gesture starts immediately');
gesture.startTouch();assert(gesture.input('touch'));step(1000);assert.equal(releases,4,'A stationary finger keeps ownership until pointer up/cancel');gesture.end();assert.equal(releases,5);
gesture.landed();assert.equal(gesture.input('key',true),false,'A held key cannot overrun the next chapter');assert(gesture.input('key',false),'A new key press works');
gesture.cancel();step(1000);assert.equal(releases,5,'Unmount and Escape clear pending timers');
gesture.settleIfReleased();assert.equal(releases,5);gesture.end();gesture.settleIfReleased();assert.equal(releases,7,'Delayed reading handoff can settle after the input has ended');
gesture.input('wheel',false,10000);gesture.landed();step(500);assert.equal(gesture.input('wheel',false,10025),false,'A queued packet remains part of the old gesture after a slow frame');assert(gesture.input('wheel',false,10300),'A real pause in the event timestamps starts a new gesture');gesture.cancel();
console.log('PASS gesture idle release, one chapter per wheel/touch/key gesture, momentum tails, fresh gestures and cleanup');
