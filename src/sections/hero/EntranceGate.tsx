import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { scrollMotionDriver } from '@/chapters/scrollMotionDriver';
import GardenGate from './GardenGate';

/** The gate is an entrance to the original gallery, not a replacement chapter. */
export default function EntranceGate({ reducedMotion, finePointer, onEntered, onPhotograph }: {
  reducedMotion: boolean; finePointer: boolean; onEntered: () => void; onPhotograph: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const driver = useRef<ReturnType<typeof scrollMotionDriver> | null>(null);
  const [entering, setEntering] = useState(false);
  const delta = useRef<number | undefined>(undefined);
  const done = useRef(onEntered); done.current = onEntered;
  const begin = (scrollDelta?: number) => {
    if (entering) return;
    if (reducedMotion) { done.current(); return; }
    delta.current = scrollDelta; setEntering(true);
  };

  useLayoutEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  useLayoutEffect(() => {
    if (!entering) return;
    const layer = host.current!, gate = layer.querySelector<HTMLElement>('.garden-gate')!;
    const world = gate.querySelector<HTMLElement>('.garden-gate__world')!;
    const rect = gate.querySelector('.garden-gate__architecture')!.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = Math.min(innerHeight * .76, rect.top + rect.width * .8);
    let timeline: gsap.core.Timeline;
    const context = gsap.context(() => {
      gsap.set(world, { transformOrigin: `${x}px ${y}px` });
      timeline = gsap.timeline({ paused: true })
        .to(gate, { '--gate-open': 1.45, duration: .38, ease: 'power2.inOut' }, 0)
        .to(gate.querySelectorAll('.garden-gate__header,.garden-gate__footer'), { opacity: 0, duration: .16 }, .03)
        .to(gate.querySelector('.garden-gate__copy'), { opacity: 0, filter: 'blur(10px)', y: -22, duration: .25 }, .04)
        .to(world, { x: innerWidth / 2 - x, scale: 1.35, duration: .3, ease: 'power2.inOut' }, .03)
        .to(world, { scale: 4.5, y: innerHeight * .57 - y, duration: .5, ease: 'power2.in' }, .3)
        .to(layer, { opacity: 0, duration: .55, ease: 'power1.inOut' }, .45);
    });
    driver.current = scrollMotionDriver({ reverse: false, scrollDelta: delta.current, autoDuration: 2400,
      paint: p => { timeline.progress(p); layer.dataset.progress = p.toFixed(4); },
      cleanup: () => { context.revert(); delete layer.dataset.progress; },
      finish: atGate => { driver.current = null; if (atGate) setEntering(false); else done.current(); },
    });
    return () => { driver.current?.dispose(); driver.current = null; };
  }, [entering]);

  useEffect(() => {
    let touchY = 0;
    const blocked = () => !!document.querySelector('dialog[open]');
    const move = (amount: number) => {
      if (blocked()) return;
      if (driver.current) driver.current.move(amount);
      else if (amount > 0) begin(amount);
    };
    const wheel = (e: WheelEvent) => { if (blocked() || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; e.preventDefault(); move(e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)); };
    const start = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0; };
    const touch = (e: TouchEvent) => { if (blocked() || e.touches.length !== 1) return; const amount = touchY - e.touches[0].clientY; touchY = e.touches[0].clientY; if (Math.abs(amount) > 1) { if (e.cancelable) e.preventDefault(); move(amount); } };
    const key = (e: KeyboardEvent) => { if (blocked()) return; if (e.key === 'Escape') driver.current?.cancel(); else if (!(e.target as Element).closest('button,a') && ['ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); move(130); } };
    const resize = () => driver.current?.settle();
    window.addEventListener('wheel', wheel, { passive: false }); window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', touch, { passive: false }); window.addEventListener('keydown', key); window.addEventListener('resize', resize);
    return () => { window.removeEventListener('wheel', wheel); window.removeEventListener('touchstart', start); window.removeEventListener('touchmove', touch); window.removeEventListener('keydown', key); window.removeEventListener('resize', resize); };
  }, [entering, reducedMotion]);

  return <div ref={host} className="cinematic-hero gate-hero entrance-gate" data-entering={entering}>
    <GardenGate active transitioning={entering} reducedMotion={reducedMotion} finePointer={finePointer} onEnter={() => begin()} onPhotograph={onPhotograph} />
  </div>;
}
