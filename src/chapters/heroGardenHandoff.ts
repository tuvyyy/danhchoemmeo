import gsap from 'gsap';
import { scrollMotionDriver } from './scrollMotionDriver';

/** The restored day/night gallery precedes the separate video garden chapter. */
export function heroGardenHandoff({ hero, garden, heroContent, gardenContent, reverse, scrollDelta, finish }: {
  hero: HTMLElement; garden: HTMLElement; heroContent: HTMLElement; gardenContent: HTMLElement;
  reverse: boolean; scrollDelta?: number; finish: (atHero: boolean) => void;
}) {
  const surface = hero.querySelector<HTMLElement>('.hero-surface')!;
  const stage = garden.querySelector<HTMLElement>('.garden-video-stage')!;
  const video = garden.querySelector<HTMLVideoElement>('.garden-video')!;
  const width = innerWidth, height = innerHeight;
  const heroUI = hero.querySelectorAll('.hero-gallery__header,.hero-gallery__center,.hero-gallery__footer');
  const gardenUI = garden.querySelectorAll('.nature-bloom__header,.nature-bloom__intro,.nature-bloom__message,.nature-bloom__footer');
  const heroWasInert = heroContent.inert, gardenWasInert = gardenContent.inert;
  // Keep the original touch target alive until the gesture ends.
  heroContent.inert = reverse ? true : heroWasInert;
  gardenContent.inert = reverse ? gardenWasInert : true;
  document.documentElement.dataset.heroGardenHandoff = reverse ? 'reverse' : 'forward';
  let timeline: gsap.core.Timeline;
  let progress = reverse ? 1 : 0;
  const context = gsap.context(() => {
    gsap.set(hero, { height: hero.offsetHeight, zIndex: 40 });
    gsap.set(garden, { height: garden.offsetHeight, zIndex: 60 });
    gsap.set(heroContent, { position: 'fixed', top: 0, left: 0, width: '100%' });
    gsap.set(gardenContent, { position: 'fixed', top: 0, left: 0, width: '100%', clipPath: 'circle(0% at 50% 50%)', opacity: 1 });
    const film = stage.getBoundingClientRect();
    gsap.set(stage, { x: width / 2 - (film.left + film.width / 2), y: height / 2 - (film.top + film.height / 2), scale: Math.max(width / film.width, height / film.height) * 1.02, transformOrigin: '50% 50%' });
    gsap.set(gardenUI, { opacity: 0 });
    gsap.set(garden.querySelector('.garden-reel'), { opacity: 0 });
    gsap.set(garden.querySelector('.garden-video-frame'), { borderRadius: 0 });
    timeline = gsap.timeline({ paused: true })
      .to(surface, { scale: 1.12, filter: 'blur(5px)', duration: .7, ease: 'power1.inOut' }, 0)
      .to(heroUI, { opacity: 0, y: -30, duration: .42, stagger: .025 }, .08)
      .to(gardenContent, { clipPath: 'circle(85% at 50% 50%)', duration: .65, ease: 'power2.inOut' }, .12)
      .to(stage, { x: 0, y: 0, scale: 1, duration: .3, ease: 'power2.inOut' }, .7)
      .to(garden.querySelector('.garden-video-frame'), { borderRadius: width <= 600 ? 10 : 12, duration: .18 }, .82)
      .to(garden.querySelector('.garden-reel'), { opacity: 1, duration: .14 }, .86)
      .fromTo(gardenUI, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .075, stagger: .008 }, .9);
  });
  void video.play().catch(() => {});
  return scrollMotionDriver({ reverse, scrollDelta, finish, autoDuration: 2200,
    paint: p => { progress = p; timeline.progress(p); hero.dataset.handoffProgress = p.toFixed(4); },
    cleanup: () => {
      context.revert(); heroContent.inert = heroWasInert; gardenContent.inert = gardenWasInert;
      delete document.documentElement.dataset.heroGardenHandoff; delete hero.dataset.handoffProgress;
      if (progress < .5) video.pause(); else void video.play().catch(() => {});
    },
  });
}

