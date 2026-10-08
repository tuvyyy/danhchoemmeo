import { publicAsset } from "@/lib/assets/publicAsset";
import type { CSSProperties } from 'react';

const flights = [
  { route: 'rose', size: 96, duration: 19, delay: -4, flap: .24 },
  { route: 'light', size: 65, duration: 25, delay: -13, flap: .20 },
  { route: 'edge', size: 112, duration: 23, delay: -8, flap: .30 },
  { route: 'rose', size: 48, duration: 28, delay: -19, flap: .18 },
  { route: 'wander', size: 76, duration: 34, delay: -7, flap: .23 },
  { route: 'roam', size: 86, duration: 39, delay: -24, flap: .27 },
];

/** One transparent cutout, two wings hinged at the body. Flight and wing
 * transforms have separate wrappers so flapping never interrupts the path. */
export function FinaleButterflies() {
  return <div className="finale-butterflies" aria-hidden="true">
    {flights.map((flight, index) => <div key={index} className={`butterfly-flight butterfly-flight--${flight.route}`} style={{
      '--butterfly-size': `${flight.size}px`, '--flight-duration': `${flight.duration}s`,
      '--flight-delay': `${flight.delay}s`, '--flap-duration': `${flight.flap}s`,
    } as CSSProperties}>
      <div className="butterfly-lift"><div className="silver-butterfly">
        <span className="butterfly-wing butterfly-wing--left"><img src={publicAsset("/assets/birthday-cake/silver-butterfly.webp")} alt="" draggable={false}/></span>
        <span className="butterfly-wing butterfly-wing--right"><img src={publicAsset("/assets/birthday-cake/silver-butterfly.webp")} alt="" draggable={false}/></span>
        <img className="butterfly-body" src={publicAsset("/assets/birthday-cake/silver-butterfly.webp")} alt="" draggable={false}/>
      </div></div>
    </div>)}
  </div>;
}
