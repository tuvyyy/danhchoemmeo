import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { TOTAL_CHAPTERS } from "./chapterRegistry";
import type { ChapterFlowContextValue, ChapterLifecycleState } from "./types";
import FlowersVoucherFlow, { type FlowersVoucherFlowHandle } from "./FlowersVoucherFlow";
import { flowersVoucherHandoff } from "./flowersVoucherHandoff";
import { voucherLetterHandoff } from "./voucherLetterHandoff";
import { letterMomentsHandoff } from "./letterMomentsHandoff";
import { momentsAnniversaryHandoff } from "./momentsAnniversaryHandoff";
import { anniversaryFinaleHandoff } from "./anniversaryFinaleHandoff";
import { heroGardenHandoff } from "./heroGardenHandoff";
import { smoothChapterScroll } from "./smoothChapterScroll";

type Driver = { move:(delta:number)=>void; cancel:()=>void; settle:()=>void; dispose:()=>void };
const ChapterFlowContext = createContext<ChapterFlowContextValue | null>(null);
export function ChapterFlowProvider({children}:{children:ReactNode}) {
 const [unlockedThrough,setUnlockedThrough]=useState(0);
 const [currentChapter,setCurrentChapter]=useState(0);
 const [completedChapters,setCompletedChapters]=useState<Set<number>>(new Set());
 const [isTransitioning,setIsTransitioning]=useState(false);
 const busy=useRef(false),destination=useRef<number|null>(null),current=useRef(0),unlocked=useRef(0);
 const driver=useRef<Driver|null>(null);
 const cancelReadingScroll=useRef<(()=>void)|null>(null);
 const stageRefs=useRef<(HTMLElement|null)[]>([]),contentRefs=useRef<(HTMLElement|null)[]>([]);
 const flowView=useRef<FlowersVoucherFlowHandle>(null);
 const [flowHost,setFlowHost]=useState<HTMLElement|null>(null);
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
   const stage=stageRefs.current[index];driver.current=null;setFlowHost(null);
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
   flushSync(()=>setFlowHost(b.querySelector<HTMLElement>('.chapter-envelope-scene')));
   driver.current=flowersVoucherHandoff({flowers:a,voucher:b,gardenContent:ac,voucherContent:bc,...common,paintThread:p=>flowView.current?.render(p)});return;
  }
  if(adjacent&&pair===2){driver.current=voucherLetterHandoff({voucher:a,letter:b,voucherContent:ac,letterContent:bc,...common});return;}
  if(adjacent&&pair===3){driver.current=letterMomentsHandoff({letter:a,moments:b,letterContent:ac,momentsContent:bc,...common});return;}
  if(adjacent&&pair===4){driver.current=momentsAnniversaryHandoff({moments:a,anniversary:b,momentsContent:ac,anniversaryContent:bc,...common});return;}
  if(adjacent&&pair===5){driver.current=anniversaryFinaleHandoff({anniversary:a,finale:b,anniversaryContent:ac,finaleContent:bc,...common});return;}
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
  let touchY=0,touchX=0;
  const blocked=()=>!!document.querySelector('[role="dialog"],[aria-modal="true"],.ticket-inspection-backdrop,.spider-split')||document.body.style.overflow==='hidden';
  const editable=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"]');
  const boundary=(delta:number)=>{
   if(driver.current){driver.current.move(delta);return true;}if(busy.current)return true;
   const index=current.current,stage=stageRefs.current[index];if(!stage)return false;
   const rect=stage.getBoundingClientRect();
   if(delta>0&&rect.bottom<=innerHeight+2&&index<TOTAL_CHAPTERS-1){
    if(index===2&&!stage.querySelector('.chapter-envelope-scene[data-state="open"]'))return true;
    if(index===3&&!stage.querySelector('.letter-atelier[data-open="true"]'))return true;
    if(index===4&&!stage.querySelector('.memory-table[data-seen="4"]'))return true;
    executeTransition(index+1,{scrollDelta:delta});return true;
   }
   if(delta<0&&rect.top>=-2&&index>0){executeTransition(index-1,{scrollDelta:delta});return true;}
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
  const clampEdge=(delta:number)=>{
   const stage=stageRefs.current[current.current];if(!stage)return false;
   const r=stage.getBoundingClientRect(),remaining=delta>0?r.bottom-innerHeight:-r.top;
   if(remaining>0&&Math.abs(delta)>remaining){const travel=delta>0?remaining:-remaining;scrollBy(0,travel);boundary(delta-travel);return true;}return false;
  };
  const wheel=(e:WheelEvent)=>{if(e.ctrlKey||blocked()||editable(e.target)||nestedScroll(e.target)||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(driver.current){driver.current.move(d);e.preventDefault();}else if(!busy.current&&readingScroll.move(d))e.preventDefault();};
  const start=(e:TouchEvent)=>{readingScroll.cancel();if(e.touches.length!==1)return;touchY=e.touches[0].clientY;touchX=e.touches[0].clientX;};
  const move=(e:TouchEvent)=>{if(e.touches.length!==1||blocked()||editable(e.target))return;const y=e.touches[0].clientY,x=e.touches[0].clientX,d=touchY-y;const vertical=Math.abs(d)>Math.max(1,Math.abs(touchX-x));touchY=y;touchX=x;if(vertical&&(boundary(d)||clampEdge(d))&&e.cancelable)e.preventDefault();};
  const key=(e:KeyboardEvent)=>{if(blocked()||editable(e.target)||nestedScroll(e.target))return;if(e.key==='Escape'&&driver.current){driver.current.cancel();e.preventDefault();return;}if((e.target as Element).closest('button,a'))return;const d=['ArrowDown','PageDown',' '].includes(e.key)?130:['ArrowUp','PageUp'].includes(e.key)?-130:0;if(d){if(driver.current){driver.current.move(d);e.preventDefault();}else if(!busy.current&&readingScroll.move(d))e.preventDefault();}};
  window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('touchstart',start,{passive:true});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('keydown',key);
  return()=>{readingScroll.cancel();cancelReadingScroll.current=null;window.removeEventListener('wheel',wheel);window.removeEventListener('touchstart',start);window.removeEventListener('touchmove',move);window.removeEventListener('keydown',key);};
 },[executeTransition]);
 useEffect(()=>{
  const observer=new IntersectionObserver(()=>{
   if(busy.current)return;let best=-1,pixels=0;
   stageRefs.current.forEach((stage,i)=>{if(!stage||i>unlockedThrough)return;const r=stage.getBoundingClientRect(),visible=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));if(visible>pixels){pixels=visible;best=i;}});
   if(best>=0){current.current=best;setCurrentChapter(best);}
  },{threshold:[0,.1,.25,.5,.75,1]});
  stageRefs.current.forEach((stage,i)=>{if(stage&&i<=unlockedThrough)observer.observe(stage);});return()=>observer.disconnect();
 },[unlockedThrough]);
 return <ChapterFlowContext.Provider value={{currentChapter,unlockedThrough,completedChapters,isTransitioning,advance,goTo,isUnlocked,isCompleted,getChapterState,registerStageRef,registerContentRef}}>{children}<FlowersVoucherFlow ref={flowView} host={flowHost}/></ChapterFlowContext.Provider>;
}
export function useChapterFlowContext():ChapterFlowContextValue {const ctx=useContext(ChapterFlowContext);if(!ctx)throw new Error('useChapterFlow must be used within a ChapterFlowProvider');return ctx;}
