import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Petals from "./components/Petals";
import ScrollCompanion from "./components/ScrollCompanion";
import Hero from "./components/Hero";
import Flowers from "./components/Flowers";
import Wallet from "./components/Wallet";
import Letter from "./components/Letter";
import Moments from "./components/Moments";
import Finale from "./components/Finale";

const STEPS = ["Mở đầu", "Hoa", "Lì xì", "Lá thư", "Khoảnh khắc", "Ước"];

export default function App() {
  // Number of chapters currently revealed. Each chapter must be "completed"
  // (its interaction done) before the next one is unlocked.
  const [unlocked, setUnlocked] = useState(1);
  const [current, setCurrent] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const advance = (i: number) => {
    setUnlocked((u) => Math.max(u, i + 2));
    // Wait a beat for the next chapter to mount, then scroll to it.
    setTimeout(() => {
      refs.current[i + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  // Track which chapter is in view for the progress rail.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setCurrent(idx);
          }
        });
      },
      { threshold: 0.5 },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [unlocked]);

  const chapters = [
    (i: number) => <Hero onComplete={() => advance(i)} />,
    (i: number) => <Flowers onComplete={() => advance(i)} />,
    (i: number) => <Wallet onComplete={() => advance(i)} />,
    (i: number) => <Letter onComplete={() => advance(i)} />,
    (i: number) => <Moments onComplete={() => advance(i)} />,
    () => <Finale />,
  ];

  return (
    <div className="relative min-h-screen w-full bg-ink text-cream">
      {/* Ambient glow that follows the journey */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-deep/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
      </div>

      <Petals />
      <ScrollCompanion />

      {/* Progress rail */}
      <div className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 sm:flex">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i === current ? "scale-150 bg-gold" : i < unlocked ? "bg-cream-dim/60" : "bg-cream-dim/20"
              }`}
            />
            <span
              className={`font-body text-[10px] uppercase tracking-[0.25em] transition-opacity ${
                i === current ? "text-gold opacity-100" : "text-cream-dim opacity-0"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <main className="relative z-10">
        <AnimatePresence>
          {chapters.map((render, i) =>
            i < unlocked ? (
              <motion.div
                key={i}
                data-idx={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                initial={i === 0 ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {render(i)}
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
