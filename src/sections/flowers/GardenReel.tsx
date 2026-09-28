import { useId } from "react";

/** A real cut-out reel silhouette: only its outer crescent peeks past the film. */
export default function GardenReel({ running }: { running: boolean }) {
  const id = useId().replace(/:/g, "");
  return <div className="garden-reel" data-running={running} aria-hidden="true">
    <svg className="garden-reel__rotor" viewBox="0 0 240 240">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#dccdb1" /><stop offset=".28" stopColor="#71695a" />
          <stop offset=".52" stopColor="#b5a88d" /><stop offset=".76" stopColor="#4a483d" /><stop offset="1" stopColor="#b7a687" />
        </linearGradient>
        <mask id={`${id}-holes`}>
          <circle cx="120" cy="120" r="116" fill="white" />
          {[0, 60, 120, 180, 240, 300].map(angle => <ellipse key={angle} cx="186" cy="120" rx="25" ry="31" fill="black" transform={`rotate(${angle} 120 120)`} />)}
          <circle cx="120" cy="120" r="12" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${id}-holes)`}>
        <circle cx="120" cy="120" r="116" fill={`url(#${id}-metal)`} stroke="#cbbc9c" strokeWidth="2" />
        {[111, 107, 102, 44, 39, 17].map(radius => <circle key={radius} cx="120" cy="120" r={radius} fill="none" stroke="#292d26" strokeWidth="1" opacity=".65" />)}
        <circle cx="120" cy="120" r="33" fill="#713e39" stroke="#debc83" strokeWidth="1.5" />
        <circle cx="120" cy="120" r="17" fill="#a68a62" />
      </g>
    </svg>
  </div>;
}
