import { forwardRef, type ReactNode, useEffect, useRef } from "react";
import type { WalletOpenState } from "./wallet.types";

interface LuxuryGiftBoxProps {
  walletState: WalletOpenState;
  onOpen: () => void;
  openPrompt: string;
  tagline: string;
  children: ReactNode;
  isMobile?: boolean;
}

export const LuxuryGiftBox = forwardRef<HTMLDivElement, LuxuryGiftBoxProps>(
  ({ walletState, onOpen, openPrompt, tagline, children, isMobile = false }, ref) => {
    const isOpen = walletState === "open";
    const isOpening = walletState === "opening";
    const isClosed = walletState === "closed";
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
      if (isClosed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;

      type Particle = { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string; life: number; };
      const COLORS = ["#e7b96a", "#d4af7a", "#ffffff", "#c8a86b", "#f5dfa0", "#e8a0b8", "#c084fc"];
      const particles: Particle[] = [];

      const burst = () => {
        const cx = W / 2;
        const cy = H * 0.35;
        for (let i = 0; i < 55; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.2 + Math.random() * 3.5;
          particles.push({
            x: cx + (Math.random() - 0.5) * 40,
            y: cy + (Math.random() - 0.5) * 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            alpha: 0.9 + Math.random() * 0.1,
            size: 1.5 + Math.random() * 3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0.012 + Math.random() * 0.016,
          });
        }
      };

      burst();
      const t = setTimeout(burst, 600);

      const animate = () => {
        ctx.clearRect(0, 0, W, H);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.07;
          p.vx *= 0.99;
          p.alpha -= p.life;
          if (p.alpha <= 0) { particles.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (particles.length > 0) rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
      return () => { clearTimeout(t); cancelAnimationFrame(rafRef.current); };
    }, [isClosed]);

    const boxW = isMobile ? 260 : 300;
    const boxH = isMobile ? 170 : 200;
    const lidH = isMobile ? 68 : 80;

    return (
      <div
        ref={ref}
        data-testid="luxury-gift-box-container"
        className="relative mx-auto flex items-center justify-center [perspective:1400px]"
        style={{ width: `${boxW}px`, height: `${boxH + 60}px` }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50"
          style={{ width: "100%", height: "100%" }}
        />

        <div
          aria-hidden
          className={`pointer-events-none absolute rounded-3xl blur-3xl transition-all duration-1000 ${
            isClosed ? "opacity-40 bg-purple-900/30" : "opacity-70"
          }`}
          style={{
            inset: "-30px",
            background: isClosed
              ? undefined
              : "radial-gradient(ellipse, rgba(120,60,220,0.25) 0%, rgba(231,185,106,0.12) 60%, transparent 100%)",
          }}
        />

        {/* Box Body */}
        <div
          data-testid="gift-box-body"
          className="absolute bottom-0 left-0 right-0 z-[5] rounded-b-xl border border-gold/30 shadow-[0_12px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]"
          style={{
            height: `${boxH}px`,
            background: "linear-gradient(160deg, #1a0d2e 0%, #120820 40%, #0d0615 70%, #070310 100%)",
          }}
        >
          <div aria-hidden className="absolute inset-[6px] rounded-lg border border-purple-400/10 bg-gradient-to-b from-purple-950/40 to-transparent" />
          <div aria-hidden className="absolute inset-y-0 left-0 w-[6px] rounded-bl-xl bg-gradient-to-r from-black/40 to-transparent" />
          <div aria-hidden className="absolute inset-y-0 right-0 w-[6px] rounded-br-xl bg-gradient-to-l from-black/40 to-transparent" />

          {/* Horizontal ribbon on body */}
          <div
            aria-hidden
            className={`absolute inset-x-0 transition-opacity duration-700 ${isOpen || isOpening ? "opacity-0" : "opacity-100"}`}
            style={{
              top: "50%", transform: "translateY(-50%)",
              height: isMobile ? "14px" : "16px",
              background: "linear-gradient(to bottom, transparent, rgba(231,185,106,0.18) 30%, rgba(231,185,106,0.30) 50%, rgba(231,185,106,0.18) 70%, transparent)",
              borderTop: "0.5px solid rgba(231,185,106,0.35)", borderBottom: "0.5px solid rgba(231,185,106,0.35)",
            }}
          />

          {/* Tagline */}
          <div className="absolute inset-x-0 bottom-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 opacity-75">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="font-hand text-sm text-gold tracking-wider">{tagline}</span>
              <span className="h-px w-5 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <span className="mt-0.5 font-mono text-[7px] tracking-[0.3em] text-cream-dim/35 uppercase">edition 10.11</span>
          </div>

          {children}
        </div>

        {/* Vertical ribbon on body */}
        <div
          aria-hidden
          className={`absolute z-[6] rounded-sm transition-opacity duration-700 ${isOpen || isOpening ? "opacity-0" : "opacity-100"}`}
          style={{
            bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: isMobile ? "14px" : "16px", height: `${boxH}px`,
            background: "linear-gradient(to right, rgba(231,185,106,0.1), rgba(231,185,106,0.35) 30%, rgba(231,185,106,0.45) 50%, rgba(231,185,106,0.35) 70%, rgba(231,185,106,0.1))",
            borderLeft: "0.5px solid rgba(231,185,106,0.4)", borderRight: "0.5px solid rgba(231,185,106,0.4)",
          }}
        />

        {/* Box Lid */}
        <div
          data-testid="gift-box-lid"
          className="absolute inset-x-0 top-0 z-[18] origin-top [transform-style:preserve-3d]"
          style={{
            height: `${lidH}px`,
            transformOrigin: "top center",
            transform: isOpen ? "rotateX(-165deg)" : isOpening ? "rotateX(-155deg)" : "rotateX(0deg)",
            transition: isOpen || isOpening ? "transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
          }}
        >
          {/* Lid outer face */}
          <div
            className="absolute inset-0 rounded-t-xl border border-gold/35 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] [backface-visibility:hidden]"
            style={{ background: "linear-gradient(180deg, #241040 0%, #1a0c2e 50%, #140828 100%)" }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-[5px] rounded-lg border border-dashed border-gold/20" />

            {/* Ribbon vertical on lid */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-1/2 -translate-x-1/2"
              style={{
                width: isMobile ? "14px" : "16px",
                background: "linear-gradient(to right, rgba(231,185,106,0.1), rgba(231,185,106,0.35) 30%, rgba(231,185,106,0.45) 50%, rgba(231,185,106,0.35) 70%, rgba(231,185,106,0.1))",
                borderLeft: "0.5px solid rgba(231,185,106,0.4)", borderRight: "0.5px solid rgba(231,185,106,0.4)",
              }}
            />

            {/* Bow knot */}
            {isClosed && (
              <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: "-14px", zIndex: 30 }}>
                <svg width={isMobile ? "52" : "62"} height={isMobile ? "30" : "36"} viewBox="0 0 62 36" fill="none">
                  <ellipse cx="16" cy="14" rx="15" ry="9" transform="rotate(-18 16 14)" fill="rgba(231,185,106,0.18)" stroke="rgba(231,185,106,0.7)" strokeWidth="1.2"/>
                  <ellipse cx="46" cy="14" rx="15" ry="9" transform="rotate(18 46 14)" fill="rgba(231,185,106,0.18)" stroke="rgba(231,185,106,0.7)" strokeWidth="1.2"/>
                  <ellipse cx="31" cy="16" rx="5.5" ry="4.5" fill="rgba(231,185,106,0.55)" stroke="rgba(231,185,106,0.9)" strokeWidth="1"/>
                  <path d="M26 20 Q20 28 14 32" stroke="rgba(231,185,106,0.65)" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M36 20 Q42 28 48 32" stroke="rgba(231,185,106,0.65)" strokeWidth="1.4" strokeLinecap="round"/>
                  <ellipse cx="29" cy="14.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.35)"/>
                </svg>
              </div>
            )}

            {/* Open prompt */}
            {isClosed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-hand text-lg sm:text-xl text-gold drop-shadow-[0_0_12px_rgba(231,185,106,0.8)] animate-pulse">
                  {openPrompt}
                </span>
              </div>
            )}
          </div>

          {/* Lid inner face */}
          <div
            className="absolute inset-0 rounded-t-xl border border-purple-400/20 [transform:rotateX(180deg)] [backface-visibility:hidden]"
            style={{ background: "linear-gradient(to top, #0d0615 0%, #1a0a30 100%)" }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-lg border border-dashed border-purple-400/15" />
          </div>
        </div>

        {/* Horizontal ribbon seam */}
        <div
          aria-hidden
          className={`absolute inset-x-0 z-[7] transition-opacity duration-500 ${isOpen || isOpening ? "opacity-0" : "opacity-100"}`}
          style={{
            top: `${lidH - 8}px`, height: isMobile ? "14px" : "16px",
            background: "linear-gradient(to bottom, transparent, rgba(231,185,106,0.20) 30%, rgba(231,185,106,0.32) 50%, rgba(231,185,106,0.20) 70%, transparent)",
            borderTop: "0.5px solid rgba(231,185,106,0.38)", borderBottom: "0.5px solid rgba(231,185,106,0.38)",
          }}
        />

        {/* Click trigger */}
        {isClosed && (
          <button
            type="button"
            data-testid="gift-box-open-trigger"
            onClick={onOpen}
            aria-label="Mo hop qua"
            className="absolute inset-0 z-30 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/60"
          >
            <span aria-hidden className="pointer-events-none absolute -inset-1.5 rounded-xl"
              style={{ animation: "pulse-ring 2.4s ease-out infinite", boxShadow: "0 0 0 2px rgba(168,85,247,0.45)" }} />
            <span aria-hidden className="pointer-events-none absolute -inset-2.5 rounded-xl"
              style={{ animation: "pulse-ring 2.4s ease-out 0.6s infinite", boxShadow: "0 0 0 2px rgba(231,185,106,0.30)" }} />
          </button>
        )}
      </div>
    );
  }
);

LuxuryGiftBox.displayName = "LuxuryGiftBox";
export default LuxuryGiftBox;
