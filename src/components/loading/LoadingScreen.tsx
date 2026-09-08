import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { preloadBloomSequence } from "@/lib/assets/preloadBloomSequence";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const hasFinishedRef = useRef(false);

  const complete = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    let current = 0;
    let assetsLoaded = false;

    // Preload heavy assets in background
    Promise.all([
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready
        : Promise.resolve(),
      preloadBloomSequence().catch(() => []),
      ...BIRTHDAY_DATA.moments.items.map(
        (item) =>
          new Promise<void>((res) => {
            const img = new Image();
            img.onload = () => res();
            img.onerror = () => res();
            img.src = item.src;
          }),
      ),
    ]).then(() => {
      assetsLoaded = true;
    });

    const startTime = Date.now();
    const duration = 1600; // Fast, elegant 1.6s duration

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const fraction = Math.min(1, elapsed / duration);

      if (!assetsLoaded) {
        current = Math.min(88, Math.round(fraction * 88));
      } else {
        current = Math.min(100, Math.round(fraction * 100));
      }

      if (elapsed >= duration && assetsLoaded) {
        current = 100;
      }

      setProgress(current);

      if (current >= 100) {
        clearInterval(timer);
        setTimeout(complete, 300);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a030d] text-cream selection:bg-none"
    >
      {/* Delicate central ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-[320px] w-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(231,185,106,0.08) 0%, rgba(244,143,177,0.04) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Minimalist sparkling star icon */}
        <motion.svg
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-6 w-6 text-gold/90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"
          />
        </motion.svg>

        {/* Quiet, refined typography */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="font-body text-[11px] font-medium uppercase tracking-[0.32em] text-gold/80">
            Dành Cho Em Mèo
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-cream-dim/50">
            10 · 11 · 2003
          </span>
        </div>

        {/* Minimal hairline progress bar */}
        <div className="mt-2 h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/60 via-gold to-[#f48fb1]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        {/* Refined percentage counter */}
        <span className="font-mono text-[11px] tracking-wider text-cream-dim/60">
          {progress}%
        </span>
      </div>
    </motion.div>
  );
}
