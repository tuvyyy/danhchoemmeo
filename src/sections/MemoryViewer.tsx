import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MomentItem } from "@/data/birthdayContent";
import { useSceneOverlay } from "@/components/effects/SceneExperience";

export default function MemoryViewer({ items, initial, onClose, onVisit }: {
  items: MomentItem[]; initial: number; onClose: () => void; onVisit: (index: number) => void;
}) {
  const [selected, setSelected] = useState(initial);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null), figure = useRef<HTMLElement>(null);
  const closing = useRef(false), selectedRef = useRef(initial), swipe = useRef<number | null>(null);
  const visit = useRef(onVisit); visit.current = onVisit;
  useSceneOverlay(true);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const node = figure.current;
    const source = document.querySelector<HTMLElement>(`.memory-print[data-index="${selectedRef.current}"] .memory-print__photo`);
    const done = () => { dialog.current?.close(); onClose(); };
    if (!node || !source || matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
    const a = source.getBoundingClientRect(), b = node.getBoundingClientRect();
    gsap.to(node, { x: Number(gsap.getProperty(node, 'x')) + a.left + a.width / 2 - b.left - b.width / 2, y: Number(gsap.getProperty(node, 'y')) + a.top + a.height / 2 - b.top - b.height / 2, scale: Number(gsap.getProperty(node, 'scaleX')) * a.width / Math.max(1, b.width), opacity: 0, duration: .42, overwrite: 'auto', ease: 'power2.inOut', onComplete: done });
    gsap.to(dialog.current, { '--viewer-shade': 0, duration: .42, overwrite: 'auto' });
  }, [onClose]);
  const select = useCallback((index: number) => {
    if (closing.current) return;
    const next = (index + items.length) % items.length;
    selectedRef.current = next; setSelected(next); setFailed(false); visit.current(next);
  }, [items.length]);
  useLayoutEffect(() => {
    const modal = dialog.current!, node = figure.current!;
    const focused = document.activeElement as HTMLElement | null;
    modal.showModal(); visit.current(initial);
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const source = document.querySelector<HTMLElement>(`.memory-print[data-index="${initial}"] .memory-print__photo`);
    const context = gsap.context(() => {
      if (source && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const a = source.getBoundingClientRect(), b = node.getBoundingClientRect();
        gsap.from(node, { x: a.left + a.width / 2 - b.left - b.width / 2, y: a.top + a.height / 2 - b.top - b.height / 2, scale: a.width / b.width, rotation: items[initial].rot, duration: .75, ease: 'power3.inOut' });
        gsap.from(modal, { '--viewer-shade': 0, duration: .45 });
        gsap.from('.memory-viewer__copy, .memory-viewer__strip', { opacity: 0, y: 15, duration: .4, delay: .3, stagger: .08 });
      }
    }, modal);
    return () => { context.revert(); gsap.killTweensOf([node, modal]); modal.close(); document.body.style.overflow = before; focused?.focus({ preventScroll: true }); };
  }, [initial, items]);
  return createPortal(<dialog ref={dialog} className="memory-viewer" aria-label="Album kỷ niệm của tụi mình" onCancel={event => { event.preventDefault(); close(); }}
    onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(selectedRef.current + (event.key === 'ArrowRight' ? 1 : -1)); } }}>
    <div className="memory-viewer__wash" aria-hidden="true" onClick={close}/>
    <header className="memory-viewer__header"><span>NHỮNG ĐIỀU MÌNH MUỐN GIỮ</span><button autoFocus onClick={close} aria-label="Đóng album">Khép album <span aria-hidden="true">×</span></button></header>
    <div className="memory-viewer__stage" onTouchStart={event => { swipe.current = event.touches[0].clientX; }} onTouchEnd={event => { if (swipe.current !== null) { const dx = event.changedTouches[0].clientX - swipe.current; if (Math.abs(dx) > 45) select(selectedRef.current + (dx < 0 ? 1 : -1)); swipe.current = null; } }}>
      <figure ref={figure} className="memory-viewer__figure"><div className="memory-viewer__image"><AnimatePresence initial={false}>{failed ? <div className="memory-viewer__fallback">Một điều mình muốn giữ lại.</div> : <motion.img key={selected} src={items[selected].src} alt={items[selected].caption} initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.035 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .42, ease: [.2, .65, .3, 1] }} onError={() => setFailed(true)}/>}</AnimatePresence></div><figcaption>của em, của tui, của tụi mình.</figcaption></figure>
      <div className="memory-viewer__copy" aria-live="polite"><span className="memory-viewer__index">0{selected + 1}<i>/ 0{items.length}</i></span><h3 key={selected}>{items[selected].caption}</h3><p>Thời gian cứ đi.<br/>Mình giữ lại những điều thương.</p><div className="memory-viewer__arrows"><button onClick={() => select(selected - 1)} aria-label="Ảnh trước">←</button><button onClick={() => select(selected + 1)} aria-label="Ảnh tiếp theo">→</button></div></div>
    </div>
    <nav className="memory-viewer__strip" aria-label="Chọn ảnh kỷ niệm">{items.map((item,index) => <button key={item.src} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={selected === index} onClick={() => select(index)}><img src={item.src} alt=""/><span>0{index + 1}</span></button>)}</nav>
  </dialog>, document.body);
}
