import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useChapterFlow } from "@/chapters/useChapterFlow";
import { CHAPTER_REGISTRY } from "@/chapters/chapterRegistry";
import { useSceneExperience } from "./SceneExperience";
import { useScenePreferences } from "./useScenePreferences";
import PigMascot from "./mascot/PigMascot";
import { MASCOT_SCENES } from "./mascot/mascotConfig";
import "./mascot/mascot.css";

export default function ScrollCompanion() {
  const { currentChapter, isTransitioning } = useChapterFlow();
  const chapter = CHAPTER_REGISTRY[currentChapter].id;
  const config = MASCOT_SCENES[chapter];
  const { overlayOpen, celebration } = useSceneExperience();
  const { mobile, reducedMotion, finePointer } = useScenePreferences();
  const [collapsed, setCollapsed] = useState(false);
  const [speech, setSpeech] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [reaction, setReaction] = useState(0);
  const [reacting, setReacting] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(!document.hidden);
  const [placement, setPlacement] = useState({ side: config.side, bottom: 20 });
  const host = useRef<HTMLDivElement>(null);
  const lastCelebration = useRef(0);

  // Pick a nearby clear corner rather than covering a caption or a chapter CTA.
  useEffect(() => {
    if (overlayOpen || isTransitioning) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const width = collapsed ? 44 : mobile ? 56 : 88;
      const height = collapsed ? 44 : width * 140 / 120;
      const edge = mobile ? 12 : 24;
      // Leave the stationery corners clear in the envelope chapter.
      const lowest = chapter === "wallet" ? (mobile ? 112 : 164) : edge;
      const bubbleHeight = host.current?.querySelector('.journey-mascot__speech')?.getBoundingClientRect().height ?? 0;
      const obstacles = [...document.querySelectorAll(`#chapter-${chapter} h1, #chapter-${chapter} h2, #chapter-${chapter} p, #chapter-${chapter} button, #chapter-${chapter} [data-mascot-obstacle], nav`)]
        .map(node => node.getBoundingClientRect()).filter(rect => rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight);
      let best = { side: config.side, bottom: edge, score: Infinity };
      for (const side of [config.side, config.side === "left" ? "right" as const : "left" as const]) {
        for (const bottom of [lowest, lowest + 120, lowest + 240]) {
          const x = side === "left" ? edge : innerWidth - edge - width;
          const y = innerHeight - bottom - height;
          const boxes = [{ left: x - 4, right: x + width + 8, top: y - 28, bottom: y + height }];
          if (speech && !collapsed) boxes.push({ left: side === "left" ? x : x + width - 230, right: side === "left" ? x + 230 : x + width, top: y - bubbleHeight - 14, bottom: y - 14 });
          let score = bottom * .4 + (side === config.side ? 0 : 10);
          for (const box of boxes) for (const rect of obstacles) {
            score += Math.max(0, Math.min(box.right, rect.right) - Math.max(box.left, rect.left)) * Math.max(0, Math.min(box.bottom, rect.bottom) - Math.max(box.top, rect.top));
          }
          if (score < best.score) best = { side, bottom, score };
        }
      }
      setPlacement(previous => previous.side === best.side && previous.bottom === best.bottom ? previous : { side: best.side, bottom: best.bottom });
    };
    let scrollTimer=0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(place); };
    const afterScroll = () => { clearTimeout(scrollTimer); scrollTimer=window.setTimeout(schedule,120); };
    schedule();
    const settle = window.setTimeout(schedule, 1100);
    window.addEventListener("scroll", afterScroll, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); clearTimeout(settle);clearTimeout(scrollTimer); window.removeEventListener("scroll", afterScroll); window.removeEventListener("resize", schedule); };
  }, [chapter, config.side, mobile, speech, collapsed, overlayOpen, isTransitioning]);

  useEffect(() => {
    setMessageIndex(0);
    setSpeech(false);
    setReacting(false);
  }, [chapter, mobile]);
  useEffect(() => {
    if (!speech || overlayOpen || collapsed) return;
    const timer = window.setTimeout(() => setSpeech(false), 5000);
    return () => window.clearTimeout(timer);
  }, [speech, messageIndex, reaction, chapter, overlayOpen, collapsed]);
  useEffect(() => {
    if (!celebration || celebration === lastCelebration.current) return;
    lastCelebration.current = celebration;
    setReaction(value => value + 1);
    setReacting(true);
    setSpeech(false);
    setMessageIndex(1);
  }, [celebration, mobile]);
  useEffect(() => {
    if (!reacting) return;
    const timer = window.setTimeout(() => setReacting(false), 1100);
    return () => window.clearTimeout(timer);
  }, [reaction, reacting]);
  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const element = host.current;
    if (!element || !finePointer || reducedMotion || overlayOpen || collapsed || !documentVisible) return;
    const look = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--gaze-x", `${Math.max(-2.5, Math.min(2.5, (event.clientX - rect.left - rect.width / 2) / 100))}px`);
      element.style.setProperty("--gaze-y", `${Math.max(-1.5, Math.min(1.5, (event.clientY - rect.top - rect.height / 2) / 100))}px`);
    };
    window.addEventListener("pointermove", look, { passive: true });
    return () => {
      window.removeEventListener("pointermove", look);
      element.style.removeProperty("--gaze-x");
      element.style.removeProperty("--gaze-y");
    };
  }, [finePointer, reducedMotion, overlayOpen, collapsed, documentVisible]);

  return (
    <div ref={host} data-journey-ui className="journey-mascot" data-side={placement.side} data-chapter={chapter}
      style={{ "--mascot-bottom": `${placement.bottom}px` } as CSSProperties}
      data-resting={overlayOpen || !documentVisible || reducedMotion} hidden={overlayOpen}>
      {collapsed ? (
        <button className="journey-mascot__restore" onClick={() => setCollapsed(false)} aria-label="Mở lại bé heo">♡</button>
      ) : <>
        {speech && <div className="journey-mascot__speech" role="status">
          <span>{config.messages[messageIndex % config.messages.length]}</span>
          <button onClick={() => setSpeech(false)} aria-label="Đóng lời nhắn">×</button>
        </div>}
        <button className="journey-mascot__collapse" onClick={() => { setCollapsed(true); setSpeech(false); }} aria-label="Thu gọn bé heo">−</button>
        <button className="journey-mascot__character" data-reacting={reacting} aria-label={`${config.name}: nghe lời nhắn`} aria-expanded={speech}
          onClick={() => { setMessageIndex(value => value + 1); setSpeech(true); setReaction(value => value + 1); setReacting(true); }}>
          <PigMascot accessory={config.accessory} />
        </button>
        {reacting && !reducedMotion && <div key={reaction} className="journey-mascot__hearts" aria-hidden="true">
          {[0, 1, 2, 3, 4].map(index => <span key={index} style={{ "--heart-x": `${(index - 2) * 22}px`, "--heart-delay": `${index * 45}ms` } as CSSProperties}>♡</span>)}
        </div>}
      </>}
    </div>
  );
}
