import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { GiftCardData } from "@/data/birthdayContent";
import type { WalletOpenState } from "./wallet.types";

interface GiftCardRackProps {
  cards: GiftCardData[];
  walletState: WalletOpenState;
  onSelectCard: (card: GiftCardData) => void;
}

/* Wide fan — 4 cards, spread to fill right column */
const SLOTS = [
  { rot: -24, x: -218, y: 32 },
  { rot:  -8, x:  -72, y:  -8 },
  { rot:   8, x:   72, y:  -8 },
  { rot:  24, x:  218, y:  32 },
];

const THEMES: Record<string, {
  bg: string; border: string; badgeBg: string; badgeText: string;
  iconBg: string; title: string; glow: string; shine: string;
}> = {
  rose: {
    bg: "from-[#fef0f3] to-[#fcd8e3]",
    border: "border-rose-300/70 hover:border-rose-400",
    badgeBg: "bg-rose-100", badgeText: "text-rose-600",
    iconBg: "bg-rose-50 border-rose-200",
    title: "text-rose-900",
    glow: "hover:shadow-[0_16px_50px_rgba(225,100,130,0.45)]",
    shine: "from-rose-100/60",
  },
  gold: {
    bg: "from-[#fdf8ed] to-[#faeabb]",
    border: "border-amber-400/70 hover:border-amber-500",
    badgeBg: "bg-amber-100", badgeText: "text-amber-700",
    iconBg: "bg-amber-50 border-amber-200",
    title: "text-amber-900",
    glow: "hover:shadow-[0_16px_50px_rgba(200,150,30,0.45)]",
    shine: "from-amber-100/60",
  },
  emerald: {
    bg: "from-[#edfaf4] to-[#b8ecd6]",
    border: "border-emerald-400/70 hover:border-emerald-500",
    badgeBg: "bg-emerald-100", badgeText: "text-emerald-700",
    iconBg: "bg-emerald-50 border-emerald-200",
    title: "text-emerald-900",
    glow: "hover:shadow-[0_16px_50px_rgba(16,185,100,0.40)]",
    shine: "from-emerald-100/60",
  },
  wine: {
    bg: "from-[#fdf0f7] to-[#f8c8e4]",
    border: "border-pink-400/70 hover:border-pink-500",
    badgeBg: "bg-pink-100", badgeText: "text-pink-700",
    iconBg: "bg-pink-50 border-pink-200",
    title: "text-pink-900",
    glow: "hover:shadow-[0_16px_50px_rgba(220,80,140,0.40)]",
    shine: "from-pink-100/60",
  },
};

export const GiftCardRack = forwardRef<HTMLDivElement, GiftCardRackProps>(
  ({ cards, walletState, onSelectCard }, ref) => {
    const isOpen    = walletState === "open";
    const isOpening = walletState === "opening";
    const show      = isOpen || isOpening;
    const cW = 148, cH = 200;

    return (
      <div ref={ref} data-testid="gift-card-rack"
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width:"1px", height:"1px" }}
      >
        {cards.map((card, i) => {
          const s  = SLOTS[i] ?? { rot:0, x:0, y:0 };
          const th = THEMES[card.colorTheme] ?? THEMES.gold;
          return (
            <motion.button key={card.id} type="button" disabled={!isOpen}
              onClick={() => onSelectCard(card)}
              aria-label={`Xem voucher: ${card.title}`}
              whileHover={isOpen ? { y:-22, scale:1.10, zIndex:50, rotate:0, transition:{duration:.22} } : {}}
              whileTap={isOpen ? { scale:.95 } : {}}
              className={`gift-card-item absolute origin-bottom rounded-2xl border shadow-[0_10px_40px_rgba(0,0,0,0.40)] transition-[border,box-shadow] duration-300 focus:outline-none focus:ring-2 focus:ring-rose/50 ${th.border} ${th.glow} ${show?"pointer-events-auto cursor-pointer":"pointer-events-none"}`}
              style={{
                width:`${cW}px`, height:`${cH}px`,
                left:"50%", top:"0", marginLeft:`-${cW/2}px`,
                zIndex:10+i,
                transform: show
                  ? `translate(${s.x}px,${s.y}px) rotate(${s.rot}deg)`
                  : `translate(0px,90px) rotate(${s.rot*.15}deg) scale(.25)`,
                opacity: show ? 1 : 0,
                transition:`transform .72s cubic-bezier(.34,1.5,.64,1) ${isOpening?.26+i*.12:0}s, opacity .42s ease ${isOpening?.23+i*.12:0}s`,
              }}
            >
              <div className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[14px] bg-gradient-to-b ${th.bg} p-4`}>
                {/* Top shine */}
                <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[14px] bg-gradient-to-b ${th.shine} to-transparent`} />
                {/* Inner border */}
                <div aria-hidden className="pointer-events-none absolute inset-[3px] rounded-[11px] border border-white/80" />

                {/* Icon big */}
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm text-2xl ${th.iconBg}`}>
                  {card.icon}
                </div>

                {/* Badge */}
                <span className={`mb-3 inline-flex w-fit rounded-md px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-widest ${th.badgeBg} ${th.badgeText}`}>
                  {card.badge}
                </span>

                {/* Title — large font matching app */}
                <p className={`flex-1 font-display text-base font-semibold leading-snug ${th.title} group-hover:opacity-80 transition-opacity`}>
                  {card.title}
                </p>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-black/8 pt-2.5">
                  <span className="font-body text-[10px] text-gray-400">chạm để xem</span>
                  <span className="text-xs text-gray-300 transition-transform group-hover:translate-x-0.5">↗</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }
);
GiftCardRack.displayName = "GiftCardRack";
export default GiftCardRack;
