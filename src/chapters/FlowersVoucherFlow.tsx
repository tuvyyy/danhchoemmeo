import { forwardRef, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";
import "./flowers-voucher-flow.css";

export interface FlowersVoucherFlowHandle { render: (progress: number) => void }
const paths = [
  "M-30 155C350 145 735 65 866 190S810 345 905 424S957 661 822 716S681 752 500 837",
  "M-30 125C300 130 690 92 840 200S827 275 899 374S925 555 824 654S711 716 500 786",
];

/** The animation paints this small surface directly; scrolling never rerenders the chapter tree. */
const FlowersVoucherFlow = forwardRef<FlowersVoucherFlowHandle, { host: HTMLElement | null }>(function FlowersVoucherFlow({ host }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const lengths=useRef(new WeakMap<SVGPathElement,number>());
  useImperativeHandle(ref, () => ({ render(progress) {
    const node = root.current;
    if (!node) return;
    const step = progress < .3 ? 0 : progress < .72 ? 1 : 2;
    node.style.setProperty("--flow-progress", String(progress));
    node.dataset.progress = progress.toFixed(4);
    node.dataset.step = String(step);
    node.querySelectorAll<SVGSVGElement>(".memory-thread").forEach(svg => {
      const path = svg.querySelector<SVGPathElement>(".memory-thread__line")!;
      let length=lengths.current.get(path);
      if(length===undefined){length=path.getTotalLength();lengths.current.set(path,length);}
      const point = path.getPointAtLength(length * progress);
      svg.querySelector(".memory-thread__tip")!.setAttribute("transform", `translate(${point.x} ${point.y})`);
    });
  } }), []);
  if (!host) return null;
  return createPortal(<div ref={root} className="memory-flow" data-progress="0" data-step="0">
    {paths.map((path, index) => <svg key={index} className={`memory-thread memory-thread--${index ? "mobile" : "desktop"}`} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={`memory-gold-${index}`} x1="0" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox">
        <stop stopColor="#916541"/><stop offset=".32" stopColor="#ffe2a2"/><stop offset=".52" stopColor="#ab7644"/><stop offset=".8" stopColor="#f8d79c"/><stop offset="1" stopColor="#bc8c58"/>
      </linearGradient></defs>
      <path className="memory-thread__track" d={path} vectorEffect="non-scaling-stroke"/>
      <path className="memory-thread__line" d={path} pathLength="1" stroke={`url(#memory-gold-${index})`}/>
      <path className="memory-thread__edge" d={path} pathLength="1"/>
      <g className="memory-thread__tip"><circle r="13" className="memory-thread__halo"/><path d="M0-7 2-2 7 0 2 2 0 7-2 2-7 0-2-2Z"/></g>
    </svg>)}
  </div>, host);
});
export default FlowersVoucherFlow;
