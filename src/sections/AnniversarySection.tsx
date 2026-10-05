import { useState } from "react";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import "./anniversary-scene.css";

const DAY_MS = 86_400_000;
function daysSinceAnniversary() {
  const now = new Date();
  return Math.max(0, Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2025, 0, 11)) / DAY_MS));
}
const messages = ["Một ngày bình thường, bỗng thành ngày mình muốn nhớ mãi.", "Hai thành phố. Một người luôn ở trong lòng.", "Cảm ơn em, vì hôm nay vẫn cùng tui viết tiếp."];
export default function AnniversarySection({ onComplete }: { onComplete: () => void }) {
  const { anniversary, moments } = BIRTHDAY_DATA;
  const [selected, setSelected] = useState(0);
  return <section className="anniversary-scene together-scene" data-milestone={selected} aria-label={anniversary.chapter}>
    <svg className="together-thread" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M-40 660C180 530 300 810 555 723S760 320 1060 370S1290 570 1480 440"/></svg>
    <header className="together-header"><span>CHƯƠNG 05 / NGÀY CỦA TỤI MÌNH</span></header>
    <div className="together-main">
      <div className="together-copy"><h2>Từ hôm đó,<br/>ngày nào cũng<br/><em>có tụi mình.</em></h2><p className="together-body">{anniversary.body}</p></div>
      <div className="together-keepsake">
        <figure className="together-photo"><img src={moments.items[3].src} alt={moments.items[3].caption}/></figure>
        <article className="together-ticket" data-mascot-obstacle aria-label="Tấm vé đi cùng nhau">
          <div className="together-ticket__top"><span>VÉ ĐI CÙNG NHAU</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 20S3 14 3 8c0-5 7-6 9-1 2-5 9-4 9 1 0 6-9 12-9 12Z"/></svg></div>
          <div className="together-ticket__route"><span>SGN<small>SÀI GÒN</small></span><i aria-hidden="true">↔</i><span>HAN<small>HÀ NỘI</small></span></div>
          <div className="together-ticket__count"><span>TỤI MÌNH ĐÃ BÊN NHAU</span><strong>{daysSinceAnniversary()}<em>ngày</em></strong><small>VÀ CÒN NHIỀU NGÀY NỮA…</small></div>
          <div className="together-ticket__message" aria-live="polite"><span>0{selected + 1} / {anniversary.beats[selected].label}</span><p key={selected}>{messages[selected]}</p></div>
          <div className="together-ticket__stub"><span>KHỞI HÀNH<strong>11 · 01 · 2025</strong></span><span>ĐIỂM ĐẾN<strong>có em là được ♡</strong></span></div>
        </article>

      </div>
    </div>
    <div className="together-stations" aria-label="Những mốc của tụi mình" style={{"--station":selected} as React.CSSProperties}>
      {anniversary.beats.map((beat,index)=><button key={beat.label} className="together-station" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span className="together-station__dot">0{index+1}</span><span><small>{beat.label}</small><strong>{beat.copy}</strong></span><i aria-hidden="true">↗</i></button>)}
    </div>
    <footer className="together-footer"><button className="together-next" onClick={onComplete}>{anniversary.cta}<i aria-hidden="true">↗</i></button></footer>
  </section>;
}
