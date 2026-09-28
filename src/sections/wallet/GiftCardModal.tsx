import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftCardData } from "@/data/birthdayContent";
import { useSceneOverlay } from "@/components/effects/SceneExperience";
import { useDialogFocus } from "@/components/effects/useDialogFocus";

interface GiftCardModalProps {
  card: GiftCardData | null;
  onClose: () => void;
}

const THEMES: Record<string, { bg: string; border: string; glow: string; badge: string; accent: string; stamp: string; iconBg: string }> = {
  rose: {
    bg: "from-[#5a0818] via-[#8a1028] to-[#3a0510]",
    border: "border-rose-400/40",
    glow: "shadow-[0_0_80px_-8px_rgba(225,100,120,0.55)]",
    badge: "bg-rose/20 text-rose-200 border-rose-400/30",
    accent: "from-rose-400/70 to-transparent",
    stamp: "border-rose-400/40 text-rose-300/60",
    iconBg: "border-rose-400/30 bg-rose/15",
  },
  gold: {
    bg: "from-[#4a2204] via-[#7a3808] to-[#2e1402]",
    border: "border-gold/40",
    glow: "shadow-[0_0_80px_-8px_rgba(231,185,106,0.55)]",
    badge: "bg-gold/20 text-gold border-gold/30",
    accent: "from-gold/70 to-transparent",
    stamp: "border-gold/40 text-gold/60",
    iconBg: "border-gold/30 bg-gold/15",
  },
  emerald: {
    bg: "from-[#082818] via-[#0e3820] to-[#05180c]",
    border: "border-emerald-400/40",
    glow: "shadow-[0_0_80px_-8px_rgba(16,185,129,0.50)]",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    accent: "from-emerald-400/65 to-transparent",
    stamp: "border-emerald-400/40 text-emerald-400/60",
    iconBg: "border-emerald-400/30 bg-emerald-500/15",
  },
  wine: {
    bg: "from-[#500818] via-[#780e28] to-[#30040e]",
    border: "border-pink-400/40",
    glow: "shadow-[0_0_80px_-8px_rgba(220,100,140,0.55)]",
    badge: "bg-pink-400/20 text-pink-300 border-pink-400/30",
    accent: "from-pink-400/65 to-transparent",
    stamp: "border-pink-400/40 text-pink-300/60",
    iconBg: "border-pink-400/30 bg-pink-400/15",
  },
};

export default function GiftCardModal({ card, onClose }: GiftCardModalProps) {
  useSceneOverlay(card !== null);
  const dialogRef = useDialogFocus(card !== null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [card, onClose]);

  if (!card) return null;
  const th = THEMES[card.colorTheme] ?? THEMES.gold;

  return (
    <AnimatePresence>
      <motion.div
        data-testid="gift-card-modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
      >
        <motion.div
          role="dialog" ref={dialogRef} tabIndex={-1} aria-modal="true" aria-label={card.title}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.75, y: 50, rotateX: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-[390px] overflow-hidden rounded-2xl border ${th.border} ${th.glow} bg-gradient-to-b ${th.bg}`}
          style={{ perspective: "800px" }}
        >
          {/* Top accent bar */}
          <div aria-hidden className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${th.accent}`} />

          {/* Inner frame */}
          <div aria-hidden className="pointer-events-none absolute inset-[5px] rounded-[14px] border border-white/[0.07]" />

          {/* Corner marks */}
          {["top-3 left-3", "top-3 right-3 rotate-90", "bottom-3 left-3 -rotate-90", "bottom-3 right-3 rotate-180"].map((cls, i) => (
            <div key={i} aria-hidden className={`pointer-events-none absolute ${cls} h-3 w-3 border-t border-l border-white/12`} />
          ))}

          {/* Close */}
          <button ref={closeBtnRef} data-dialog-close type="button" onClick={onClose} aria-label="Dong the"
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-xs text-cream-dim transition-all hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold/60">
            ✕
          </button>

          <div className="p-6 sm:p-7 pt-7">
            {/* Icon + badge */}
            <div className="flex items-start gap-3 mb-5">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-3xl shadow-inner ${th.iconBg}`}>
                {card.icon}
              </div>
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${th.badge}`}>
                  {card.badge}
                </span>
                <p className="mt-1 font-hand text-base text-rose-200 drop-shadow-sm">{card.subtitle}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display text-2xl sm:text-3xl font-normal leading-snug text-cream mb-1">
              {card.title}
            </h3>

            <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            {/* Description */}
            <p className="font-body text-sm leading-relaxed text-cream-dim/85">{card.description}</p>

            {/* Footer */}
            <div className="mt-6 flex items-end justify-between border-t border-white/[0.08] pt-4">
              <p className="font-body text-[10px] leading-relaxed text-cream-dim/45 max-w-[195px]">{card.finePrint}</p>
              <div
                className={`relative flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed font-mono text-[6.5px] uppercase tracking-tight ${th.stamp}`}
                style={{ transform: "rotate(-14deg)" }}
              >
                <span className="font-semibold leading-tight">VOUCHER</span>
                <span className="text-[9px] font-bold">✓</span>
                <span className="leading-tight">10.11</span>
                <div aria-hidden className="pointer-events-none absolute inset-[5px] rounded-full border border-dashed opacity-35" style={{ borderColor: "currentColor" }} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
