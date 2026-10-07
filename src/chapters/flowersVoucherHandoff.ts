import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";
import { videoPaperFold } from "./videoPaperFold";
import { settleEnvelopeArrival } from "@/sections/voucher/envelopeArrival";
export function flowersVoucherHandoff({flowers,voucher,gardenContent,voucherContent,reverse,scrollDelta,finish}: {
 flowers:HTMLElement;voucher:HTMLElement;gardenContent:HTMLElement;voucherContent:HTMLElement;reverse:boolean;scrollDelta?:number;finish:(atGarden:boolean)=>void;
}) {
 const garden=flowers.querySelector<HTMLElement>(".nature-bloom")!;
 const scene=voucher.querySelector<HTMLElement>(".chapter-envelope-scene")!;
 const hero=flowers.querySelector<HTMLElement>(".garden-video-stage")!;
 const envelope=voucher.querySelector<HTMLElement>(".scene-pan")!;
 const height=flowers.offsetHeight;
 const fold=videoPaperFold(hero);
 const fabric={amount:0};
 document.documentElement.dataset.flowersVoucherHandoff=reverse?"reverse":"forward";
 const backdrop=document.createElement("div");backdrop.className="flowers-voucher-background";garden.prepend(backdrop);
 let choreography:gsap.core.Timeline;
 let lastProgress=reverse?1:0;
 let heroTop=0,heroHeight=0,pocketY=0,envelopeCentre=0;
 const context=gsap.context(()=>{
  gsap.set(flowers,{height,zIndex:20});gsap.set(voucher,{height:innerHeight,zIndex:30});
  gsap.set(gardenContent,{position:"fixed",top:innerHeight-height,left:0,width:"100%"});
  gsap.set(voucherContent,{position:"fixed",top:0,left:0,width:"100%"});gsap.set(scene,{background:"transparent"});
  if(fold) gsap.set(hero.querySelector(".garden-video-frame"),{opacity:0});
  gsap.set(hero,{transformOrigin:"50% 65%",clipPath:"none"});
  const heroBounds=hero.getBoundingClientRect();heroTop=heroBounds.top;heroHeight=hero.offsetHeight;
  const envelopeBounds=envelope.getBoundingClientRect();envelopeCentre=envelopeBounds.top+envelopeBounds.height*.5;
  const pocketBounds=envelope.querySelector<HTMLElement>(".envelope__pocket")?.getBoundingClientRect();
  pocketY=pocketBounds? pocketBounds.top+pocketBounds.height*.5:innerHeight;
  choreography=gsap.timeline({paused:true});
  choreography.fromTo(backdrop,{opacity:0},{opacity:1,duration:.65},.05)
   .to(flowers.querySelectorAll(".nature-bloom__header,.nature-bloom__intro,.nature-bloom__message,.nature-bloom__footer"),{opacity:0,y:-25,duration:.22,stagger:.01},0)
   .to(hero.querySelector(".garden-reel"),{opacity:0,duration:.2},0)
   .to(fabric,{amount:1,duration:.64,ease:"power1.out"},.025)
   .to(hero,{scale:.9,rotation:-1,x:0,y:innerHeight*.035,duration:.36,ease:"sine.inOut"},.04)
   .to(hero,{scale:.32,scaleY:.27,rotation:1,y:innerHeight*.3,duration:.56,ease:"power2.in"},.38)
   .to(hero,{opacity:0,duration:.78,ease:"sine.inOut"},.12)
   .fromTo(envelope,{y:innerHeight*.58,scale:.78},{y:0,scale:1,duration:.72,ease:"sine.out"},.1)
   .fromTo(envelope,{opacity:0},{opacity:1,duration:.18},.1)
   .fromTo(voucher.querySelector(".envelope-frame"),{opacity:0},{opacity:1,duration:.35},.4)
   .fromTo(voucher.querySelectorAll(".royal-corner"),{autoAlpha:0,scale:.92,filter:"blur(3px)"},{autoAlpha:1,scale:1,filter:"blur(0px)",duration:.32},.48)
   .fromTo(voucher.querySelectorAll(".corner-line--h"),{scaleX:0},{scaleX:1,duration:.28,ease:"power2.out"},.52)
   .fromTo(voucher.querySelectorAll(".corner-line--v"),{scaleY:0},{scaleY:1,duration:.28,ease:"power2.out"},.52)
   .fromTo(voucher.querySelector(".envelope-light"),{opacity:0},{opacity:.6,duration:.55},.22)
   .fromTo(voucher.querySelectorAll(".envelope-petals,.scene-next"),{opacity:0},{opacity:1,duration:.3},.55);
 });
  return scrollMotionDriver({
    reverse, scrollDelta, finish, commitOnIntent:true,
    paint: progress => {
      lastProgress=progress;
      choreography.progress(progress); fold?.paint(fabric.amount); garden.dataset.handoffProgress=progress.toFixed(4);
      // The pulled tip disappears inside the pocket, never out through its bottom edge.
      const heroY=Number(gsap.getProperty(hero,"y")),heroScale=Number(gsap.getProperty(hero,"scaleY"));
      const envelopeY=Number(gsap.getProperty(envelope,"y")),envelopeScale=Number(gsap.getProperty(envelope,"scaleY"));
      const pocketAt=envelopeCentre+(pocketY-envelopeCentre)*envelopeScale+envelopeY;
      const topAt=heroTop+heroY+heroHeight*.65*(1-heroScale);
      const cut=(pocketAt-topAt)/Math.max(.01,heroScale);
      hero.style.clipPath=`inset(-200% -200% ${heroHeight-cut}px -200%)`;
    },
    cleanup: () => { context.revert(); if(lastProgress>=.5)settleEnvelopeArrival(scene);fold?.dispose(); backdrop.remove(); delete garden.dataset.handoffProgress; delete document.documentElement.dataset.flowersVoucherHandoff;  },
  });
}
