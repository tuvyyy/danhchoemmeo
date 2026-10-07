import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { TOTAL_CHAPTERS } from "./chapterRegistry";
import type { ChapterFlowContextValue, ChapterLifecycleState } from "./types";
import { flowersVoucherHandoff } from "./flowersVoucherHandoff";
import { voucherLetterHandoff } from "./voucherLetterHandoff";
import { letterWishHandoff } from "./letterWishHandoff";
import { wishAnniversaryHandoff } from "./wishAnniversaryHandoff";
import { heroGardenHandoff } from "./heroGardenHandoff";
import { smoothChapterScroll } from "./smoothChapterScroll";
import { chapterScrollGesture } from "./chapterScrollGesture";
import { chapterScrollRequirement } from "./chapterScrollRequirement";

type Driver = { move:(delta:number)=>void; release?:()=>void; cancel:()=>void; settle:()=>void; dispose:()=>void };
const ChapterFlowContext = createContext<ChapterFlowContextValue | null>(null);
export function ChapterFlowProvider({children}:{children:ReactNode}) {
 const [unlockedThrough,setUnlockedThrough]=useState(0);
 const [currentChapter,setCurrentChapter]=useState(0);
 const [completedChapters,setCompletedChapters]=useState<Set<number>>(new Set());
 const [isTransitioning,setIsTransitioning]=useState(false);
 const busy=useRef(false),destination=useRef<number|null>(null),current=useRef(0),unlocked=useRef(0);
 const driver=useRef<Driver|null>(null);
 const gesture=useRef<ReturnType<typeof chapterScrollGesture>|null>(null);
 const cancelReadingScroll=useRef<(()=>void)|null>(null);
 const stageRefs=useRef<(HTMLElement|null)[]>([]),contentRefs=useRef<(HTMLElement|null)[]>([]);
 current.current=currentChapter;unlocked.current=unlockedThrough;
 const registerStageRef=useCallback((i:number,el:HTMLElement|null)=>{stageRefs.current[i]=el;},[]);
 const registerContentRef=useCallback((i:number,el:HTMLElement|null)=>{contentRefs.current[i]=el;},[]);
 const isUnlocked=useCallback((i:number)=>i<=unlockedThrough,[unlockedThrough]);
 const isCompleted=useCallback((i:number)=>completedChapters.has(i),[completedChapters]);
 const getChapterState=useCallback((i:number):ChapterLifecycleState=>{
  if(i>unlockedThrough)return "locked";
  if(busy.current){if(i===currentChapter)return "leaving";if(i===destination.current)return "entering";}
  if(i===currentChapter)return completedChapters.has(i)?"completing":"active";
  return i<currentChapter?"completed":"ready";
 },[currentChapter,unlockedThrough,completedChapters]);
 const executeTransition=useCallback((targetIndex:number,options?:{instant?:boolean;scrollDelta?:number})=>{
  const from=current.current;if(busy.current||targetIndex===from||targetIndex<0||targetIndex>=TOTAL_CHAPTERS)return;
  cancelReadingScroll.current?.();
  busy.current=true;destination.current=targetIndex;
  flushSync(()=>{setIsTransitioning(true);setUnlockedThrough(n=>Math.max(n,targetIndex));if(targetIndex>from)setCompletedChapters(s=>new Set(s).add(from));});
  const reverse=targetIndex<from,pair=Math.min(from,targetIndex);
  const adjacent=Math.abs(from-targetIndex)===1;
  const outgoing=stageRefs.current[from],incoming=stageRefs.current[targetIndex];
  const finish=(atPrevious=reverse)=>{
   const index=adjacent?(atPrevious?pair:pair+1):targetIndex;
   const stage=stageRefs.current[index];driver.current=null;
   gesture.current?.landed();
   if(stage)window.scrollTo({top:index===pair&&(pair===1||pair>=3)?stage.offsetTop+Math.max(0,stage.offsetHeight-innerHeight):stage.offsetTop,behavior:"instant"});
   current.current=index;setCurrentChapter(index);stage?.focus({preventScroll:true});busy.current=false;destination.current=null;setIsTransitioning(false);
  };
  if(!outgoing||!incoming){finish();return;}
  if(options?.instant||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
  const a=stageRefs.current[pair]!,b=stageRefs.current[pair+1]!;
  const ac=contentRefs.current[pair]!,bc=contentRefs.current[pair+1]!;
  const common={reverse,scrollDelta:options?.scrollDelta,finish};
  if(adjacent&&pair===0){driver.current=heroGardenHandoff({hero:a,garden:b,heroContent:ac,gardenContent:bc,...common});return;}
  if(adjacent&&pair===1){
   driver.current=flowersVoucherHandoff({flowers:a,voucher:b,gardenContent:ac,voucherContent:bc,...common});return;
  }
  if(adjacent&&pair===2){driver.current=voucherLetterHandoff({voucher:a,letter:b,voucherContent:ac,letterContent:bc,...common});return;}
  if(adjacent&&pair===3){driver.current=letterWishHandoff({letter:a,wish:b,letterContent:ac,wishContent:bc,...common});return;}
  if(adjacent&&pair===4){driver.current=wishAnniversaryHandoff({wish:a,anniversary:b,wishContent:ac,anniversaryContent:bc,...common});return;}
  // Native chapter geometry stays in place while the opening scene travels.
  const position={y:scrollY};const target=incoming.offsetTop;
  const tween=gsap.to(position,{y:target,duration:.9,ease:"power2.inOut",onUpdate:()=>scrollTo(0,position.y),onComplete:()=>finish()});
  driver.current={move:()=>{},cancel:()=>{tween.kill();scrollTo(0,outgoing.offsetTop);current.current=from;setCurrentChapter(from);busy.current=false;setIsTransitioning(false);driver.current=null;},settle:()=>{tween.kill();finish();},dispose:()=>{tween.kill();}};
 },[]);
 const advance=useCallback((from:number,options?:{instant?:boolean})=>{if(from===current.current)executeTransition(from+1,options);},[executeTransition]);
 const goTo=useCallback((index:number)=>{if(index<=unlocked.current)executeTransition(index);},[executeTransition]);
 useEffect(()=>{
  let width=innerWidth,height=innerHeight;
  const resize=()=>{
   const significant=Math.abs(innerWidth-width)>2||Math.abs(innerHeight-height)>(matchMedia('(pointer:coarse)').matches?140:2);
   if(significant){cancelReadingScroll.current?.();driver.current?.settle();width=innerWidth;height=innerHeight;}
  };
  window.addEventListener('resize',resize);return()=>{window.removeEventListener('resize',resize);driver.current?.dispose();};
 },[]);
 useEffect(()=>{
  let touchId=-1,touchY=0,touchStartY=0,touchStartX=0,touchTime=0,touchSpeed=0,touchVertical=false,touchTransitioned=false;
  const inputGesture=chapterScrollGesture(()=>driver.current?.release?.());
  gesture.current=inputGesture;
  const blocked=()=>!!document.querySelector('[role="dialog"],[aria-modal="true"],.ticket-inspection-backdrop,.spider-split')||document.body.style.overflow==='hidden';
  const editable=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"]');
  const boundary=(delta:number)=>{
   if(driver.current){driver.current.move(delta);return true;}if(busy.current)return true;
   const index=current.current,stage=stageRefs.current[index];if(!stage)return false;
   const rect=stage.getBoundingClientRect();
   if(delta>0&&rect.bottom<=innerHeight+2&&index<TOTAL_CHAPTERS-1){
    if(!inputGesture.canHandoff()||chapterScrollRequirement(index,stage))return true;
    executeTransition(index+1,{scrollDelta:delta});inputGesture.settleIfReleased();return true;
   }
   if(delta<0&&rect.top>=-2&&index>0){if(!inputGesture.canHandoff())return true;executeTransition(index-1,{scrollDelta:delta});inputGesture.settleIfReleased();return true;}
   return false;
  };
  const readingScroll=smoothChapterScroll({
   bounds:()=>{const s=stageRefs.current[current.current];return s?{top:s.offsetTop,bottom:s.offsetTop+Math.max(0,s.offsetHeight-innerHeight)}:null;},
   handoff:delta=>{boundary(delta);},blocked:()=>blocked()||busy.current,
  });
  cancelReadingScroll.current=readingScroll.cancel;
  const nestedScroll=(target:EventTarget|null)=>{
   let node=target instanceof Element?target:null;
   while(node&&node!==document.body){
    if(node instanceof HTMLElement&&node.scrollHeight>node.clientHeight+2&&/auto|scroll/.test(getComputedStyle(node).overflowY))return true;
    node=node.parentElement;
   }
   return false;
  };
  const wheel=(e:WheelEvent)=>{if(e.ctrlKey||blocked()||editable(e.target)||nestedScroll(e.target)||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(!inputGesture.input('wheel',false,e.timeStamp,d)){e.preventDefault();return;}if(driver.current){driver.current.move(d);e.preventDefault();}else if(!busy.current&&readingScroll.move(d))e.preventDefault();};
  const start=(e:PointerEvent)=>{
   if(e.pointerType!=='touch'||!e.isPrimary||blocked()||editable(e.target)||nestedScroll(e.target))return;
   readingScroll.cancel();inputGesture.startTouch();touchId=e.pointerId;
   touchY=touchStartY=e.clientY;touchStartX=e.clientX;touchTime=e.timeStamp;touchSpeed=0;touchVertical=false;touchTransitioned=!!driver.current;
  };
  const move=(e:PointerEvent)=>{
   if(e.pointerType!=='touch'||e.pointerId!==touchId||blocked())return;
   if(!touchVertical){
    if(Math.abs(touchStartY-e.clientY)<=Math.max(8,Math.abs(touchStartX-e.clientX)*1.15))return;
    touchVertical=true;
    // Capture on a stable root: video captions and transformed children can be replaced mid-gesture.
    document.documentElement.setPointerCapture(e.pointerId);
   }
   const delta=touchY-e.clientY,dt=Math.max(8,e.timeStamp-touchTime);
   touchSpeed=touchSpeed*.4+delta/dt*1000*.6;touchY=e.clientY;touchTime=e.timeStamp;
   e.preventDefault();
   if(!inputGesture.input('touch'))return;
   if(driver.current){touchTransitioned=true;driver.current.move(delta);}
   else if(!busy.current){readingScroll.move(delta,true);if(driver.current)touchTransitioned=true;}
  };
  const end=(e:PointerEvent)=>{
   if(e.pointerId!==touchId)return;touchId=-1;
   // A short, bounded glide stays inside the reading chapter; handoff owns the remaining distance.
   if(e.type==='pointerup'&&touchVertical&&!touchTransitioned&&!blocked()&&e.timeStamp-touchTime<80&&Math.abs(touchSpeed)>200)
    readingScroll.move(Math.max(-180,Math.min(180,touchSpeed*.08)));
   inputGesture.end();
  };
  const key=(e:KeyboardEvent)=>{if(blocked()||editable(e.target)||nestedScroll(e.target))return;if(e.key==='Escape'&&driver.current){inputGesture.cancel();driver.current.cancel();e.preventDefault();return;}if((e.target as Element).closest('button,a'))return;const d=['ArrowDown','PageDown',' '].includes(e.key)?130:['ArrowUp','PageUp'].includes(e.key)?-130:0;if(d){if(!inputGesture.input('key',e.repeat)){e.preventDefault();return;}if(driver.current){driver.current.move(d);e.preventDefault();}else if(!busy.current&&readingScroll.move(d))e.preventDefault();}};
  window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('pointerdown',start,{passive:true});window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end,{passive:true});window.addEventListener('pointercancel',end,{passive:true});window.addEventListener('keydown',key);
  return()=>{readingScroll.cancel();inputGesture.cancel();gesture.current=null;cancelReadingScroll.current=null;window.removeEventListener('wheel',wheel);window.removeEventListener('pointerdown',start);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);window.removeEventListener('keydown',key);};
 },[executeTransition]);
 useEffect(()=>{
  const observer=new IntersectionObserver(()=>{
   if(busy.current)return;let best=-1,pixels=0;
   stageRefs.current.forEach((stage,i)=>{if(!stage||i>unlockedThrough)return;const r=stage.getBoundingClientRect(),visible=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));if(visible>pixels){pixels=visible;best=i;}});
   if(best>=0){current.current=best;setCurrentChapter(best);}
  },{threshold:[0,.1,.25,.5,.75,1]});
  stageRefs.current.forEach((stage,i)=>{if(stage&&i<=unlockedThrough)observer.observe(stage);});return()=>observer.disconnect();
 },[unlockedThrough]);
 return <ChapterFlowContext.Provider value={{currentChapter,unlockedThrough,completedChapters,isTransitioning,advance,goTo,isUnlocked,isCompleted,getChapterState,registerStageRef,registerContentRef}}>{children}</ChapterFlowContext.Provider>;
}
export function useChapterFlowContext():ChapterFlowContextValue {const ctx=useContext(ChapterFlowContext);if(!ctx)throw new Error('useChapterFlow must be used within a ChapterFlowProvider');return ctx;}
