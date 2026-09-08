import { useState } from "react";
import { motion } from "framer-motion";
import { VIETNAM_PATH } from "./vietnamPath";

// The map SVG uses a 1024×1024 viewBox and is rendered at STAGE px (1:1),
// so viewBox units == CSS px and offset-path lines up with the drawn route.
const STAGE = 360;
const S = STAGE / 1024;

// City coordinates in viewBox units.
const SGN: [number, number] = [560, 812];
const HAN: [number, number] = [372, 250];
const C1: [number, number] = [790, 650];
const C2: [number, number] = [770, 380];

const route = (k: number) =>
  `M${SGN[0] * k},${SGN[1] * k} C ${C1[0] * k},${C1[1] * k} ${C2[0] * k},${C2[1] * k} ${HAN[0] * k},${HAN[1] * k}`;

const PATH_VB = route(1); // for the SVG dashed trail
const PATH_PX = route(S); // for the flying pig's offset-path

const HEARTS = Array.from({ length: 8 }, (_, i) => i);

export default function Hero({ onComplete }: { onComplete: () => void }) {
  const [landed, setLanded] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="max-w-2xl font-hand text-2xl leading-snug text-rose sm:text-4xl"
      >
        “Tui phi từ Nam ra Bắc, tui mang tình yêu từ Sài Gòn đến mèo đây
        hayyaaaaaa~” 🐷💨
      </motion.p>

      {/* Real Vietnam map + flight animation */}
      <div className="relative mt-4 origin-top scale-[0.82] sm:scale-100" style={{ width: STAGE, height: STAGE }}>
        <svg viewBox="0 0 1024 1024" width={STAGE} height={STAGE} style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="vnland" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#241a26" />
              <stop offset="100%" stopColor="#0d0810" />
            </linearGradient>
          </defs>

          {/* the actual country silhouette */}
          <g transform="translate(0,1024) scale(0.1,-0.1)">
            <path d={VIETNAM_PATH} fill="url(#vnland)" stroke="#5fb2d6" strokeWidth="18" strokeOpacity="0.5" />
          </g>

          {/* dashed flight trail that draws itself */}
          <motion.path
            d={PATH_VB}
            fill="none"
            stroke="#e18aa0"
            strokeWidth="4"
            strokeDasharray="4 16"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.95 }}
            transition={{ delay: 1, duration: 4.2, ease: "easeInOut" }}
          />

          {/* Sài Gòn marker */}
          <circle cx={SGN[0]} cy={SGN[1]} r="10" fill="#e7b96a" />
          <circle cx={SGN[0]} cy={SGN[1]} r="10" fill="none" stroke="#e7b96a" strokeWidth="3">
            <animate attributeName="r" from="10" to="34" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={SGN[0] + 22} y={SGN[1] + 6} fill="#e7b96a" fontSize="30" fontFamily="Instrument Sans" fontWeight="600">
            Sài Gòn
          </text>

          {/* Hà Nội marker */}
          <circle cx={HAN[0]} cy={HAN[1]} r="10" fill="#5fb2d6" />
          {landed && (
            <circle cx={HAN[0]} cy={HAN[1]} r="10" fill="none" stroke="#5fb2d6" strokeWidth="3">
              <animate attributeName="r" from="10" to="38" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.9" to="0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}
          <text x={HAN[0] - 250} y={HAN[1] + 6} fill="#5fb2d6" fontSize="30" fontFamily="Instrument Sans" fontWeight="600">
            Hà Nội 🐱
          </text>
        </svg>

        {/* flying pig riding the exact route */}
        <motion.div
          className="absolute left-0 top-0 text-4xl"
          style={{ offsetPath: `path('${PATH_PX}')`, offsetRotate: "0deg", offsetDistance: "0%" } as React.CSSProperties}
          initial={{ offsetDistance: "0%", scale: 0.4, opacity: 0 } as any}
          animate={{ offsetDistance: "100%", scale: 1, opacity: 1 } as any}
          transition={{
            offsetDistance: { delay: 1, duration: 4.2, ease: "easeInOut" },
            scale: { delay: 1, duration: 0.6 },
            opacity: { delay: 1, duration: 0.4 },
          }}
          onAnimationComplete={() => setLanded(true)}
        >
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block drop-shadow-[0_0_12px_rgba(225,138,160,0.8)]"
          >
            🐷✈️
          </motion.span>
        </motion.div>

        {/* burst of hearts on arrival at Hà Nội */}
        {landed &&
          HEARTS.map((i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{ left: HAN[0] * S, top: HAN[1] * S }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
              animate={{ x: (Math.random() - 0.5) * 140, y: -40 - Math.random() * 90, opacity: 0, scale: 1.2 }}
              transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
            >
              {i % 2 ? "💗" : "🤍"}
            </motion.span>
          ))}
      </div>

      {/* birthday reveal after the pig lands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={landed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1 }}
        className="mt-2 flex flex-col items-center"
      >
        <h1 className="font-display text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl">
          Chúc mừng <span className="text-shimmer italic">sinh nhật</span>
        </h1>
        <div className="mt-6 flex items-center gap-4 font-body text-sm uppercase tracking-[0.4em] text-cream-dim">
          <span className="h-px w-10 bg-gold/50" />
          10 · 11 · 2003
          <span className="h-px w-10 bg-gold/50" />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="group mt-10 flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-8 py-4 font-body text-sm uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold/15"
        >
          Bắt đầu hành trình
          <span className="transition-transform group-hover:translate-y-1">↓</span>
        </motion.button>
      </motion.div>
    </section>
  );
}
