import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import SceneBackground from "@/components/effects/SceneBackground";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { useSceneExperience } from "@/components/effects/SceneExperience";
import { useScenePreferences } from "@/components/effects/useScenePreferences";

const CONFETTI_COLORS = ["#e7b96a", "#e18aa0", "#a63c56", "#f4ece4", "#f0c04a"];

// 60 deterministic confetti particles for stable burst animation without rerender jitter
const STABLE_CONFETTI = Array.from({ length: 60 }, (_, i) => {
  const pseudo1 = Math.abs(Math.sin(i * 12.9898));
  const pseudo2 = Math.abs(Math.cos(i * 78.233));
  const pseudo3 = Math.abs(Math.sin(i * 43.123));
  const pseudo4 = Math.abs(Math.cos(i * 91.543));
  const pseudo5 = Math.abs(Math.sin(i * 67.891));

  return {
    i,
    x: (pseudo1 - 0.5) * 800,
    y: 400 + pseudo2 * 400,
    rotate: pseudo3 * 720,
    duration: 2.5 + pseudo4 * 1.5,
    delay: pseudo5 * 0.3,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  };
});

export default function FinaleSection({ onComplete }: { onComplete?: () => void } = {}) {
  const { isActive } = useChapterLifecycle(6);
  const { celebrate } = useSceneExperience();
  const { mobile, reducedMotion } = useScenePreferences();
  const [blown, setBlown] = useState(false);
  const { finale } = BIRTHDAY_DATA;

  return (
    <section
      className="finale-scene relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center transition-colors duration-700"
      style={{
        background:
          "radial-gradient(125% 100% at 50% 35%, #2a111a 0%, #1a0910 55%, #0a0306 100%)",
      }}
    >
      <SceneBackground effect="orb" active={isActive} blown={blown} />
      <div className="wish-stars" aria-hidden="true">
        {Array.from({ length: mobile ? 12 : 24 }, (_, i) => <span key={i} style={{ left: `${8 + ((i * 37) % 84)}%`, top: `${10 + ((i * 23) % 76)}%`, animationDelay: `${-i * .7}s` }} />)}
      </div>
      <AnimatePresence>
        {blown && !reducedMotion &&
          STABLE_CONFETTI.map((c) => (
            <motion.div
              key={c.i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: c.x,
                y: c.y,
                rotate: c.rotate,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: c.duration, delay: c.delay, ease: "easeOut" }}
              className="absolute left-1/2 top-1/3 h-3 w-2"
              style={{ background: c.color }}
            />
          ))}
      </AnimatePresence>

      <div className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-gold">
        {finale.chapter}
      </div>

      {!blown ? (
        <>
          <h2 className="mb-10 max-w-xl font-display text-4xl font-light leading-tight sm:text-5xl">
            {finale.heading}
            <span className="mt-3 block font-hand text-2xl text-rose">{finale.subtitle}</span>
          </h2>

          <motion.button
            onClick={() => { setBlown(true); celebrate(); }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative cursor-pointer"
            aria-label="Thổi nến"
          >
            {/* cake */}
            <div className="relative flex flex-col items-center">
              <div className="relative -mb-2 h-10 w-1.5 rounded-full bg-cream">
                <motion.div
                  animate={reducedMotion ? { scaleY: 1, opacity: 1 } : { scaleY: [1, 1.25, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute -top-5 left-1/2 h-6 w-4 -translate-x-1/2 rounded-full bg-gradient-to-t from-gold to-[#fff4dd] blur-[1px]"
                />
              </div>
              <div className="h-16 w-56 rounded-t-md bg-gradient-to-b from-rose to-rose-deep" />
              <div className="h-14 w-64 rounded-md bg-gradient-to-b from-[#e6d8c8] to-[#cdbdae]" />
            </div>
            <span className="mt-4 block font-hand text-xl text-gold">{finale.candlePrompt}</span>
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-2xl px-4"
        >
          <h2 className="font-display text-5xl font-light italic sm:text-7xl">
            <span className="text-shimmer">{finale.shimmerTitle}</span>
          </h2>
          <p className="mt-8 font-hand text-3xl text-rose">
            {finale.quote}
          </p>
          <p className="mt-6 font-body leading-relaxed text-cream-dim">
            {finale.body}
          </p>
          <p className="mt-10 font-body text-xs uppercase tracking-[0.4em] text-gold">
            {finale.footerBadge}
          </p>
        </motion.div>
      )}
    </section>
  );
}
