import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";
import { letterFragments } from "./letterFragments";

export function letterMomentsHandoff({ letter, moments, letterContent, momentsContent, reverse, scrollDelta, finish }: {
  letter: HTMLElement; moments: HTMLElement; letterContent: HTMLElement; momentsContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atLetter: boolean) => void;
}) {
  const scene = moments.querySelector<HTMLElement>(".memory-table")!;
  const paper = letter.querySelector<HTMLElement>(".letter-keepsake")!;
  const prints = [...moments.querySelectorAll<HTMLElement>(".memory-print")];
  const letterHeight = letter.offsetHeight, momentsHeight = moments.offsetHeight;
  const oldCopy = letter.querySelectorAll<HTMLElement>(".letter-atelier__intro > *, .letter-atelier__header, .letter-atelier__footer, .letter-desk__annotation, .letter-desk__controls");
  const flowers = letter.querySelectorAll<HTMLElement>(".letter-bloom-garden > *");
  const newCopy = moments.querySelectorAll(".memory-table__header, .memory-table__intro, .memory-table__footer, .memory-board__annotation");
  document.documentElement.dataset.letterMomentsHandoff = reverse ? "reverse" : "forward";
  const backdrop = document.createElement("div"); backdrop.className = "moments-handoff-backdrop"; scene.prepend(backdrop);
  let choreography: gsap.core.Timeline;
  let fragments: ReturnType<typeof letterFragments>;
  const outgoing = [paper, ...oldCopy, ...flowers];
  const context = gsap.context(() => {
    gsap.set(letter, { height: letterHeight, zIndex: 40 });
    gsap.set(moments, { height: momentsHeight, zIndex: 50 });
    gsap.set(letterContent, { position: "fixed", top: innerHeight - letterHeight, left: 0, width: "100%" });
    gsap.set(momentsContent, { position: "fixed", top: 0, left: 0, width: "100%" });
    fragments = letterFragments(outgoing);
    gsap.set(outgoing, { visibility: "hidden" });
    choreography = gsap.timeline({ paused: true });
    choreography.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: .8, ease: "sine.inOut" }, .2)
      .fromTo(newCopy, { opacity: 0, y: 18, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .3, stagger: .035, ease: "power2.out" }, .55)
      .fromTo(moments.querySelector(".memory-table__thread path"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .8, ease: "none" }, .15);
    choreography.to(letter.querySelector(".letter-atelier__landscape"), {
      scale: 1.055, y: -innerHeight * .025, opacity: 0, duration: .85, ease: "sine.inOut",
    }, .1);
    prints.forEach((print, index) => {
      const angle = parseFloat(getComputedStyle(print).getPropertyValue("--print-angle"));
      const bounds = print.getBoundingClientRect();
      const board = print.parentElement!.getBoundingClientRect();
      const start = .12 + index * .035;
      // All photos begin near one vanishing point, then approach their own resting positions.
      choreography.fromTo(print, {
        x: (board.left + board.width * .5 - bounds.left - bounds.width * .5) * .65,
        y: (board.top + board.height * .42 - bounds.top - bounds.height * .5) * .5,
        scale: .12, rotation: angle * .35, filter: "blur(8px)",
      }, { x: 0, y: 0, scale: 1, rotation: angle, filter: "blur(0px)", duration: .775, ease: "power2.out" }, start)
        .fromTo(print, { opacity: 0 }, { opacity: 1, duration: .26, ease: "sine.out" }, start);
    });
  });
  return scrollMotionDriver({
    reverse, scrollDelta, finish,
    paint: progress => {
      choreography.progress(progress); fragments.paint(progress);
      scene.dataset.handoffProgress = progress.toFixed(4);
    },
    cleanup: () => { fragments.dispose(); context.revert(); backdrop.remove(); delete document.documentElement.dataset.letterMomentsHandoff; delete scene.dataset.handoffProgress; },
  });
}
