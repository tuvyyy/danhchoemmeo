import { useEffect, useState, type CSSProperties } from "react";
import "./FlowerAtmosphere.css";

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
