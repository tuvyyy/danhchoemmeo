import { motion } from "framer-motion";
import { useChapterFlow } from "@/chapters/useChapterFlow";

// Rich atmospheric palettes per chapter (Atmospheric Storytelling Nebulae)
const CHAPTER_GLOWS: Record<
  number,
  {
    primary: string;
    secondary: string;
    accent: string;
  }
> = {
  // 0. Hero (Midnight Stardust & Aurora)
  0: {
    primary: "radial-gradient(circle, rgba(147, 51, 234, 0.22) 0%, rgba(88, 28, 135, 0.12) 45%, transparent 70%)",
    secondary: "radial-gradient(circle, rgba(231, 185, 106, 0.16) 0%, rgba(225, 138, 160, 0.08) 50%, transparent 70%)",
    accent: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 65%)",
  },
  // 1. Flowers (Enchanted Velvet Plum & Blossom Rose Glow)
  1: {
    primary: "radial-gradient(circle, rgba(244, 143, 177, 0.24) 0%, rgba(194, 24, 91, 0.14) 45%, transparent 70%)",
    secondary: "radial-gradient(circle, rgba(231, 185, 106, 0.14) 0%, rgba(244, 143, 177, 0.06) 50%, transparent 70%)",
    accent: "radial-gradient(circle, rgba(156, 39, 176, 0.15) 0%, transparent 65%)",
  },
  // 2. Wallet (Royal Ruby & Warm Amber Velvet)
  2: {
    primary: "radial-gradient(circle, rgba(225, 29, 72, 0.22) 0%, rgba(159, 18, 57, 0.12) 45%, transparent 70%)",
    secondary: "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.08) 50%, transparent 70%)",
    accent: "radial-gradient(circle, rgba(251, 191, 36, 0.14) 0%, transparent 65%)",
  },
  // 3. Letter (Warm Candlelight & Roasted Chestnut)
  3: {
    primary: "radial-gradient(circle, rgba(245, 158, 11, 0.20) 0%, rgba(180, 83, 9, 0.10) 45%, transparent 70%)",
    secondary: "radial-gradient(circle, rgba(217, 119, 6, 0.16) 0%, rgba(146, 64, 14, 0.08) 50%, transparent 70%)",
    accent: "radial-gradient(circle, rgba(254, 243, 199, 0.10) 0%, transparent 65%)",
  },
  // 4. Moments (Cosmic Deep Sapphire & Starry Cyan)
  4: {
    primary: "radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(2, 132, 199, 0.12) 45%, transparent 70%)",
    secondary: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(67, 56, 202, 0.08) 50%, transparent 70%)",
    accent: "radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, transparent 65%)",
  },
  // 5. Finale (Champagne Celebration & Strawberry Gold)
  5: {
    primary: "radial-gradient(circle, rgba(251, 191, 36, 0.24) 0%, rgba(245, 158, 11, 0.14) 45%, transparent 70%)",
    secondary: "radial-gradient(circle, rgba(244, 63, 94, 0.20) 0%, rgba(225, 29, 72, 0.10) 50%, transparent 70%)",
    accent: "radial-gradient(circle, rgba(253, 224, 71, 0.18) 0%, transparent 65%)",
  },
};

export default function AmbientGlow() {
  const { currentChapter } = useChapterFlow();
  const glow = CHAPTER_GLOWS[currentChapter] ?? CHAPTER_GLOWS[0];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Top / Center Primary Aurora Bloom */}
      <motion.div
        animate={{ background: glow.primary }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-[110px]"
      />

      {/* Bottom Right Secondary Warm Glow */}
      <motion.div
        animate={{ background: glow.secondary }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-24 -right-16 h-[520px] w-[520px] rounded-full blur-[120px]"
      />

      {/* Left Mid Accent Floating Mote */}
      <motion.div
        animate={{ background: glow.accent }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/3 -left-20 h-[420px] w-[420px] rounded-full blur-[100px]"
      />
    </div>
  );
}
