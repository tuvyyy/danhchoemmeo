import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* 👉 THAY ẢNH SCAN THẬT: đổi 2 hằng số này sang ảnh scan lá thư tay
   (đặt trong public/ rồi trỏ "/left-page-scan.jpg", "/right-page-scan.jpg").
   Hiện dùng ảnh giấy viết tay làm placeholder để canh bố cục. */
const LEFT_SCAN =
  "https://images.unsplash.com/photo-1561812938-f6e60cbf95e3?w=900&h=1200&fit=crop&auto=format";
const RIGHT_SCAN =
  "https://images.unsplash.com/photo-1730342754571-93f5462e6d2f?w=900&h=1200&fit=crop&auto=format";

const PAPER = "linear-gradient(135deg, #efe6d3 0%, #e7dcc4 45%, #ddd0b4 100%)";
const DUST = Array.from({ length: 7 }, (_, i) => i);

function Page({ src, side }: { src: string; side: "left" | "right" }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: PAPER }}>
      <img src={src} alt={`Trang thư ${side === "left" ? "1" : "2"}`} className="h-full w-full object-cover" />
      {/* fold shading toward the spine */}
      <div
        className="pointer-events-none absolute inset-y-0 w-16"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background:
            side === "left"
              ? "linear-gradient(to right, transparent, rgba(0,0,0,0.22))"
              : "linear-gradient(to left, transparent, rgba(0,0,0,0.22))",
        }}
      />
      {/* tiny placeholder filename hint */}
      <span className="absolute bottom-2 left-2 font-body text-[9px] uppercase tracking-widest text-black/25">
        {side}-page-scan.jpg
      </span>
    </div>
  );
}

export default function Letter({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<null | 0 | 1>(null);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24" style={{ background: "#080808" }}>
      {/* one extremely faint blurred flower near an edge */}
      <img
        src="https://images.unsplash.com/photo-1623183074617-90611646e4ca?w=700&h=900&fit=crop&auto=format"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full object-cover opacity-[0.06] blur-2xl"
      />
      {/* a few drifting dust motes */}
      {DUST.map((i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-cream/40"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${10 + i * 12}%`,
            top: 0,
            animation: `fall ${16 + i * 2}s linear ${-i * 3}s infinite`,
            // @ts-expect-error custom property
            "--drift": `${(i % 2 ? 1 : -1) * 60}px`,
          }}
        />
      ))}

      <div className="mb-10 font-body text-[10px] uppercase tracking-[0.5em] text-cream-dim/50">
        Chương 03
      </div>

      {/* stage */}
      <div className="relative flex items-center justify-center" style={{ perspective: 2000, height: "72vh", width: "100%" }}>
        {/* open two-page spread (revealed behind the cover) */}
        <motion.button
          initial={false}
          animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
          transition={{ delay: open ? 0.45 : 0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => open && setZoom(0)}
          className="relative flex overflow-hidden rounded-[6px] shadow-[0_40px_90px_rgba(0,0,0,0.7)]"
          style={{ height: "70vh", width: "min(94vw, 96vh)", cursor: open ? "zoom-in" : "default" }}
          aria-label="Phóng to đọc thư"
          disabled={!open}
        >
          <div className="h-full w-1/2">
            <Page src={LEFT_SCAN} side="left" />
          </div>
          <div className="h-full w-1/2">
            <Page src={RIGHT_SCAN} side="right" />
          </div>
          {/* central fold seam */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/30" />
        </motion.button>

        {/* folded cover — two halves that swing outward like doors */}
        <motion.div
          className="absolute"
          initial={false}
          animate={{ rotate: open ? 0 : 3 }}
          transition={{ duration: 0.6 }}
          style={{
            height: "64vh",
            width: "min(46vh, 82vw)",
            transformStyle: "preserve-3d",
            pointerEvents: open ? "none" : "auto",
          }}
        >
          {/* left half */}
          <motion.div
            className="absolute left-0 top-0 h-full w-1/2 rounded-l-[6px]"
            initial={false}
            animate={{ rotateY: open ? -172 : 0, opacity: open ? 0 : 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], opacity: { delay: open ? 0.5 : 0, duration: 0.5 } }}
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              background: PAPER,
              boxShadow: "inset -18px 0 34px rgba(0,0,0,0.22), 0 30px 60px rgba(0,0,0,0.6)",
            }}
          />
          {/* right half */}
          <motion.div
            className="absolute right-0 top-0 h-full w-1/2 rounded-r-[6px]"
            initial={false}
            animate={{ rotateY: open ? 172 : 0, opacity: open ? 0 : 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], opacity: { delay: open ? 0.5 : 0, duration: 0.5 } }}
            style={{
              transformOrigin: "right center",
              backfaceVisibility: "hidden",
              background: PAPER,
              boxShadow: "inset 18px 0 34px rgba(0,0,0,0.22), 0 30px 60px rgba(0,0,0,0.6)",
            }}
          />

          {/* front label + hint, fades as it opens */}
          <motion.button
            onClick={() => setOpen(true)}
            initial={false}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.35 }}
            whileHover={!open ? { scale: 1.015 } : {}}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ pointerEvents: open ? "none" : "auto" }}
            aria-label="Mở thư"
          >
            <span className="font-hand text-3xl text-[#5a4a3a]">for you</span>
            <span className="mt-1 font-hand text-lg text-[#8a7659]">10.11</span>
            <span className="absolute bottom-8 font-body text-[10px] uppercase tracking-[0.35em] text-[#8a7659]/80">
              chạm để mở ↗
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* controls */}
      <div className="mt-10 flex h-8 items-center gap-6">
        <AnimatePresence>
          {open && (
            <motion.div
              key="ctrl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-6 font-body text-[11px] uppercase tracking-[0.3em] text-cream-dim"
            >
              <button onClick={() => setZoom(0)} className="hover:text-gold">
                ⤢ phóng to
              </button>
              <button onClick={() => setOpen(false)} className="hover:text-gold">
                đóng thư
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplete}
            className="group mt-8 flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-8 py-4 font-body text-sm uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold/15"
          >
            Nhớ lại tụi mình
            <span className="transition-transform group-hover:translate-y-1">↓</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* zoomed reading state */}
      <AnimatePresence>
        {zoom !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/92 px-4 py-10"
            onClick={() => setZoom(null)}
          >
            <motion.div
              key={zoom}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="overflow-hidden rounded-[6px] shadow-2xl"
              style={{ height: "84vh", maxWidth: "94vw", background: PAPER }}
            >
              <img
                src={zoom === 0 ? LEFT_SCAN : RIGHT_SCAN}
                alt={`Trang thư ${zoom + 1}`}
                className="h-full w-auto max-w-full object-contain"
              />
            </motion.div>

            <div className="mt-6 flex items-center gap-8 font-body text-[11px] uppercase tracking-[0.3em] text-cream-dim">
              <button onClick={(e) => { e.stopPropagation(); setZoom(0); }} className={zoom === 0 ? "text-gold" : "hover:text-cream"}>
                ← 01
              </button>
              <span className="text-cream-dim/50">/</span>
              <button onClick={(e) => { e.stopPropagation(); setZoom(1); }} className={zoom === 1 ? "text-gold" : "hover:text-cream"}>
                02 →
              </button>
              <button onClick={() => setZoom(null)} className="ml-4 hover:text-gold">
                thu nhỏ ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
