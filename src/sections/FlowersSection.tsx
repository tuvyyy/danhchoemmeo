import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import gardenVideo from "@/assets/Cats_nuzzling_in_night_garden_20260927145203.mp4";
import gardenPoster from "@/assets/garden/night-garden-poster.jpg";
import GardenReel from "./flowers/GardenReel";
import "./flowers/VideoGarden.css";

export default function FlowersSection({ onComplete }: { onComplete: () => void }) {
  const { isActive } = useChapterLifecycle(1);
  const { flowers } = BIRTHDAY_DATA;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(!document.hidden);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    if (isActive && visible && !userPaused) {
      video.muted = true;
      void video.play().catch(() => { if (!cancelled) setPlaying(false); });
    } else video.pause();
    return () => { cancelled = true; video.pause(); };
  }, [isActive, visible, userPaused]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      setUserPaused(true);
      video.pause();
    } else {
      setUserPaused(false);
      // A direct gesture also lets playback recover if the browser blocked autoplay.
      void video.play().catch(() => setPlaying(false));
    }
  };

  const message = flowers.quadMessages[messageIndex];

  return (
    <section className="nature-bloom nature-bloom--video">
      <div className="garden-video-stage">
        <GardenReel running={isActive && visible && playing} />
        <div className="garden-video-frame">
        <video ref={videoRef} className="garden-video" src={gardenVideo} poster={gardenPoster}
          autoPlay muted loop playsInline preload="auto" disablePictureInPicture
          aria-label="Hai bé mèo quấn quýt trong vườn hoa dưới ánh trăng"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
          onTimeUpdate={event => {
            const video = event.currentTarget;
            if (video.duration > 0) {
              const next = Math.min(3, Math.floor(video.currentTime / video.duration * 4));
              setMessageIndex(previous => Math.max(previous, next));
            }
          }} />
        {!failed && <button type="button" className="garden-video-toggle" onClick={togglePlayback}
          aria-label={playing ? "Tạm dừng video vườn hoa" : "Phát video vườn hoa"}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
        </button>}
        {failed && <p className="garden-video-status" role="status">Video chưa tải được. Em tải lại trang để xem nhé.</p>}
        </div>
      </div>

      <header className="nature-bloom__header">
        <span>{flowers.chapter}</span><span>một khoảng trời cho em</span>
      </header>

      <div className="nature-bloom__intro">
        <h2>Một khoảng trời,<em> chỉ có tụi mình.</em></h2>
      </div>

      <div className="nature-bloom__message" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: .35 }}>
            <span className="garden-message-count">{message.tag}<i aria-hidden="true" />04</span>
            <p>{message.line1}<br /><em>{message.line2}</em></p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="nature-bloom__footer">
        <button type="button" onClick={onComplete}><span>{flowers.cta}</span><i aria-hidden="true">↗</i></button>
      </div>
    </section>
  );
}
