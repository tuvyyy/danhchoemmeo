const PETAL_COLORS = ["#e18aa0", "#a63c56", "#e7b96a", "#f4ece4"];

type PetalProps = { count?: number };

// Ambient falling petals — a soft, continuous romantic background.
export default function Petals({ count = 18 }: PetalProps) {
  const petals = Array.from({ length: count }, (_, i) => {
    const left = Math.random() * 100;
    const size = 8 + Math.random() * 14;
    const duration = 9 + Math.random() * 11;
    const delay = -Math.random() * 20;
    const drift = `${(Math.random() - 0.5) * 220}px`;
    const color = PETAL_COLORS[i % PETAL_COLORS.length];
    const opacity = 0.35 + Math.random() * 0.4;
    return { left, size, duration, delay, drift, color, opacity, i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <div
          key={p.i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            // @ts-expect-error custom property
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
