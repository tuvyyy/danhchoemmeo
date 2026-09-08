import { forwardRef } from "react";
import { STYLIZED_BILLS } from "./walletConfig";
import type { WalletOpenState } from "./wallet.types";

interface MoneyFanProps {
  walletState: WalletOpenState;
  isMobile?: boolean;
}

export const MoneyFan = forwardRef<HTMLDivElement, MoneyFanProps>(
  ({ walletState, isMobile = false }, ref) => {
    const isOpen = walletState === "open";
    const isOpening = walletState === "opening";
    const showBills = isOpen || isOpening;

    return (
      <div
        ref={ref}
        data-testid="money-fan"
        className="pointer-events-none absolute left-1/2 top-10 z-[6] -translate-x-1/2"
      >
        {STYLIZED_BILLS.map((bill, index) => {
          // Adjust spread slightly on small screens
          const x = isMobile ? bill.xOffset * 0.65 : bill.xOffset;
          const y = isMobile ? bill.yOffset * 0.75 : bill.yOffset;
          const rot = isMobile ? bill.rotation * 0.8 : bill.rotation;
          const scale = isMobile ? bill.scale * 0.85 : bill.scale;

          return (
            <div
              key={bill.id}
              data-bill-id={bill.id}
              className="bill-item absolute left-1/2 top-0 origin-bottom transition-all duration-700 ease-out"
              style={{
                width: isMobile ? "124px" : "154px",
                height: isMobile ? "64px" : "78px",
                marginLeft: isMobile ? "-62px" : "-77px",
                transform: showBills
                  ? `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`
                  : `translate(0px, 0px) rotate(0deg) scale(0.6)`,
                opacity: showBills ? 1 : 0,
                transitionDelay: isOpening ? `${bill.delay}s` : "0s",
              }}
            >
              {/* Decorative Stylized Banknote */}
              <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[5px] border border-[#e7b96a]/50 bg-gradient-to-br from-[#103328] via-[#1d5241] to-[#0c241d] p-2 text-white shadow-xl shadow-black/60">
                {/* Guilloche inner hairline border */}
                <div className="pointer-events-none absolute inset-[3px] rounded-[3px] border border-[#e7b96a]/25" />

                {/* Top header row */}
                <div className="relative z-10 flex items-center justify-between text-[7px] font-medium tracking-widest text-[#e7b96a]/80">
                  <span>NGÂN HÀNG YÊU THƯƠNG</span>
                  <span className="font-mono text-[6px] text-white/50">{bill.serial}</span>
                </div>

                {/* Center denomination and mascot seal */}
                <div className="relative z-10 my-auto flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="font-display text-xs font-bold tracking-tight text-[#f4ece4] drop-shadow-sm sm:text-sm">
                      500.000₫
                    </span>
                    <span className="text-[6px] uppercase tracking-wider text-[#e7b96a]">
                      quỹ chiều em
                    </span>
                  </div>
                  {/* Decorative circular watermark stamp */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e7b96a]/40 bg-[#e7b96a]/10 text-xs shadow-inner">
                    🐷
                  </div>
                </div>

                {/* Bottom decorative band */}
                <div className="relative z-10 flex items-center justify-between text-[6px] font-mono text-white/40">
                  <span>VND 500K</span>
                  <span className="text-[#e7b96a]/60">10·11·2003</span>
                </div>

                {/* Holographic foil sheen overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

MoneyFan.displayName = "MoneyFan";
export default MoneyFan;
