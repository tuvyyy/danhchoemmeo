import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import FlowerBloomCanvas from "./flowers/FlowerBloomCanvas";
import TulipBloom, { preloadTulipSequence } from "./flowers/TulipBloom";
import FlowerAtmosphere from "./flowers/FlowerAtmosphere";
import { preloadBloomSequence } from "@/lib/assets/preloadBloomSequence";
import { useGardenDepth } from "@/components/effects/useSceneDepth";

const easeOut = [0.22, 1, 0.36, 1] as const;
const TULIPS = [
  { id: "tulip-1", x: 43, y: 1, scale: 0.48, rotate: -6, delay: 1400, depth: "foreground" },
  { id: "tulip-2", x: 79, y: -5, scale: 0.53, rotate: 5, delay: 1950, depth: "foreground" },
  { id: "tulip-3", x: 88, y: 11, scale: 0.43, rotate: -3, delay: 2500, depth: "background" },
  { id: "tulip-gold-left", x: 38, y: -3, scale: 0.44, rotate: -9, delay: 1700, depth: "foreground", color: "butter" },
  { id: "tulip-lavender-left", x: 47, y: 12, scale: 0.34, rotate: 7, delay: 2250, depth: "background", color: "lavender" },
  { id: "tulip-coral-low", x: 59, y: -4, scale: 0.42, rotate: -7, delay: 1850, depth: "foreground", color: "coral" },
  { id: "tulip-gold-low", x: 64, y: 3, scale: 0.32, rotate: 5, delay: 2350, depth: "midground", color: "butter" },
  { id: "tulip-coral-right", x: 85, y: 3, scale: 0.4, rotate: -5, delay: 2050, depth: "foreground", color: "coral" },
  { id: "tulip-lavender-right", x: 93, y: 10, scale: 0.32, rotate: 8, delay: 2600, depth: "background", color: "lavender" },
  { id: "tulip-gold-edge", x: 33, y: -6, scale: 0.36, rotate: 6, delay: 2150, depth: "foreground", color: "butter" },
  { id: "tulip-lavender-front", x: 46, y: -8, scale: 0.43, rotate: -4, delay: 2450, depth: "foreground", color: "lavender" },
  { id: "tulip-coral-front", x: 73, y: -4, scale: 0.35, rotate: 8, delay: 2750, depth: "foreground", color: "coral" },
  { id: "tulip-gold-right", x: 91, y: -2, scale: 0.38, rotate: -6, delay: 2300, depth: "foreground", color: "butter" },
] as const;

function MeadowLayer() {
  return (
    <div className="nature-bloom__meadow" aria-hidden="true">
      <motion.img
        src="/assets/flowers/nature/grass-airy-tall.png"
        className="nature-bloom__grass nature-bloom__grass--left"
        alt=""
        animate={{ rotate: [-0.8, 0.8, -0.8], x: [-2, 3, -2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <img
        src="/assets/flowers/nature/grass-back-strip.png"
        className="nature-bloom__grass nature-bloom__grass--strip"
        alt=""
      />
      <motion.img
        src="/assets/flowers/nature/grass-airy-tall.png"
        className="nature-bloom__grass nature-bloom__grass--right"
        alt=""
        animate={{ rotate: [0.6, -0.6, 0.6], x: [2, -3, 2] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function FlowersSection({ onComplete }: { onComplete: () => void }) {
  const { isActive } = useChapterLifecycle(1);
  const sceneRef = useGardenDepth(isActive);
  const { flowers } = BIRTHDAY_DATA;
  const completedFlowers = useRef(new Set<string>());
  const [hasBloomed, setHasBloomed] = useState(false);
  const [revealedStage, setRevealedStage] = useState(0);
  const [isCtaReady, setIsCtaReady] = useState(false);
  const [gardenReady, setGardenReady] = useState(false);
  const tulips = TULIPS;

  useEffect(() => {
    let cancelled = false;
    Promise.all([preloadBloomSequence(), preloadTulipSequence()]).then(() => {
      if (!cancelled) setGardenReady(true);
    }).catch((error: unknown) => console.error("Garden assets failed to load", error));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasBloomed(true);
      setRevealedStage(4);
      setIsCtaReady(true);
    }
  }, []);

  const handleStageTrigger = useCallback((stage: number) => {
    setRevealedStage((previous) => Math.max(previous, stage));
  }, []);

  const handleBloomComplete = useCallback((flower: string) => {
    completedFlowers.current.add(flower);
    // Let every delayed bloom finish before holding the scene and revealing the CTA.
    if (["lily-main", "lily-secondary", ...tulips.map(({ id }) => id)].every((id) => completedFlowers.current.has(id))) {
      setHasBloomed(true);
      setRevealedStage(4);
      setIsCtaReady(true);
    }
  }, [tulips]);

  const activeMessage = flowers.quadMessages[Math.max(0, revealedStage - 1)];

  return (
    <section ref={sceneRef} className="nature-bloom">
      <div className="nature-bloom__wash" aria-hidden="true" />
      <div className="nature-bloom__grain" aria-hidden="true" />
      <FlowerAtmosphere isActive={isActive && gardenReady} />

      <header className="nature-bloom__header">
        <span>{flowers.chapter}</span>
        <span>một khoảng trời cho em</span>
      </header>

      <motion.div
        className="nature-bloom__intro"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: easeOut }}
      >
        <p className="nature-bloom__kicker">where the wind keeps our little secrets</p>
        <h2>
          Có những điều dịu dàng,
          <em> cứ để gió kể thay.</em>
        </h2>
      </motion.div>

      <div className="nature-bloom__flower-cluster" role="img" aria-label="Hai bông hoa ly hồng giữa vườn tulip trắng, vàng bơ, hồng san hô và tím lavender đang nở">
        {tulips.map((tulip) => (
          <TulipBloom key={tulip.id} {...tulip} isActive={isActive && gardenReady} hasBloomed={hasBloomed}
            onBloomComplete={() => handleBloomComplete(tulip.id)} />
        ))}
        <FlowerBloomCanvas
          className="nature-bloom__flower nature-bloom__flower--left"
          isActive={isActive && gardenReady}
          hasBloomed={hasBloomed}
          isSecondary
          baseRotation={-4}
          onBloomComplete={() => handleBloomComplete("lily-secondary")}
          delayMs={700}
          durationMs={4300}
        />
        <FlowerBloomCanvas
          className="nature-bloom__flower nature-bloom__flower--main"
          isActive={isActive && gardenReady}
          hasBloomed={hasBloomed}
          baseRotation={3}
          onStageTrigger={handleStageTrigger}
          onBloomComplete={() => handleBloomComplete("lily-main")}
          delayMs={0}
          durationMs={4600}
        />

      </div>

      <div className="nature-bloom__message" aria-live="polite">
        <AnimatePresence mode="wait">
          {revealedStage > 0 && activeMessage ? (
            <motion.div
              key={activeMessage.id}
              initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.7, ease: easeOut }}
            >
              <span>{activeMessage.tag} / 04</span>
              <p>{activeMessage.line1}<br /><em>{activeMessage.line2}</em></p>
            </motion.div>
          ) : (
            <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}>
              chờ một chút, hoa đang thức dậy…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <MeadowLayer />

      <div className="nature-bloom__footer">
        <span>11.01.2025 · 10.11</span>
        <AnimatePresence mode="wait">
          {isCtaReady ? (
            <motion.button
              key="next"
              type="button"
              onClick={onComplete}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: easeOut }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {flowers.cta}<i>↗</i>
            </motion.button>
          ) : (
            <motion.span
              key="loading"
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              {flowers.loadingStatus}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
