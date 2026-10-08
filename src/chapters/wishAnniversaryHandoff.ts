import gsap from 'gsap';
import { scrollMotionDriver } from './scrollMotionDriver';

/** A keepsake is laid down while the cake is still present; the photograph leads the eye. */
export function wishAnniversaryHandoff({ wish, anniversary, wishContent, anniversaryContent, reverse, scrollDelta, finish }: {
 wish:HTMLElement;anniversary:HTMLElement;wishContent:HTMLElement;anniversaryContent:HTMLElement;
 reverse:boolean;scrollDelta?:number;finish:(atWish:boolean)=>void;
}) {
 const scene=anniversary.querySelector<HTMLElement>('.together-scene')!;
 const backdrop=document.createElement('div');backdrop.className='anniversary-handoff-backdrop';scene.prepend(backdrop);
 const photo=anniversary.querySelector<HTMLElement>('.together-photo img')!;
 const photoFilter=getComputedStyle(photo).filter;
 anniversary.querySelector('.together-note')?.getAnimations().forEach(animation=>animation.cancel());
 document.documentElement.dataset.wishAnniversaryHandoff=reverse?'reverse':'forward';
 let choreography:gsap.core.Timeline;
 const context=gsap.context(()=>{
  gsap.set(wish,{height:wish.offsetHeight,zIndex:50});gsap.set(anniversary,{height:anniversary.offsetHeight,zIndex:60});
  gsap.set(wishContent,{position:'fixed',top:innerHeight-wish.offsetHeight,left:0,width:'100%'});
  gsap.set(anniversaryContent,{position:'fixed',top:0,left:0,width:'100%'});
  // The photograph reveals over the outgoing scene, without an empty dark mount.
  gsap.set(anniversary.querySelector('.together-photo'),{backgroundColor:'transparent'});
  choreography=gsap.timeline({paused:true});
  choreography
   .fromTo(backdrop,{opacity:0,backgroundColor:'#e7ddcd'},{opacity:1,backgroundColor:'#f0eee6',duration:.74,ease:'sine.inOut'},.06)
   .to(wish.querySelectorAll('.finale-header,.finale-copy > *,.finale-footer'),{opacity:0,y:-8,duration:.22,stagger:.012},.02)
   .to(wish.querySelector('.finale-butterflies'),{opacity:0,duration:.32},.12)
   .to(wish.querySelector('.cake-altar'),{x:-24,y:14,scale:.975,opacity:0,duration:.48,ease:'sine.inOut'},.18)
   .fromTo(anniversary.querySelector('.together-photo'),{y:18,scale:1.012},{y:0,scale:1,duration:.6,ease:'power2.out'},.06)
   .fromTo(photo,{clipPath:'inset(0 0 100% 0)',filter:'grayscale(1) contrast(.92) brightness(1.08)'},{clipPath:'inset(0 0 0% 0)',filter:photoFilter,duration:.5,ease:'power2.out'},.09)
   .fromTo(anniversary.querySelector('.together-note__heading'),{opacity:0,y:12},{opacity:1,y:0,duration:.28,ease:'power2.out'},.38)
   .fromTo(anniversary.querySelectorAll('.together-note__body p,.together-note__closing,.together-signature'),{opacity:0,y:8},{opacity:1,y:0,duration:.26,stagger:.045,ease:'sine.out'},.5)
   .fromTo(anniversary.querySelectorAll('.together-margin > *'),{opacity:0,y:6},{opacity:1,y:0,duration:.24,stagger:.035,ease:'sine.out'},.49)
   .fromTo(anniversary.querySelector('.together-frame'),{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.28,ease:'power2.out'},.66)
   .fromTo(anniversary.querySelector('.together-photo figcaption'),{opacity:0},{opacity:1,duration:.22},.73)
   .fromTo(anniversary.querySelectorAll('.together-header,.together-stations,.together-footer'),{opacity:0,y:6},{opacity:1,y:0,duration:.21,stagger:.02,ease:'sine.out'},.75);
 });
 return scrollMotionDriver({reverse,scrollDelta,finish,autoDuration:2100,
  paint:progress=>{choreography.progress(progress);scene.dataset.handoffProgress=progress.toFixed(4);},
  cleanup:()=>{context.revert();backdrop.remove();delete scene.dataset.handoffProgress;delete document.documentElement.dataset.wishAnniversaryHandoff;},
 });
}
