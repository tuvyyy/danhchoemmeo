import { useState, type CSSProperties } from "react";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useSceneTilt } from "@/components/effects/useSceneDepth";
import "./moments-scene.css";
import MemoryViewer from "./MemoryViewer";

const notes = ["một cái nắm tay", "một đêm thật dài", "một lời hẹn", "còn viết tiếp…"];
const drawings = ["M12 21S2 14 2 8c0-6 8-7 10-1 2-6 10-5 10 1 0 6-10 13-10 13Z", "M19 18A9 9 0 0 1 7 4a9 9 0 1 0 12 14ZM19 3v5m-2.5-2.5h5", "M2 18h20M5 15a7 7 0 0 1 14 0M12 2v3M3 6l2 2m14 0 2-2M7 22h10", "M4 16c0-8 16-8 16 0S4 24 4 16Zm8-13v6m-3-3h6"];
export default function MomentsSection({ onComplete }: { onComplete: () => void }) {
  const tilt = useSceneTilt(5);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [viewer, setViewer] = useState<number | null>(null);
  const { moments } = BIRTHDAY_DATA;
  const flip = (index: number) => {
    setRevealed(previous => { const next = new Set(previous); if (next.has(index)) next.delete(index); else next.add(index); return next; });
    setSeen(previous => new Set([...previous, index]));
  };
  return <section className="scrapbook-scene memory-table" aria-label={moments.chapter} data-seen={seen.size}>
    <svg className="memory-table__thread" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M-30 430C210 400 190 705 435 690S734 371 1001 451S1255 680 1480 580"/></svg>
    <header className="memory-table__header"><span>CHƯƠNG 04 / KHOẢNH KHẮC</span></header>
    <div className="memory-table__intro"><h2>Xa một chút,<br/><em>kỷ niệm vẫn gần.</em></h2><div><button className="memory-album-open" onClick={() => setViewer(0)}>Mở album ảnh <span aria-hidden="true">↗</span></button></div></div>
    <div className="memory-board" aria-label="Bốn tấm hình kỷ niệm">
      {moments.items.map((moment, index) => <button key={moment.src} className="memory-print" data-index={index} data-revealed={revealed.has(index)}
        style={{ "--print-angle": `${moment.rot}deg` } as CSSProperties} onClick={() => flip(index)}
        aria-label={`${revealed.has(index) ? "Xem ảnh" : "Đọc lời nhắn"} kỷ niệm ${index + 1}: ${moment.caption}`} aria-pressed={revealed.has(index)} {...tilt}>
        <span className="memory-print__motion"><span className="memory-print__turn">
          <span className="memory-print__front" aria-hidden={!revealed.has(index)}>
            <span className="memory-print__edition">DÀNH CHO TỤI MÌNH <i>0{index + 1}</i></span>
            <svg viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth=".65" aria-hidden="true"><path d={drawings[index]}/></svg>
            <span className="memory-print__note">{notes[index]}</span>
            <span className="memory-print__tap">CHẠM ĐỂ XEM ẢNH <i aria-hidden="true">↗</i></span>
          </span>
          <span className="memory-print__back" aria-hidden={revealed.has(index)}>
            <span className="memory-print__photo">{failed.has(index) ? <span className="memory-print__unavailable">Ảnh chưa tải được<br/><small>{moment.caption}</small></span> : <img src={moment.src} alt={moment.caption} loading="eager" onError={() => setFailed(previous => new Set([...previous, index]))}/>}</span>
            <span className="memory-print__caption">{moment.caption}</span>
            <span className="memory-print__number">0{index + 1}</span>
          </span>
        </span></span>
      </button>)}

    </div>
    <footer className="memory-table__footer"><div className="memory-table__count" aria-live="polite"><strong>0{seen.size}</strong><span>/ 04 ĐIỀU ĐÃ MỞ</span><i aria-hidden="true" style={{ "--seen": seen.size / 4 } as CSSProperties}/></div>
      {seen.size === moments.items.length ? <button className="moments-next" onClick={onComplete}>{moments.cta}<span aria-hidden="true">↗</span></button> : <p>Chạm ảnh để đọc lời nhắn.</p>}
    </footer>
    {viewer !== null && <MemoryViewer items={moments.items} initial={viewer} onClose={() => setViewer(null)} onVisit={index => setSeen(previous => new Set([...previous, index]))}/>}
  </section>;
}
