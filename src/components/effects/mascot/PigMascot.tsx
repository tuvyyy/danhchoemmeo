import { useId } from "react";
import type { MascotAccessory } from "./mascotConfig";

/** Original layered SVG artwork. Motion is applied to individual body parts. */
export default function PigMascot({ accessory }: { accessory: MascotAccessory }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 140" fill="none" aria-hidden="true" className={`pig-art pig-art--${accessory}`}>
      <defs>
        <radialGradient id={`${id}-skin`} cx=".3" cy=".2" r=".9"><stop stopColor="#ffe6d9" /><stop offset=".55" stopColor="#f5b6b5" /><stop offset="1" stopColor="#d77f96" /></radialGradient>
        <linearGradient id={`${id}-snout`} x2="0" y2="1"><stop stopColor="#ffc6c8" /><stop offset="1" stopColor="#e58a9c" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="132" rx="30" ry="4" fill="#140a11" opacity=".28" />
      <g className="pig-body">
        <path d="M87 105c20-13 26 10 13 10-8 0-5-10 1-7" stroke="#dc8b9d" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="60" cy="102" rx="29" ry="28" fill={`url(#${id}-skin)`} />
        <ellipse cx="60" cy="107" rx="18" ry="17" fill="#ffe1cf" opacity=".65" />
        <path d="M39 119v9c0 6 17 6 17 0v-7M66 121v7c0 6 17 6 17 0v-9" fill="#e99faa" />
        <path d="M47 127v5m27-5v5" stroke="#ba6b84" strokeWidth="2" strokeLinecap="round" />
        <g className="pig-wave"><ellipse cx="30" cy="98" rx="9" ry="17" transform="rotate(28 30 98)" fill={`url(#${id}-skin)`} /></g>
        <ellipse cx="88" cy="99" rx="9" ry="17" transform="rotate(-30 88 99)" fill={`url(#${id}-skin)`} />
      </g>
      <g className="pig-head">
        <g className="pig-ear pig-ear--left"><path d="M26 47C9 10 32 10 46 34" fill="#efa5af" /><path d="M28 35c-6-16 0-17 8-3" fill="#c7738f" /></g>
        <g className="pig-ear pig-ear--right"><path d="M74 34c15-26 38-24 20 13" fill="#efa5af" /><path d="M84 32c8-14 14-13 8 3" fill="#c7738f" /></g>
        <ellipse cx="60" cy="59" rx="41" ry="35" fill={`url(#${id}-skin)`} />
        <path d="M38 34c9-6 20-8 30-5" stroke="#fff2e4" strokeWidth="3" opacity=".6" strokeLinecap="round" />
        <g className="pig-gaze">
          <g className="pig-eyes"><ellipse cx="44" cy="55" rx="3.6" ry="5" fill="#48323b" /><ellipse cx="76" cy="55" rx="3.6" ry="5" fill="#48323b" /><circle cx="45" cy="53" r="1.2" fill="white" /><circle cx="77" cy="53" r="1.2" fill="white" /></g>
          <ellipse cx="33" cy="66" rx="7" ry="4" fill="#e786a0" opacity=".55" /><ellipse cx="87" cy="66" rx="7" ry="4" fill="#e786a0" opacity=".55" />
          <ellipse cx="60" cy="69" rx="17" ry="12" fill={`url(#${id}-snout)`} stroke="#d8869a" strokeWidth="1.3" />
          <ellipse cx="54" cy="69" rx="2.4" ry="3.3" fill="#b76885" /><ellipse cx="66" cy="69" rx="2.4" ry="3.3" fill="#b76885" />
          <path d="M53 84q7 6 14 0" stroke="#a75572" strokeWidth="2" strokeLinecap="round" />
        </g>
        {accessory === "pilot" && <g><path d="M22 44q38-20 76 0" stroke="#795347" strokeWidth="6" /><rect x="31" y="28" width="25" height="18" rx="8" fill="#704e46" stroke="#e6bd81" strokeWidth="3" /><rect x="64" y="28" width="25" height="18" rx="8" fill="#704e46" stroke="#e6bd81" strokeWidth="3" /><path d="m37 32 10 9m23-9 10 9M56 36h8" stroke="#fff3cc" strokeWidth="2" opacity=".7" /><path d="m34 88 32 5 21-7-9 14-38-1Z" fill="#ca754f" /></g>}
        {accessory === "party" && <g><path d="m44 30 17-28 20 28q-19 8-37 0" fill="#e7b96a" /><path d="m53 17 18 7M58 9l6 3" stroke="#c06c84" strokeWidth="4" /><circle cx="61" cy="3" r="3" fill="#fff0d3" /></g>}
      </g>
      <g className="pig-accessory">
        {accessory === "flower" && <g><path d="m68 123 4-31" stroke="#688463" strokeWidth="3" /><path d="M71 113c-16 1-16-12-16-12 10 0 15 5 16 12" fill="#8ea679" /><g fill="#f3d0ab" stroke="#d59790" strokeWidth="1"><ellipse cx="72" cy="88" rx="6" ry="10" /><ellipse cx="72" cy="88" rx="6" ry="10" transform="rotate(60 72 88)" /><ellipse cx="72" cy="88" rx="6" ry="10" transform="rotate(120 72 88)" /></g><circle cx="72" cy="88" r="4" fill="#ce984f" /></g>}
        {accessory === "envelope-red" && <g transform="rotate(-8 62 107)"><rect x="43" y="91" width="36" height="34" rx="4" fill="#b34259" stroke="#e5b76c" /><path d="m45 94 16 11 16-11" stroke="#efc986" /><circle cx="61" cy="109" r="8" fill="#e7b96a" /><path d="M61 104v10m-4-7h8m-8 4h8" stroke="#a75b50" strokeWidth="2" /></g>}
        {accessory === "letter" && <g transform="rotate(9 61 108)"><rect x="39" y="94" width="45" height="29" rx="3" fill="#f7e6cc" stroke="#c9a885" /><path d="m40 96 22 17 21-17" stroke="#c9a885" /><path d="M62 105c-7-6-11 3 0 9 11-6 7-15 0-9" fill="#be6b83" /></g>}
        {accessory === "camera" && <g><path d="m42 89-7 17m44-17 7 17" stroke="#645149" strokeWidth="3" /><rect x="37" y="97" width="49" height="28" rx="5" fill="#4d4a49" stroke="#d4bfa5" strokeWidth="2" /><rect x="44" y="92" width="14" height="6" rx="2" fill="#dbc8ac" /><circle cx="62" cy="111" r="10" fill="#b29c87" /><circle cx="62" cy="111" r="7" fill="#293a44" /><path d="m59 107 6 6" stroke="#d6e7e2" strokeWidth="2" opacity=".6" /><rect className="pig-flash" x="76" y="101" width="6" height="4" rx="1" fill="#f7e6bd" /></g>}
        {(accessory === "heart" || accessory === "party") && <path d="M61 100c-19-18-36 9 0 29 36-20 19-47 0-29" fill="#c96483" stroke="#f4b8b9" strokeWidth="2" />}
      </g>
    </svg>
  );
}
