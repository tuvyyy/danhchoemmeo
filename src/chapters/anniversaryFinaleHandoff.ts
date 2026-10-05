import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";

export function anniversaryFinaleHandoff({
  anniversary,
  finale,
  anniversaryContent,
  finaleContent,
  reverse,
  scrollDelta,
  finish,
}: {
  anniversary: HTMLElement;
  finale: HTMLElement;
  anniversaryContent: HTMLElement;
  finaleContent: HTMLElement;
  reverse: boolean;
  scrollDelta?: number;
  finish: (atAnniversary: boolean) => void;
}) {
  const anniversaryScene = anniversary.querySelector<HTMLElement>(".together-scene")!;
  const finaleScene = finale.querySelector<HTMLElement>(".celebration-scene")!;
  const ticket = anniversary.querySelector<HTMLElement>(".together-ticket")!;
  const photo = anniversary.querySelector<HTMLElement>(".together-photo")!;
  const cake = finale.querySelector<HTMLElement>(".cake-altar")!;
  const flame = finale.querySelector<HTMLElement>(".candle-flame")!;
  const aura = finale.querySelector<HTMLElement>(".candle-aura")!;
  const lighting = finale.querySelector<HTMLElement>('.finale-lighting')!;
  const anniversaryHeight = anniversary.offsetHeight;
  const finaleHeight = finale.offsetHeight;
  const candleLit = finaleScene.dataset.blown !== 'true';
  // A user may reverse the chapter while the room is still brightening.
  // Start from the visible light level so that interrupting it never snaps.
  const nightOpacity = reverse ? Number(getComputedStyle(lighting).opacity) : candleLit ? 1 : 0;
  const flameOpacity = reverse ? Number(getComputedStyle(flame).opacity) : candleLit ? 1 : 0;
  const auraOpacity = reverse ? Number(getComputedStyle(aura).opacity) : candleLit ? 1 : 0;

  document.documentElement.dataset.anniversaryFinaleHandoff = reverse ? "reverse" : "forward";
  const backdrop = document.createElement("div");
  backdrop.className = "finale-handoff-backdrop";
  finaleScene.prepend(backdrop);

  let choreography: gsap.core.Timeline;
  const context = gsap.context(() => {
    gsap.set(anniversary, { height: anniversaryHeight, zIndex: 50 });
    gsap.set(finale, { height: finaleHeight, zIndex: 60 });
    gsap.set(anniversaryContent, {
      position: "fixed",
      top: innerHeight - anniversaryHeight,
      left: 0,
      width: "100%",
    });
    gsap.set(finaleContent, { position: "fixed", top: 0, left: 0, width: "100%" });

    choreography = gsap.timeline({ paused: true });
    choreography
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.65, ease: "none" }, 0.25)
      .fromTo(lighting, { opacity: 0 }, { opacity: nightOpacity, duration: 0.65, ease: 'none' }, 0.25)
      .to(
        anniversary.querySelectorAll(
          ".together-header, .together-copy > *, .together-stations, .together-footer, .together-annotation",
        ),
        { opacity: 0, y: -24, duration: 0.22, stagger: 0.015 },
        0.02,
      )
      .to(
        ticket,
        {
          y: -innerHeight * 0.12,
          x: -innerWidth * 0.08,
          scale: 0.76,
          rotation: -6,
          opacity: 0,
          duration: 0.54,
          ease: "power2.inOut",
        },
        0.12,
      )
      .to(
        photo,
        {
          y: -innerHeight * 0.09,
          scale: 0.72,
          rotation: -18,
          opacity: 0,
          duration: 0.44,
          ease: "power1.inOut",
        },
        0.1,
      )
      .fromTo(
        cake,
        { x: -80, y: 45, scale: 0.9, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.58, ease: "power2.out" },
        0.32,
      )
      .fromTo(
        flame,
        { scale: 0, opacity: 0 },
        { scale: candleLit ? 1 : 0.1, opacity: flameOpacity, duration: 0.4, ease: "back.out(1.8)" },
        0.48,
      )
      .fromTo(
        aura,
        { opacity: 0, scale: 0.4 },
        { opacity: auraOpacity, scale: candleLit ? 1 : 0.4, duration: 0.48, ease: "power2.out" },
        0.44,
      )
      .fromTo(
        finale.querySelector('.finale-butterflies'),
        { opacity: 0 },
        { opacity: 1, duration: 0.38, ease: 'power1.out' },
        0.62,
      )
      .fromTo(
        finale.querySelectorAll(
          ".finale-header, .finale-copy > *, .finale-footer",
        ),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.32, stagger: 0.025, ease: "power2.out" },
        0.46,
      );
  });

  return scrollMotionDriver({
    reverse, scrollDelta, finish,
    paint: progress => { choreography.progress(progress); finaleScene.dataset.handoffProgress = progress.toFixed(4); },
    cleanup: () => { context.revert(); backdrop.remove(); delete document.documentElement.dataset.anniversaryFinaleHandoff; delete finaleScene.dataset.handoffProgress; },
  });
}
