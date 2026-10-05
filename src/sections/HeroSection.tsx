import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { preloadFlowerAssets } from "@/lib/assets/preloadFlowers";
import couplePhoto from "@/assets/hero/couple-original-tone.png";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { useScenePreferences } from "@/components/effects/useScenePreferences";
import { useSceneOverlay } from "@/components/effects/SceneExperience";
import EntranceGate from "./hero/EntranceGate";
import ReliefGarden from "./hero/ReliefGarden";
import "./hero/hero-gallery.css";

function OurPhotograph({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useSceneOverlay(true);
  useLayoutEffect(() => {
    const node=dialog.current!, previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    node.showModal();document.body.style.overflow='hidden';
    return () => {node.close();document.body.style.overflow=overflow;previous?.focus({preventScroll:true});};
  }, []);
  return createPortal(<dialog ref={dialog} className="hero-portrait" aria-label="Tấm hình của tụi mình" onCancel={event=>{event.preventDefault();onClose();}}>
    <button autoFocus className="hero-portrait__close" onClick={onClose}>Khép lại <span aria-hidden="true">×</span></button>
    <figure><img src={couplePhoto} alt="Hai đứa ôm nhau trước gương"/><figcaption>từ một cái ôm, thành cả một câu chuyện.</figcaption></figure>
    <span className="hero-portrait__date">TỤI MÌNH · 2025 — FOREVER</span>
  </dialog>,document.body);
}

export default function HeroSection({ onComplete }: { onComplete: (options?: { instant?: boolean }) => void }) {
  const { isActive, isTransitioning } = useChapterLifecycle(0);
  const { reducedMotion, finePointer } = useScenePreferences();
  const [portrait, setPortrait] = useState(false);
  const [entered, setEntered] = useState(false);
  const [night, setNight] = useState(false);
  const gallery = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (entered) gallery.current?.focus({ preventScroll: true });
  }, [entered]);
  useEffect(() => { preloadFlowerAssets(); }, []);
  return <div className="hero-opening" data-entered={entered}>
    <section ref={gallery} tabIndex={-1} inert={!entered} aria-hidden={!entered} className="cinematic-hero hero-gallery" data-night={night}
      onPointerMove={event => { if (cursor.current && finePointer) { const rect=event.currentTarget.getBoundingClientRect(); cursor.current.style.transform=`translate(${event.clientX-rect.left}px,${event.clientY-rect.top}px)`; cursor.current.style.opacity='1'; } }}
      onPointerLeave={() => { if(cursor.current)cursor.current.style.opacity='0'; }}>
      <ReliefGarden active={isActive && !isTransitioning && !portrait} night={night} reducedMotion={reducedMotion} />
      <header className="hero-gallery__header">
        <button className="hero-gallery__back hero-gallery__edition" onClick={() => setEntered(false)}>← Cánh cổng</button>
        <button className="hero-gallery__theme" onClick={() => setNight(value => !value)} aria-pressed={night}><span className="hero-gallery__moon" aria-hidden="true" />{night ? 'Khu vườn ban ngày' : 'Khu vườn đêm'}<span aria-hidden="true">↗</span></button>
      </header>
      <div className="hero-gallery__center">
        <div className="hero-gallery__signature"><span className="hero-gallery__monogram">m</span><span>DÀNH CHO<br />EM MEO</span></div>
        <h1>Chúc mừng em,<em>và tụi mình.</em></h1>

      </div>
      <footer className="hero-gallery__footer">
        <button className="hero-gallery__photograph" onClick={() => setPortrait(true)}><span className="hero-gallery__photo-mark" aria-hidden="true" />Tấm hình của tụi mình<span aria-hidden="true">↗</span></button>
        <p>10.11 <i>·</i> SÀI GÒN — HÀ NỘI</p>
        <button className="cinematic-hero__cta" onClick={() => onComplete()} disabled={!isActive || isTransitioning}>Bắt đầu câu chuyện<span className="hero-gallery__arrow" aria-hidden="true">↓</span></button>
      </footer>
      <span ref={cursor} className="hero-gallery__cursor" aria-hidden="true" />
    </section>
    {!entered && <EntranceGate reducedMotion={reducedMotion} finePointer={finePointer} onEntered={() => setEntered(true)} onPhotograph={() => setPortrait(true)} />}
    {portrait && <OurPhotograph onClose={() => setPortrait(false)} />}
  </div>;
}
