import { useMemo } from "react";

const PETAL_COLORS = ["#e18aa0", "#a63c56", "#e7b96a", "#f4ece4"];

type PetalProps = { count?: number };

// Ambient falling petals — a soft, continuous romantic background with stable deterministic properties.
export default function Petals({ count = 18 }: PetalProps) {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic PRNG seeded by index so positions stay stable across re-renders
      const pseudoRandom = (offset: number) => {
        const x = Math.sin(i * 997 + offset * 37) * 10000;
        return x - Math.floor(x);
      };

      const left = pseudoRandom(1) * 100;
      const size = 8 + pseudoRandom(2) * 14;
      const duration = 9 + pseudoRandom(3) * 11;
      const delay = -pseudoRandom(4) * 20;
      const drift = `${(pseudoRandom(5) - 0.5) * 220}px`;
      const color = PETAL_COLORS[i % PETAL_COLORS.length];
      const opacity = 0.35 + pseudoRandom(6) * 0.4;

      return { left, size, duration, delay, drift, color, opacity, i };
    });
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <div
          key={p.i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            // @ts-expect-error custom property consumed by fall keyframe
            "--drift": p.drift,
            animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          <div
            style={{
              width: p.size,
              height: p.size * 1.3,
              background: p.color,
              opacity: p.opacity,
              borderRadius: "100% 0 100% 0",
              filter: "blur(0.3px)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
