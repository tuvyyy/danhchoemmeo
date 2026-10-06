import { useCallback, useEffect, useRef, useState } from 'react';
import FlowerBloomCanvas from './FlowerBloomCanvas';
import TulipBloom, { preloadTulipSequence } from './TulipBloom';
import { preloadBloomSequence } from '@/lib/assets/preloadBloomSequence';
import FlowerAtmosphere from './FlowerAtmosphere';

// Original pre-video flowers, expanded into three staggered tulip rows.
const TULIPS = [
  { id: "letter-meadow-1", x: 10, y: 33, scale: 0.43, rotate: -5, delay: 1600, depth: "background", color: "ivory" },
  { id: "letter-meadow-2", x: 21, y: 39, scale: 0.4, rotate: 5, delay: 2100, depth: "background", color: "lavender" },
  { id: "letter-meadow-3", x: 32, y: 34, scale: 0.46, rotate: -3, delay: 1750, depth: "background", color: "butter" },
  { id: "letter-meadow-4", x: 44, y: 37, scale: 0.42, rotate: 4, delay: 2300, depth: "background", color: "coral" },
  { id: "letter-meadow-5", x: 58, y: 34, scale: 0.43, rotate: -4, delay: 2550, depth: "background", color: "lavender" },
  { id: "letter-meadow-6", x: 72, y: 36, scale: 0.45, rotate: 6, delay: 1900, depth: "background", color: "ivory" },
  { id: "letter-meadow-7", x: 85, y: 33, scale: 0.4, rotate: -5, delay: 2700, depth: "background", color: "butter" },
  { id: "letter-meadow-8", x: 95, y: 38, scale: 0.38, rotate: 3, delay: 2400, depth: "background", color: "lavender" },
  { id: "letter-meadow-9", x: 7, y: 17, scale: 0.59, rotate: -7, delay: 1950, depth: "midground", color: "butter" },
  { id: "letter-meadow-10", x: 18, y: 20, scale: 0.63, rotate: 5, delay: 1400, depth: "midground", color: "ivory" },
  { id: "letter-meadow-11", x: 29, y: 24, scale: 0.55, rotate: -4, delay: 2250, depth: "midground", color: "coral" },
  { id: "letter-meadow-12", x: 39, y: 21, scale: 0.6, rotate: 6, delay: 1700, depth: "midground", color: "lavender" },
  { id: "letter-meadow-13", x: 49, y: 23, scale: 0.56, rotate: -5, delay: 2450, depth: "midground", color: "butter" },
  { id: "letter-meadow-14", x: 61, y: 18, scale: 0.65, rotate: 4, delay: 1850, depth: "midground", color: "ivory" },
  { id: "letter-meadow-15", x: 73, y: 22, scale: 0.57, rotate: -6, delay: 2600, depth: "midground", color: "coral" },
  { id: "letter-meadow-16", x: 84, y: 19, scale: 0.6, rotate: 4, delay: 2050, depth: "midground", color: "lavender" },
  { id: "letter-meadow-17", x: 94, y: 22, scale: 0.54, rotate: -5, delay: 2500, depth: "midground", color: "ivory" },
  { id: "letter-meadow-18", x: 12, y: 4, scale: 0.69, rotate: -6, delay: 2100, depth: "foreground", color: "coral" },
  { id: "letter-meadow-19", x: 23, y: 7, scale: 0.73, rotate: 4, delay: 1750, depth: "foreground", color: "butter" },
  { id: "letter-meadow-20", x: 34, y: 3, scale: 0.71, rotate: -4, delay: 2350, depth: "foreground", color: "ivory" },
  { id: "letter-meadow-21", x: 45, y: 6, scale: 0.65, rotate: 5, delay: 2550, depth: "foreground", color: "lavender" },
  { id: "letter-meadow-22", x: 56, y: 2, scale: 0.72, rotate: -3, delay: 1950, depth: "foreground", color: "coral" },
  { id: "letter-meadow-23", x: 68, y: 5, scale: 0.69, rotate: 4, delay: 2750, depth: "foreground", color: "butter" },
  { id: "letter-meadow-24", x: 79, y: 3, scale: 0.77, rotate: -5, delay: 2300, depth: "foreground", color: "ivory" },
  { id: "letter-meadow-25", x: 91, y: 6, scale: 0.66, rotate: 6, delay: 2600, depth: "foreground", color: "coral" },
  { id: "letter-meadow-26", x: 4, y: 1, scale: 0.49, rotate: -8, delay: 2900, depth: "foreground", color: "lavender" },
  { id: "letter-meadow-27", x: 15, y: 29, scale: 0.44, rotate: 4, delay: 2800, depth: "background", color: "coral" },
  { id: "letter-meadow-28", x: 35, y: 13, scale: 0.51, rotate: 3, delay: 3050, depth: "midground", color: "butter" },
  { id: "letter-meadow-29", x: 53, y: 14, scale: 0.52, rotate: -4, delay: 2850, depth: "midground", color: "ivory" },
  { id: "letter-meadow-30", x: 77, y: 12, scale: 0.5, rotate: 4, delay: 3150, depth: "midground", color: "lavender" },
  { id: "letter-meadow-31", x: 97, y: 2, scale: 0.5, rotate: -4, delay: 3000, depth: "foreground", color: "butter" },
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
