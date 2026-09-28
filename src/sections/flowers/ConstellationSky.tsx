import { useId, type CSSProperties } from "react";

// Decorative interpretations of the two signs, not a navigational star chart.
const CONSTELLATIONS: readonly {
  id: string; name: string; symbol: string;
  stars: readonly (readonly [number, number])[];
  lines: readonly (readonly [number, number])[];
}[] = [
  {
    id: "gemini", name: "Song Tử", symbol: "♊\uFE0E",
    stars: [[55, 22], [112, 16], [62, 57], [117, 51], [48, 88], [111, 86], [30, 119], [69, 121], [94, 120], [136, 112]],
    lines: [[0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 6], [4, 7], [5, 8], [5, 9]],
  },
  {
    id: "libra", name: "Thiên Bình", symbol: "♎\uFE0E",
    stars: [[90, 19], [41, 55], [140, 52], [90, 73], [29, 106], [63, 116], [124, 113], [157, 101]],
    lines: [[0, 1], [0, 2], [1, 3], [3, 2], [1, 4], [1, 5], [4, 5], [2, 6], [2, 7], [6, 7]],
  },
] as const;

const SKY_STARS = [
  [8, 20, 1.2], [18, 61, 1], [25, 10, 1.1], [33, 37, 0.8],
  [40, 76, 1.2], [48, 48, 0.8], [56, 90, 1], [62, 17, 1.2],
  [70, 49, 0.8], [77, 10, 0.9], [86, 34, 1.1], [94, 73, 0.8],
  [4, 90, 0.7], [55, 65, 0.8], [90, 7, 0.7],
] as const;

export default function ConstellationSky({ isRunning }: { isRunning: boolean }) {
  const id = useId();

  return (
    <div className="flower-atmosphere constellation-sky" data-running={isRunning} aria-hidden="true">
      <div className="constellation-sky__stars">
        {SKY_STARS.map(([x, y, size], index) => (
          <i key={index} className="constellation-sky__spark" style={{
            left: `${x}%`, top: `${y}%`, width: size * 1.6, height: size * 1.6,
            "--star-delay": `${index * -0.7}s`, "--star-duration": `${4 + index % 5}s`,
          } as CSSProperties} />
        ))}
      </div>

      <div className="constellation-sky__moon">
        <svg viewBox="0 0 120 120" fill="none" focusable="false">
          <defs>
            <radialGradient id={`${id}-moon-light`} cx="30%" cy="65%" r="80%">
              <stop stopColor="#fff9e6" />
              <stop offset="0.65" stopColor="#e4e9dd" />
              <stop offset="1" stopColor="#9eb8b5" />
            </radialGradient>
            <mask id={`${id}-crescent`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
              <circle cx="60" cy="60" r="32" fill="white" />
              <circle cx="74" cy="49" r="30" fill="black" />
            </mask>
          </defs>
          <g mask={`url(#${id}-crescent)`}>
            <circle cx="60" cy="60" r="32" fill={`url(#${id}-moon-light)`} />
            <circle cx="45" cy="69" r="4.5" fill="#889d96" opacity="0.14" />
            <circle cx="53" cy="84" r="2.5" fill="#889d96" opacity="0.18" />
            <circle cx="33" cy="57" r="2" fill="#fffbed" opacity="0.7" />
          </g>
        </svg>
      </div>

      {CONSTELLATIONS.map((constellation) => (
        <div key={constellation.id} className={`constellation-sky__sign constellation-sky__sign--${constellation.id}`}>
          <svg viewBox="0 0 180 140" fill="none" focusable="false">
            <g className="constellation-sky__lines">
              {constellation.lines.map(([from, to], index) => (
                <line key={index}
                  x1={constellation.stars[from][0]} y1={constellation.stars[from][1]}
                  x2={constellation.stars[to][0]} y2={constellation.stars[to][1]}
                />
              ))}
            </g>
            {constellation.stars.map(([x, y], index) => (
              <g key={index} className="constellation-sky__star" style={{
                "--star-delay": `${index * -1.1}s`, "--star-duration": `${5 + index % 4}s`,
              } as CSSProperties}>
                <circle cx={x} cy={y} r={index < 2 ? 7 : 4} fill="currentColor" opacity="0.09" />
                <circle cx={x} cy={y} r={index < 2 ? 2.3 : 1.5} fill="currentColor" />
                {index < 2 && <path d={`M${x - 4},${y}h8 M${x},${y - 4}v8`} stroke="currentColor" strokeWidth="0.55" opacity="0.6" />}
              </g>
            ))}
          </svg>
          <span className="constellation-sky__label"><b>{constellation.symbol}</b>{constellation.name}</span>
        </div>
      ))}
    </div>
  );
}
