import { useState, useCallback, useLayoutEffect, useRef, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useSceneExperience } from "@/components/effects/SceneExperience";
import { useScenePreferences } from "@/components/effects/useScenePreferences";
import { useChapterFlow } from "@/chapters/useChapterFlow";
import "./finale-scene.css";

const CONFETTI_COLORS = ["#e7b96a", "#e18aa0", "#dfb77d", "#f4ece4", "#f0c04a", "#c97086"];

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => {
  const angle = (i / 50) * Math.PI * 2;
  const velocity = 180 + (i % 7) * 45;
  const pseudoX = Math.cos(angle) * velocity;
  const pseudoY = -120 + Math.sin(angle) * velocity * 0.7;
  const pseudoRot = ((i * 47) % 720) - 360;

  return {
    id: i,
    x: pseudoX,
    y: pseudoY + 220,
    rotate: pseudoRot,
    duration: 1.8 + (i % 5) * 0.3,
    delay: (i % 6) * 0.04,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  };
});

export default function FinaleSection({ onComplete }: { onComplete?: () => void } = {}) {
  const { celebrate } = useSceneExperience();
  const { mobile, reducedMotion } = useScenePreferences();
  const { goTo } = useChapterFlow();
  const [blown, setBlown] = useState(false);
  const [cakeFailed, setCakeFailed] = useState(false);
  const blowButton = useRef<HTMLButtonElement>(null);
  const reigniteButton = useRef<HTMLButtonElement>(null);
  const transferFocus = useRef(false);
  const { finale } = BIRTHDAY_DATA;

  useLayoutEffect(() => {
    if (!transferFocus.current) return;
    transferFocus.current = false;
    (blown ? reigniteButton : blowButton).current?.focus({ preventScroll: true });
  }, [blown]);

  const handleBlow = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (blown) return;
    // Only move focus when the control that owns it is about to disappear.
    transferFocus.current = event.currentTarget === blowButton.current && document.activeElement === event.currentTarget;
    setBlown(true);
    celebrate();
    onComplete?.();
  }, [blown, celebrate, onComplete]);

  const handleReignite = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    transferFocus.current = document.activeElement === event.currentTarget;
    setBlown(false);
  }, []);

  return (
    <section
      className="finale-scene celebration-scene"
      data-blown={blown ? "true" : "false"}
      aria-label={finale.chapter}
    >
      <p className="sr-only" role="status" aria-atomic="true">
        {blown ? "Nến đã tắt. Điều ước đã được gửi đi. Chúc mừng sinh nhật em mèo!" : "Nến đang sáng, nhắm mắt ước một điều nha."}
      </p>
      {/* Golden memory thread leading across from previous chapter */}
      <svg className="finale-thread" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path
          pathLength="1"
          d="M-30 420C210 540 380 260 620 480S880 720 1140 560S1360 380 1470 510"
        />
      </svg>

      {/* Atmospheric starlight particles */}
      <div className="celebration-stars" aria-hidden="true">
        {Array.from({ length: mobile ? 12 : 24 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${7 + ((i * 37) % 86)}%`,
              top: `${12 + ((i * 23) % 76)}%`,
              animationDelay: `${-i * 0.65}s`,
            }}
          />
        ))}
      </div>

      {/* Scene Header */}
      <header className="finale-header">
        <span>CHƯƠNG 06 / ƯỚC MỘT ĐIỀU NHA</span>
      </header>

      {/* Main content grid */}
      <div className="finale-main">
        {/* Left Column: Typography & Affectionate Copy */}
        <div className="finale-copy">
          {!blown ? (
            <>

              <h2>
                Thổi nến<br />và ước đi em,<br />
                <em>phần còn lại,<br />để tui lo.</em>
              </h2>
              <p className="finale-body">
                Một tuổi mới bình an và thật nhiều niềm vui nha em mèo.
              </p>

            </>
          ) : (
            <>

              <h2>
                Chúc mừng<br />
                sinh nhật<br />
                <em>em mèo ♡</em>
              </h2>
              <blockquote className="finale-quote" data-mascot-obstacle>
                "{finale.quote}"
              </blockquote>
              <p className="finale-body">
                {finale.body}
              </p>

            </>
          )}
        </div>

        {/* Right Column: The Birthday Cake Centerpiece */}
        <div className="finale-centerpiece">
          <div data-mascot-obstacle className={`cake-altar${cakeFailed ? '' : ' cake-altar--patisserie'}`}>
            {/* Ambient candlelight illumination */}
            <div className="candle-aura" aria-hidden="true" />

            {/* Candle with living flame & wisp of smoke */}
            <button
              type="button"
              className="birthday-candle"
              onClick={handleBlow}
              aria-disabled={blown}
              aria-label={blown ? "Nến đã thổi" : "Chạm để thổi nến"}
            >
              <div className="candle-flame-wrap">
                <svg className="candle-flame" viewBox="0 0 24 36" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="flame-outer" x1="12" y1="2" x2="12" y2="31" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fff2a8" />
                      <stop offset="40%" stopColor="#ff9a3c" />
                      <stop offset="100%" stopColor="#e5383b" />
                    </linearGradient>
                    <linearGradient id="flame-inner" x1="12" y1="12" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#ffea79" />
                      <stop offset="100%" stopColor="#ffb703" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2C12 2 5 13 5 22C5 26.9706 8.13401 31 12 31C15.866 31 19 26.9706 19 22C19 13 12 2 12 2Z"
                    fill="url(#flame-outer)"
                  />
                  <path
                    d="M12 12C12 12 8 18 8 23C8 26 9.79 28 12 28C14.21 28 16 26 16 23C16 18 12 12 12 12Z"
                    fill="url(#flame-inner)"
                  />
                </svg>

                {/* Delicate smoke wisp after blowing */}
                <svg className="smoke-wisp" viewBox="0 0 28 48" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="smoke-grad" x1="14" y1="46" x2="12" y2="2" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#dfb77d" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#f5e4cd" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M14 46C14 46 8 36 18 26C28 16 16 8 12 2"
                    stroke="url(#smoke-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="candle-wick" aria-hidden="true" />
              <div className="candle-stick" aria-hidden="true" />
            </button>

            {/* Artisanal Birthday Cake */}
            {!cakeFailed && <div className="birthday-cake birthday-cake--patisserie">
              <img src="/assets/birthday-cake/ivory-wine-cake.webp" width="1254" height="1254"
                alt="Bánh sinh nhật hai tầng kem ngà và đỏ rượu, hoa đường trắng trên đế đồng"
                decoding="async" onError={() => setCakeFailed(true)} />
            </div>}
            {cakeFailed && <div className="birthday-cake" aria-hidden="true">
              {/* Top Tier */}
              <div className="cake-tier--top">
                <div className="cake-drips">
                  <span /><span /><span /><span /><span />
                </div>
              </div>

              {/* Bottom Tier */}
              <div className="cake-tier--bottom">
                <div className="cake-decorations">
                  <span>✨</span>
                  <span>🤍</span>
                  <span>✨</span>
                </div>
              </div>

              {/* Porcelain / Gold rim Pedestal */}
              <div className="cake-pedestal" />
            </div>}

            {/* Confetti burst celebration */}
            <AnimatePresence>
              {blown && !reducedMotion && (
                <div className="finale-confetti-container" aria-hidden="true">
                  {CONFETTI_PIECES.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.2 }}
                      animate={{
                        x: c.x,
                        y: c.y,
                        rotate: c.rotate,
                        scale: 1,
                        opacity: [1, 1, 0],
                      }}
                      transition={{ duration: c.duration, delay: c.delay, ease: "easeOut" }}
                      className="confetti-piece"
                      style={{ background: c.color }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Action Controls */}
          <div className="finale-controls">
          {!blown ? (
            <>
              <button
                ref={blowButton}
                className="candle-blow-action"
                onClick={handleBlow}
                aria-label="Thổi nến sinh nhật"
              >
                <span className="blow-pulse" aria-hidden="true" />
                <span>CHẠM ĐỂ THỔI NẾN ✨</span>
              </button>

            </>
          ) : (
            <div className="blown-actions">
              <button
                ref={reigniteButton}
                className="reignite-btn"
                onClick={handleReignite}
                aria-label="Thắp lại nến"
              >
                <i aria-hidden="true">🔥</i> Thắp nến lại
              </button>
              <button
                className="revisit-btn"
                onClick={() => goTo(0)}
                aria-label="Xem lại từ đầu"
              >
                <i aria-hidden="true">↺</i> Xem lại từ đầu
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Scene Footer */}
      <footer className="finale-footer">
        <span>{finale.footerBadge}</span>

      </footer>
    </section>
  );
}
