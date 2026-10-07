import gsap from 'gsap';
import { scrollMotionDriver } from './scrollMotionDriver';

/** The letter gives way to the next keepsake without an intermediate album. */
export function letterAnniversaryHandoff({ letter, anniversary, letterContent, anniversaryContent, reverse, scrollDelta, finish }: {
  letter: HTMLElement; anniversary: HTMLElement; letterContent: HTMLElement; anniversaryContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atLetter: boolean) => void;
}) {
  const scene = anniversary.querySelector<HTMLElement>('.together-scene')!;
  const vines = letter.querySelector<HTMLElement>('.letter-vines');
  const backdrop = document.createElement('div');
  backdrop.className = 'anniversary-handoff-backdrop';
  scene.prepend(backdrop);
  document.documentElement.dataset.letterAnniversaryHandoff = reverse ? 'reverse' : 'forward';
  let lastProgress = reverse ? 1 : 0;
  let choreography: gsap.core.Timeline;
  const context = gsap.context(() => {
    gsap.set(letter, { height: letter.offsetHeight, zIndex: 40 });
    gsap.set(anniversary, { height: anniversary.offsetHeight, zIndex: 50 });
    gsap.set(letterContent, { position: 'fixed', top: innerHeight - letter.offsetHeight, left: 0, width: '100%' });
    gsap.set(anniversaryContent, { position: 'fixed', top: 0, left: 0, width: '100%' });
    choreography = gsap.timeline({ paused: true });
    choreography
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: .8, ease: 'sine.inOut' }, .12)
      .to(letter.querySelector('.letter-keepsake'), { y: -45, x: -30, rotation: -8, scale: .94, opacity: 0, duration: .66, ease: 'sine.inOut' }, .16)
      .to(letter.querySelectorAll('.letter-atelier__header, .letter-atelier__footer, .letter-desk__controls'), { opacity: 0, y: -16, duration: .3 }, .04)
      .to(letter.querySelector('.letter-bloom-garden'), { opacity: 0, y: -22, duration: .68, ease: 'sine.inOut' }, .18)
      .fromTo(letter.querySelectorAll('.letter-vines__strand'), { yPercent: 0, y: 0, opacity: .85 }, { yPercent: -105, opacity: 0, duration: .78, stagger: .025, ease: 'power2.in' }, .08)
      .fromTo(anniversary.querySelector('.together-photo'), { opacity: 0, y: 30, scale: .95 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'power2.out' }, .16)
      .fromTo(anniversary.querySelector('.together-ticket'), { opacity: 0, y: 75, rotation: 12 }, { opacity: 1, y: 0, rotation: 5, duration: .65, ease: 'power2.out' }, .24)
      .fromTo(anniversary.querySelectorAll('.together-header, .together-copy > *, .together-stations, .together-footer'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .34, stagger: .025, ease: 'power2.out' }, .46)
      .fromTo(anniversary.querySelector('.together-thread path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7, ease: 'none' }, .25);
  });
  return scrollMotionDriver({
    reverse, scrollDelta, finish,
    paint: progress => { lastProgress = progress; choreography.progress(progress); scene.dataset.handoffProgress = progress.toFixed(4); },
    cleanup: () => {
      context.revert(); backdrop.remove();
      if (vines) vines.dataset.visible = String(lastProgress < .5);
      delete scene.dataset.handoffProgress;
      delete document.documentElement.dataset.letterAnniversaryHandoff;
    },
  });
}
