import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import FlowerBloomCanvas from './FlowerBloomCanvas';
import { preloadBloomSequence } from '@/lib/assets/preloadBloomSequence';
import FlowerAtmosphere from './FlowerAtmosphere';

// Keep the original opening sequence; cooler and ivory accents sit between its layers.
const PINK_BLOOMS = [
  { id: 'pink-back-left', x: 18, y: 16, scale: .54, rotate: -7, delay: 850, duration: 4400, depth: 'back' },
  { id: 'pink-back-middle', x: 39, y: 24, scale: .65, rotate: 5, delay: 1200, duration: 4600, depth: 'back' },
  { id: 'pink-back-right', x: 82, y: 21, scale: .57, rotate: 7, delay: 1550, duration: 4500, depth: 'back' },
  { id: 'pink-main', x: 59, y: 22, scale: 1, rotate: -2, delay: 0, duration: 5200, depth: 'middle' },
  { id: 'pink-middle-left', x: 28, y: 9, scale: .78, rotate: -5, delay: 650, duration: 4800, depth: 'middle' },
  { id: 'pink-middle-right', x: 77, y: 8, scale: .82, rotate: 4, delay: 1900, duration: 4500, depth: 'middle' },
  { id: 'pink-front-left', x: 14, y: -1, scale: .59, rotate: -8, delay: 2350, duration: 4100, depth: 'front' },
  { id: 'pink-front-middle', x: 48, y: -2, scale: .70, rotate: 3, delay: 2650, duration: 4200, depth: 'front' },
  { id: 'pink-front-right', x: 84, y: 1, scale: .56, rotate: 6, delay: 2950, duration: 4050, depth: 'front' },
] as const;

const ACCENT_BLOOMS = [
  { id: 'blue-tall', color: 'slate-blue', asset: 'slate-blue-lily', x: 33, y: 20, scale: .92, rotate: -7, delay: .35 },
  { id: 'ivory-tall', color: 'ivory', asset: 'ivory-lily', x: 75, y: 18, scale: .97, rotate: 5, delay: .95 },
  { id: 'ivory-front', color: 'ivory', asset: 'ivory-lily', x: 17, y: 1, scale: .68, rotate: -11, delay: 1.65 },
  { id: 'blue-front', color: 'slate-blue', asset: 'slate-blue-lily', x: 91, y: 2, scale: .72, rotate: 8, delay: 2.2 },
] as const;

export default function LetterBloomGarden({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const completed = useRef(new Set<string>());
  const [bloomed, setBloomed] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const [started, setStarted] = useState(false);
  const finish = useCallback((id: string) => {
    completed.current.add(id);
    if (completed.current.size === PINK_BLOOMS.length) setBloomed(true);
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
    preloadBloomSequence()
      .then(() => { if (!cancelled) setReady(true); })
      .catch((error: unknown) => console.error('Letter garden failed to load', error));
    return () => { cancelled = true; };
  }, []);
  const running = active && inView && visible && ready;
  useEffect(() => { if (running) setStarted(true); }, [running]);

  return <div ref={root} className="letter-bloom-garden" data-running={running} data-started={started} data-bloomed={bloomed} aria-hidden="true">
    <div className="letter-bloom-garden__pond" data-swans="2">
      <img src="/assets/flowers/letter-garden/distant-swan-pond.png" width="1774" height="887" decoding="async" alt="" />
    </div>
    <FlowerAtmosphere isActive={running} />
    <div className="letter-bloom-garden__flowers">
      {PINK_BLOOMS.map(flower => <FlowerBloomCanvas key={flower.id}
        className={`letter-bloom-garden__bloom letter-bloom-garden__bloom--${flower.depth}`}
        isActive={running} hasBloomed={bloomed} isSecondary={flower.id !== 'pink-main'}
        baseRotation={flower.rotate} delayMs={flower.delay} durationMs={flower.duration}
        style={{ '--bloom-x': `${flower.x}%`, '--bloom-bottom': `${flower.y}%`, '--bloom-scale': flower.scale } as CSSProperties}
        onBloomComplete={() => finish(flower.id)} />)}
      {ACCENT_BLOOMS.map(flower => <div key={flower.id}
        className="letter-bloom-garden__accent" data-flower-color={flower.color}
        style={{ '--bloom-x': `${flower.x}%`, '--bloom-bottom': `${flower.y}%`, '--bloom-scale': flower.scale,
          '--bloom-rotation': `${flower.rotate}deg`, '--bloom-delay': `${flower.delay}s` } as CSSProperties}>
        <img src={`/assets/flowers/letter-garden/${flower.asset}.png`} width="1024" height="1536" decoding="async" alt="" />
      </div>)}
    </div>
    <div className="letter-bloom-garden__meadow">
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--left" src="/assets/flowers/nature/grass-airy-tall.png" alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--strip" src="/assets/flowers/nature/grass-back-strip.png" alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--right" src="/assets/flowers/nature/grass-airy-tall.png" alt="" />
    </div>
  </div>;
}
