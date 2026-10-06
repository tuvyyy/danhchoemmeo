import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  const [inViewport, setInViewport] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { threshold: .01 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (!isActive) setUserPaused(false); }, [isActive]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    if ((isActive || inViewport) && visible && !userPaused) {
      video.muted = true;
      void video.play().catch(() => { if (!cancelled) setPlaying(false); });
    } else video.pause();
    return () => { cancelled = true; video.pause(); };
  }, [isActive, inViewport, visible, userPaused]);

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
        <GardenReel running={(isActive || inViewport) && visible && !userPaused} />
        <div className="garden-keepsake" aria-hidden="true">
          <span>Một khoảng trời của tụi mình.</span><span>01 / ∞</span>
        </div>
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
        <span>{flowers.chapter}</span>
      </header>

      <div className="nature-bloom__intro">
        <h2>Một khoảng trời,<em> chỉ có tụi mình.</em></h2>
      </div>

      <div className="nature-bloom__message" aria-live="polite">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35 }}>

            <p>{message.line1}<br /><em>{message.line2}</em></p>
          </motion.div>
      </div>

      <div className="nature-bloom__footer">

        <button type="button" onClick={onComplete}><span>{flowers.cta}</span><i aria-hidden="true">↗</i></button>
      </div>
    </section>
  );
}
