import { useEffect, useState, type CSSProperties } from 'react';
import './letter-vines.css';

const STRANDS = [
  { x: 18, length: .46, duration: 8.2, lean: -1.3 },
  { x: 37, length: .82, duration: 10.1, lean: 1.1 },
  { x: 55, length: .44, duration: 7.7, lean: -1.6 },
  { x: 72, length: .29, duration: 7.1, lean: 1.5 },
  { x: 92, length: 1, duration: 11.3, lean: -.9 },
];

export default function LetterVines({ active, running }: { active: boolean; running: boolean }) {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <div className="letter-vines" data-visible={active} data-running={running && visible} aria-hidden="true">
    {STRANDS.map((strand, index) => {
      const height = Math.round(620 * strand.length);
      const leaves = Math.floor(height / 30);
      const gradient = `letter-vine-leaf-${index}`;
      return <div key={index} className="letter-vines__strand" style={{
        '--vine-x': `${strand.x}%`, '--vine-length': strand.length,
        '--vine-duration': `${strand.duration}s`, '--vine-lean': `${strand.lean}deg`,
        '--vine-delay': `${-index * 1.7}s`,
      } as CSSProperties}>
        <div className="letter-vines__sway">
          <svg viewBox={`0 0 64 ${height}`} preserveAspectRatio="none" fill="none">
            <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#263c2e"/><stop offset=".55" stopColor="#61794c"/><stop offset="1" stopColor="#344b35"/>
            </linearGradient></defs>
            <path d={`M32 -6 Q23 ${height * .18} 34 ${height * .36} T30 ${height * .72} Q37 ${height * .87} 28 ${height}`} stroke="#526443" strokeWidth="1.4"/>
            {Array.from({ length: leaves }, (_, leaf) => {
              const y = 14 + leaf * 30;
              const x = 31 + Math.sin(leaf * .8) * 4;
              const side = leaf % 2 ? 1 : -1;
              return <g key={leaf} transform={`translate(${x} ${y}) scale(${side} 1) rotate(${leaf % 3 * 6 - 8})`}>
                <path d="M0 7Q7 3 12 -5" stroke="#526443" strokeWidth=".9"/>
                <path d="M7 0Q5 -17 24 -21Q26 -5 7 0Z" fill={`url(#${gradient})`}/>
                <path d="M8 -1L22 -18" stroke="#a2b58c" strokeOpacity=".28" strokeWidth=".7"/>
              </g>;
            })}
          </svg>
        </div>
      </div>;
    })}
  </div>;
}
