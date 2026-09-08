import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA, type GiftCardData } from "@/data/birthdayContent";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import LeatherWallet from "./wallet/LeatherWallet";
import MoneyFan from "./wallet/MoneyFan";
import GiftCardRack from "./wallet/GiftCardRack";
import GiftCardModal from "./wallet/GiftCardModal";
import type { WalletOpenState } from "./wallet/wallet.types";

export default function WalletSection({ onComplete }: { onComplete: () => void }) {
  const { isActive } = useChapterLifecycle(2);
  const { wallet } = BIRTHDAY_DATA;

  // Session state: starts closed on first visit; once opened, persists through return visits
  const [walletState, setWalletState] = useState<WalletOpenState>("closed");
  const [hasOpened, setHasOpened] = useState<boolean>(false);
  const [isCtaReady, setIsCtaReady] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<GiftCardData | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Track viewport size for mobile layout adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Return-visit persistence: keep open if already opened in this session
  useEffect(() => {
    if (hasOpened && walletState !== "open") {
      setWalletState("open");
      setIsCtaReady(true);
    }
  }, [hasOpened, walletState]);

  const handleOpenWallet = useCallback(() => {
    if (walletState !== "closed") return;

    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReducedMotion) {
      setWalletState("open");
      setHasOpened(true);
      setIsCtaReady(true);
      return;
    }

    setWalletState("opening");
    const timer = setTimeout(() => {
      setWalletState("open");
      setHasOpened(true);
      setIsCtaReady(true);
    }, 1100);

    return () => clearTimeout(timer);
  }, [walletState]);

  const handleSelectCard = useCallback((card: GiftCardData) => {
    setSelectedCard(card);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const isOpen = walletState === "open";
  const isOpening = walletState === "opening";
  const showContents = isOpen || isOpening;

  return (
    <section
      data-testid="wallet-section"
      className="relative flex min-h-screen min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-20 transition-colors duration-700"
      style={{
        background:
          "radial-gradient(120% 95% at 50% 35%, #2b0714 0%, #1b040d 55%, #0a0105 100%)",
      }}
    >
      {/* Chapter identifier badge */}
      <div className="mb-3 font-body text-[10px] uppercase tracking-[0.45em] text-gold/70 sm:text-xs">
        {wallet.chapter}
      </div>

      {/* Narrative Section Heading */}
      <h2 className="mb-8 max-w-xl text-center font-display text-3xl font-light leading-tight text-cream sm:mb-12 sm:text-4xl md:text-5xl">
        {wallet.heading}
        <span className="mt-2 block font-hand text-xl text-rose sm:mt-3 sm:text-2xl drop-shadow-sm">
          {wallet.subtitle}
        </span>
      </h2>

      {/* ── Center Stage: Physical Leather Wallet & Contents ── */}
      <div className="relative mb-6 mt-14 flex h-64 w-full max-w-sm items-center justify-center sm:mb-8 sm:mt-20 sm:h-72">
        <LeatherWallet
          walletState={walletState}
          onOpen={handleOpenWallet}
          openPrompt={wallet.openPrompt}
          tagline={wallet.walletTag ?? "quỹ chiều em"}
          isMobile={isMobile}
        >
          {/* Fanned Banknotes (Layer 5) */}
          <MoneyFan walletState={walletState} isMobile={isMobile} />

          {/* Interactive Gift Voucher Cards (Layer 6) */}
          <GiftCardRack
            cards={wallet.cards}
            walletState={walletState}
            isMobile={isMobile}
            onSelectCard={handleSelectCard}
          />
        </LeatherWallet>
      </div>

      {/* ── Message & Next-Chapter CTA (Gated until wallet opening completes) ── */}
      <AnimatePresence>
        {isCtaReady && (
          <motion.div
            data-testid="wallet-cta-group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-2 flex flex-col items-center text-center sm:mt-4"
          >
            {/* Playful hint to explore vouchers */}
            <p className="mb-3 font-hand text-base text-gold/90 sm:text-lg">
              {wallet.cardsPrompt}
            </p>

            {/* Thoughtful message */}
            <p className="max-w-md font-body text-xs sm:text-sm leading-relaxed text-cream-dim">
              {wallet.messagePrefix}
              <span className="text-gold font-medium">
                {wallet.messageHighlight}
              </span>
            </p>

            {/* Advance to Chapter 03 (Letter) */}
            <motion.button
              type="button"
              data-testid="wallet-next-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              aria-label={wallet.cta}
              className="group mt-6 sm:mt-7 flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-7 py-3.5 sm:px-8 sm:py-4 font-body text-xs sm:text-sm uppercase tracking-[0.25em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold/15 cursor-pointer shadow-[0_0_25px_-5px_rgba(231,185,106,0.25)]"
            >
              <span>{wallet.cta}</span>
              <span className="transition-transform group-hover:translate-y-1">↓</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Card Inspection Dialog Modal ── */}
      <GiftCardModal card={selectedCard} onClose={handleCloseModal} />
    </section>
  );
}
