import { useEffect, useState, type CSSProperties } from "react";
import "./FlowerAtmosphere.css";

/* ── Crescent Moon + Constellation overlay ── */
function ConstellationSky({ isRunning }: { isRunning: boolean }) {
  return (
    <div
      aria-hidden
      className="flower-atmosphere"
      style={{ inset: 0, zIndex: 2, pointerEvents: "none" }}
      data-running={isRunning}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        fill="none"
      >
        <defs>
          {/* Moon glow filter */}
          <filter id="moon-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Star glow */}
          <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Constellation line glow */}
          <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft haze around moon */}
          <radialGradient id="moon-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4e8ff" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#b8d4f0" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#a0c0e8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── CRESCENT MOON — upper-left sky ── */}
        <g transform="translate(148, 108)" style={{ animation: isRunning ? "moon-float 9s ease-in-out infinite" : "none" }}>
          {/* Haze halo */}
          <circle cx="0" cy="0" r="54" fill="url(#moon-haze)" />
          {/* Moon body */}
          <circle cx="0" cy="0" r="28" fill="#e8f0fa" opacity="0.92" filter="url(#moon-glow)" />
          {/* Crescent cut-out */}
          <circle cx="12" cy="-6" r="23" fill="#0a0208" />
          {/* Moon surface sheen */}
          <circle cx="-6" cy="-4" r="28" fill="none" stroke="#d0e4ff" strokeWidth="0.6" opacity="0.35" />
          {/* Tiny craters */}
          <circle cx="-14" cy="8" r="2.5" fill="none" stroke="#c8daf0" strokeWidth="0.5" opacity="0.3" />
          <circle cx="-8" cy="16" r="1.5" fill="none" stroke="#c8daf0" strokeWidth="0.4" opacity="0.25" />
          <circle cx="-20" cy="2" r="1.8" fill="none" stroke="#c8daf0" strokeWidth="0.4" opacity="0.20" />
        </g>

        {/* ── THIÊN BÌNH ♎ (LIBRA) — upper-right area ── */}
        {/* Libra: the Scales. Stars: Alpha (α), Beta (β), Gamma (γ), Sigma (σ), Upsilon (υ) */}
        <g opacity="0.85" filter="url(#line-glow)">
          {/* Constellation lines */}
          {/* beam of scale: γ to α */}
          <line x1="1088" y1="148" x2="1178" y2="172" stroke="#d4c8f0" strokeWidth="0.8" opacity="0.5" />
          {/* α to β (right arm) */}
          <line x1="1178" y1="172" x2="1248" y2="148" stroke="#d4c8f0" strokeWidth="0.8" opacity="0.5" />
          {/* α down to σ (pivot) */}
          <line x1="1178" y1="172" x2="1168" y2="228" stroke="#d4c8f0" strokeWidth="0.8" opacity="0.5" />
          {/* σ to υ (base) */}
          <line x1="1168" y1="228" x2="1108" y2="248" stroke="#d4c8f0" strokeWidth="0.8" opacity="0.45" />
          {/* left pan: γ down */}
          <line x1="1088" y1="148" x2="1078" y2="208" stroke="#d4c8f0" strokeWidth="0.7" opacity="0.4" />
          {/* right pan: β down */}
          <line x1="1248" y1="148" x2="1258" y2="210" stroke="#d4c8f0" strokeWidth="0.7" opacity="0.4" />
        </g>
        {/* Stars */}
        <g filter="url(#star-glow)">
          {/* Alpha Librae — brightest */}
          <circle cx="1178" cy="172" r="3.2" fill="#e8e0ff" opacity="0.95" />
          <circle cx="1178" cy="172" r="5.5" fill="#c8b8ff" opacity="0.18" />
          {/* Beta Librae */}
          <circle cx="1248" cy="148" r="2.8" fill="#d8f0e8" opacity="0.90" />
          <circle cx="1248" cy="148" r="4.5" fill="#a8e0c8" opacity="0.15" />
          {/* Gamma Librae */}
          <circle cx="1088" cy="148" r="2.2" fill="#ffe8c8" opacity="0.85" />
          <circle cx="1088" cy="148" r="3.8" fill="#ffd090" opacity="0.12" />
          {/* Sigma Librae */}
          <circle cx="1168" cy="228" r="2.0" fill="#e8e0ff" opacity="0.80" />
          {/* Upsilon Librae */}
          <circle cx="1108" cy="248" r="1.6" fill="#e0d8f8" opacity="0.70" />
          {/* Left pan */}
          <circle cx="1078" cy="208" r="1.8" fill="#e8e0ff" opacity="0.75" />
          {/* Right pan */}
          <circle cx="1258" cy="210" r="1.8" fill="#e8e0ff" opacity="0.75" />
        </g>
        {/* Label ♎ */}
        <text x="1154" y="290" fontFamily="serif" fontSize="13" fill="#c8b8ff" opacity="0.65" textAnchor="middle" letterSpacing="2">
          ♎ THIÊN BÌNH
        </text>

        {/* ── SONG TỬ ♊ (GEMINI) — mid-left sky ── */}
        {/* Gemini: Castor & Pollux are the twins. */}
        <g opacity="0.82" filter="url(#line-glow)">
          {/* Pollux head down to body */}
          <line x1="318" y1="78" x2="308" y2="148" stroke="#f0d8c8" strokeWidth="0.8" opacity="0.48" />
          {/* Castor head down to body */}
          <line x1="368" y1="68" x2="358" y2="138" stroke="#f0d8c8" strokeWidth="0.8" opacity="0.48" />
          {/* Shoulder line connecting twins */}
          <line x1="308" y1="148" x2="358" y2="138" stroke="#f0d8c8" strokeWidth="0.75" opacity="0.42" />
          {/* Body down — Pollux side */}
          <line x1="308" y1="148" x2="298" y2="208" stroke="#f0d8c8" strokeWidth="0.7" opacity="0.38" />
          {/* Body down — Castor side */}
          <line x1="358" y1="138" x2="348" y2="198" stroke="#f0d8c8" strokeWidth="0.7" opacity="0.38" />
          {/* Feet — Pollux */}
          <line x1="298" y1="208" x2="282" y2="248" stroke="#f0d8c8" strokeWidth="0.65" opacity="0.32" />
          <line x1="298" y1="208" x2="312" y2="252" stroke="#f0d8c8" strokeWidth="0.65" opacity="0.32" />
          {/* Feet — Castor */}
          <line x1="348" y1="198" x2="334" y2="242" stroke="#f0d8c8" strokeWidth="0.65" opacity="0.32" />
          <line x1="348" y1="198" x2="362" y2="244" stroke="#f0d8c8" strokeWidth="0.65" opacity="0.32" />
        </g>
        {/* Stars */}
        <g filter="url(#star-glow)">
          {/* Pollux — brightest, slightly orange */}
          <circle cx="318" cy="78" r="3.5" fill="#ffe4c0" opacity="0.96" />
          <circle cx="318" cy="78" r="6" fill="#ffd090" opacity="0.20" />
          {/* Castor */}
          <circle cx="368" cy="68" r="3.0" fill="#e8f0ff" opacity="0.90" />
          <circle cx="368" cy="68" r="5" fill="#c8d8ff" opacity="0.15" />
          {/* Body stars */}
          <circle cx="308" cy="148" r="2.2" fill="#f0e8d8" opacity="0.82" />
          <circle cx="358" cy="138" r="2.0" fill="#f0e8d8" opacity="0.80" />
          <circle cx="298" cy="208" r="1.8" fill="#e8e0f0" opacity="0.75" />
          <circle cx="348" cy="198" r="1.8" fill="#e8e0f0" opacity="0.75" />
          {/* Feet */}
          <circle cx="282" cy="248" r="1.5" fill="#e8e0f0" opacity="0.65" />
          <circle cx="312" cy="252" r="1.4" fill="#e8e0f0" opacity="0.60" />
          <circle cx="334" cy="242" r="1.5" fill="#e8e0f0" opacity="0.65" />
          <circle cx="362" cy="244" r="1.4" fill="#e8e0f0" opacity="0.60" />
        </g>
        {/* Label ♊ */}
        <text x="328" y="290" fontFamily="serif" fontSize="13" fill="#f0d8b8" opacity="0.62" textAnchor="middle" letterSpacing="2">
          ♊ SONG TỬ
        </text>

        {/* ── Extra twinkling background stars ── */}
        {[
          [520, 52, 1.2], [680, 38, 0.9], [820, 88, 1.1], [960, 44, 1.0],
          [200, 62, 0.8], [450, 92, 1.3], [750, 56, 0.9], [1050, 96, 1.1],
          [1320, 72, 0.8], [100, 32, 0.7], [1380, 48, 1.0], [600, 120, 0.8],
          [880, 110, 0.9], [1200, 118, 0.7], [420, 28, 0.8],
        ].map(([cx, cy, r], i) => (
          <circle key={i}
            cx={cx} cy={cy} r={r as number}
            fill="#e8f0ff" opacity={0.35 + (i % 3) * 0.1}
            style={{ animation: isRunning ? `star-twinkle ${4 + (i % 5)}s ease-in-out ${-(i * 0.7)}s infinite` : "none" }}
          />
        ))}
      </svg>
    </div>
  );
}

// Fixed, sparse positions stay stable through the bloom's text-stage updates.
const FIREFLIES = [
  { depth: "far", x: 36, y: 10, size: 1.8, driftX: 9, driftY: -10, duration: 27, pulse: 8.7, delay: -3.2 },
  { depth: "far", x: 63, y: 23, size: 2, driftX: -12, driftY: 8, duration: 31, pulse: 10.1, delay: -9.4 },
  { depth: "far", x: 82, y: 59, size: 1.6, driftX: 8, driftY: -12, duration: 29, pulse: 7.9, delay: -5.7 },
  { depth: "mid", x: 24, y: 36, size: 4.5, driftX: -18, driftY: -19, duration: 23, pulse: 7.3, delay: -13.1 },
  { depth: "mid", x: 49, y: 20, size: 3.5, driftX: 16, driftY: 13, duration: 26, pulse: 9.2, delay: -6.3 },
  { depth: "mid", x: 76, y: 40, size: 4, driftX: -15, driftY: -11, duration: 20, pulse: 6.1, delay: -11.8 },
  { depth: "mid", x: 12, y: 77, size: 3.2, driftX: 18, driftY: -14, duration: 32, pulse: 8.3, delay: -18.6 },
  { depth: "mid", x: 4, y: 50, size: 3.6, driftX: 12, driftY: -16, duration: 28, pulse: 6.8, delay: -2.6 },
  { depth: "mid", x: 28, y: 62, size: 4.2, driftX: -14, driftY: 11, duration: 35, pulse: 10.6, delay: -15.3 },
  { depth: "mid", x: 56, y: 6, size: 3.4, driftX: 17, driftY: 9, duration: 30, pulse: 8.1, delay: -21.7 },
  { depth: "mid", x: 64, y: 78, size: 4.6, driftX: -11, driftY: -17, duration: 24, pulse: 7.6, delay: -8.9 },
  { depth: "mid", x: 92, y: 22, size: 3.8, driftX: -16, driftY: 12, duration: 33, pulse: 9.9, delay: -12.4 },
  { depth: "near", x: 38, y: 93, size: 7, driftX: -20, driftY: 13, duration: 34, pulse: 11.7, delay: -17.4 },
  { depth: "near", x: 91, y: 56, size: 6, driftX: 14, driftY: -18, duration: 25, pulse: 9.7, delay: -4.2 },
] as const;

const PETALS = [
  { depth: "far", x: 24, y: 0, size: 10, duration: 43, delay: -5, drift: -27, rotation: 32, blur: 0.15, ivory: true },
  { depth: "far", x: 67, y: 8, size: 12, duration: 38, delay: -24, drift: 24, rotation: -38, blur: 0.2, ivory: false },
  { depth: "mid", x: 8, y: 6, size: 28, duration: 33, delay: -12, drift: 55, rotation: -24, blur: 0.4, ivory: false },
  { depth: "mid", x: 71, y: 0, size: 24, duration: 39, delay: -3, drift: -48, rotation: 14, blur: 0.5, ivory: true },
  { depth: "near", x: 108, y: 5, size: 68, duration: 36, delay: -10, drift: -190, rotation: -16, blur: 3, ivory: false },
  { depth: "near", x: 42, y: 48, size: 52, duration: 41, delay: -18, drift: 95, rotation: 26, blur: 2.5, ivory: false },
] as const;

export default function FlowerAtmosphere({ isActive }: { isActive: boolean }) {
  const [isVisible, setIsVisible] = useState(() => typeof document === "undefined" || !document.hidden);

  useEffect(() => {
    const update = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // No per-frame JS work; pause CSS loops off-chapter and in background tabs.
  const isRunning = isActive && isVisible;

  return (
    <>
      <div className="flower-atmosphere flower-atmosphere__warm-glow" aria-hidden="true" />
      <div className="flower-atmosphere flower-atmosphere__warm-glow flower-atmosphere__warm-glow--secondary" aria-hidden="true" />
      <div className="flower-atmosphere flower-atmosphere__mist flower-atmosphere__mist--low" data-running={isRunning} aria-hidden="true" />
      <div className="flower-atmosphere flower-atmosphere__mist flower-atmosphere__mist--high" data-running={isRunning} aria-hidden="true" />
      <div className="flower-atmosphere flower-atmosphere__fireflies" data-running={isRunning} aria-hidden="true">
        {FIREFLIES.map((fly, index) => (
          <span key={index} className="flower-atmosphere__firefly" data-depth={fly.depth} style={{
            left: `${fly.x}%`, top: `${fly.y}%`,
            "--fly-size": `${fly.size}px`, "--drift-x": `${fly.driftX}px`, "--drift-y": `${fly.driftY}px`,
            "--duration": `${fly.duration}s`, "--pulse": `${fly.pulse}s`, "--delay": `${fly.delay}s`,
          } as CSSProperties} />
        ))}
      </div>
      <div className="flower-atmosphere flower-atmosphere__petals" data-running={isRunning} aria-hidden="true">
        {PETALS.map((petal, index) => (
          <span key={index} className="flower-atmosphere__petal" data-depth={petal.depth} data-ivory={petal.ivory} style={{
            left: `${petal.x}%`, top: `${petal.y}%`, width: petal.size, height: petal.size * 0.55,
            "--duration": `${petal.duration}s`, "--delay": `${petal.delay}s`,
            "--drift-x": `${petal.drift}px`, "--rotation": `${petal.rotation}deg`,
            filter: `blur(${petal.blur}px)`,
          } as CSSProperties} />
        ))}
      </div>
    </>
  );
}
