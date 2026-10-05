import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SunlitIronGate from './SunlitIronGate';
import './garden-gate.css';

/** Fixed fanlight, rectangular iron leaves: only the leaves rotate on their jambs. */
function IronLeaf({ side }: { side: 'left' | 'right' }) {
  const id = `estate-iron-${side}`;
  return <div className={`garden-gate__leaf garden-gate__leaf--${side}`}>
    <svg viewBox="0 0 240 620" preserveAspectRatio="none" aria-hidden="true">
      <defs><g id={id} fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d="M5 4H234V616H5ZM16 16H222V605H16ZM26 29H210V592H26" />
        <path d="M16 16L26 29M222 16L210 29M16 605L26 592M222 605L210 592" />
        {[43,71,99,139,167,195].map((x,i)=><path key={x} d={`M${x} ${i===2||i===3?154:111}V${530-(i%3)*19}q${i<3?14:-14} 14 0 28`} />)}
        <path d="M119 576V165C117 142 86 131 87 103C88 87 110 89 108 104C106 113 95 112 96 104M119 165C121 142 152 131 151 103C150 87 128 89 130 104C132 113 143 112 142 104" />
        <path d="M119 137C103 122 62 116 59 87C55 58 87 57 88 77C88 91 66 92 68 78M119 137C135 122 176 116 179 87C183 58 151 57 150 77C150 91 172 92 170 78" />
        <path d="M119 118C101 101 101 60 119 49C137 60 137 101 119 118ZM119 49V34" />
        <path d="M27 51C45 32 68 47 62 61C56 73 39 67 44 57M211 51C193 32 170 47 176 61C182 73 199 67 194 57" />
        <path d="M43 113C17 100 27 82 37 87C46 91 41 101 35 97M195 113C221 100 211 82 201 87C192 91 197 101 203 97" />
        <path d="M27 305C52 274 81 290 75 310C68 331 45 317 50 305M27 344C51 373 81 357 75 337C68 316 45 330 50 342M211 305C186 274 157 290 163 310C170 331 193 317 188 305M211 344C187 373 157 357 163 337C170 316 193 330 188 342" />
        <path d="M26 556C57 525 101 553 82 576C65 592 47 568 63 560M212 556C181 525 137 553 156 576C173 592 191 568 175 560M119 576q-19 15 0 29q19-14 0-29Z" />
      </g></defs>
      <use href={`#${id}`} stroke="#1c201a" strokeWidth="5.5" opacity=".35" />
      <use href={`#${id}`} stroke="#373a2d" strokeWidth="3.1" />
      <use href={`#${id}`} stroke="#e4d4a6" strokeWidth=".65" opacity=".28" transform="translate(-.7 -.5)" />
      <path d="M218 244v48" stroke="#252a20" strokeWidth="7" strokeLinecap="round" />
      <path d="M217 245q-7 22 0 45" stroke="#8a8266" strokeWidth="2" fill="none" />
    </svg>
  </div>;
}

function Fanlight() {
  return <svg className="garden-gate__fanlight" viewBox="0 0 480 208" preserveAspectRatio="none" aria-hidden="true">
    <defs><clipPath id="estate-fan-clip"><path d="M0 208V188C0 84 111 0 240 0S480 84 480 188V208Z" /></clipPath></defs>
    <g clipPath="url(#estate-fan-clip)" fill="none" stroke="#373a2d" strokeWidth="3.3">
      <path d="M2 206V188C2 85 112 3 240 3S478 85 478 188V206M0 200H480M0 193H480M0 155H480M0 147H480" />
      {[0,1,2,3,4,5,6,7,8,9,10].map(i=><path key={i} transform={`translate(${i*44-5} 176)`} d="M0 0C8-25 38-25 40-5C42 10 17 14 17 0C17-8 29-8 28-1M40-5C49-30 73-15 75 0" strokeWidth="2.6" />)}
      <g transform="translate(240 61)">
        <ellipse rx="23" ry="33" strokeWidth="2.5" /><ellipse rx="17" ry="28" strokeWidth="1" />
        <path d="M-5 20V-21L8 6V-23M-15 9Q2-4 15 12M-7-34L0-44L7-34" strokeWidth="2" />
        <path d="M-25 14C-69-35-126-21-112 13C-103 34-77 14-89 1M25 14C69-35 126-21 112 13C103 34 77 14 89 1M-26 15C-58 28-68 0-52-5M26 15C58 28 68 0 52-5" />
        <path d="M-21 28C-37 50-79 44-79 62C-79 80-51 79-56 63M21 28C37 50 79 44 79 62C79 80 51 79 56 63M0 34V54C-31 33-42 66-24 72C-13 74-8 62-15 58M0 54C31 33 42 66 24 72C13 74 8 62 15 58" />
        <path d="M-96 30C-107 84-160 83-159 45H-185Q-184 78-216 69M96 30C107 84 160 83 159 45H185Q184 78 216 69" />
        {[-1,1].map(side => <g key={side} transform={`scale(${side} 1)`} fill="#373a2d" strokeWidth=".5">
          <path d="M30 13C46-5 66-17 93-10L78-2L88 3L69 5L73 11L53 9L55 18L38 15Z" />
          <path d="M46 12C62 11 77 19 88 32L77 30L79 38L65 29L64 36L54 25L48 29L42 18Z" />
          <path d="M89-4C101-16 117-17 129-10L116-7L124-2L109 1L112 6L96 4Z" />
        </g>)}
      </g>
    </g>
  </svg>;
}

type Props = { active: boolean; transitioning: boolean; reducedMotion: boolean; finePointer: boolean; onEnter: () => void; onPhotograph: () => void };

export default function GardenGate({ active, transitioning, reducedMotion, finePointer, onEnter, onPhotograph }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [peek, setPeek] = useState(false);
  const [artFailed, setArtFailed] = useState(false);
  const open = hovered || focused || peek;

  useLayoutEffect(() => {
    const node = root.current!;
    if (transitioning) return;
    if (!active) { gsap.set(node, { '--gate-open': 0 }); return; }
    const tween = gsap.to(node, { '--gate-open': open ? 1 : 0, duration: reducedMotion ? 0 : open ? 1.35 : 1.65, ease: 'power2.out', overwrite: true });
    return () => { tween.kill(); };
  }, [open, active, transitioning, reducedMotion]);
  useEffect(() => { if (!active) { setHovered(false); setFocused(false); setPeek(false); } }, [active]);

  const available = active && !transitioning;
  const focus = () => { if (available) setFocused(true); };
  const blur = () => setFocused(false);
  return <div ref={root} className="garden-gate" data-open={open} data-art={artFailed ? 'fallback' : 'ready'}
    onKeyDown={event => { if (event.key === 'Escape' && !transitioning) { setHovered(false); setFocused(false); setPeek(false); } }}>
    <svg className="garden-gate__filters" aria-hidden="true"><defs>
      <filter id="estate-type-softness" x="-10%" y="-20%" width="120%" height="150%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".008 .023" numOctaves="1" seed="4" result="mist" />
        <feDisplacementMap in="SourceGraphic" in2="mist" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation=".22" />
      </filter>
    </defs></svg>
    <div className="garden-gate__world" aria-hidden="true">
      <div className="garden-gate__set">
        <img className="garden-gate__plate" src="/assets/garden-gate/estate-sunset.webp" width="1774" height="887" alt="" fetchPriority="high" onError={() => setArtFailed(true)} />
        <div className="garden-gate__architecture">
          <div className="garden-gate__mist" />
          <Fanlight />
          <div className="garden-gate__doors"><IronLeaf side="left" /><IronLeaf side="right" /></div>
          <SunlitIronGate active={active} />
          <div className="garden-gate__jamb" />
        </div>
        <div className="garden-gate__sunlight" />
      </div>
      <div className="garden-gate__shade" />
    </div>
    <div className="garden-gate__grain" aria-hidden="true" />
    <header className="garden-gate__header">
      <button type="button" className="garden-gate__photo" onClick={onPhotograph} disabled={!available} aria-label="Tấm hình của tụi mình"><span aria-hidden="true">♡</span></button>
      <span>DÀNH CHO EM MEO</span><span className="garden-gate__date">10 / 11</span>
    </header>
    <div className="garden-gate__copy">
      <h1><em>Gửi em,</em><span>MỘT TRỜI</span><span>THƯƠNG.</span></h1>
      <p>Có những điều chỉ muốn dành cho một người.<br />Và người đó, là em.</p>
      <button type="button" className="cinematic-hero__cta garden-gate__enter" onClick={onEnter} disabled={!available} onFocus={focus} onBlur={blur}>
        <span>Bước vào câu chuyện</span><span aria-hidden="true">↗</span>
      </button>
    </div>
    <div className="garden-gate__hit-plane">
      <button type="button" className="garden-gate__hit" disabled={!available}
        aria-label={finePointer ? 'Bước qua cánh cổng' : peek ? 'Khép cánh cổng' : 'Chạm để mở cánh cổng'}
        aria-pressed={finePointer ? undefined : peek}
        onPointerEnter={event => { if (available && event.pointerType === 'mouse') setHovered(true); }}
        onPointerLeave={() => setHovered(false)} onFocus={focus} onBlur={blur}
        onClick={event => { if (finePointer || event.detail === 0) onEnter(); else { setPeek(value => !value); setFocused(false); } }}>
        <span className="sr-only">{finePointer ? 'Rê vào để mở, rê ra để khép cổng. Bấm để bước vào.' : 'Chạm để ngắm cổng mở. Bấm Bước vào câu chuyện để tiếp tục.'}</span>
      </button>
    </div>
    <footer className="garden-gate__footer"><span>MỘT NGÀY · DÀNH RIÊNG CHO EM</span><span>{finePointer ? 'RÊ CHUỘT LÊN CỔNG' : 'CHẠM NHẸ LÊN CỔNG'} <i aria-hidden="true">↗</i></span></footer>
    <div className="garden-gate__passage" aria-hidden="true" />
    <div className="garden-gate__chapter" aria-hidden="true"><span>CHƯƠNG MỘT</span><p><em>Một khoảng trời</em><span>CHỈ CÓ</span><span>TỤI MÌNH.</span></p><i /></div>
  </div>;
}
