import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CONFETTI = Array.from({ length: 60 }, (_, i) => i);
const COLORS = ["#e7b96a", "#e18aa0", "#a63c56", "#f4ece4", "#f0c04a"];

export default function Finale() {
  const [blown, setBlown] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <AnimatePresence>
        {blown &&
          CONFETTI.map((i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 800,
                y: 400 + Math.random() * 400,
                rotate: Math.random() * 720,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.3, ease: "easeOut" }}
              className="absolute left-1/2 top-1/3 h-3 w-2"
              style={{ background: COLORS[i % COLORS.length] }}
            />
          ))}
      </AnimatePresence>

      <div className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-gold">
        Chương 05 — Ước một điều nha
      </div>

      {!blown ? (
        <>
          <h2 className="mb-10 max-w-xl font-display text-4xl font-light leading-tight sm:text-5xl">
            Thổi nến và ước đi em,
            <span className="mt-3 block font-hand text-2xl text-rose">năm nay để tui lo phần còn lại.</span>
          </h2>

          <motion.button
            onClick={() => setBlown(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative"
            aria-label="Thổi nến"
          >
            {/* cake */}
            <div className="relative flex flex-col items-center">
              <div className="relative -mb-2 h-10 w-1.5 rounded-full bg-cream">
                <motion.div
                  animate={{ scaleY: [1, 1.25, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute -top-5 left-1/2 h-6 w-4 -translate-x-1/2 rounded-full bg-gradient-to-t from-gold to-[#fff4dd] blur-[1px]"
                />
              </div>
              <div className="h-16 w-56 rounded-t-md bg-gradient-to-b from-rose to-rose-deep" />
              <div className="h-14 w-64 rounded-md bg-gradient-to-b from-[#e6d8c8] to-[#cdbdae]" />
            </div>
            <span className="mt-4 block font-hand text-xl text-gold">chạm để thổi nến ✨</span>
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-5xl font-light italic sm:text-7xl">
            <span className="text-shimmer">Chúc mừng sinh nhật em</span>
          </h2>
          <p className="mt-8 font-hand text-3xl text-rose">
            Cảm ơn em vì đã yêu tui, kể cả khi mình cách nhau cả một khoảng trời.
          </p>
          <p className="mt-6 font-body leading-relaxed text-cream-dim">
            Khoảng cách chỉ là tạm thời. Còn tui thương em thì lâu dài lắm.
            Hẹn ngày mình được thổi nến chung một cái bánh nha. 🤍
          </p>
          <p className="mt-10 font-body text-xs uppercase tracking-[0.4em] text-gold">
            10 · 11 · 2003 — mãi thương
          </p>
        </motion.div>
      )}
    </section>
  );
}
