import gsap from 'gsap';
import { scrollMotionDriver } from './scrollMotionDriver';

/** The open letter stays visible until the candle has taken over the left side. */
export function letterWishHandoff({ letter, wish, letterContent, wishContent, reverse, scrollDelta, finish }: {
 letter:HTMLElement;wish:HTMLElement;letterContent:HTMLElement;wishContent:HTMLElement;
 reverse:boolean;scrollDelta?:number;finish:(atLetter:boolean)=>void;
}) {
 const scene=wish.querySelector<HTMLElement>('.celebration-scene')!;
 const vines=letter.querySelector<HTMLElement>('.letter-vines');
 const lighting=wish.querySelector<HTMLElement>('.finale-lighting')!;
 const lightingOpacity=Number(getComputedStyle(lighting).opacity);
 const backdrop=document.createElement('div');backdrop.className='finale-handoff-backdrop';scene.prepend(backdrop);
 document.documentElement.dataset.letterWishHandoff=reverse?'reverse':'forward';
 let lastProgress=reverse?1:0,choreography:gsap.core.Timeline;
 const context=gsap.context(()=>{
  gsap.set(letter,{height:letter.offsetHeight,zIndex:40});gsap.set(wish,{height:wish.offsetHeight,zIndex:50});
  gsap.set(letterContent,{position:'fixed',top:innerHeight-letter.offsetHeight,left:0,width:'100%'});
  gsap.set(wishContent,{position:'fixed',top:0,left:0,width:'100%'});
  choreography=gsap.timeline({paused:true});
  choreography
   .fromTo(backdrop,{opacity:0},{opacity:1,duration:.75,ease:'sine.inOut'},.05)
   .fromTo(lighting,{opacity:0},{opacity:lightingOpacity,duration:.75,ease:'sine.inOut'},.05)
   .to(letter.querySelectorAll('.letter-atelier__header,.letter-atelier__footer,.letter-desk__controls'),{opacity:0,y:-12,duration:.28},.04)
   .to(letter.querySelector('.letter-keepsake'),{x:-30,y:-35,scale:.94,opacity:0,duration:.65,ease:'sine.inOut'},.2)
   .to(letter.querySelector('.letter-bloom-garden'),{opacity:0,y:-22,duration:.7,ease:'sine.inOut'},.15)
   .fromTo(letter.querySelectorAll('.letter-vines__strand'),{yPercent:0,y:0,opacity:.85},{yPercent:-105,opacity:0,duration:.78,stagger:.025,ease:'power2.in'},.08)
   .fromTo(wish.querySelector('.cake-altar'),{opacity:0,x:45,y:25,scale:.96},{opacity:1,x:0,y:0,scale:1,duration:.76,ease:'power2.out'},.1)
   .fromTo(wish.querySelector('.finale-butterflies'),{opacity:0},{opacity:1,duration:.35},.55)
   .fromTo(wish.querySelectorAll('.finale-header,.finale-copy > *,.finale-footer'),{opacity:0,y:18},{opacity:1,y:0,duration:.35,stagger:.03,ease:'power2.out'},.4);
 });
 return scrollMotionDriver({reverse,scrollDelta,finish,autoDuration:2000,
  paint:progress=>{lastProgress=progress;choreography.progress(progress);scene.dataset.handoffProgress=progress.toFixed(4);},
  cleanup:()=>{context.revert();backdrop.remove();if(vines)vines.dataset.visible=String(lastProgress<.5);delete scene.dataset.handoffProgress;delete document.documentElement.dataset.letterWishHandoff;},
 });
}
