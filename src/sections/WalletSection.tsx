import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA, type GiftCardData } from "@/data/birthdayContent";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import LoveLetter from "./wallet/LoveLetter";
import GiftCardRack from "./wallet/GiftCardRack";
import GiftCardModal from "./wallet/GiftCardModal";
import type { WalletOpenState } from "./wallet/wallet.types";

/* ──────────────────────────────────────────
   ASSET PATH
   ────────────────────────────────────────── */
const A = "/assets/envelope-voucher/chapter02_envelope_final_assets/chapter02_envelope_final_assets";

/* ──────────────────────────────────────────
   ORNAMENT FRAME
   Positioned relative to the ENVELOPE,
   not the viewport.
   Frame box ≈ envelope visual bounds + margin.
   ────────────────────────────────────────── */
function EnvelopeOrnamentFrame() {
  // LoveLetter renders at W=460, H=540 (H+220). Scale 0.88 → visual ~405×475.
  // Frame: envelope visual + ~60px each side horiz, ~50px each side vert.
  // We express as CSS so it scales fluidly.
  const CORNER_LINE = "rgba(190,158,105,0.36)";

  return (
    /*
      This div is centred over the envelope artwork by the parent.
      absolute inset-0 on the artwork, so the frame uses the same coordinate space.
    */
    <div
      aria-hidden
      className="pointer-events-none select-none absolute inset-0"
      style={{ animation: "fadeIn 0.6s ease-out both" }}
    >

      {/* ── Top ornament — centred, above envelope top ── */}
      {/* Sits between the two upper corner ornaments */}
      <img
        src={`${A}/ornament-top.png`}
        alt=""
        className="absolute left-1/2 -translate-x-1/2 hidden sm:block"
        style={{
          /* ~50px above frame top; negative top pulls it up */
          top: "-12px",
          width: "clamp(130px, 14vw, 195px)",
          opacity: 0.70,
        }}
        draggable={false}
      />

      {/* ── Corner TL ── */}
      <img src={`${A}/corner-tl.png`} alt=""
        className="absolute"
        style={{ top: 0, left: 0, width: "clamp(72px, 5.5vw, 106px)", opacity: 0.78 }}
        draggable={false}
      />
      {/* TL frame lines */}
      <div style={{
        position: "absolute", top: "clamp(72px,5.5vw,106px)", left: 0,
        width: "clamp(70px,8vw,130px)", height: "1px",
        background: `linear-gradient(to right, ${CORNER_LINE}, transparent)`,
      }} />
      <div style={{
        position: "absolute", top: 0, left: "clamp(72px,5.5vw,106px)",
        width: "1px", height: "clamp(70px,8vw,120px)",
        background: `linear-gradient(to bottom, ${CORNER_LINE}, transparent)`,
      }} />

      {/* ── Corner TR ── */}
      <img src={`${A}/corner-tr.png`} alt=""
        className="absolute"
        style={{ top: 0, right: 0, width: "clamp(72px, 5.5vw, 106px)", opacity: 0.78 }}
        draggable={false}
      />
      {/* TR frame lines */}
      <div style={{
        position: "absolute", top: "clamp(72px,5.5vw,106px)", right: 0,
        width: "clamp(70px,8vw,130px)", height: "1px",
        background: `linear-gradient(to left, ${CORNER_LINE}, transparent)`,
      }} />
      <div style={{
        position: "absolute", top: 0, right: "clamp(72px,5.5vw,106px)",
        width: "1px", height: "clamp(70px,8vw,120px)",
        background: `linear-gradient(to bottom, ${CORNER_LINE}, transparent)`,
      }} />

      {/* ── Corner BL ── */}
      <img src={`${A}/corner-bl.png`} alt=""
        className="absolute"
        style={{ bottom: 0, left: 0, width: "clamp(72px, 5.5vw, 106px)", opacity: 0.78 }}
        draggable={false}
      />
      {/* BL frame lines */}
      <div style={{
        position: "absolute", bottom: "clamp(72px,5.5vw,106px)", left: 0,
        width: "clamp(70px,8vw,130px)", height: "1px",
        background: `linear-gradient(to right, ${CORNER_LINE}, transparent)`,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: "clamp(72px,5.5vw,106px)",
        width: "1px", height: "clamp(70px,8vw,120px)",
        background: `linear-gradient(to top, ${CORNER_LINE}, transparent)`,
      }} />

      {/* ── Corner BR ── */}
      <img src={`${A}/corner-br.png`} alt=""
        className="absolute"
        style={{ bottom: 0, right: 0, width: "clamp(72px, 5.5vw, 106px)", opacity: 0.78 }}
        draggable={false}
      />
      {/* BR frame lines */}
      <div style={{
        position: "absolute", bottom: "clamp(72px,5.5vw,106px)", right: 0,
        width: "clamp(70px,8vw,130px)", height: "1px",
        background: `linear-gradient(to left, ${CORNER_LINE}, transparent)`,
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: "clamp(72px,5.5vw,106px)",
        width: "1px", height: "clamp(70px,8vw,120px)",
        background: `linear-gradient(to top, ${CORNER_LINE}, transparent)`,
      }} />

    </div>
  );
}

/* ──────────────────────────────────────────
   SECTION
   ────────────────────────────────────────── */
export default function WalletSection({ onComplete }: { onComplete: () => void }) {
  const { isActive } = useChapterLifecycle(2);
  const { wallet }   = BIRTHDAY_DATA;

  const [walletState, setWalletState] = useState<WalletOpenState>("closed");
  const [hasOpened,   setHasOpened]   = useState(false);
  const [isCtaReady,  setIsCtaReady]  = useState(false);
  const [selectedCard,setSelectedCard]= useState<GiftCardData | null>(null);
  const openingTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(openingTimer.current), []);

  useEffect(() => {
    if (hasOpened && walletState !== "open") {
      setWalletState("open"); setIsCtaReady(true);
    }
  }, [hasOpened, walletState]);

  const handleOpen = useCallback(() => {
    if (walletState !== "closed") return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setWalletState("open"); setHasOpened(true); setIsCtaReady(true); return; }
    setWalletState("opening");
    openingTimer.current = window.setTimeout(() => {
      setWalletState("open"); setHasOpened(true); setIsCtaReady(true);
    }, 1100);
  }, [walletState]);

  const handleSelectCard = useCallback((c: GiftCardData) => setSelectedCard(c), []);
  const handleCloseModal = useCallback(() => setSelectedCard(null), []);
  const showContents = walletState === "open" || walletState === "opening";

  return (
    <section
      data-testid="wallet-section"
      className="wallet-scene relative w-full overflow-hidden"
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(125% 100% at 65% 50%, #2b0714 0%, #1b040d 42%, #0d0208 75%, #070106 100%)",
      }}
    >
      {/* ── z-0: Atmosphere ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Rose haze right */}
        <div className="absolute right-0 top-0 h-full w-3/5"
          style={{ background: "radial-gradient(ellipse 80% 65% at 75% 52%, rgba(150,25,55,0.22) 0%, transparent 72%)" }}
        />
        {/* Gold warmth left */}
        <div className="absolute left-0 top-0 h-full w-2/5"
          style={{ background: "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(160,90,30,0.10) 0%, transparent 70%)" }}
        />
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 105% 105% at 50% 50%, transparent 42%, rgba(0,0,0,0.55) 100%)" }}
        />
        {/* Micro-dots */}
        {[
          { t:"7%",  l:"8%",  s:2,   o:.18, d:"0s"   },
          { t:"18%", l:"52%", s:1.5, o:.11, d:".7s"  },
          { t:"68%", l:"6%",  s:1.5, o:.14, d:"1.2s" },
          { t:"12%", l:"72%", s:2,   o:.14, d:".4s"  },
          { t:"78%", l:"93%", s:2,   o:.13, d:"1.5s" },
          { t:"86%", l:"60%", s:1.5, o:.10, d:".55s" },
        ].map((d, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ top:d.t, left:d.l, width:`${d.s}px`, height:`${d.s}px`,
              background:"#e18aa0", opacity:d.o,
              boxShadow:`0 0 ${d.s*5}px ${d.s*2}px rgba(225,138,160,0.4)`,
              animation:`floaty ${3.5+i*.5}s ease-in-out ${d.d} infinite` }}
          />
        ))}
      </div>

      {/* ── z-2: Main two-column layout ── */}
      <div className="relative z-[2] grid min-h-[100svh] w-full grid-cols-1 md:grid-cols-2">

        {/* ════ LEFT: Chapter · Heading · CTA ════ */}
        <div className="flex flex-col items-start justify-center
          px-10 py-20 sm:px-14 lg:px-20 xl:px-28
          md:border-r md:border-white/[0.05]"
        >
          <motion.p
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.15, duration:.6 }}
            className="mb-6 font-body text-[10px] font-semibold uppercase tracking-[0.42em] text-gold/50"
          >
            {wallet.chapter}
          </motion.p>

          <motion.h2
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.28, duration:.75 }}
            className="mb-5 font-display font-light leading-[1.08] text-cream
              text-4xl sm:text-5xl lg:text-[clamp(2.8rem,4.2vw,3.8rem)]"
          >
            {wallet.heading}
          </motion.h2>

          <motion.p
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.42, duration:.7 }}
            className="mb-10 font-hand text-2xl text-rose/80 drop-shadow-sm sm:text-3xl"
          >
            {wallet.subtitle}
          </motion.p>

          {/* Gold divider */}
          <motion.div
            initial={{ opacity:0, scaleX:0 }} animate={{ opacity:1, scaleX:1 }}
            transition={{ delay:.58, duration:.7 }}
            className="mb-10 h-px w-14 origin-left bg-gradient-to-r from-gold/35 to-transparent"
          />

          {/* Dynamic CTA / hint */}
          <AnimatePresence mode="wait">
            {isCtaReady ? (
              <motion.div key="cta"
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:.65 }}
                className="flex flex-col items-start gap-5"
              >
                <p className="font-hand text-xl text-rose/70 sm:text-2xl">
                  {wallet.cardsPrompt}
                </p>
                <p className="max-w-xs font-body text-sm leading-relaxed text-cream-dim/75 sm:text-base sm:max-w-sm">
                  {wallet.messagePrefix}
                  <span className="font-medium text-gold/85">{wallet.messageHighlight}</span>
                </p>
                <div className="h-px w-8 bg-gradient-to-r from-rose/25 to-transparent" />
                <motion.button
                  type="button"
                  data-testid="wallet-next-btn"
                  whileHover={{ scale:1.04, x:4 }}
                  whileTap={{ scale:.97 }}
                  onClick={onComplete}
                  aria-label={wallet.cta}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-full
                    border border-rose/28 bg-transparent
                    px-8 py-3.5 font-body text-[10px] uppercase tracking-[0.3em] text-rose/70
                    transition-all duration-300
                    hover:border-rose/50 hover:bg-rose/[0.06]
                    cursor-pointer
                    shadow-[0_0_22px_-8px_rgba(225,138,160,0.30)]
                    hover:shadow-[0_0_34px_-6px_rgba(225,138,160,0.46)]"
                >
                  <span aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full
                      bg-gradient-to-r from-transparent via-rose/5 to-transparent
                      transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <span>{wallet.cta}</span>
                  <span className="opacity-50 transition-transform group-hover:translate-y-0.5">↓</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.p key="hint"
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay:.9, duration:.9 }}
                className="font-hand text-base italic text-cream-dim/25 sm:text-lg"
              >
                chạm vào phong thư để mở quà ✉️
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ════ RIGHT: Envelope + ornament frame ════ */}
        <div
          className="relative flex items-center justify-center py-16 md:py-0"
          data-wallet-state={walletState}
        >
          {/*
            ENVELOPE FRAME SCENE
            This box is sized to hug the envelope's visual bounds.
            LoveLetter: 460×540px at scale 0.88 → ~405×475 visual.
            Frame: +60px/side horiz, +55px/side vert → ~525×585px.
            On desktop we use a fixed px box; let it clip safely.
          */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width:  "clamp(360px, 46vw, 530px)",
              height: "clamp(480px, 62vh, 595px)",
            }}
          >
            {/* Ornament frame — positioned within this box */}
            <EnvelopeOrnamentFrame />

            {/* Envelope artwork — centred, scaled to breathe within frame */}
            <div
              className="relative z-[1]"
              style={{ transform: "scale(0.84)", transformOrigin: "center center" }}
            >
              {/* Floor glow after open */}
              <AnimatePresence>
                {showContents && (
                  <motion.div
                    aria-hidden
                    initial={{ opacity:0, scale:.3 }}
                    animate={{ opacity:1, scale:1 }}
                    exit={{ opacity:0 }}
                    transition={{ duration:1.1 }}
                    className="pointer-events-none absolute bottom-[14%] left-1/2 -translate-x-1/2 z-0"
                    style={{
                      width:"440px", height:"80px",
                      background:"radial-gradient(ellipse, rgba(225,138,160,0.24) 0%, rgba(231,185,106,0.05) 55%, transparent 80%)",
                      filter:"blur(28px)",
                    }}
                  />
                )}
              </AnimatePresence>

              <LoveLetter
                walletState={walletState}
                onOpen={handleOpen}
                openPrompt={wallet.openPrompt}
              >
                <GiftCardRack
                  cards={wallet.cards}
                  walletState={walletState}
                  onSelectCard={handleSelectCard}
                />
              </LoveLetter>
            </div>
          </div>
        </div>

      </div>

      <GiftCardModal card={selectedCard} onClose={handleCloseModal} />
    </section>
  );
}
