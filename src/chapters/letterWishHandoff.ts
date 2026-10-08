import gsap from 'gsap';
import { scrollMotionDriver } from './scrollMotionDriver';

/** Moonlight gathers around the candle before the cake and greeting take over. */
export function letterWishHandoff({ letter, wish, letterContent, wishContent, reverse, scrollDelta, finish }: {
 letter:HTMLElement;wish:HTMLElement;letterContent:HTMLElement;wishContent:HTMLElement;
 reverse:boolean;scrollDelta?:number;finish:(atLetter:boolean)=>void;
}) {
 const scene=wish.querySelector<HTMLElement>('.celebration-scene')!;
 const vines=letter.querySelector<HTMLElement>('.letter-vines');
 const lighting=wish.querySelector<HTMLElement>('.finale-lighting')!;
 const lightingOpacity=Number(getComputedStyle(lighting).opacity);
 const backdrop=document.createElement('div');backdrop.className='finale-handoff-backdrop';scene.prepend(backdrop);
 const light=document.createElement('div');light.className='chapter-light-bridge';light.setAttribute('aria-hidden','true');scene.append(light);
 document.documentElement.dataset.letterWishHandoff=reverse?'reverse':'forward';
 let lastProgress=reverse?1:0,choreography:gsap.core.Timeline;
 const context=gsap.context(()=>{
  gsap.set(letter,{height:letter.offsetHeight,zIndex:40});gsap.set(wish,{height:wish.offsetHeight,zIndex:50});
  gsap.set(letterContent,{position:'fixed',top:innerHeight-letter.offsetHeight,left:0,width:'100%'});
  gsap.set(wishContent,{position:'fixed',top:0,left:0,width:'100%'});
  const candle=wish.querySelector<HTMLElement>('.candle-flame-wrap')!.getBoundingClientRect();
  light.style.setProperty('--light-x',`${candle.left+candle.width/2}px`);
  light.style.setProperty('--light-y',`${candle.top+candle.height/2}px`);
  choreography=gsap.timeline({paused:true});
  choreography
   .fromTo(backdrop,{opacity:0},{opacity:1,duration:.78,ease:'sine.inOut'},0)
   .fromTo(lighting,{opacity:0},{opacity:lightingOpacity,duration:.66,ease:'sine.inOut'},.16)
   .fromTo(light,{opacity:0,'--light-color':'#c8d8d2'},{opacity:.6,'--light-color':lightingOpacity>.5?'#efbd7d':'#e4d8bc',duration:.34,ease:'sine.out'},.04)
   .to(light,{opacity:0,duration:.42,ease:'sine.inOut'},.52)
   .to(letter.querySelectorAll('.letter-atelier__header,.letter-atelier__footer,.letter-desk__controls'),{opacity:0,y:-8,duration:.22},.02)
   .to(letter.querySelector('.letter-keepsake'),{x:-18,y:-20,scale:.975,opacity:0,duration:.42,ease:'sine.inOut'},.2)
   .to(letter.querySelector('.letter-bloom-garden'),{opacity:0,y:-10,duration:.62,ease:'sine.inOut'},.12)
   .fromTo(letter.querySelectorAll('.letter-vines__strand'),{yPercent:0,y:0,opacity:.85},{yPercent:-105,opacity:0,duration:.48,stagger:{amount:.22},ease:'power2.in'},.1)
   .fromTo(wish.querySelector('.cake-altar'),{opacity:0,y:16,scale:.985},{opacity:1,y:0,scale:1,duration:.64,ease:'sine.out'},.06)
   .fromTo(wish.querySelector('.cake-altar'),{clipPath:'ellipse(3% 4% at 47% 18%)'},{clipPath:'ellipse(130% 110% at 47% 18%)',duration:.66,ease:'power2.inOut'},.08)
   .fromTo(wish.querySelector('.finale-kicker'),{opacity:0,y:8},{opacity:1,y:0,duration:.22},.5)
   .fromTo(wish.querySelectorAll('.finale-copy h2 > *'),{opacity:0,y:16},{opacity:1,y:0,duration:.24,stagger:.045,ease:'power2.out'},.58)
   .fromTo(wish.querySelector('.finale-body'),{opacity:0,y:10},{opacity:1,y:0,duration:.22,ease:'sine.out'},.7)
   .fromTo(wish.querySelector('.finale-butterflies'),{opacity:0},{opacity:1,duration:.26},.68)
   .fromTo(wish.querySelectorAll('.finale-header,.finale-footer'),{opacity:0},{opacity:1,duration:.22},.76)
   .fromTo(wish.querySelector('.finale-controls'),{opacity:0,y:6},{opacity:1,y:0,duration:.21,ease:'sine.out'},.79);
 });
 return scrollMotionDriver({reverse,scrollDelta,finish,autoDuration:2000,
  paint:progress=>{lastProgress=progress;choreography.progress(progress);scene.dataset.handoffProgress=progress.toFixed(4);},
  cleanup:()=>{context.revert();backdrop.remove();light.remove();if(vines)vines.dataset.visible=String(lastProgress<.5);delete scene.dataset.handoffProgress;delete document.documentElement.dataset.letterWishHandoff;},
 });
}
