import { forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import type { WalletOpenState } from "./wallet.types";

interface RedEnvelopeProps {
  walletState: WalletOpenState;
  onOpen: () => void;
  openPrompt: string;
  children: ReactNode;
  isMobile?: boolean;
}

export const RedEnvelope = forwardRef<HTMLDivElement, RedEnvelopeProps>(
  ({ walletState, onOpen, openPrompt, children, isMobile = false }, ref) => {
    const isOpen = walletState === "open";
    const isOpening = walletState === "opening";
    const isClosed = walletState === "closed";
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const [shaking, setShaking] = useState(false);

    // Shake hint after 2s idle
    useEffect(() => {
      if (!isClosed) return;
      const t = setTimeout(() => { setShaking(true); setTimeout(() => setShaking(false), 800); }, 2200);
      return () => clearTimeout(t);
    }, [isClosed]);

    // Gold coin + petal burst
    useEffect(() => {
      if (isClosed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;

      type P = { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string; life: number; shape: "circle" | "coin"; rot: number; rotV: number; };
      const COLORS = ["#e7b96a", "#f5d07a", "#ffe066", "#ffa500", "#ff6b6b", "#fff", "#ffcc44"];
      const ps: P[] = [];

      const burst = (delay: number) => setTimeout(() => {
        const cx = W / 2; const cy = H * 0.42;
        for (let i = 0; i < 60; i++) {
          const angle = -Math.PI * 0.9 + Math.random() * Math.PI * 1.8;
          const speed = 2 + Math.random() * 5;
          ps.push({
            x: cx + (Math.random() - 0.5) * 30, y: cy,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
            alpha: 1, size: 2 + Math.random() * 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0.010 + Math.random() * 0.014,
            shape: Math.random() > 0.5 ? "coin" : "circle",
            rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.3,
          });
        }
      }, delay);

      burst(0); burst(400); burst(800);

      const animate = () => {
        ctx.clearRect(0, 0, W, H);
        for (let i = ps.length - 1; i >= 0; i--) {
          const p = ps[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.vx *= 0.98;
          p.alpha -= p.life; p.rot += p.rotV;
          if (p.alpha <= 0) { ps.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (p.shape === "coin") {
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8; ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 0.5;
            ctx.stroke();
          } else {
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6; ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        if (ps.length > 0) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }, [isClosed]);

    const w = isMobile ? 220 : 270;
    const h = isMobile ? 300 : 370;
    const flapH = isMobile ? 120 : 148;

    return (
      <div
        ref={ref}
        className="relative mx-auto flex flex-col items-center justify-end [perspective:1200px]"
        style={{ width: `${w}px`, height: `${h + 80}px` }}
      >
        <canvas ref={canvasRef} aria-hidden
          className="pointer-events-none absolute inset-0 z-50"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: isOpen || isOpening
              ? "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(231,185,106,0.22) 0%, rgba(200,30,30,0.10) 60%, transparent 100%)"
              : "radial-gradient(ellipse 80% 60% at 50% 55%, rgba(200,30,30,0.30) 0%, transparent 75%)",
            filter: "blur(18px)", transition: "background 1s",
          }}
        />

        {/* Cards emerge above envelope */}
        <div className="absolute left-0 right-0 z-[20]" style={{ bottom: `${h - 20}px` }}>
          {children}
        </div>

        {/* Envelope body */}
        <div
          className={`relative z-[10] flex-shrink-0 overflow-visible transition-transform duration-200 ${shaking ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
          style={{ width: `${w}px`, height: `${h}px` }}
        >
          {/* Body */}
          <div className="absolute inset-0 rounded-b-2xl rounded-t-none shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(200,30,30,0.3)]"
            style={{
              background: "linear-gradient(170deg, #c0150f 0%, #a01010 35%, #8b0a0a 65%, #6d0606 100%)",
              borderRadius: "4px 4px 16px 16px",
            }}
          >
            {/* Diamond pattern watermark */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #ffd700 0, #ffd700 1px, transparent 0, transparent 50%)",
                backgroundSize: "18px 18px",
                borderRadius: "inherit",
              }}
            />
            {/* Border */}
            <div aria-hidden className="pointer-events-none absolute inset-[6px] rounded-xl border border-gold/25" />
            {/* Side shadows for depth */}
            <div aria-hidden className="absolute inset-y-0 left-0 w-6 rounded-l bg-gradient-to-r from-black/30 to-transparent" />
            <div aria-hidden className="absolute inset-y-0 right-0 w-6 rounded-r bg-gradient-to-l from-black/30 to-transparent" />

            {/* Round gold medallion center */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "52%" }}>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/60 bg-gradient-to-br from-[#f5d07a] via-[#e7b96a] to-[#c8922a] shadow-[0_0_20px_rgba(231,185,106,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)]">
                <span className="font-display text-2xl font-bold text-[#6d0606]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>囍</span>
                {/* Rotating ring */}
                <div aria-hidden className="pointer-events-none absolute inset-[-4px] rounded-full border border-dashed border-gold/40"
                  style={{ animation: "spin 12s linear infinite" }} />
              </div>
            </div>

            {/* Bottom text */}
            <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/50" />
                <span className="font-hand text-xs text-gold/80 tracking-wider">sinh nhật vui vẻ</span>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/50" />
              </div>
              <span className="font-mono text-[8px] tracking-[0.25em] text-gold/40 uppercase">10 · 11 · 2003</span>
            </div>
          </div>

          {/* Flap — 3D fold from top */}
          <div
            className="absolute inset-x-0 top-0 z-[15] origin-top [transform-style:preserve-3d]"
            style={{
              height: `${flapH}px`,
              transformOrigin: "top center",
              transform: isOpen ? "rotateX(-170deg)" : isOpening ? "rotateX(-160deg)" : "rotateX(0deg)",
              transition: isOpen || isOpening ? "transform 950ms cubic-bezier(0.34,1.2,0.64,1)" : "none",
            }}
          >
            {/* Flap outer — red with diamond flap shape */}
            <div className="absolute inset-0 [backface-visibility:hidden] overflow-hidden"
              style={{
                background: "linear-gradient(170deg, #d01515 0%, #b01010 60%, #901010 100%)",
                clipPath: "polygon(0 0, 50% 72%, 100% 0, 100% 100%, 0 100%)",
              }}
            >
              {/* Diamond pattern on flap */}
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, #ffd700 0, #ffd700 1px, transparent 0, transparent 50%)",
                  backgroundSize: "18px 18px",
                }}
              />
              {/* Flap border */}
              <div aria-hidden className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, rgba(231,185,106,0.5) 0%, transparent 40%)",
                  clipPath: "polygon(0 0, 50% 72%, 100% 0)",
                }}
              />

              {isClosed && (
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "18%", transform: "translateX(-50%)" }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-display text-2xl text-gold drop-shadow-[0_0_8px_rgba(231,185,106,0.9)] animate-pulse">✦</span>
                    <span className="font-hand text-sm text-gold/90">{openPrompt}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Flap inner — shown when open */}
            <div className="absolute inset-0 [transform:rotateX(180deg)] [backface-visibility:hidden]"
              style={{ background: "linear-gradient(to bottom, #7a0808, #901010)", clipPath: "polygon(0 0, 50% 72%, 100% 0, 100% 100%, 0 100%)" }}
            />
          </div>

          {/* V-shaped bottom fold line on body */}
          <div aria-hidden className="pointer-events-none absolute left-0 right-0 z-[5] opacity-30"
            style={{
              top: `${flapH - 2}px`, height: "2px",
              background: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 80%, transparent 100%)",
            }}
          />
        </div>

        {/* Click overlay */}
        {isClosed && (
          <button type="button" onClick={onOpen} aria-label="Mo li xi"
            className="absolute z-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/60 rounded-sm"
            style={{ inset: 0 }}
          >
            <span aria-hidden className="pointer-events-none absolute rounded-lg"
              style={{ inset: "-4px", animation: "pulse-ring 2.2s ease-out infinite", boxShadow: "0 0 0 3px rgba(231,185,106,0.5)" }} />
          </button>
        )}
      </div>
    );
  }
);

RedEnvelope.displayName = "RedEnvelope";
export default RedEnvelope;
