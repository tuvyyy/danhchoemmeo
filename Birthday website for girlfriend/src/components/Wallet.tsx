import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BILLS = Array.from({ length: 14 }, (_, i) => i);

export default function Wallet({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-gold">
        Chương 02 — Lì xì sinh nhật
      </div>
      <h2 className="mb-10 max-w-xl text-center font-display text-4xl font-light leading-tight sm:text-5xl">
        Tui không ở cạnh để dẫn em đi ăn,
        <span className="mt-3 block font-hand text-2xl text-rose">
          nên gửi trước một chút — em muốn gì thì cứ mua nha 💸
        </span>
      </h2>

      <div className="relative flex h-72 w-full max-w-sm items-center justify-center">
        {/* flying bills */}
        <AnimatePresence>
          {open &&
            BILLS.map((i) => {
              const angle = (Math.PI * (i / (BILLS.length - 1))) - Math.PI / 2;
              const dist = 150 + Math.random() * 130;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist - 60,
                    opacity: [0, 1, 1, 0],
                    rotate: (Math.random() - 0.5) * 180,
                    scale: 1,
                  }}
                  transition={{ duration: 1.8 + Math.random(), delay: i * 0.05, ease: "easeOut" }}
                  className="absolute flex h-9 w-16 items-center justify-center rounded-sm border border-gold/60 bg-gradient-to-br from-[#1c3a2a] to-[#2f5c3f] text-[10px] font-semibold text-gold shadow-lg"
                >
                  500K
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* wallet */}
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: open ? 1 : 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative z-10"
          disabled={open}
          aria-label="Mở ví"
        >
          <div className="relative h-40 w-60 rounded-2xl bg-gradient-to-br from-ink-soft to-[#2a1d22] shadow-2xl ring-1 ring-gold/20">
            <motion.div
              animate={open ? { rotateX: -150 } : { rotateX: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
              className="absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-br from-[#2a1d22] to-[#3a1420] ring-1 ring-gold/20"
            >
              <div className="absolute bottom-3 left-1/2 h-8 w-16 -translate-x-1/2 rounded-md border border-gold/40 bg-gold/10" />
            </motion.div>
            {!open && (
              <div className="absolute inset-x-0 bottom-5 text-center font-hand text-xl text-gold">
                chạm để mở ✨
              </div>
            )}
          </div>
          {!open && (
            <span className="absolute inset-0 -z-10 rounded-2xl" style={{ animation: "pulse-ring 2s ease-out infinite", boxShadow: "0 0 0 2px #e7b96a" }} />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-col items-center"
          >
            <p className="max-w-sm text-center font-body leading-relaxed text-cream-dim">
              Coi như tui đang ngồi đối diện, dúi vào tay em và nói:
              <span className="text-gold"> “Thích gì mua nấy, đừng tiết kiệm nha.”</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="group mt-8 flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-8 py-4 font-body text-sm uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold/15"
            >
              Có thứ này quan trọng hơn
              <span className="transition-transform group-hover:translate-y-1">↓</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
