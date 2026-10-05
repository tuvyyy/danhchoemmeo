import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";

export function momentsAnniversaryHandoff({ moments, anniversary, momentsContent, anniversaryContent, reverse, scrollDelta, finish }: {
  moments: HTMLElement; anniversary: HTMLElement; momentsContent: HTMLElement; anniversaryContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atMoments: boolean) => void;
}) {
  const scene = anniversary.querySelector<HTMLElement>(".together-scene")!;
  const photo = anniversary.querySelector<HTMLElement>(".together-photo")!;
  const ticket = anniversary.querySelector<HTMLElement>(".together-ticket")!;
  const prints = [...moments.querySelectorAll<HTMLElement>(".memory-print")];
  const momentsHeight = moments.offsetHeight, anniversaryHeight = anniversary.offsetHeight;
  document.documentElement.dataset.momentsAnniversaryHandoff = reverse ? "reverse" : "forward";
  const backdrop = document.createElement("div"); backdrop.className = "anniversary-handoff-backdrop"; scene.prepend(backdrop);
  let choreography: gsap.core.Timeline;
  const context = gsap.context(() => {
    gsap.set(moments, { height: momentsHeight, zIndex: 50 });
    gsap.set(anniversary, { height: anniversaryHeight, zIndex: 60 });
    gsap.set(momentsContent, { position: "fixed", top: innerHeight - momentsHeight, left: 0, width: "100%" });
    gsap.set(anniversaryContent, { position: "fixed", top: 0, left: 0, width: "100%" });
    const destination = photo.getBoundingClientRect();
    choreography = gsap.timeline({ paused: true });
    choreography.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: .65, ease: "none" }, .3)
      .to(moments.querySelectorAll(".memory-table__header, .memory-table__intro, .memory-table__footer, .memory-board__annotation"), { opacity: 0, y: -20, duration: .23, stagger: .015 }, .02)
      .fromTo(photo, { opacity: 0 }, { opacity: 1, duration: .14 }, .53)
      .fromTo(ticket, { y: 110, x: 25, rotation: 16, scale: .83 }, { y: 0, x: 0, rotation: 5, scale: 1, duration: .55, ease: "power2.out" }, .34)
      .fromTo(ticket, { opacity: 0 }, { opacity: 1, duration: .08 }, .34)
      .fromTo(anniversary.querySelectorAll(".together-header, .together-copy > *, .together-stations, .together-footer, .together-annotation"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .3, stagger: .015, ease: "power2.out" }, .46)
      .fromTo(anniversary.querySelector(".together-thread path"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7, ease: "none" }, .3);
    prints.forEach((print, index) => {
      const source = print.getBoundingClientRect();
      const ratio = destination.width / source.width;
      choreography.to(print, {
        x: destination.left + destination.width / 2 - (source.left + source.width / 2) + (index - 3) * 5,
        y: destination.top + destination.height / 2 - (source.top + source.height / 2) + (index - 3) * 3,
        scale: ratio, rotation: -14 + (index - 3) * 3, duration: .59, ease: "power2.inOut",
      }, .03 + index * .035).to(print, { opacity: 0, duration: .16 }, .59 + index * .025);
    });
  });
  return scrollMotionDriver({
    reverse, scrollDelta, finish,
    paint: progress => { choreography.progress(progress); scene.dataset.handoffProgress = progress.toFixed(4); },
    cleanup: () => { context.revert(); backdrop.remove(); delete document.documentElement.dataset.momentsAnniversaryHandoff; delete scene.dataset.handoffProgress; },
  });
}
