import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";

/** The envelope travels left while the real letter opens around its paper spine. */
export function voucherLetterHandoff({ voucher, letter, voucherContent, letterContent, reverse, scrollDelta, finish }: {
  voucher: HTMLElement; letter: HTMLElement; voucherContent: HTMLElement; letterContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atVoucher: boolean) => void;
}) {
  const scene = letter.querySelector<HTMLElement>(".letter-atelier")!;
  const paper = letter.querySelector<HTMLElement>(".letter-keepsake")!;
  const cover = paper.querySelector<HTMLElement>(".letter-cover")!;
  const envelope = voucher.querySelector<HTMLElement>(".scene-pan")!;
  const source = voucher.querySelector<HTMLElement>('.envelope__letter')!;
  const copy = letter.querySelectorAll(".letter-atelier__intro,.letter-atelier__header,.letter-atelier__footer,.letter-desk__controls");
  const height = letter.offsetHeight;
  const back = document.createElement('div');
  back.className='letter-book-back';back.setAttribute('aria-hidden','true');paper.append(back);
  document.documentElement.dataset.voucherLetterHandoff=reverse?'reverse':'forward';
  let choreography: gsap.core.Timeline;
  const context=gsap.context(()=>{
    gsap.set(voucher,{height:innerHeight,zIndex:30});gsap.set(letter,{height,zIndex:40});
    gsap.set(voucherContent,{position:'fixed',top:0,left:0,width:'100%'});
    gsap.set(letterContent,{position:'fixed',top:0,left:0,width:'100%',height,overflow:'clip'});
    gsap.set(scene,{background:'transparent'});
    gsap.set([cover,back],{transition:'none',transformOrigin:'0% 50%'});
    // The reverse face has opposite local coordinates around the same spine.
    gsap.set(back,{scaleX:-1});
    const sourceRect=source.getBoundingClientRect(),target=paper.getBoundingClientRect();
    const startX=sourceRect.left+sourceRect.width/2-target.left-target.width/2;
    const startY=sourceRect.top+sourceRect.height/2-target.top-target.height/2;
    const stagingX=innerWidth<600?0:-innerWidth*.18;
    choreography=gsap.timeline({paused:true});
    choreography
      .fromTo(scene.querySelector('.letter-atelier__landscape'),{opacity:0},{opacity:1,duration:.95,ease:'sine.inOut'},.08)
      .fromTo(envelope,{x:0,y:0,scale:1,rotation:0},{x:-innerWidth*.82,y:innerHeight*.04,scale:.7,rotation:-5,duration:.83,ease:'power2.inOut'},.02)
      .fromTo(voucher.querySelectorAll('.envelope-frame,.envelope-petals,.scene-next'),{opacity:1},{opacity:0,duration:.2},.04)
      .fromTo(source,{opacity:1},{opacity:0,duration:.18},.06)
      .fromTo(paper,{x:startX,y:startY,rotation:6,rotationY:24,scale:.42,opacity:0},{x:stagingX,y:0,rotation:0,rotationY:0,scale:.9,opacity:1,duration:.4,ease:'power2.out'},.06)
      .to(paper,{x:0,rotation:-5,scale:1,duration:.5,ease:'power2.inOut'},.49)
      .fromTo(cover,{rotationY:0,opacity:1},{rotationY:-155,opacity:1,duration:.64,ease:'power2.inOut'},.35)
      .fromTo(back,{rotationY:180,opacity:0},{rotationY:25,opacity:1,duration:.64,ease:'power2.inOut'},.35)
      .to([cover,back],{opacity:0,duration:.13,ease:'sine.out'},.89)
      .fromTo(copy,{opacity:0,x:45},{opacity:1,x:0,duration:.32,stagger:.025,ease:'power2.out'},.68);
  });
  return scrollMotionDriver({reverse,scrollDelta,finish,
    paint:progress=>{choreography.progress(progress);scene.dataset.handoffProgress=progress.toFixed(4);},
    cleanup:()=>{context.revert();back.remove();delete document.documentElement.dataset.voucherLetterHandoff;delete scene.dataset.handoffProgress;},
  });
}
