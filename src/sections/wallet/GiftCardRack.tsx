import { forwardRef } from "react";
import type { GiftCardData } from "@/data/birthdayContent";
import type { WalletOpenState } from "./wallet.types";
import { GIFT_CARD_SLOTS, GIFT_CARD_SLOTS_MOBILE } from "./walletConfig";

interface GiftCardRackProps {
  cards: GiftCardData[];
  walletState: WalletOpenState;
  isMobile?: boolean;
  onSelectCard: (card: GiftCardData) => void;
}

const COLOR_MAP: Record<
  string,
  { bg: string; border: string; badge: string; text: string }
> = {
  rose: {
    bg: "from-[#2b151b] via-[#3d1a24] to-[#1f0e13]",
    border: "border-rose/50 hover:border-rose",
    badge: "bg-rose/20 text-rose border-rose/30",
    text: "text-rose-100",
  },
  gold: {
    bg: "from-[#291e12] via-[#3d2c18] to-[#1e150b]",
    border: "border-gold/50 hover:border-gold",
    badge: "bg-gold/20 text-gold border-gold/30",
    text: "text-gold-100",
  },
  emerald: {
    bg: "from-[#11261d] via-[#1a382b] to-[#0b1a13]",
    border: "border-emerald-500/50 hover:border-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    text: "text-emerald-100",
  },
  wine: {
    bg: "from-[#2d111c] via-[#421727] to-[#1e0911]",
    border: "border-rose-400/50 hover:border-rose-400",
    badge: "bg-rose-400/20 text-rose-300 border-rose-400/30",
    text: "text-rose-100",
  },
};

export const GiftCardRack = forwardRef<HTMLDivElement, GiftCardRackProps>(
  ({ cards, walletState, isMobile = false, onSelectCard }, ref) => {
    const isOpen = walletState === "open";
    const isOpening = walletState === "opening";
    const showCards = isOpen || isOpening;
    const slots = isMobile ? GIFT_CARD_SLOTS_MOBILE : GIFT_CARD_SLOTS;

    return (
      <div
        ref={ref}
        data-testid="gift-card-rack"
        className="absolute left-1/2 top-14 z-[8] -translate-x-1/2"
      >
        {cards.map((card, index) => {
          const slot = slots[index] || { rot: 0, x: 0, y: 0 };
          const theme = COLOR_MAP[card.colorTheme] || COLOR_MAP.gold;

          return (
            <button
              key={card.id}
              type="button"
              data-card-id={card.id}
              disabled={!isOpen}
              onClick={() => onSelectCard(card)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCard(card);
                }
              }}
              aria-label={`Mở voucher: ${card.title}`}
              className={`gift-card-item group absolute left-1/2 top-0 origin-bottom cursor-pointer rounded-lg border p-2 text-left shadow-lg transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-gold ${
                theme.border
              } ${
                showCards
                  ? "pointer-events-auto hover:-translate-y-3 hover:scale-105 hover:shadow-gold/20 hover:z-20"
                  : "pointer-events-none"
              }`}
              style={{
                width: isMobile ? "78px" : "92px",
                height: isMobile ? "74px" : "86px",
                marginLeft: isMobile ? "-39px" : "-46px",
                zIndex: 10 + index,
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                transform: showCards
                  ? `translate(${slot.x}px, ${slot.y}px) rotate(${slot.rot}deg)`
                  : `translate(0px, 0px) rotate(0deg) scale(0.6)`,
                opacity: showCards ? 1 : 0,
                transitionDelay: isOpening ? `${0.35 + index * 0.08}s` : "0s",
              }}
            >
              {/* Background gradient container */}
              <div
                className={`flex h-full w-full flex-col justify-between rounded-md bg-gradient-to-br ${theme.bg} p-1.5`}
              >
                {/* Header with Icon & Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs">{card.icon}</span>
                  <span
                    className={`rounded-[3px] border px-1 py-[1px] font-mono text-[7px] uppercase tracking-wider ${theme.badge}`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Card Title */}
                <div className="my-auto">
                  <p className="line-clamp-2 font-display text-[9px] font-semibold leading-tight text-cream group-hover:text-gold sm:text-[10px]">
                    {card.title}
                  </p>
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-between text-[6px] font-medium text-cream-dim/60">
                  <span>chạm xem</span>
                  <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

GiftCardRack.displayName = "GiftCardRack";
export default GiftCardRack;
