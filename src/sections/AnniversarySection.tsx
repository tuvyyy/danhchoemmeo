import { useState } from "react";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useRef } from "react";
import { useChapterFlow } from "@/chapters/useChapterFlow";
import couplePhoto from "@/assets/hero/couple-original-tone.png";
import "./anniversary-scene.css";

function daysSinceAnniversary() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (type: string) => Number(today.find(part => part.type === type)?.value);
  return Math.max(0, Math.floor((Date.UTC(value("year"), value("month") - 1, value("day")) - Date.UTC(2025, 0, 11)) / 86_400_000));
}

const notes = [
  { title: "mon bel amour", subtitle: "ngày mình bắt đầu", paragraphs: ["Có một ngày, giữa rất nhiều ngày bình thường, tụi mình tìm thấy nhau. Từ hôm ấy, tui có thêm một người để nhớ, một người để kể nghe những chuyện nhỏ xíu trong ngày.", "11 tháng 01 năm 2025. Tui muốn giữ ngày này như giữ một tấm hình cũ — để mỗi lần nhìn lại, vẫn thấy lòng mình ấm như lúc ban đầu."], closing: "Từ hôm đó, ngày nào cũng có tụi mình." },
  { title: "despite the miles", subtitle: "xa một chút, thương nhiều chút", paragraphs: ["Sài Gòn — Hà Nội. Hai khoảng trời, một người tui luôn muốn ở gần. Mình gửi thương nhớ qua những cuộc gọi khuya và từng lời hẹn.", "Có những hôm chỉ ước được ngồi cạnh em, chẳng cần nói gì. Dù hôm nay còn xa, trong những điều tui mong cho ngày mai, lúc nào cũng có em."], closing: "Hai thành phố. Một người luôn ở trong lòng." },
  { title: "to be continued…", subtitle: "vẫn là em và tui", paragraphs: ["Tụi mình đã đi qua từng cuộc gọi khuya, từng lần nhớ và từng lời hẹn. Cảm ơn em vì vẫn ở đây, cùng tui viết tiếp câu chuyện này.", "Tui mong mình còn nhiều buổi sáng cùng nhau, nhiều lần nắm tay, nhiều ngày bình thường mà sau này nhớ lại vẫn thấy thương. Không cần một câu chuyện hoàn hảo. Chỉ cần trong câu chuyện ấy, có tụi mình."], closing: "Cảm ơn em, vì hôm nay vẫn cùng tui viết tiếp." },
];

export default function AnniversarySection() {
  const { anniversary } = BIRTHDAY_DATA;
  const { goTo } = useChapterFlow();
  const [selected, setSelected] = useState(0);
  const copyRef = useRef<HTMLDivElement>(null);
  const selectNote = (index: number) => {
    setSelected(index);
    if (window.matchMedia("(max-width: 760px)").matches) {
      requestAnimationFrame(() => copyRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      }));
    }
  };
  const note = notes[selected];
  return <section className="anniversary-scene together-scene" data-milestone={selected} aria-label={anniversary.chapter}>
    <div className="together-frame" aria-hidden="true"/>
    <header className="together-header"><span>CHƯƠNG 05 / NGÀY CỦA TỤI MÌNH</span><span>MỘT TRANG ĐỂ GIỮ LẠI</span></header>
    <div className="together-main">
      <article className="together-paper" data-mascot-obstacle aria-label="Trang kỷ niệm của tụi mình">
          <figure className="together-photo">
            <img src={couplePhoto} alt="Tấm ảnh hai đứa mình bên nhau" width="1922" height="818" draggable={false}/>
            <figcaption>our little story · since 2025</figcaption>
          </figure>
          <div ref={copyRef} className="together-copy" aria-live="polite" aria-atomic="true">
            <div key={selected} className="together-note">
              <div className="together-note__heading"><h3>{note.title}</h3><span>{note.subtitle}</span></div>
              <div className="together-note__body">{note.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
              <p className="together-note__closing">{note.closing}</p>
              <span className="together-signature">thương em, luôn luôn.</span>
            </div>
          </div>
          <aside className="together-margin">
            <h2>Ngày của tụi mình.</h2>
            <div className="together-date"><span>TỪ NGÀY</span><time dateTime="2025-01-11"><span>11.01</span><span>2025</span></time></div>
            <div className="together-count"><strong>{daysSinceAnniversary()}</strong><span>ngày bên nhau</span></div>
            <span className="together-page-number">0{selected + 1} / 03</span>
          </aside>
      </article>
    </div>
    <div className="together-stations" aria-label="Những mốc của tụi mình">
      {anniversary.beats.map((beat, index) => <button key={beat.label} className="together-station" aria-pressed={selected === index} onClick={() => selectNote(index)}><span className="together-station__number">0{index + 1}</span><span><small>{beat.label}</small><strong>{beat.copy}</strong></span><i aria-hidden="true">↗</i></button>)}
    </div>
    <footer className="together-footer"><span>câu chuyện này, mình còn viết tiếp.</span><button className="together-next" onClick={() => goTo(0)}>Xem lại từ đầu <i aria-hidden="true">↺</i></button></footer>
  </section>;
}
