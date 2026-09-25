import { useState } from "react";
import { motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useSceneTilt } from "@/components/effects/useSceneDepth";
import { useScenePreferences } from "@/components/effects/useScenePreferences";

export default function MomentsSection({ onComplete }: { onComplete: () => void }) {
  const tilt = useSceneTilt(12);
  const { reducedMotion } = useScenePreferences();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const { moments } = BIRTHDAY_DATA;
  const allFlipped = flipped.size === moments.items.length;

  const flip = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });

  return (
    <section
      className="scrapbook-scene relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 transition-colors duration-700"
      style={{
        background:
          "radial-gradient(125% 100% at 50% 30%, #091a27 0%, #05111a 55%, #02080e 100%)",
      }}
    >
      <div className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-gold">
        {moments.chapter}
      </div>
      <h2 className="mb-12 max-w-xl text-center font-display text-4xl font-light leading-tight sm:text-5xl">
        {moments.heading}
        <span className="mt-3 block font-hand text-2xl text-rose">{moments.subtitle}</span>
      </h2>

      <div className="scrapbook-grid grid grid-cols-2 gap-6 sm:gap-10 md:grid-cols-4">
        {moments.items.map((m, i) => (
          <motion.button
            key={i}
            onClick={() => flip(i)}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 40, x: reducedMotion ? 0 : (i % 2 ? 22 : -22), rotate: m.rot }}
            whileInView={{ opacity: 1, y: 0, x: 0, rotate: m.rot }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.12, duration: 0.7 }}
            whileHover={{ scale: 1.06, rotate: 0, zIndex: 20 }}
            className="scrapbook-card relative rounded-sm cursor-pointer"
            aria-label={`${flipped.has(i) ? "Kỷ niệm" : "Mở kỷ niệm"} ${i + 1}`}
            aria-pressed={flipped.has(i)}
            {...tilt}
          >
            <div className="scrapbook-card__surface">
            <div className="scrapbook-card__image relative aspect-square w-32 overflow-hidden bg-ink-soft sm:w-40">
              <img src={m.src} alt={m.caption} className="h-full w-full object-cover" />
              {!flipped.has(i) && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/70 font-hand text-lg text-gold">
                  {moments.tapPrompt}
                </div>
              )}
            </div>
            <p className="scrapbook-card__caption">
              {flipped.has(i) ? m.caption : "· · ·"}
            </p>
            </div>
          </motion.button>
        ))}
      </div>

      {allFlipped && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="group mt-12 flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-8 py-4 font-body text-sm uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold/15 cursor-pointer"
        >
          {moments.cta}
          <span className="transition-transform group-hover:translate-y-1">↓</span>
        </motion.button>
      )}
    </section>
  );
}
