import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";

export function voucherLetterHandoff({ voucher, letter, voucherContent, letterContent, reverse, scrollDelta, finish }: {
  voucher: HTMLElement; letter: HTMLElement; voucherContent: HTMLElement; letterContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atVoucher: boolean) => void;
}) {
  const scene = letter.querySelector<HTMLElement>(".letter-atelier")!;
  const paper = letter.querySelector<HTMLElement>(".letter-keepsake")!;
  const envelope = voucher.querySelector<HTMLElement>(".scene-pan")!;
  const source = voucher.querySelector<HTMLElement>(".envelope__letter")!;
  const copy = letter.querySelectorAll(".letter-atelier__intro, .letter-atelier__header, .letter-atelier__footer, .letter-desk__annotation, .letter-desk__controls");
  const letterHeight = letter.offsetHeight;
  document.documentElement.dataset.voucherLetterHandoff = reverse ? "reverse" : "forward";
  const backdrop = document.createElement("div");
  backdrop.className = "letter-handoff-backdrop";
  scene.prepend(backdrop);
  let choreography: gsap.core.Timeline;
  const context = gsap.context(() => {
    gsap.set(voucher, { height: innerHeight, zIndex: 30 });
    gsap.set(letter, { height: letterHeight, zIndex: 40 });
    gsap.set(voucherContent, { position: "fixed", inset: "0 auto auto 0", width: "100%" });
    gsap.set(letterContent, { position: "fixed", top: 0, left: 0, width: "100%" });
    gsap.set(scene, { background: "transparent" });
    const sourceRect = source.getBoundingClientRect();
    const target = paper.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    const dx = gsap.utils.clamp(-innerWidth * .7, innerWidth * .3, sourceX - (target.left + target.width / 2));
    const dy = sourceY - (target.top + target.height / 2);
    choreography = gsap.timeline({ paused: true });
    choreography.fromTo([backdrop, scene.querySelector('.letter-atelier__landscape')], { opacity: 0 }, { opacity: 1, duration: .82, ease: "none" }, .12)
      .fromTo(paper, { x: dx, y: dy + 70, scale: .34, rotation: -14, opacity: 0 }, { x: innerWidth < 600 ? 0 : dx * .55, y: Math.max(-innerHeight * .22, Math.min(-65, dy - 70)), scale: .66, rotation: 9, opacity: 1, duration: .42, ease: "power1.out" }, 0)
      .to(paper, { x: 0, y: 0, scale: 1, rotation: -5, duration: .5, ease: "power2.inOut" }, .42)
      .fromTo(source, { opacity: 1 }, { opacity: 0, duration: .1 }, .03)
      .fromTo(envelope, { x: 0, y: 0, rotation: 0, scale: 1 }, { x: -innerWidth * .18, y: innerHeight * .66, rotation: -9, scale: .88, duration: .75, ease: "power1.inOut" }, .16)
      .fromTo(copy, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .26, stagger: .02, ease: "power2.out" }, .6)
      .fromTo(letter.querySelector(".letter-atelier__thread path"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .8, ease: "none" }, .15)
      .fromTo(voucher.querySelectorAll(".envelope-frame, .envelope-petals, .scene-next"), { opacity: 1 }, { opacity: 0, duration: .24 }, 0);
  });
  return scrollMotionDriver({
    reverse, scrollDelta, finish,
    paint: progress => { choreography.progress(progress); scene.dataset.handoffProgress = progress.toFixed(4); },
    cleanup: () => { context.revert(); backdrop.remove(); delete document.documentElement.dataset.voucherLetterHandoff; delete scene.dataset.handoffProgress; },
  });
}
