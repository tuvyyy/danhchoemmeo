import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────
   Local photographic assets (transparent PNGs) — no remote URLs, no vectors,
   no mix-blend. Rendered normally as cut-out images.
   ──────────────────────────────────────────────────────────────────────── */
import bud from "../img/birthday_flower_asset_pack/lily_frame_01_bud.png";
import opening from "../img/birthday_flower_asset_pack/lily_frame_02_opening.png";
import half from "../img/birthday_flower_asset_pack/lily_frame_03_half_bloom.png";
import almost from "../img/birthday_flower_asset_pack/lily_frame_04_almost_open.png";
import full from "../img/birthday_flower_asset_pack/lily_frame_05_full_bloom.png";
import altFull from "../img/birthday_flower_asset_pack/lily_static_alt_full_bloom.png";
import grassBack from "../img/birthday_flower_asset_pack/grass_back.png";
import grassMid from "../img/birthday_flower_asset_pack/grass_mid.png";
import grassFront from "../img/birthday_flower_asset_pack/grass_front.png";

// One flower, five frames of the same bloom.
const FRAMES = [bud, opening, half, almost, full];

const MARQUEE = "growing with you — blooming with you — loving you — ";

const PETALS = Array.from({ length: 4 }, (_, i) => ({
  left: 18 + Math.random() * 64,
  dur: 18 + Math.random() * 12,
  delay: -Math.random() * 18,
  size: 16 + Math.random() * 12,
  drift: (Math.random() - 0.5) * 180,
  i,
}));

export default function Flowers({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [frame, setFrame] = useState(0); // 0..4 active bloom frame
  const [bloomed, setBloomed] = useState(false);

  // Play the bloom sequence once the section is in view (~4s, soft overlaps).
  useEffect(() => {
    if (!inView) return;
    const STEP = 900; // ms between frames → ~3.6s for 4 transitions
    const timers = [1, 2, 3, 4].map((n) =>
      window.setTimeout(() => setFrame(n), n * STEP),
    );
    const done = window.setTimeout(() => setBloomed(true), 4 * STEP + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 22%, #170f11 0%, #100a0c 45%, #070506 100%)",
      }}
    >
      <div className="absolute top-16 z-30 font-body text-[10px] uppercase tracking-[0.5em] text-cream-dim/50">
        Chương 01
      </div>

      {/* ── marquee — huge, faint, drifting right → left behind the flower ── */}
      <div
        data-layer="marquee"
        className="pointer-events-none absolute top-[26%] z-[1] w-full -translate-y-1/2 overflow-hidden"
      >
        <div
          className="flex w-max whitespace-nowrap font-display text-[15vw] italic leading-none text-cream opacity-[0.08] sm:text-[10vw]"
          style={{ animation: "marquee 48s linear infinite" }}
        >
          <span>{MARQUEE.repeat(4)}</span>
          <span>{MARQUEE.repeat(4)}</span>
        </div>
      </div>

      {/* soft breathing halo behind the flowers */}
      <div
        className="pointer-events-none absolute left-1/2 top-[34%] z-[2] h-[540px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(224,138,170,0.16) 0%, rgba(224,138,170,0.05) 42%, rgba(7,5,6,0) 70%)",
          animation: "breathe 8s ease-in-out infinite",
        }}
      />

      {/* ── flowers ── */}
      <div className="relative z-[3] mt-[-6vh] flex h-[54vh] w-full max-w-5xl items-end justify-center">
        {/* secondary flower — smaller, behind & left, gentle sway only */}
        <motion.img
          data-layer="flower-static"
          src={altFull}
          alt=""
          aria-hidden
          className="absolute bottom-0 left-[26%] z-[1] w-[20vw] max-w-[240px] min-w-[140px] origin-bottom object-contain"
          initial={{ opacity: 0, y: 24 }}
          animate={
            inView
              ? { opacity: 1, y: [0, -3, 0], rotate: [-0.7, 0.7, -0.7] }
              : { opacity: 0 }
          }
          transition={{
            opacity: { duration: 1.4 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ filter: "brightness(0.86) drop-shadow(0 20px 34px rgba(0,0,0,0.5))" }}
        />

        {/* main blooming flower — 5 frames stacked in the exact same spot */}
        <motion.div
          data-layer="flower-bloom"
          className="absolute bottom-0 left-[46%] z-[2] w-[32vw] max-w-[380px] min-w-[220px] origin-bottom"
          animate={{ rotate: [-0.5, 0.4, -0.5], y: [2, 0, 2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative aspect-[3/4] w-full">
            {FRAMES.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt={i === FRAMES.length - 1 ? "Hoa ly nở rộ" : ""}
                aria-hidden={i !== FRAMES.length - 1}
                initial={false}
                animate={{
                  opacity: frame === i ? 1 : 0,
                  scale: frame === i ? 1 : 0.97,
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full origin-bottom object-contain"
                style={{ filter: "drop-shadow(0 26px 44px rgba(0,0,0,0.55))" }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── main quote — only after the bloom finishes ── */}
      <div data-layer="quote" className="relative z-[6] mt-[3vh] h-[6em] max-w-2xl">
        <AnimatePresence>
          {bloomed && (
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-center font-display text-3xl font-light italic leading-snug text-[#f3e7d6] sm:text-5xl"
            >
              My darling,
              <br />
              you will never be unloved by me.
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      {/* ── garden: back → mid → front, each swaying at its own pace ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[24vh] min-h-[170px]">
        <GrassLayer
          layer="grass-back"
          src={grassBack}
          z={1}
          scale={1.05}
          blur={1}
          brightness={0.6}
          sway={{ dur: 13, a: -0.25, b: 0.25 }}
        />
        <GrassLayer
          layer="grass-mid"
          src={grassMid}
          z={2}
          scale={1}
          blur={0}
          brightness={0.85}
          sway={{ dur: 9, a: -0.5, b: 0.5 }}
        />
        <GrassLayer
          layer="grass-front"
          src={grassFront}
          z={3}
          scale={1.12}
          blur={2}
          brightness={0.72}
          sway={{ dur: 7, a: -0.8, b: 0.8 }}
        />
      </div>

      {/* occasional drifting petals (reuse a bloom frame as a tiny cut-out) */}
      {PETALS.map((p) => (
        <img
          key={p.i}
          src={full}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 z-[5] object-contain opacity-60"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `fall ${p.dur}s linear ${p.delay}s infinite`,
            // @ts-expect-error custom prop consumed by the fall keyframe
            "--drift": `${p.drift}px`,
          }}
        />
      ))}

      {/* status / continue */}
      <div className="absolute bottom-8 z-30 flex h-12 items-center">
        <AnimatePresence>
          {bloomed ? (
            <motion.button
              key="go"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="group flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-8 py-4 font-body text-sm uppercase tracking-[0.25em] text-gold backdrop-blur-sm transition-colors hover:bg-gold/15"
            >
              Món quà nhỏ tiếp theo
              <span className="transition-transform group-hover:translate-y-1">↓</span>
            </motion.button>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="font-body text-[10px] uppercase tracking-[0.4em] text-cream-dim"
            >
              hoa đang nở…
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* One full-width grass depth-layer, anchored at the bottom and swaying gently. */
function GrassLayer({
  layer,
  src,
  z,
  scale,
  blur,
  brightness,
  sway,
}: {
  layer: string;
  src: string;
  z: number;
  scale: number;
  blur: number;
  brightness: number;
  sway: { dur: number; a: number; b: number };
}) {
  return (
    <div
      data-layer={layer}
      className="absolute inset-x-0 bottom-0"
      style={{
        zIndex: z,
        transformOrigin: "center bottom",
        animation: `sway ${sway.dur}s ease-in-out infinite`,
        // @ts-expect-error custom props consumed by the sway keyframe
        "--a": `${sway.a}deg`,
        "--b": `${sway.b}deg`,
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        className="w-full origin-bottom object-cover object-bottom"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center bottom",
          filter: `blur(${blur}px) brightness(${brightness})`,
        }}
      />
    </div>
  );
}
