import { scrollMotionDriver } from "./scrollMotionDriver";
import gsap from "gsap";

/** Turn the outgoing chapter as a viewport-sized page. The letter stays flat. */
export function voucherLetterHandoff({ voucher, letter, voucherContent, letterContent, reverse, scrollDelta, finish }: {
  voucher: HTMLElement; letter: HTMLElement; voucherContent: HTMLElement; letterContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atVoucher: boolean) => void;
}) {
  // Measure before changing positioning; preserve both chapters' native geometry.
  const scene = letter.querySelector<HTMLElement>(".letter-atelier")!;
  const vines = letter.querySelector<HTMLElement>('.letter-vines');
  const strands = letter.querySelectorAll<HTMLElement>('.letter-vines__strand');
  let lastProgress = reverse ? 1 : 0;
  const voucherHeight = voucher.offsetHeight, letterHeight = letter.offsetHeight;
  const voucherTop = reverse ? 0 : voucherContent.getBoundingClientRect().top;
  const shade = document.createElement('div');
  shade.className = 'chapter-page-turn-shade'; shade.setAttribute('aria-hidden', 'true');
  voucherContent.append(shade);
  document.documentElement.dataset.voucherLetterHandoff = reverse ? 'reverse' : 'forward';
  let choreography: gsap.core.Timeline;
  const context = gsap.context(() => {
    gsap.set(voucher, { height: voucherHeight, zIndex: 50 });
    gsap.set(letter, { height: letterHeight, zIndex: 40 });
    gsap.set(letterContent, { position: 'fixed', top: 0, left: 0, width: '100%', height: letterHeight, overflow: 'clip' });
    gsap.set(voucherContent, {
      position: 'fixed', top: voucherTop, left: 0, width: '100%', height: voucherHeight,
      transformOrigin: `${innerWidth}px ${innerHeight * .5 - voucherTop}px`,
      transformPerspective: innerWidth * 1.8, backfaceVisibility: 'hidden',
      willChange: 'transform', overflow: 'clip',
    });
    choreography = gsap.timeline({ paused: true });
    choreography.fromTo(voucherContent, { rotationY: 0 }, {
      rotationY: -100, duration: 1, ease: 'sine.inOut',
    }, 0)
      .fromTo(shade, { opacity: 0 }, { opacity: .72, duration: .75, ease: 'sine.in' }, .05)
      .fromTo(voucherContent, { opacity: 1 }, { opacity: 0, duration: .16, ease: 'sine.inOut' }, .84);
    choreography
      .fromTo(letter.querySelector('.letter-keepsake'), { y: 12, scale: 1.008 }, {
        y: 0, scale: 1, duration: .52, ease: 'power2.out',
      }, .18)
      .fromTo(letter.querySelectorAll('.letter-atelier__header,.letter-desk__controls,.letter-atelier__footer'), { opacity: 0 }, {
        opacity: 1, duration: .24, stagger: .035, ease: 'sine.out',
      }, .6)
      .fromTo(strands, { yPercent: -105, y: 0, opacity: 0 }, {
        yPercent: 0, opacity: .85, duration: .48, stagger: { amount: .16 }, ease: 'power2.out',
      }, .25);
  });
  return scrollMotionDriver({ reverse, scrollDelta, finish, response: 16, autoDuration: 1650,
    paint: progress => {
      lastProgress = progress;
      choreography.progress(progress);
      scene.dataset.handoffProgress = progress.toFixed(4);
    },
    cleanup: () => {
      context.revert(); shade.remove();
      if (vines) vines.dataset.visible = String(lastProgress >= .5);
      delete document.documentElement.dataset.voucherLetterHandoff;
      delete scene.dataset.handoffProgress;
    },
  });
}
