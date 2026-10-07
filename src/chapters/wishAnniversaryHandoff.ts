import gsap from 'gsap';
import { scrollMotionDriver } from './scrollMotionDriver';

/** A keepsake is laid down while the cake is still present; the photograph leads the eye. */
export function wishAnniversaryHandoff({ wish, anniversary, wishContent, anniversaryContent, reverse, scrollDelta, finish }: {
 wish:HTMLElement;anniversary:HTMLElement;wishContent:HTMLElement;anniversaryContent:HTMLElement;
 reverse:boolean;scrollDelta?:number;finish:(atWish:boolean)=>void;
}) {
 const scene=anniversary.querySelector<HTMLElement>('.together-scene')!;
 const backdrop=document.createElement('div');backdrop.className='anniversary-handoff-backdrop';scene.prepend(backdrop);
 document.documentElement.dataset.wishAnniversaryHandoff=reverse?'reverse':'forward';
 let choreography:gsap.core.Timeline;
 const context=gsap.context(()=>{
  gsap.set(wish,{height:wish.offsetHeight,zIndex:50});gsap.set(anniversary,{height:anniversary.offsetHeight,zIndex:60});
  gsap.set(wishContent,{position:'fixed',top:innerHeight-wish.offsetHeight,left:0,width:'100%'});
  gsap.set(anniversaryContent,{position:'fixed',top:0,left:0,width:'100%'});
  choreography=gsap.timeline({paused:true});
  choreography
   .fromTo(backdrop,{opacity:0},{opacity:1,duration:.74,ease:'sine.inOut'},.06)
   .to(wish.querySelectorAll('.finale-header,.finale-copy > *,.finale-footer'),{opacity:0,y:-15,duration:.3,stagger:.015},.06)
   .to(wish.querySelector('.finale-butterflies'),{opacity:0,duration:.45},.18)
   .to(wish.querySelector('.cake-altar'),{x:-45,y:25,scale:.94,opacity:0,duration:.62,ease:'sine.inOut'},.24)
   .fromTo(anniversary.querySelector('.together-paper'),{y:35},{y:0,duration:.82,ease:'power2.out'},.07)
   .fromTo(anniversary.querySelector('.together-frame'),{opacity:0},{opacity:1,duration:.36,ease:'sine.out'},.07)
   .fromTo(anniversary.querySelector('.together-photo'),{opacity:.15,scale:.985},{opacity:1,scale:1,duration:.6,ease:'sine.out'},.13)
   .fromTo(anniversary.querySelector('.together-copy'),{opacity:0,y:10},{opacity:1,y:0,duration:.42,ease:'power2.out'},.35)
   .fromTo(anniversary.querySelector('.together-margin'),{opacity:0,y:6},{opacity:1,y:0,duration:.4,ease:'power2.out'},.43)
   .fromTo(anniversary.querySelectorAll('.together-header,.together-stations,.together-footer'),{opacity:0,y:10},{opacity:1,y:0,duration:.3,stagger:.04,ease:'power2.out'},.6);
 });
 return scrollMotionDriver({reverse,scrollDelta,finish,autoDuration:2100,
  paint:progress=>{choreography.progress(progress);scene.dataset.handoffProgress=progress.toFixed(4);},
  cleanup:()=>{context.revert();backdrop.remove();delete scene.dataset.handoffProgress;delete document.documentElement.dataset.wishAnniversaryHandoff;},
 });
}
