import { publicAsset } from "@/lib/assets/publicAsset";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import FlowerBloomCanvas from './FlowerBloomCanvas';
import { preloadBloomSequence } from '@/lib/assets/preloadBloomSequence';
import FlowerAtmosphere from './FlowerAtmosphere';
import PondWaterCanvas from './PondWaterCanvas';

// Tall blossoms form the canopy; smaller blooms fill the gaps above the stems.
const BLOOMS = [
  { id: 'blue-back', palette: 'midnight', x: 13, y: 17, scale: .36, rotate: -6, delay: 1200, duration: 4800, depth: 'back' },
  { id: 'pink-main', palette: 'pink', x: 56, y: 11, scale: 1, rotate: -2, delay: 0, duration: 5200, depth: 'middle' },
  { id: 'pink-front', palette: 'pink', x: 67, y: 3, scale: .57, rotate: 3, delay: 2650, duration: 4200, depth: 'front' },
  { id: 'blue-tall', palette: 'midnight', x: 33, y: 7, scale: .82, rotate: -6, delay: 350, duration: 5300, depth: 'middle' },
  { id: 'ivory-tall', palette: 'ivory', x: 79, y: 5, scale: .79, rotate: 5, delay: 950, duration: 5100, depth: 'middle' },
  { id: 'ivory-front', palette: 'ivory', x: 20, y: 7, scale: .49, rotate: -11, delay: 1650, duration: 4500, depth: 'front' },
  { id: 'blue-front', palette: 'midnight', x: 92, y: 0, scale: .50, rotate: 7, delay: 2200, duration: 4800, depth: 'front' },
  { id: 'pink-fill', palette: 'pink', x: 44, y: 4, scale: .43, rotate: -4, delay: 3100, duration: 4300, depth: 'front' },
  { id: 'ivory-fill', palette: 'ivory', x: 54, y: 8, scale: .42, rotate: 6, delay: 3500, duration: 4200, depth: 'front' },
] as const;

export default function LetterBloomGarden({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const pond = useRef<HTMLDivElement>(null);
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
    Promise.all([preloadBloomSequence(), preloadBloomSequence('blue')])
      .then(() => { if (!cancelled) setReady(true); })
      .catch((error: unknown) => console.error('Letter garden failed to load', error));
    return () => { cancelled = true; };
  }, []);
  const running = active && inView && visible && ready;

  return <div ref={root} className="letter-bloom-garden" data-running={running} data-bloomed={bloomed} aria-hidden="true">
    <div ref={pond} className="letter-bloom-garden__pond" data-swans="2" data-swan-interaction="paired">
      <img className="pond-water" src={publicAsset("/assets/flowers/letter-garden/moonlit-pond.png")} width="1774" height="887" decoding="async" alt="" />
      <PondWaterCanvas running={running} pond={pond} />
      {[0,1].map(index=><div key={index} className={`pond-swimmer${index?' pond-swimmer--far':''}`} data-swan={index+1}>
        <div className="pond-swan-body">
          <div className="pond-swan-float"><img className="pond-swan" src={publicAsset("/assets/flowers/letter-garden/swimming-swan.png")} width="1254" height="1254" decoding="async" alt=""/></div>
          <div className="pond-swan-reflection"><img src={publicAsset("/assets/flowers/letter-garden/swimming-swan.png")} width="1254" height="1254" decoding="async" alt=""/></div>
        </div>
      </div>)}
      <svg className="pond-heart" viewBox="0 0 40 36" fill="none" aria-hidden="true">
        <path d="M20 31C15 26 3 18 3 10C3 1 15 0 20 9C25 0 37 1 37 10C37 18 25 26 20 31Z" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
    <FlowerAtmosphere isActive={running} />
    <div className="letter-bloom-garden__flowers">
      {BLOOMS.map(flower => <FlowerBloomCanvas key={flower.id} palette={flower.palette} sequence={flower.palette === 'midnight' ? 'blue' : 'pink'}
        className={`letter-bloom-garden__bloom letter-bloom-garden__bloom--${flower.depth}`}
        isActive={running} hasBloomed={bloomed} isSecondary={flower.id !== 'pink-main'}
        baseRotation={flower.rotate} delayMs={flower.delay} durationMs={flower.duration}
        style={{ '--bloom-x': `${flower.x}%`, '--bloom-bottom': `${flower.y}%`, '--bloom-scale': flower.scale } as CSSProperties}
        onBloomComplete={() => finish(flower.id)} />)}
    </div>
    <div className="letter-bloom-garden__meadow" data-depth="foreground">
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--left" src={publicAsset("/assets/flowers/nature/grass-airy-tall.png")} alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--strip" src={publicAsset("/assets/flowers/nature/grass-back-strip.png")} alt="" />
      <img className="letter-bloom-garden__grass letter-bloom-garden__grass--right" src={publicAsset("/assets/flowers/nature/grass-airy-tall.png")} alt="" />
    </div>
  </div>;
}
