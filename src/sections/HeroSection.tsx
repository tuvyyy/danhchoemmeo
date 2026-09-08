import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VIETNAM_PATH } from "@/data/vietnamMapPath";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { preloadFlowerAssets } from "@/lib/assets/preloadFlowers";

// Extended Vietnam silhouette viewBox accommodating Hoàng Sa and Trường Sa archipelagos
const VB_X = 220;
const VB_Y = -15;
const VB_W = 660;
const VB_H = 1060;

// Refined, centered Stage dimensions (340px x 546px)
const STAGE_W = 340;
const SCALE = STAGE_W / VB_W; // ~0.51515
const STAGE_H = Math.round(VB_H * SCALE); // ~546px

// Landmark coordinates in 1024x1024 space
const SGN: [number, number] = [565, 810];
const HAN: [number, number] = [420, 235];

// Projected CSS pixel coordinates within STAGE_W x STAGE_H
const SGN_PX = {
  x: Math.round((SGN[0] - VB_X) * SCALE), // ~178
  y: Math.round((SGN[1] - VB_Y) * SCALE), // ~425
};
const HAN_PX = {
  x: Math.round((HAN[0] - VB_X) * SCALE), // ~103
  y: Math.round((HAN[1] - VB_Y) * SCALE), // ~129
};

// 100% Verified Inland Flight Path (S-curve traversing inland Vietnam)
const PATH_SVG =
  "M 565,810 C 615,700 580,520 480,400 C 435,340 425,280 420,235";

// CSS offset-path in container pixel space for the flying companion
const kX = (x: number) => ((x - VB_X) * SCALE).toFixed(1);
const kY = (y: number) => ((y - VB_Y) * SCALE).toFixed(1);
const PATH_PX = `M ${kX(565)},${kY(810)} C ${kX(615)},${kY(700)} ${kX(580)},${kY(520)} ${kX(480)},${kY(400)} C ${kX(435)},${kY(340)} ${kX(425)},${kY(280)} ${kX(420)},${kY(235)}`;

// Celebration sparkle burst upon arrival at Hà Nội
const ARRIVAL_BURST = [
  { id: 0, x: -26, y: -30, delay: 0, icon: "✨" },
  { id: 1, x: 24, y: -34, delay: 0.1, icon: "💖" },
  { id: 2, x: -30, y: -14, delay: 0.2, icon: "🌸" },
  { id: 3, x: 26, y: -18, delay: 0.3, icon: "✨" },
  { id: 4, x: -14, y: -45, delay: 0.15, icon: "🤍" },
  { id: 5, x: 18, y: -48, delay: 0.25, icon: "💗" },
];

export default function HeroSection({ onComplete }: { onComplete: () => void }) {
  const [landed, setLanded] = useState(false);
  const { hero } = BIRTHDAY_DATA;

  useEffect(() => {
    preloadFlowerAssets();
  }, []);

  return (
    <section
      className="relative flex min-h-screen min-h-[100svh] w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 text-center transition-colors duration-700"
      style={{
        background:
          "radial-gradient(130% 110% at 50% 30%, #180829 0%, #0d0417 55%, #05010a 100%)",
      }}
    >
      {/* ── Soft celestial background ambient glow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(235,120,160,0.12) 0%, rgba(231,185,106,0.06) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Main Unified Balanced Container ── */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        {/* ── 1. HEADER SECTION (Always visible from start) ── */}
        <div className="flex flex-col items-center">
          {/* Subtle Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2.5 sm:gap-3 font-body text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-gold/85 mb-2.5 sm:mb-3"
          >
            <span className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-gold/75" />
            <span>10 · 11 · 2003 · DÀNH CHO EM MÈO</span>
            <span className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-gold/75" />
          </motion.div>

          {/* Majestic Serif Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-light leading-[1.08] tracking-tight text-[#fff9f2]"
          >
            {hero.headingPrefix}{" "}
            <span className="font-display italic font-medium bg-gradient-to-r from-[#ffe5b8] via-[#e7b96a] to-[#f48fb1] bg-clip-text text-transparent">
              {hero.headingHighlight} em yêu
            </span>
          </motion.h1>

          {/* Sweet Handwritten Quote */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="font-hand text-xl sm:text-2xl md:text-[27px] leading-relaxed text-[#fcd5e0] mt-1.5 sm:mt-2 max-w-2xl px-2"
          >
            “Tui phi từ Nam ra Bắc, mang tình yêu từ Sài Gòn đến mèo đây~”
          </motion.p>
        </div>

        {/* ── 2. CENTERPIECE: Vietnam Map with Hoàng Sa & Trường Sa ── */}
        <div className="hero-map-wrapper my-2 sm:my-3">
          <div
            className="hero-map-stage relative"
            style={{ width: STAGE_W, height: STAGE_H }}
          >
            <svg
              viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
              width={STAGE_W}
              height={STAGE_H}
            >
              <defs>
                {/* Velvet land gradient */}
                <linearGradient id="vnLand" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#32142e" />
                  <stop offset="50%" stopColor="#220c22" />
                  <stop offset="100%" stopColor="#120512" />
                </linearGradient>

                {/* Flight path gradient */}
                <linearGradient id="flightGrad" x1="1" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#e7b96a" />
                  <stop offset="50%" stopColor="#f48fb1" />
                  <stop offset="100%" stopColor="#ff4081" />
                </linearGradient>

                {/* Gentle gold shoreline glow */}
                <filter id="coastGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Biển Đông Việt Nam Watermark */}
              <text
                x="705"
                y="620"
                textAnchor="middle"
                fill="#e7b96a"
                fontSize="12.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="600"
                letterSpacing="3.5"
                opacity="0.2"
              >
                BIỂN ĐÔNG VIỆT NAM
              </text>

              {/* Vietnam mainland silhouette */}
              <g transform="translate(0,1024) scale(0.1,-0.1)">
                <path
                  d={VIETNAM_PATH}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="12"
                  strokeOpacity="0.85"
                />
              </g>

              {/* ── Đảo Phú Quốc & Côn Đảo ── */}
              <g id="phuQuocConDao">
                {/* Phú Quốc */}
                <ellipse
                  cx={292}
                  cy={935}
                  rx={9}
                  ry={17}
                  transform="rotate(18 292 935)"
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.8"
                />
                {/* Côn Đảo */}
                <circle
                  cx={595}
                  cy={955}
                  r={5}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.8"
                />
              </g>

              {/* ── Quần đảo Hoàng Sa ── */}
              <g id="hoangSaArchipelago">
                {/* Territory aura ring */}
                <ellipse
                  cx={746}
                  cy={456}
                  rx={32}
                  ry={26}
                  fill="none"
                  stroke="#e7b96a"
                  strokeWidth="0.9"
                  strokeDasharray="3 4"
                  opacity="0.35"
                />
                {/* Islet cluster */}
                <ellipse
                  cx={755}
                  cy={446}
                  rx={5.5}
                  ry={3.8}
                  transform="rotate(-20 755 446)"
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.6"
                  filter="url(#coastGlow)"
                />
                <circle
                  cx={746}
                  cy={438}
                  r={3.2}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={766}
                  cy={453}
                  rx={4.2}
                  ry={2.8}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <circle
                  cx={736}
                  cy={456}
                  r={3.8}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <circle
                  cx={744}
                  cy={464}
                  r={3.2}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={728}
                  cy={472}
                  rx={4}
                  ry={2.6}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                {/* Label: Hoàng Sa */}
                <text
                  x={746}
                  y={422}
                  textAnchor="middle"
                  fill="#f3c875"
                  fontSize="11.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="600"
                  letterSpacing="1.2"
                  opacity="0.88"
                >
                  HOÀNG SA
                </text>
              </g>

              {/* ── Quần đảo Trường Sa ── */}
              <g id="truongSaArchipelago">
                {/* Territory aura ring */}
                <ellipse
                  cx={772}
                  cy={775}
                  rx={45}
                  ry={58}
                  transform="rotate(-22 772 775)"
                  fill="none"
                  stroke="#e7b96a"
                  strokeWidth="0.9"
                  strokeDasharray="3 4"
                  opacity="0.35"
                />
                {/* Islet cluster */}
                <circle
                  cx={786}
                  cy={728}
                  r={4}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.6"
                  filter="url(#coastGlow)"
                />
                <circle
                  cx={798}
                  cy={734}
                  r={3}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={774}
                  cy={748}
                  rx={5}
                  ry={3.5}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <circle
                  cx={784}
                  cy={744}
                  r={3}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={762}
                  cy={766}
                  rx={4.8}
                  ry={3.2}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={736}
                  cy={796}
                  rx={5.5}
                  ry={4}
                  transform="rotate(-25 736 796)"
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.6"
                  filter="url(#coastGlow)"
                />
                <circle
                  cx={758}
                  cy={788}
                  r={3.2}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={766}
                  cy={810}
                  rx={5}
                  ry={2.6}
                  transform="rotate(35 766 810)"
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                <circle
                  cx={746}
                  cy={822}
                  r={3.8}
                  fill="url(#vnLand)"
                  stroke="#e7b96a"
                  strokeWidth="1.5"
                />
                {/* Label: Trường Sa */}
                <text
                  x={775}
                  y={705}
                  textAnchor="middle"
                  fill="#f3c875"
                  fontSize="11.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="600"
                  letterSpacing="1.2"
                  opacity="0.88"
                >
                  TRƯỜNG SA
                </text>
              </g>

              {/* Soft flight trail underglow */}
              <motion.path
                d={PATH_SVG}
                fill="none"
                stroke="#ff4081"
                strokeWidth="8"
                strokeLinecap="round"
                opacity={0.25}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 3.2, ease: "easeInOut" }}
              />

              {/* Animated stardust dashed flight trail */}
              <motion.path
                d={PATH_SVG}
                fill="none"
                stroke="url(#flightGrad)"
                strokeWidth="3"
                strokeDasharray="5 7"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ delay: 0.5, duration: 3.2, ease: "easeInOut" }}
              />

              {/* Sài Gòn beacon */}
              <circle cx={SGN[0]} cy={SGN[1]} r="9" fill="#e7b96a" filter="url(#coastGlow)" />
              <circle cx={SGN[0]} cy={SGN[1]} r="3.5" fill="#ffffff" />
              <circle cx={SGN[0]} cy={SGN[1]} r="9" fill="none" stroke="#e7b96a" strokeWidth="2">
                <animate attributeName="r" from="9" to="28" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
              </circle>

              {/* Hà Nội beacon */}
              <circle cx={HAN[0]} cy={HAN[1]} r="9" fill="#ff4081" filter="url(#coastGlow)" />
              <circle cx={HAN[0]} cy={HAN[1]} r="3.5" fill="#ffffff" />
              {landed && (
                <circle cx={HAN[0]} cy={HAN[1]} r="9" fill="none" stroke="#ff4081" strokeWidth="2">
                  <animate attributeName="r" from="9" to="32" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>

            {/* ── Sài Gòn Label ── */}
            <div
              className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-full border border-gold/40 bg-[#120715]/85 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-gold/90 backdrop-blur-sm"
              style={{
                left: SGN_PX.x + 14,
                top: SGN_PX.y - 12,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span>SÀI GÒN</span>
            </div>

            {/* ── Hà Nội Label ── */}
            <div
              className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-full border border-rose/45 bg-[#120715]/85 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-rose/90 backdrop-blur-sm"
              style={{
                left: HAN_PX.x + 16,
                top: HAN_PX.y - 12,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose" />
              <span>HÀ NỘI 🐱</span>
            </div>

            {/* ── Cute Companion Riding the Inland Path ── */}
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-20"
              style={
                {
                  offsetPath: `path('${PATH_PX}')`,
                  offsetRotate: "0deg",
                  offsetDistance: "0%",
                  offsetAnchor: "center",
                } as React.CSSProperties
              }
              initial={{ offsetDistance: "0%", scale: 0.5, opacity: 0 } as any}
              animate={{ offsetDistance: "100%", scale: 1, opacity: 1 } as any}
              transition={{
                offsetDistance: { delay: 0.5, duration: 3.2, ease: "easeInOut" },
                scale: { delay: 0.5, duration: 0.6 },
                opacity: { delay: 0.5, duration: 0.4 },
              }}
              onAnimationComplete={() => setLanded(true)}
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative text-2xl filter drop-shadow-[0_0_12px_rgba(244,143,177,0.7)]"
                >
                  🐷
                </motion.div>
              </div>
            </motion.div>

            {/* ── Arrival sparkle celebration ── */}
            {landed &&
              ARRIVAL_BURST.map((item) => (
                <motion.span
                  key={item.id}
                  className="pointer-events-none absolute text-base z-30"
                  style={{ left: HAN_PX.x, top: HAN_PX.y }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                  animate={{ x: item.x, y: item.y, opacity: 0, scale: 1.2 }}
                  transition={{ duration: 1.8, delay: item.delay, ease: "easeOut" }}
                >
                  {item.icon}
                </motion.span>
              ))}
          </div>
        </div>

        {/* ── 3. CTA BUTTON & JOURNEY NOTE (Always visible from start) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="flex flex-col items-center gap-3 mt-1 sm:mt-2"
        >
          <p className="font-body text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase text-gold/75 px-4">
            Chuyến bay chở trọn yêu thương · Sài Gòn ➔ Hà Nội
          </p>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(231,185,106,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="group flex items-center gap-3 rounded-full border border-gold/50 bg-gradient-to-r from-gold/20 via-gold/10 to-transparent px-9 sm:px-11 py-3.5 sm:py-4 font-body text-xs sm:text-sm uppercase tracking-[0.24em] text-gold transition-all hover:border-gold hover:bg-gold/25 cursor-pointer shadow-[0_4px_24px_rgba(231,185,106,0.2)]"
          >
            <span>{hero.cta}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
