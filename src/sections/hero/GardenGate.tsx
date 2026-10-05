import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SunlitIronGate from './SunlitIronGate';
import { gateLeafPaths } from './gateIronwork';
import './garden-gate.css';

/** The arched crowns belong to the moving leaves; the masonry sockets stay fixed. */
function IronLeaf({ side }: { side: 'left' | 'right' }) {
  return <div className={`garden-gate__leaf garden-gate__leaf--${side}`}>
    <svg viewBox="0 0 255 767" preserveAspectRatio="none" aria-hidden="true">
      <defs><g id={`estate-iron-${side}`} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {gateLeafPaths(side).map((path, i) => <path key={i} d={path.d} strokeWidth={path.width} />)}
      </g></defs>
      <g transform="translate(12 0)">
        <use href={`#estate-iron-${side}`} stroke="#181a16" transform="translate(1.3 1.8)" />
        <use href={`#estate-iron-${side}`} stroke="#3f3a2e" />
        <use href={`#estate-iron-${side}`} stroke="#b3a17a" opacity=".24" transform="translate(-.8 -.7)" />
        <path d="M224 353q-12 5-12 19v24q0 14 12 19" stroke="#756547" strokeWidth="5" fill="none" />
        {[270, 447, 688].map(y => <g key={y}><path d={`M0 ${y - 8}h37`} stroke="#302e25" strokeWidth="9" /><rect x="-4" y={y - 14} width="8" height="28" rx="2" fill="#756547" /></g>)}
      </g>
    </svg>
  </div>;
}

function GateSockets() {
  return <svg className="garden-gate__sockets" viewBox="0 0 510 767" preserveAspectRatio="none" aria-hidden="true">
    <defs><filter id="estate-contact"><feGaussianBlur stdDeviation="2.8" /></filter></defs>
    <path d="M5 767V214C5 102 151 3 287 4C412 4 505 93 505 191V767" fill="none" stroke="#261b12" strokeWidth="13" opacity=".3" filter="url(#estate-contact)" />
    {[12, 498].map(x => <g key={x}>
      <path d={`M${x} ${x === 12 ? 210 : 194}V767`} stroke="#22241d" strokeWidth="8" />
      <path d={`M${x + 2} ${x === 12 ? 210 : 194}V767`} stroke="#c2a571" strokeWidth="1.3" opacity=".45" />
      {[270, 447, 688].map(y => <g key={y}>
        <rect x={x - 11} y={y - 22} width="22" height="44" rx="2" fill="#151810" opacity=".24" filter="url(#estate-contact)" />
        <rect x={x - 9} y={y - 20} width="18" height="40" rx="2" fill="#3c382d" stroke="#8c7755" strokeWidth=".7" />
        {[-12, 12].map(offset => <circle key={offset} cx={x} cy={y + offset} r="2.3" fill="#a18b64" stroke="#25271d" strokeWidth="1" />)}
      </g>)}
    </g>)}
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
          <div className="garden-gate__doors"><IronLeaf side="left" /><IronLeaf side="right" /></div>
          <SunlitIronGate active={active} />
          <GateSockets />
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
