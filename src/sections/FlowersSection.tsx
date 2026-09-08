import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import FlowerBloomCanvas from "./flowers/FlowerBloomCanvas";
import FloatingPetals from "./flowers/FloatingPetals";

export default function FlowersSection({ onComplete }: { onComplete: () => void }) {
  const { isActive } = useChapterLifecycle(1);
  const { flowers } = BIRTHDAY_DATA;

  // Track bloom progression and revealed quadrant message stages (1..4)
  const [hasBloomed, setHasBloomed] = useState<boolean>(false);
  const [revealedStage, setRevealedStage] = useState<number>(0);
  const [isCtaReady, setIsCtaReady] = useState<boolean>(false);

  // Immediate availability for reduced-motion users
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setHasBloomed(true);
      setRevealedStage(4);
      setIsCtaReady(true);
    }
  }, []);

  const handleStageTrigger = useCallback((stage: number) => {
    setRevealedStage((prev) => Math.max(prev, stage));
  }, []);

  const handleBloomComplete = useCallback(() => {
    setHasBloomed(true);
    setRevealedStage(4);
    setIsCtaReady(true);
  }, []);

  const [msg1, msg2, msg3, msg4] = flowers.quadMessages;

  return (
    <section
      className="relative flex min-h-screen min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-6 transition-colors duration-700"
      style={{
        background:
          "radial-gradient(125% 105% at 50% 45%, #240826 0%, #150518 50%, #08020a 100%)",
      }}
    >
      {/* Chapter identifier badge */}
      <div className="absolute top-12 sm:top-14 z-30 font-body text-[10px] uppercase tracking-[0.4em] text-gold/70">
        {flowers.chapter}
      </div>

      {/* ── Soft, seamless celestial bloom halo behind the centered flower ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,143,177,0.14) 0%, rgba(231,185,106,0.06) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── CENTERPIECE: Single Magnificent 60-Frame Blooming Lily (Original Smooth Animation, Centered & Clean) ── */}
      <div className="relative z-10 flex w-full max-w-4xl items-center justify-center my-auto py-6">
        <FlowerBloomCanvas
          isActive={isActive}
          hasBloomed={hasBloomed}
          onStageTrigger={handleStageTrigger}
          onBloomComplete={handleBloomComplete}
          durationMs={4200}
        />
      </div>

      {/* ── 4 Quadrant Message Boxes (symmetrically surrounding the centered flower) ── */}
      {/* Box 1: Top Left (Stage 1) */}
      <AnimatePresence>
        {revealedStage >= 1 && msg1 && (
          <motion.div
            key="box-top-left"
            data-layer="quad-msg-1"
            initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[12%] sm:top-[16%] md:top-[18%] left-3 sm:left-10 md:left-16 lg:left-24 z-20 max-w-[155px] sm:max-w-[280px] md:max-w-[340px] pointer-events-none"
          >
            <div className="flex flex-col items-start border-l-2 border-[#e05676] bg-gradient-to-r from-[#e05676]/15 via-[#e05676]/5 to-transparent pl-3 sm:pl-4 py-2 rounded-r-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <span className="font-body text-[9px] sm:text-xs font-semibold tracking-[0.25em] text-[#f48fb1] uppercase mb-0.5 sm:mb-1">
                {msg1.tag}
              </span>
              <p className="font-display text-[13px] sm:text-lg md:text-2xl font-light italic leading-snug text-[#fff4e6]">
                {msg1.line1}
                <br />
                <span className="text-cream/90 font-normal">{msg1.line2}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Box 2: Top Right (Stage 2) */}
      <AnimatePresence>
        {revealedStage >= 2 && msg2 && (
          <motion.div
            key="box-top-right"
            data-layer="quad-msg-2"
            initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[12%] sm:top-[16%] md:top-[18%] right-3 sm:right-10 md:right-16 lg:right-24 z-20 max-w-[155px] sm:max-w-[280px] md:max-w-[340px] pointer-events-none text-right"
          >
            <div className="flex flex-col items-end border-r-2 border-[#e05676] bg-gradient-to-l from-[#e05676]/15 via-[#e05676]/5 to-transparent pr-3 sm:pr-4 py-2 rounded-l-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <span className="font-body text-[9px] sm:text-xs font-semibold tracking-[0.25em] text-[#f48fb1] uppercase mb-0.5 sm:mb-1">
                {msg2.tag}
              </span>
              <p className="font-display text-[13px] sm:text-lg md:text-2xl font-light italic leading-snug text-[#fff4e6]">
                {msg2.line1}
                <br />
                <span className="text-cream/90 font-normal">{msg2.line2}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Box 3: Bottom Left (Stage 3) */}
      <AnimatePresence>
        {revealedStage >= 3 && msg3 && (
          <motion.div
            key="box-bottom-left"
            data-layer="quad-msg-3"
            initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[16%] sm:bottom-[18%] md:bottom-[20%] left-3 sm:left-10 md:left-16 lg:left-24 z-20 max-w-[155px] sm:max-w-[280px] md:max-w-[340px] pointer-events-none"
          >
            <div className="flex flex-col items-start border-l-2 border-[#e05676] bg-gradient-to-r from-[#e05676]/15 via-[#e05676]/5 to-transparent pl-3 sm:pl-4 py-2 rounded-r-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <span className="font-body text-[9px] sm:text-xs font-semibold tracking-[0.25em] text-[#f48fb1] uppercase mb-0.5 sm:mb-1">
                {msg3.tag}
              </span>
              <p className="font-display text-[13px] sm:text-lg md:text-2xl font-light italic leading-snug text-[#fff4e6]">
                {msg3.line1}
                <br />
                <span className="text-cream/90 font-normal">{msg3.line2}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Box 4: Bottom Right (Stage 4) */}
      <AnimatePresence>
        {revealedStage >= 4 && msg4 && (
          <motion.div
            key="box-bottom-right"
            data-layer="quad-msg-4"
            initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[16%] sm:bottom-[18%] md:bottom-[20%] right-3 sm:right-10 md:right-16 lg:right-24 z-20 max-w-[155px] sm:max-w-[280px] md:max-w-[340px] pointer-events-none text-right"
          >
            <div className="flex flex-col items-end border-r-2 border-[#e05676] bg-gradient-to-l from-[#e05676]/15 via-[#e05676]/5 to-transparent pr-3 sm:pr-4 py-2 rounded-l-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <span className="font-body text-[9px] sm:text-xs font-semibold tracking-[0.25em] text-[#f48fb1] uppercase mb-0.5 sm:mb-1">
                {msg4.tag}
              </span>
              <p className="font-display text-[13px] sm:text-lg md:text-2xl font-light italic leading-snug text-[#fff4e6]">
                {msg4.line1}
                <br />
                <span className="text-cream/90 font-normal">{msg4.line2}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ambient drifting petals ── */}
      <FloatingPetals />

      {/* ── Gated CTA Button ── */}
      <div className="absolute bottom-8 z-30 flex h-14 items-center">
        <AnimatePresence mode="wait">
          {isCtaReady ? (
            <motion.button
              key="go"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(231,185,106,0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="group flex items-center gap-3 rounded-full border border-gold/50 bg-gradient-to-r from-gold/20 to-transparent px-8 py-3.5 font-body text-xs sm:text-sm uppercase tracking-[0.22em] text-gold backdrop-blur-md transition-all hover:border-gold hover:bg-gold/25 cursor-pointer shadow-[0_4px_20px_rgba(231,185,106,0.15)]"
            >
              <span>{flowers.cta}</span>
              <span className="transition-transform group-hover:translate-y-0.5">↓</span>
            </motion.button>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.9, 0.35] }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="font-body text-[10px] uppercase tracking-[0.35em] text-gold/70 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            >
              {flowers.loadingStatus}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
