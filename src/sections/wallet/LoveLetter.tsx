import { forwardRef, type ReactNode, useEffect, useRef } from "react";
import type { WalletOpenState } from "./wallet.types";

interface LoveLetterProps {
  walletState: WalletOpenState;
  onOpen: () => void;
  openPrompt: string;
  children: ReactNode;
  /** Expose flap and seal refs for the portal transition */
  flapRef?: React.RefObject<HTMLDivElement | null>;
  sealRef?: React.RefObject<HTMLDivElement | null>;
}

export const LoveLetter = forwardRef<HTMLDivElement, LoveLetterProps>(
  ({ walletState, onOpen, openPrompt, children, flapRef, sealRef }, ref) => {
    const isOpen    = walletState === "open";
    const isOpening = walletState === "opening";
    const isClosed  = walletState === "closed";
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef    = useRef<number>(0);

    /* ── Particle burst on open ── */
    useEffect(() => {
      if (isClosed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;

      type P = { x:number; y:number; vx:number; vy:number; alpha:number; size:number; color:string; life:number; rot:number; rotV:number; heart:boolean };
      const COLS = ["#e18aa0","#f5c6d0","#e7b96a","#fff","#fadadd","#f9a8b8","#ffd6e0"];
      const ps: P[] = [];

      const burst = (delay: number) => setTimeout(() => {
        const cx = W / 2, cy = H * 0.52;
        for (let i = 0; i < 60; i++) {
          const a = Math.random() * Math.PI * 2, spd = 1.6 + Math.random() * 4;
          ps.push({ x: cx+(Math.random()-.5)*20, y: cy+(Math.random()-.5)*20,
            vx: Math.cos(a)*spd, vy: Math.sin(a)*spd - 1.2,
            alpha:1, size:1.5+Math.random()*4,
            color: COLS[Math.floor(Math.random()*COLS.length)],
            life: .011+Math.random()*.012, rot:Math.random()*6.28, rotV:(Math.random()-.5)*.26,
            heart: Math.random()>.5 });
        }
      }, delay);
      burst(0); burst(420);

      const draw = () => {
        ctx.clearRect(0,0,W,H);
        for (let i = ps.length-1; i>=0; i--) {
          const p = ps[i];
          p.x+=p.vx; p.y+=p.vy; p.vy+=.06; p.vx*=.99;
          p.alpha-=p.life; p.rot+=p.rotV;
          if (p.alpha<=0) { ps.splice(i,1); continue; }
          ctx.save(); ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color;
          ctx.translate(p.x,p.y); ctx.rotate(p.rot);
          if (p.heart && p.size>2.5) {
            const s=p.size*.85;
            ctx.beginPath();
            ctx.moveTo(0,-s*.5);
            ctx.bezierCurveTo(s*.5,-s,s,-s*.3,0,s*.55);
            ctx.bezierCurveTo(-s,-s*.3,-s*.5,-s,0,-s*.5);
            ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(0,0,p.size*.55,0,6.28); ctx.fill();
          }
          ctx.restore();
        }
        if (ps.length>0) rafRef.current=requestAnimationFrame(draw);
      };
      rafRef.current=requestAnimationFrame(draw);
      return () => cancelAnimationFrame(rafRef.current);
    }, [isClosed]);

    const W = 460, H = 320, flapH = 156;

    return (
      <div
        ref={ref}
        className="relative [perspective:1200px]"
        style={{
          width: `${W}px`,
          height: `${H+220}px`,
          /* Idle breathing animation */
          animation: isClosed ? "envelope-breathe 6s ease-in-out infinite" : "none",
        }}
      >
        {/* Particle canvas */}
        <canvas ref={canvasRef} aria-hidden
          className="pointer-events-none absolute inset-0 z-50"
          style={{ width:"100%", height:"100%" }}
        />

        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-all duration-1000 z-0"
          style={{
            background: (isOpen||isOpening)
              ? "radial-gradient(ellipse 75% 55% at 50% 52%, rgba(225,138,160,0.25) 0%, rgba(231,185,106,0.07) 55%, transparent 88%)"
              : "radial-gradient(ellipse 55% 42% at 50% 58%, rgba(225,138,160,0.11) 0%, transparent 78%)",
            filter:"blur(28px)",
          }}
        />

        {/* Cards slot */}
        <div className="absolute left-0 right-0 z-[22]" style={{ top:`${flapH - 12}px` }}>
          {children}
        </div>

        {/* ══ Envelope body ══ */}
        <div className="absolute inset-x-0 bottom-0 z-[10]" style={{ height:`${H}px` }}>
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, #f7f0e8 0%, #f0e8d8 30%, #ebe0cc 65%, #e4d8c0 100%)",
              borderRadius:"3px 3px 12px 12px",
              boxShadow: "0 32px 110px rgba(0,0,0,0.78), 0 8px 32px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* Paper grain */}
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.045]"
              style={{
                backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
              }}
            />

            {/* Bottom V-folds */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
              style={{ height:"58%", borderRadius:"0 0 12px 12px" }}
            >
              <div aria-hidden className="absolute inset-0"
                style={{ background:"linear-gradient(140deg,#ddd0b8 0%,#d8c8aa 100%)", clipPath:"polygon(0 0,50% 100%,0 100%)" }}
              />
              <div aria-hidden className="absolute inset-0"
                style={{ background:"linear-gradient(220deg,#e2d4bc 0%,#d8c8aa 100%)", clipPath:"polygon(100% 0,50% 100%,100% 100%)" }}
              />
              <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom"
                style={{ width:"1px", height:"100%", background:"linear-gradient(to top, rgba(160,140,110,0.55), transparent)" }}
              />
            </div>

            {/* Thin border */}
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[#b8a88a]/30" />

            {/* ── Wax seal ── */}
            <div
              ref={sealRef}
              className="absolute left-1/2 -translate-x-1/2 z-[15]"
              style={{
                bottom: "14%",
                opacity: isOpen ? 0 : 1,
                transform: `translateX(-50%) scale(${isOpen ? 0.5 : 1})`,
                transition: "opacity 500ms ease, transform 500ms ease",
              }}
            >
              <div className="group relative flex items-center justify-center" style={{ width:"72px", height:"72px" }}>
                {/* Wax body */}
                <div className="absolute inset-0 rounded-full transition-[filter] duration-300 group-hover:brightness-[1.12]"
                  style={{
                    background:"radial-gradient(circle at 38% 32%, #e84565, #c0163a 45%, #8a0c24 80%, #600818 100%)",
                    boxShadow:"0 6px 28px rgba(180,20,40,0.65), 0 2px 8px rgba(0,0,0,0.55), inset 0 2px 5px rgba(255,160,180,0.30), inset 0 -2px 6px rgba(0,0,0,0.30)",
                  }}
                />
                {/* Subtle gold shimmer highlight on seal */}
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                  <div
                    className="absolute"
                    style={{
                      inset:"-40%",
                      background:"conic-gradient(from 0deg, transparent 0%, rgba(231,185,106,0.18) 25%, transparent 50%)",
                      animation:"seal-shimmer 4s linear infinite",
                    }}
                  />
                </div>
                {/* Rings */}
                <div aria-hidden className="pointer-events-none absolute inset-[5px] rounded-full border border-[rgba(255,160,160,0.22)]" />
                <div aria-hidden className="pointer-events-none absolute inset-[9px] rounded-full border border-dashed border-[rgba(255,160,160,0.12)]" />
                {/* Heart */}
                <span className="relative z-10 select-none text-white/90 drop-shadow-md" style={{ fontSize:"26px" }}>🤍</span>
              </div>
              {/* Open prompt — close to seal */}
              {isClosed && (
                <div className="mt-2 text-center">
                  <span className="font-hand text-sm tracking-wide text-[#8a6a50]/65 select-none">
                    {/* openPrompt comes from parent */}
                    Chạm để mở thư
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <span className="font-hand text-[11px] tracking-wide text-[#8a6a50]/40 select-none">
                10 · 11 · 2003
              </span>
            </div>
          </div>
        </div>

        {/* ══ Flap ══ */}
        <div
          ref={flapRef}
          className="absolute inset-x-0 top-0 z-[18] [transform-style:preserve-3d]"
          style={{
            height: `${flapH}px`,
            transformOrigin:"top center",
            transform: isOpen
              ? "rotateX(-172deg)"
              : isOpening
                ? "rotateX(-158deg)"
                : "rotateX(0deg)",
            transition: (isOpen||isOpening)
              ? "transform 900ms cubic-bezier(.22,.75,.18,1)"
              : "none",
          }}
        >
          {/* Flap outer face */}
          <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
            style={{
              background:"linear-gradient(185deg, #f0e8d8 0%, #e8dcc8 45%, #ddd0b8 100%)",
              clipPath:"polygon(0 0,50% 82%,100% 0,100% 100%,0 100%)",
              borderBottom:"1px solid rgba(180,160,120,0.35)",
            }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ background:"linear-gradient(175deg, rgba(255,255,255,0.45) 0%, transparent 55%)", clipPath:"polygon(0 0,50% 82%,100% 0)" }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ background:"linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 65%)", clipPath:"polygon(0 0,50% 82%,100% 0,100% 100%,0 100%)" }}
            />
          </div>

          {/* Flap inner face */}
          <div className="absolute inset-0 overflow-hidden [transform:rotateX(180deg)] [backface-visibility:hidden]"
            style={{
              background:"linear-gradient(to bottom,#d8c8aa,#ccc0a0)",
              clipPath:"polygon(0 0,50% 82%,100% 0,100% 100%,0 100%)",
            }}
          />
        </div>

        {/* ── Click overlay ── */}
        {isClosed && (
          <button type="button" onClick={onOpen} aria-label="Mo phong thu"
            className="group absolute inset-0 z-30 cursor-pointer rounded focus:outline-none"
            style={{ borderRadius:"3px 3px 12px 12px" }}
          >
            {/* Hover lift shadow overlay */}
            <span aria-hidden
              className="pointer-events-none absolute -inset-2 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ boxShadow:"0 40px 80px rgba(0,0,0,0.45), 0 12px 30px rgba(180,20,40,0.25)" }}
            />
            {/* Pulse ring */}
            <span aria-hidden className="pointer-events-none absolute -inset-1.5 rounded-xl"
              style={{ animation:"pulse-ring 2.4s ease-out infinite", boxShadow:"0 0 0 2.5px rgba(225,138,160,0.55)" }}
            />
          </button>
        )}
      </div>
    );
  }
);
LoveLetter.displayName = "LoveLetter";
export default LoveLetter;
