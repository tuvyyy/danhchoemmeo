import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import FlowerBloomCanvas from './FlowerBloomCanvas';
import { preloadBloomSequence } from '@/lib/assets/preloadBloomSequence';
import FlowerAtmosphere from './FlowerAtmosphere';

// Seven real frame sequences: three pink anchors, two ivory, two midnight blue.
const BLOOMS = [
  { id: 'pink-back', palette: 'pink', x: 19, y: 13, scale: .46, rotate: -7, delay: 850, duration: 4400, depth: 'back' },
  { id: 'pink-main', palette: 'pink', x: 56, y: 8, scale: .93, rotate: -2, delay: 0, duration: 5200, depth: 'middle' },
  { id: 'pink-front', palette: 'pink', x: 61, y: -1, scale: .55, rotate: 3, delay: 2650, duration: 4200, depth: 'front' },
  { id: 'blue-tall', palette: 'midnight', x: 34, y: 6, scale: .75, rotate: -7, delay: 350, duration: 5000, depth: 'middle' },
  { id: 'ivory-tall', palette: 'ivory', x: 77, y: 3, scale: .78, rotate: 5, delay: 950, duration: 5100, depth: 'middle' },
  { id: 'ivory-front', palette: 'ivory', x: 21, y: 0, scale: .47, rotate: -11, delay: 1650, duration: 4500, depth: 'front' },
  { id: 'blue-front', palette: 'midnight', x: 87, y: -2, scale: .5, rotate: 8, delay: 2200, duration: 4400, depth: 'front' },
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
    if (completed.current.size === BLOOMS.length) setBloomed(true);
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

  return <div ref={root} className="letter-bloom-garden" data-running={running} data-bloomed={bloomed} aria-hidden="true">
    <div className="letter-bloom-garden__pond" data-swans="2">
      <img className="pond-water" src="/assets/flowers/letter-garden/moonlit-pond.png" width="1774" height="887" decoding="async" alt="" />
      {[0,1].map(index=><div key={index} className={`pond-swimmer${index?' pond-swimmer--far':''}`} data-swan={index+1}>
        <i className="pond-wake"/><i className="pond-wake pond-wake--late"/>
        <div className="pond-swan-body">
          <div className="pond-swan-float"><img className="pond-swan" src="/assets/flowers/letter-garden/swimming-swan.png" width="1254" height="1254" decoding="async" alt=""/></div>
          <div className="pond-swan-reflection"><img src="/assets/flowers/letter-garden/swimming-swan.png" width="1254" height="1254" decoding="async" alt=""/></div>
        </div>
      </div>)}
    </div>
    <FlowerAtmosphere isActive={running} />
    <div className="letter-bloom-garden__flowers">
      {BLOOMS.map(flower => <FlowerBloomCanvas key={flower.id} palette={flower.palette}
        className={`letter-bloom-garden__bloom letter-bloom-garden__bloom--${flower.depth}`}
        isActive={running} hasBloomed={bloomed} isSecondary={flower.id !== 'pink-main'}
        baseRotation={flower.rotate} delayMs={flower.delay} durationMs={flower.duration}
        style={{ '--bloom-x': `${flower.x}%`, '--bloom-bottom': `${flower.y}%`, '--bloom-scale': flower.scale } as CSSProperties}
        onBloomComplete={() => finish(flower.id)} />)}
    </div>
    <div className="letter-bloom-garden__meadow" data-depth="foreground">
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--left" src="/assets/flowers/nature/grass-airy-tall.png" alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--strip" src="/assets/flowers/nature/grass-back-strip.png" alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--right" src="/assets/flowers/nature/grass-airy-tall.png" alt="" />
    </div>
  </div>;
}
