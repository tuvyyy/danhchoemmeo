import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftCardData } from "@/data/birthdayContent";
import { useSceneOverlay } from "@/components/effects/SceneExperience";
import { useDialogFocus } from "@/components/effects/useDialogFocus";

interface GiftCardModalProps {
  card: GiftCardData | null;
  onClose: () => void;
}

const MODAL_THEME_MAP: Record<
  string,
  {
    bg: string;
    border: string;
    glow: string;
    badge: string;
    title: string;
    stamp: string;
  }
> = {
  rose: {
    bg: "from-[#28141a] via-[#3a1824] to-[#1a0c11]",
    border: "border-rose/50",
    glow: "shadow-[0_0_50px_-10px_rgba(225,138,160,0.3)]",
    badge: "bg-rose/20 text-rose border-rose/30",
    title: "text-rose-100",
    stamp: "border-rose/40 text-rose/60",
  },
  gold: {
    bg: "from-[#241a0f] via-[#382815] to-[#181109]",
    border: "border-gold/50",
    glow: "shadow-[0_0_50px_-10px_rgba(231,185,106,0.3)]",
    badge: "bg-gold/20 text-gold border-gold/30",
    title: "text-gold-100",
    stamp: "border-gold/40 text-gold/60",
  },
  emerald: {
    bg: "from-[#0f241a] via-[#173627] to-[#0a1811]",
    border: "border-emerald-500/50",
    glow: "shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    title: "text-emerald-100",
    stamp: "border-emerald-500/40 text-emerald-400/60",
  },
  wine: {
    bg: "from-[#2b0f19] via-[#3f1524] to-[#1c0a10]",
    border: "border-rose-400/50",
    glow: "shadow-[0_0_50px_-10px_rgba(225,138,160,0.35)]",
    badge: "bg-rose-400/20 text-rose-300 border-rose-400/30",
    title: "text-rose-100",
    stamp: "border-rose-400/40 text-rose-300/60",
  },
};

export default function GiftCardModal({ card, onClose }: GiftCardModalProps) {
  useSceneOverlay(card !== null);
  const dialogRef = useDialogFocus(card !== null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus close button on mount and handle Escape key
  useEffect(() => {
    if (!card) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [card, onClose]);

  if (!card) return null;

  const theme = MODAL_THEME_MAP[card.colorTheme] || MODAL_THEME_MAP.gold;

  return (
    <AnimatePresence>
      <div
        data-testid="gift-card-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md transition-opacity"
      >
        <motion.div
          role="dialog"
          ref={dialogRef}
          tabIndex={-1}
          aria-modal="true"
          aria-label={card.title}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-[380px] overflow-hidden rounded-2xl border ${theme.border} ${theme.glow} bg-gradient-to-b ${theme.bg} p-6 sm:p-7 shadow-2xl`}
        >
          {/* Subtle Guilloche Inner Border */}
          <div className="pointer-events-none absolute inset-2 rounded-xl border border-white/10" />

          {/* Close button */}
          <button
            ref={closeBtnRef}
            data-dialog-close
            type="button"
            onClick={onClose}
            aria-label="Đóng thẻ"
            className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs text-cream transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gold"
          >
            ✕
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{card.icon}</span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${theme.badge}`}
            >
              {card.badge}
            </span>
          </div>

          {/* Card Title & Subtitle */}
          <h3 className={`font-display text-2xl sm:text-3xl font-normal leading-snug ${theme.title}`}>
            {card.title}
          </h3>
          <p className="mt-1 font-hand text-lg text-rose drop-shadow-sm">
            {card.subtitle}
          </p>

          {/* Horizontal divider */}
          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Description */}
          <p className="font-body text-sm leading-relaxed text-cream-dim/90">
            {card.description}
          </p>

          {/* Fine Print Footer & Official Stamp */}
          <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
            <p className="font-body text-[10px] leading-relaxed text-cream-dim/60 max-w-[200px]">
              {card.finePrint}
            </p>

            {/* Circular decorative seal stamp */}
            <div
              className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border border-dashed font-mono text-[7px] uppercase tracking-tighter ${theme.stamp}`}
            >
              <span>VOUCHER</span>
              <span className="font-bold">VALID</span>
              <span>10.11</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
