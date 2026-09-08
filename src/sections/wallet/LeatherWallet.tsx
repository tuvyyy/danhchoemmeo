import { forwardRef, type ReactNode } from "react";
import type { WalletOpenState } from "./wallet.types";

interface LeatherWalletProps {
  walletState: WalletOpenState;
  onOpen: () => void;
  openPrompt: string;
  tagline: string;
  children: ReactNode;
  isMobile?: boolean;
}

export const LeatherWallet = forwardRef<HTMLDivElement, LeatherWalletProps>(
  (
    { walletState, onOpen, openPrompt, tagline, children, isMobile = false },
    ref
  ) => {
    const isOpen = walletState === "open";
    const isOpening = walletState === "opening";
    const isClosed = walletState === "closed";

    return (
      <div
        ref={ref}
        data-testid="leather-wallet-container"
        className="relative mx-auto flex items-center justify-center [perspective:1200px]"
        style={{
          width: isMobile ? "270px" : "310px",
          height: isMobile ? "180px" : "200px",
        }}
      >
        {/* Ambient subtle glow beneath wallet */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-6 rounded-3xl bg-gold/10 blur-2xl transition-opacity duration-1000 ${
            isClosed ? "opacity-60" : "opacity-30"
          }`}
        />

        {/* ── 1. Wallet Back Layer (Exterior Leather Base) ── */}
        <div
          data-testid="wallet-back"
          className="absolute inset-0 z-[2] rounded-2xl border border-gold/25 bg-gradient-to-br from-[#1c1117] via-[#2a1421] to-[#140b10] shadow-2xl shadow-black/90"
        >
          {/* Subtle perimeter stitching */}
          <div className="pointer-events-none absolute inset-[5px] rounded-xl border border-dashed border-gold/20" />
        </div>

        {/* ── 2. Interior Velvet Lining (Cavity) ── */}
        <div
          data-testid="wallet-lining"
          className="absolute inset-[8px] z-[4] rounded-xl bg-gradient-to-b from-[#180b13] via-[#220e1b] to-[#12080e] shadow-inner"
        >
          {/* Inner card slot pocket line */}
          <div className="absolute inset-x-3 top-7 h-[1px] bg-gold/20 shadow-sm" />
        </div>

        {/* ── 3. Contents Slot (MoneyFan + GiftCardRack) ── */}
        {children}

        {/* ── 4. Front Leather Lip (Pockets holding items from sliding out) ── */}
        <div
          data-testid="wallet-front-lip"
          className="absolute inset-x-0 bottom-0 z-[12] h-[105px] sm:h-[115px] rounded-b-2xl border-x border-b border-gold/30 bg-gradient-to-t from-[#160c12] via-[#24131e] to-[#2c1624] shadow-[0_-6px_16px_rgba(0,0,0,0.6)]"
        >
          {/* Front lip stitching */}
          <div className="pointer-events-none absolute inset-x-[5px] bottom-[5px] top-[4px] rounded-b-xl border-x border-b border-dashed border-gold/20" />

          {/* Gold foil embossed emblem / tagline */}
          <div className="absolute inset-x-0 bottom-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="font-hand text-base text-gold tracking-wider sm:text-lg">
                {tagline}
              </span>
              <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <span className="font-mono text-[8px] tracking-[0.3em] text-cream-dim/40 uppercase mt-0.5">
              edition 10.11
            </span>
          </div>

          {/* Magnetic clasp receiver notch */}
          <div className="absolute left-1/2 top-0 h-4 w-12 -translate-x-1/2 rounded-b-md border-x border-b border-gold/40 bg-[#160b11] shadow-inner flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-gold/60 shadow-sm" />
          </div>
        </div>

        {/* ── 5. Top Flap with 3D physical fold ── */}
        <div
          data-testid="wallet-top-flap"
          className={`absolute inset-x-0 top-0 z-[20] h-[115px] sm:h-[125px] origin-top transition-transform duration-1000 [transform-style:preserve-3d] ${
            isOpen
              ? "-rotate-x-[155deg]"
              : isOpening
              ? "-rotate-x-[150deg]"
              : "rotate-x-0"
          }`}
          style={{
            transformOrigin: "top center",
          }}
        >
          {/* Flap Outer Leather Face */}
          <div className="absolute inset-0 rounded-t-2xl border-x border-t border-gold/35 bg-gradient-to-b from-[#2b1522] via-[#381a2c] to-[#1e0d17] shadow-xl [backface-visibility:hidden]">
            {/* Flap perimeter stitching */}
            <div className="pointer-events-none absolute inset-x-[5px] top-[5px] bottom-0 rounded-t-xl border-x border-t border-dashed border-gold/25" />

            {/* Gold magnetic clasp tab extending downward */}
            <div className="absolute bottom-0 left-1/2 h-7 w-14 -translate-x-1/2 translate-y-3.5 rounded-b-lg border border-gold/50 bg-gradient-to-b from-[#2a1320] to-[#190a12] shadow-md flex items-center justify-center">
              {/* Metallic snap button */}
              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gold/80 bg-gradient-to-br from-[#f3d18e] via-[#d4a04d] to-[#926827] shadow-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-[#1e0e17]" />
              </div>
            </div>

            {/* Closed prompt hint */}
            {isClosed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-hand text-lg sm:text-xl text-gold drop-shadow-md animate-pulse">
                  {openPrompt}
                </span>
              </div>
            )}
          </div>

          {/* Flap Inner Velvet Face (Revealed when open) */}
          <div className="absolute inset-0 rounded-t-2xl border-x border-t border-gold/20 bg-gradient-to-t from-[#180a12] to-[#250f1d] [transform:rotateX(180deg)] [backface-visibility:hidden]">
            <div className="pointer-events-none absolute inset-2 rounded-t-xl border border-dashed border-gold/15" />
          </div>
        </div>

        {/* ── 6. Full clickable overlay button when closed ── */}
        {isClosed && (
          <button
            type="button"
            data-testid="wallet-open-trigger"
            onClick={onOpen}
            aria-label="Mở ví"
            className="absolute inset-0 z-30 cursor-pointer rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/60"
          >
            {/* Pulse aura ring */}
            <span
              className="pointer-events-none absolute -inset-1 rounded-2xl"
              style={{
                animation: "pulse-ring 2.4s ease-out infinite",
                boxShadow: "0 0 0 2px rgba(231,185,106,0.5)",
              }}
            />
          </button>
        )}
      </div>
    );
  }
);

LeatherWallet.displayName = "LeatherWallet";
export default LeatherWallet;
