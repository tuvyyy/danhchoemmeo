import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useSceneOverlay } from "@/components/effects/SceneExperience";
import { useDialogFocus } from "@/components/effects/useDialogFocus";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { useChapterFlowContext } from "@/chapters/ChapterFlowContext";
import { ENVELOPE_ASSETS } from "./voucher/voucherConfig";
import LetterBloomGarden from "./flowers/LetterBloomGarden";
import LetterVines from "./flowers/LetterVines";
import { prepareLetterFragments } from "@/chapters/letterFragments";
import "./letter-scene.css";
import "./flowers/letter-bloom-garden.css";

function LetterPage({ index }: { index: number }) {
  if (index === 0) {
    return (
      <article className="letter-page letter-page--note" data-page="0">
        <div className="letter-page__meta"><span>GỬI RIÊNG EM · LÁ THƯ TAY</span><span>10 / 11</span></div>
        <div className="letter-page__note-container">
          <img
            src={ENVELOPE_ASSETS.letter.src}
            alt="Lá thư tay: Tui không ở cạnh để dẫn em đi ăn, nên gửi em một chút để tiêu nè. Tuỳ em thích gì thì dùng nhé, chỉ cần em vui là được. Luôn thương em ♡"
            className="letter-page__note-img"
          />
        </div>
        <div className="sr-only">
          <h3>Gửi em mèo,</h3>
          <p>Tui không ở cạnh để dẫn em đi ăn, nên gửi em một chút để tiêu nè. Tuỳ em thích gì thì dùng nhé, chỉ cần em vui là được.</p>
          <p className="letter-page__signature">Luôn thương em ♡</p>
        </div>
        <span className="letter-page__number">01 / 02</span>
      </article>
    );
  }
  const page = BIRTHDAY_DATA.letter.pages[1];
  return (
    <article className="letter-page" data-page="1">
      <div className="letter-page__meta"><span>GỬI RIÊNG EM</span><span>10 / 11</span></div>
      <h3>{page.title}</h3>
      {page.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <p className="letter-page__signature">{page.closing}</p>
      <span className="letter-page__number">02 / 02</span>
    </article>
  );
}

export default function LetterSection({ onComplete }: { onComplete: () => void }) {
  const [page, setPage] = useState(0);
  const [reading, setReading] = useState(false);
  const atelier = useRef<HTMLElement>(null);
  const { isActive, isTransitioning } = useChapterLifecycle(3);
  const { currentChapter } = useChapterFlowContext();
  useSceneOverlay(reading);
  const dialogRef = useDialogFocus(reading);
  useEffect(() => { if (!isActive) { setReading(false); if (currentChapter < 3) setPage(0); } }, [isActive, currentChapter]);
  useEffect(() => {
    if (!isActive || isTransitioning || reading || !atelier.current) return;
    let stop: (() => void) | undefined;
    let timer = 0;
    const prepare = () => { clearTimeout(timer); timer=window.setTimeout(()=>{stop?.();stop=prepareLetterFragments(atelier.current!);},1250); };
    prepare();
    const garden=atelier.current.querySelector('.letter-bloom-garden');
    const observer=new MutationObserver(prepare);
    if(garden)observer.observe(garden,{attributes:true,attributeFilter:['data-bloomed']});
    return()=>{clearTimeout(timer);stop?.();observer.disconnect();};
  }, [isActive, isTransitioning, page, reading]);
  useEffect(() => {
    if (!reading) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReading(false);
      if (event.key === "ArrowRight") setPage(1);
      if (event.key === "ArrowLeft") setPage(0);
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", key); };
  }, [reading]);
  return <section ref={atelier} className="letter-scene letter-atelier" data-open="true" data-reading={reading} aria-label="Chương 03 — Một lá thư dành riêng em">
    <div className="letter-atelier__light" aria-hidden="true"/>
    <div className="letter-atelier__landscape" aria-hidden="true"/>
    <LetterBloomGarden active={isActive && !isTransitioning && !reading}/>
    <LetterVines active={isActive} running={isActive && !isTransitioning && !reading}/>
    <header className="letter-atelier__header"><span>CHƯƠNG 03 / LÁ THƯ</span></header>
    <div className="letter-desk">
      <div className="letter-keepsake">
        <div className="letter-keepsake__back" aria-hidden="true"/>
        <div className="letter-keepsake__pages">
          <LetterPage index={page}/>
          <button className="letter-page__read" onClick={() => setReading(true)} aria-label="Phóng to đọc thư">⤢</button>
        </div>
      </div>
      <div className="letter-desk__controls" aria-label="Điều khiển lá thư">
        <button onClick={() => setPage(value => 1 - value)} aria-label={page ? "Đọc trang thứ nhất" : "Đọc trang thứ hai"}>{page ? "← Trang trước" : "Trang tiếp theo →"}</button><span>0{page + 1} / 02</span><button onClick={() => setReading(true)}>Đọc rõ hơn ↗</button>
      </div>
    </div>
    <footer className="letter-atelier__footer"><button className="letter-next" onClick={onComplete}>{BIRTHDAY_DATA.letter.cta} <span aria-hidden="true">↗</span></button></footer>
    {reading && createPortal(<div className="letter-reader" role="dialog" aria-modal="true" aria-label="Đọc thư dành riêng em" ref={dialogRef} tabIndex={-1} onClick={() => setReading(false)}>
      <div className="letter-reader__body" onClick={event => event.stopPropagation()}>
        <div className="letter-reader__toolbar"><span>LÁ THƯ DÀNH RIÊNG EM</span><button data-dialog-close onClick={() => setReading(false)} aria-label="Đóng chế độ đọc">Đóng ✕</button></div>
        <LetterPage index={page}/>
        <div className="letter-reader__pagination"><button disabled={page === 0} onClick={() => setPage(0)}>← Trang 01</button><span>0{page + 1} / 02</span><button disabled={page === 1} onClick={() => setPage(1)}>Trang 02 →</button></div>
      </div>
    </div>, document.body)}
  </section>;
}
