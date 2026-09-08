// Stable deterministic drifting petals (4 subtle particles)
const STABLE_PETALS = [
  { i: 0, left: 22, dur: 23, delay: -4, size: 14, drift: -40, rot: 15 },
  { i: 1, left: 45, dur: 19, delay: -11, size: 11, drift: 55, rot: -25 },
  { i: 2, left: 68, dur: 26, delay: -2, size: 16, drift: -25, rot: 40 },
  { i: 3, left: 84, dur: 21, delay: -14, size: 12, drift: 35, rot: -15 },
];

export default function FloatingPetals() {
  return (
    <>
      <svg className="hidden" aria-hidden="true">
        <defs>
          <linearGradient id="petalGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#f472b6" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
      {STABLE_PETALS.map((p) => (
        <div
          key={p.i}
          aria-hidden
          className="pointer-events-none absolute top-0 z-[5]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: Math.round(p.size * 1.5),
            animation: `fall ${p.dur}s linear ${p.delay}s infinite`,
            // @ts-expect-error custom prop consumed by the fall keyframe
            "--drift": `${p.drift}px`,
          }}
        >
          <svg
            viewBox="0 0 24 36"
            className="h-full w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            style={{ transform: `rotate(${p.rot}deg)` }}
          >
            <path
              d="M12 0C6 11 1 18 3 27C5 35 19 35 21 27C23 18 18 11 12 0Z"
              fill="url(#petalGrad)"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
