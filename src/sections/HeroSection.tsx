import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { preloadFlowerAssets } from "@/lib/assets/preloadFlowers";
import couplePhoto from "@/assets/hero/couple-original-tone.png";
import SceneBackground from "@/components/effects/SceneBackground";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { useSceneTilt } from "@/components/effects/useSceneDepth";
import { useScenePreferences } from "@/components/effects/useScenePreferences";

const easeOut = [0.22, 1, 0.36, 1] as const;

function SpiderMeoSplit({ active }: { active: boolean }) {
  const rays = [
    "M50 50 L2 4",
    "M50 50 L24 0",
    "M50 50 L76 0",
    "M50 50 L98 4",
    "M50 50 L100 34",
    "M50 50 L100 68",
    "M50 50 L94 100",
    "M50 50 L65 100",
    "M50 50 L35 100",
    "M50 50 L6 100",
    "M50 50 L0 68",
    "M50 50 L0 34",
  ];

  if (!active) return null;

  return createPortal(
    <div className="spider-split" aria-hidden="true">
      <motion.div
        className="spider-split__panel spider-split__panel--left"
        initial={{ x: "-102%" }}
        animate={{ x: ["-102%", "0%", "0%", "-102%"] }}
        transition={{ duration: 1.55, times: [0, 0.34, 0.56, 1], ease: easeOut }}
      />
      <motion.div
        className="spider-split__panel spider-split__panel--right"
        initial={{ x: "102%" }}
        animate={{ x: ["102%", "0%", "0%", "102%"] }}
        transition={{ duration: 1.55, times: [0, 0.34, 0.56, 1], ease: easeOut }}
      />

      <svg className="spider-split__web" viewBox="0 0 100 100" preserveAspectRatio="none">
        {rays.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.1, delay: index * 0.012, times: [0, 0.52, 1] }}
          />
        ))}
        {[13, 23, 34, 45].map((radius, index) => (
          <motion.circle
            key={radius}
            cx="50"
            cy="50"
            r={radius}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 0.75, 0] }}
            transition={{ duration: 1.05, delay: 0.09 + index * 0.04, times: [0, 0.55, 1] }}
          />
        ))}
      </svg>

      <div className="spider-split__meo-anchor">
        <motion.div
          className="spider-split__meo"
          initial={{ scale: 0.3, rotate: -16, opacity: 0 }}
          animate={{ scale: [0.3, 1.08, 1, 0.65], rotate: [-16, 5, 0, 10], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.32, 0.7, 1], ease: easeOut }}
        >
          <span className="spider-split__ear spider-split__ear--left" />
          <span className="spider-split__ear spider-split__ear--right" />
          <span className="spider-split__mask" />
          <span className="spider-split__eye spider-split__eye--left" />
          <span className="spider-split__eye spider-split__eye--right" />
          <span className="spider-split__nose" />
        </motion.div>
      </div>
    </div>, document.body
  );
}

export default function HeroSection({ onComplete }: { onComplete: (options?: { instant?: boolean }) => void }) {
  const { isActive } = useChapterLifecycle(0);
  const tilt = useSceneTilt(4);
  const { reducedMotion } = useScenePreferences();
  const { hero } = BIRTHDAY_DATA;
  const [isSplitting, setIsSplitting] = useState(false);
  const splitTimers = useRef<number[]>([]);

  useEffect(() => {
    preloadFlowerAssets();
    return () => splitTimers.current.forEach(window.clearTimeout);
  }, []);

  const startStory = () => {
    if (isSplitting) return;
    if (reducedMotion) { onComplete(); return; }
    setIsSplitting(true);
    // The split already covers the handoff; a second chapter transition would
    // dim and zoom the scene again underneath it.
    splitTimers.current = [
      window.setTimeout(() => onComplete({ instant: true }), 720),
      window.setTimeout(() => setIsSplitting(false), 1650),
    ];
  };

  return (
    <section className="cinematic-hero">
      <SceneBackground effect="ribbon" active={isActive} />
      <header className="cinematic-hero__header">
        <motion.p className="cinematic-hero__eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: easeOut }}>
          sinh nhật em meo · ngày của tụi mình
        </motion.p>
        <motion.p className="cinematic-hero__copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.85, ease: easeOut }}>
          Một góc nhỏ dành cho sinh nhật em, và cho câu chuyện bắt đầu từ ngày 11 tháng 01 năm 2025 — từ Sài Gòn đến Hà Nội.
        </motion.p>
        <motion.div className="cinematic-hero__date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
          <span>10.11</span><span aria-hidden="true">×</span><span>11.01.2025</span>
        </motion.div>
      </header>

      <div className="cinematic-hero__image-stage" {...tilt}>
        <img src={couplePhoto} alt="Hai đứa ôm nhau trước gương" className="cinematic-hero__photo" />
      </div>

      <div className="cinematic-hero__content">
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.9, ease: easeOut }}>
          Chúc mừng em,<em> và tụi mình.</em>
        </motion.h1>
        <div className="cinematic-hero__details">
          <motion.div className="cinematic-hero__tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.75 }}>
            <span><i className="cinematic-hero__swatch cinematic-hero__swatch--orange" />meo cam</span>
            <span><i className="cinematic-hero__swatch cinematic-hero__swatch--tuxedo" />meo đen vớ trắng</span>
            <span><i className="cinematic-hero__swatch cinematic-hero__swatch--pink" />meo hồng</span>
          </motion.div>
          <p className="cinematic-hero__caption">tụi mình · 2025 — forever</p>
        </div>
        <motion.button type="button" className="cinematic-hero__cta" onClick={startStory} disabled={isSplitting} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8, ease: easeOut }} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
          <span>{hero.cta}</span><span className="cinematic-hero__cta-mark" aria-hidden="true">→</span>
        </motion.button>
      </div>

      <SpiderMeoSplit active={isSplitting} />
    </section>
  );
}
