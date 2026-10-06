import { useCallback, useEffect, useRef, useState } from 'react';
import FlowerBloomCanvas from './FlowerBloomCanvas';
import TulipBloom, { preloadTulipSequence } from './TulipBloom';
import { preloadBloomSequence } from '@/lib/assets/preloadBloomSequence';
import FlowerAtmosphere from './FlowerAtmosphere';

// Restored from the pre-video garden in 624a0c0; preserve its planting and bloom order.
const TULIPS = [
  { id: "tulip-1", x: 43, y: 1, scale: 0.48, rotate: -6, delay: 1400, depth: "foreground" },
  { id: "tulip-2", x: 79, y: -5, scale: 0.53, rotate: 5, delay: 1950, depth: "foreground" },
  { id: "tulip-3", x: 88, y: 11, scale: 0.43, rotate: -3, delay: 2500, depth: "background" },
  { id: "tulip-gold-left", x: 38, y: -3, scale: 0.44, rotate: -9, delay: 1700, depth: "foreground", color: "butter" },
  { id: "tulip-lavender-left", x: 47, y: 12, scale: 0.34, rotate: 7, delay: 2250, depth: "background", color: "lavender" },
  { id: "tulip-coral-low", x: 59, y: -4, scale: 0.42, rotate: -7, delay: 1850, depth: "foreground", color: "coral" },
  { id: "tulip-gold-low", x: 64, y: 3, scale: 0.32, rotate: 5, delay: 2350, depth: "midground", color: "butter" },
  { id: "tulip-coral-right", x: 85, y: 3, scale: 0.4, rotate: -5, delay: 2050, depth: "foreground", color: "coral" },
  { id: "tulip-lavender-right", x: 93, y: 10, scale: 0.32, rotate: 8, delay: 2600, depth: "background", color: "lavender" },
  { id: "tulip-gold-edge", x: 33, y: -6, scale: 0.36, rotate: 6, delay: 2150, depth: "foreground", color: "butter" },
  { id: "tulip-lavender-front", x: 46, y: -8, scale: 0.43, rotate: -4, delay: 2450, depth: "foreground", color: "lavender" },
  { id: "tulip-coral-front", x: 73, y: -4, scale: 0.35, rotate: 8, delay: 2750, depth: "foreground", color: "coral" },
  { id: "tulip-gold-right", x: 91, y: -2, scale: 0.38, rotate: -6, delay: 2300, depth: "foreground", color: "butter" },
] as const;

export default function LetterBloomGarden({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const completed = useRef(new Set<string>());
  const [bloomed, setBloomed] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const finish = useCallback((id: string) => {
    completed.current.add(id);
    if (completed.current.size === TULIPS.length + 2) setBloomed(true);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .1 });
    observer.observe(root.current!);
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    Promise.all([preloadBloomSequence(), preloadTulipSequence()])
      .then(() => { if (!cancelled) setReady(true); })
      .catch((error: unknown) => console.error('Letter garden failed to load', error));
    return () => { cancelled = true; };
  }, []);
  const running = active && inView && visible && ready;

  return <div ref={root} className="letter-bloom-garden" data-running={running} data-bloomed={bloomed} aria-hidden="true">
    <FlowerAtmosphere isActive={running} />
    <div className="letter-bloom-garden__flowers">
      {TULIPS.map(tulip => <TulipBloom key={tulip.id} {...tulip}
        isActive={running} hasBloomed={bloomed} onBloomComplete={() => finish(tulip.id)} />)}
      <FlowerBloomCanvas className="letter-bloom-garden__lily letter-bloom-garden__lily--left"
        isActive={running} hasBloomed={bloomed} isSecondary baseRotation={-4}
        delayMs={700} durationMs={4300} onBloomComplete={() => finish('lily-left')} />
      <FlowerBloomCanvas className="letter-bloom-garden__lily letter-bloom-garden__lily--right"
        isActive={running} hasBloomed={bloomed} baseRotation={3}
        delayMs={0} durationMs={4600} onBloomComplete={() => finish('lily-right')} />
    </div>
    <div className="letter-bloom-garden__meadow">
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--left" src="/assets/flowers/nature/grass-airy-tall.png" alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--strip" src="/assets/flowers/nature/grass-back-strip.png" alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--right" src="/assets/flowers/nature/grass-airy-tall.png" alt="" />
    </div>
  </div>;
}
