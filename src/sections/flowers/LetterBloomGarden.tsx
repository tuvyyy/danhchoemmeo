import { useCallback, useEffect, useRef, useState } from 'react';
import FlowerBloomCanvas from './FlowerBloomCanvas';
import TulipBloom from './TulipBloom';
import './letter-bloom-garden.css';

// The original bloom sequences, gathered into a fan-shaped cluster at the letter.
const TULIPS = [
  { id: 'letter-ivory-left', x: 24, y: 2, scale: 0.86, rotate: -25, delay: 1000, depth: 'foreground' },
  { id: 'letter-ivory-right', x: 71, y: 1, scale: 1.03, rotate: 20, delay: 1800, depth: 'foreground' },
  { id: 'letter-ivory-back', x: 41, y: 8, scale: 0.96, rotate: -9, delay: 2600, depth: 'background' },
  { id: 'letter-butter-left', x: 33, y: 0, scale: 0.77, rotate: -19, delay: 1400, depth: 'foreground', color: 'butter' },
  { id: 'letter-lavender-left', x: 35, y: 10, scale: 0.95, rotate: -16, delay: 2200, depth: 'background', color: 'lavender' },
  { id: 'letter-coral-left', x: 40, y: 0, scale: 0.71, rotate: -12, delay: 1700, depth: 'foreground', color: 'coral' },
  { id: 'letter-butter-middle', x: 49, y: 6, scale: 0.94, rotate: -4, delay: 2800, depth: 'midground', color: 'butter' },
  { id: 'letter-coral-right', x: 65, y: 2, scale: 0.84, rotate: 16, delay: 2400, depth: 'foreground', color: 'coral' },
  { id: 'letter-lavender-right', x: 66, y: 11, scale: 1.04, rotate: 14, delay: 3400, depth: 'background', color: 'lavender' },
  { id: 'letter-butter-edge', x: 76, y: 0, scale: 0.72, rotate: 27, delay: 3100, depth: 'foreground', color: 'butter' },
  { id: 'letter-lavender-front', x: 59, y: 0, scale: 0.65, rotate: 7, delay: 3800, depth: 'foreground', color: 'lavender' },
  { id: 'letter-coral-front', x: 53, y: 0, scale: 0.7, rotate: -6, delay: 4100, depth: 'foreground', color: 'coral' },
  { id: 'letter-butter-right', x: 81, y: 0, scale: 0.8, rotate: 29, delay: 3000, depth: 'foreground', color: 'butter' },
] as const;

export default function LetterBloomGarden({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const completed = useRef(new Set<string>());
  const [bloomed, setBloomed] = useState(false);
  const [inView, setInView] = useState(false);
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
  const running = active && inView && visible;

  return <div ref={root} className="letter-bloom-garden" data-running={running} data-bloomed={bloomed} aria-hidden="true">
    <FlowerBloomCanvas className="letter-bloom-garden__lily letter-bloom-garden__lily--left"
      isActive={running} hasBloomed={bloomed} isSecondary baseRotation={-13}
      delayMs={700} durationMs={6500} onBloomComplete={() => finish('lily-left')} />
    <FlowerBloomCanvas className="letter-bloom-garden__lily letter-bloom-garden__lily--right"
      isActive={running} hasBloomed={bloomed} baseRotation={10}
      delayMs={100} durationMs={6200} onBloomComplete={() => finish('lily-right')} />
    {TULIPS.map(tulip => <TulipBloom key={tulip.id} {...tulip} durationMs={3000}
      isActive={running} hasBloomed={bloomed} onBloomComplete={() => finish(tulip.id)} />)}
  </div>;
}
