import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { CLOSED_SEAL_Y_PERCENT, VOUCHERS, VOUCHER_PLACEMENTS, type EnvelopeState } from "./voucherConfig";

type Options = {
  root: RefObject<HTMLElement | null>; ready: boolean; running: boolean;
  state: EnvelopeState; reducedMotion: boolean; onFinish: () => void; onArrival: () => void;
};

/** One clock owns the entrance, corner pulses, lid, papers and warm light.
 * The same timeline is reused for subsequent seal open/close interactions. */
export function useEnvelopeMotion({ root, ready, running, state, reducedMotion, onFinish, onArrival }: Options) {
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const context = useRef<gsap.Context | null>(null);
  const entered = useRef(false);

  useLayoutEffect(() => {
    if (!ready || !root.current) return;
    const ctx = gsap.context(() => {
      timeline.current = gsap.timeline({ id: "chapter02-envelope", paused: true, defaults: { ease: "power2.inOut" } });
      if (!entered.current && !reducedMotion) {
        gsap.set(".envelope", { autoAlpha: 0, y: 42 });
        gsap.set(".royal-corner", { autoAlpha: 0, scale: .92, filter: "blur(3px)" });
        gsap.set(".corner-line--h", { scaleX: 0 });
        gsap.set(".corner-line--v", { scaleY: 0 });
        gsap.set(".envelope-light, .envelope-petals, .envelope-trim-light", { opacity: 0 });
      }
    }, root);
    context.current = ctx;
    return () => { ctx.revert(); timeline.current = null; context.current = null; };
  }, [root, ready, reducedMotion]);

  useLayoutEffect(() => {
    if (!ready || !context.current || !timeline.current) return;
    context.current.add(() => {
      const tl = timeline.current!;
      if (reducedMotion) {
        tl.pause().clear();
        const open = state === "open" || state === "opening";
        gsap.set(".envelope, .royal-corner", { autoAlpha: 1, y: 0, scale: 1, filter: "none" });
        gsap.set(".corner-line--h", { scaleX: 1 });
        gsap.set(".corner-line--v", { scaleY: 1 });
        gsap.set(".envelope-light", { opacity: .45 });
        gsap.set(".envelope__body", { opacity: 1 });
        gsap.set(".envelope__flap", { rotationX: open ? -180 : 0 });
        gsap.set(".envelope__hinge", { zIndex: open ? 2 : 5 });
        gsap.set(".envelope__paper", { y: open ? 0 : 80, autoAlpha: open ? 1 : 0, scale: 1 });
        gsap.set(".envelope__letter", { rotation: -3 });
        VOUCHERS.forEach(v => gsap.set(`[data-ticket-artwork="${v.id}"]`, { rotation: VOUCHER_PLACEMENTS[v.id].angle }));
        gsap.set(".envelope__seal", { yPercent: open ? 0 : CLOSED_SEAL_Y_PERCENT });
        entered.current = true;
        if (root.current) root.current.dataset.entered = "true";
        onArrival();
        if (state === "opening" || state === "closing") onFinish();
        return;
      }
      if (state === "closed") {
        tl.pause().clear();
        tl.eventCallback("onComplete", null);
        gsap.set(".envelope__flap", { rotationX: 0 });
        gsap.set(".envelope__hinge", { zIndex: 5 });
        gsap.set(".envelope__paper", { autoAlpha: 0, y: 80 });
        gsap.set(".envelope__seal", { yPercent: CLOSED_SEAL_Y_PERCENT });
        if (!entered.current) {
          // Arrival only reveals the sealed envelope. The lid and papers wait
          // for an explicit seal press, independently of chapter navigation.
          tl.eventCallback("onComplete", () => {
            entered.current = true;
            if (root.current) root.current.dataset.entered = "true";
            onArrival();
          });
          tl.to(".royal-corner", { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .85 }, .2)
            .to(".corner-line--h", { scaleX: 1, duration: .8, ease: "power2.out" }, .3)
            .to(".corner-line--v", { scaleY: 1, duration: .8, ease: "power2.out" }, .3)
            .to(".envelope", { autoAlpha: 1, y: 0, duration: .85, ease: "power3.out" }, .6)
            .to(".envelope-light", { opacity: .6, duration: 1.1 }, .6)
            .to(".envelope-petals", { opacity: 1, duration: .8 }, .8);
          tl.play(0);
          if (!running) tl.pause();
        }
        return;
      }
      if (state !== "opening" && state !== "closing") return;
      tl.pause().clear();
      tl.eventCallback("onComplete", () => {
        entered.current = true;
        if (root.current) root.current.dataset.entered = "true";
        onFinish();
      });

      if (state === "closing") {
        tl.to(".envelope__ticket", { y: 90, autoAlpha: 0, scale: .96, rotation: 0, duration: .55, stagger: { each: .06, from: "end" } }, 0)
          .to(".envelope__letter", { y: 70, autoAlpha: 0, duration: .6 }, .15)
          .to(".envelope__flap", { rotationX: 0, filter: "drop-shadow(0 12px 14px #0005)", duration: .95 }, .8)
          .set(".envelope__hinge", { zIndex: 5 }, 1.275)
          .to(".envelope__seal", { yPercent: CLOSED_SEAL_Y_PERCENT, duration: .45 }, 1.4);
      } else {
        const offset = -.6;
        gsap.set(".envelope__hinge", { zIndex: 5 });
        gsap.set(".envelope__flap", { rotationX: 0, filter: "drop-shadow(0 12px 14px #0005)" });
        gsap.set(".envelope__paper", { autoAlpha: 0, y: 80, scale: .96, rotation: 0 });
        gsap.set(".envelope__letter", { y: 70, rotation: -6, scale: 1 });
        gsap.set(".envelope__seal", { yPercent: CLOSED_SEAL_Y_PERCENT });
        tl.to(".envelope__seal", { yPercent: 0, duration: .65 }, .65 + offset)
          .to(".envelope__flap", { rotationX: -180, filter: "drop-shadow(0 2px 5px #0002)", duration: 1.05, ease: "power2.inOut" }, .9 + offset)
          .set(".envelope__hinge", { zIndex: 2 }, 1.425 + offset)
          .to(".envelope__body", { opacity: 1, duration: .4 }, 1.35 + offset)
          .to(".envelope__letter", { autoAlpha: 1, y: 0, rotation: -3, duration: .85, ease: "power3.out" }, 1.55 + offset);
        VOUCHERS.forEach((v, i) => {
          tl.to(`[data-ticket-artwork="${v.id}"]`, {
            y: 0, autoAlpha: 1, scale: 1, rotation: VOUCHER_PLACEMENTS[v.id].angle,
            duration: .85, ease: "power3.out",
          }, 1.75 + i * .15 + offset);
        });
        tl.to(".corner-ink", { filter: "drop-shadow(0 0 5px #e6c98b70)", duration: .3 }, 1.95 + offset)
          .to(".corner-ink", { filter: "drop-shadow(0 0 1px #dab87c22)", duration: .8 }, 2.25 + offset)
          .fromTo(".envelope-trim-light", { xPercent: -80, opacity: 0 }, { xPercent: 80, opacity: .28, duration: .9, ease: "sine.inOut" }, 1.95 + offset)
          .to(".envelope-trim-light", { opacity: 0, duration: .25 }, 2.85 + offset)
          .to(".envelope__seal-face", { filter: "brightness(1.18) drop-shadow(0 0 5px #d9b87344)", duration: .3 }, 2.45 + offset)
          .to(".envelope__seal-face", { filter: "brightness(1) drop-shadow(0 0 0px transparent)", duration: .4 }, 2.75 + offset);
      }
      tl.play(0);
      if (!running) tl.pause();
    });
  }, [ready, state, reducedMotion, onFinish, onArrival, root]);

  useLayoutEffect(() => {
    if (running) timeline.current?.resume();
    else timeline.current?.pause();
  }, [running, ready, state]);
}
