import type { CSSProperties } from "react";

const FALLS = [
  [4, 30, 19, -2, 46], [11, 20, 23, -13, -28], [18, 34, 21, -7, 38],
  [25, 24, 17, -11, -46], [33, 19, 25, -3, 32], [39, 29, 20, -16, -35],
  [46, 22, 22, -9, 44], [53, 35, 24, -19, -26], [61, 20, 18, -4, 38],
  [68, 30, 21, -14, -40], [75, 23, 26, -8, 25], [82, 33, 19, -16, -48],
  [90, 22, 23, -6, 29], [96, 29, 22, -18, -36], [15, 21, 18, -15, 40],
  [86, 26, 24, -1, -32],
] as const;

export default function EnvelopePetals() {
  return <div className="envelope-petals envelope-petals--back" aria-hidden="true">
    {FALLS.map(([x, size, duration, delay, drift], i) => <span className="envelope-petal" key={i}
      data-blossom={i % 3 === 0} style={{
        "--petal-x": `${x}%`, "--petal-size": `${size}px`, "--petal-duration": `${duration}s`,
        "--petal-delay": `${delay}s`, "--petal-drift": `${drift}px`,
        "--petal-turn": `${i % 2 ? -240 : 280}deg`, "--petal-color": i % 4 === 0 ? "#ead4b3" : i % 2 ? "#c58193" : "#dfadb1",
      } as CSSProperties}>
      <svg viewBox="0 0 40 40" fill="currentColor">
        {i % 3 === 0 ? <>
          {[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cx="20" cy="11" rx="7" ry="10" transform={`rotate(${angle} 20 20)`} />)}
          <circle cx="20" cy="20" r="4" fill="#c6a368" />
          <circle cx="19" cy="19" r="1.5" fill="#f5e3ad" />
        </> : <>
          <path d="M7 31C1 13 14 3 33 6c4 17-8 32-26 25Z" />
          <path d="M9 29c7-7 12-13 20-19" fill="none" stroke="#fbe1d9" strokeOpacity=".45" strokeWidth="1" />
        </>}
      </svg>
    </span>)}
  </div>;
}
