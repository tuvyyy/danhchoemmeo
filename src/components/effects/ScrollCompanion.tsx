import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChapterFlow } from "@/chapters/useChapterFlow";

interface CompanionConfig {
  chapter: number;
  name: string;
  badge: string;
  speech: string;
  altSpeeches: string[];
  icon: string;
  propEmoji: string;
  side: "left" | "right";
  // Coordinates formatted as CSS transform offsets
  xDesktop: string;
  yDesktop: string;
  xMobile: string;
  yMobile: string;
  glowColor: string;
}

const COMPANION_CONFIGS: CompanionConfig[] = [
  // 0. Hero (Mở đầu - Phi công tình yêu Nam ➔ Bắc)
  {
    chapter: 0,
    name: "Phi công tình yêu",
    badge: "✈️ SÀI GÒN ➔ HÀ NỘI",
    speech: "Tui bay từ Nam ra Bắc tìm em mèo nè~ 🐷✈️",
    altSpeeches: [
      "Hành trình 1,730 km vì tình yêu! 💖",
      "Hà Nội ơi, tui tới với mèo đâyyy! 🐱",
      "Em mèo sinh nhật vui vẻ nha~ 🌸",
    ],
    icon: "🐷",
    propEmoji: "✈️",
    side: "right",
    xDesktop: "calc(100vw - 115px)",
    yDesktop: "34vh",
    xMobile: "calc(100vw - 58px)",
    yMobile: "24vh",
    glowColor: "rgba(235, 120, 160, 0.45)",
  },
  // 1. Flowers (Hoa - Bé heo ngắm hoa bách hợp nở)
  {
    chapter: 1,
    name: "Bé Heo ngắm hoa",
    badge: "🌸 HOA TẶNG EM",
    speech: "Đóa bách hợp nở rộ tặng riêng em mèo đó! 🌸",
    altSpeeches: [
      "Bông hoa đẹp nhất cũng không bằng mèo! ✨",
      "Em có thấy cánh hoa hé nở lộng lẫy hông? 🌷",
      "Mỗi cánh hoa là một lời chúc yêu thương 🤍",
    ],
    icon: "🐷",
    propEmoji: "🌸",
    side: "left",
    xDesktop: "44px",
    yDesktop: "46vh",
    xMobile: "12px",
    yMobile: "44vh",
    glowColor: "rgba(244, 143, 177, 0.5)",
  },
  // 2. Wallet (Lì xì - Bé heo giữ quỹ chiều chuộng)
  {
    chapter: 2,
    name: "Bé Heo Thần Tài",
    badge: "💰 QUỸ CHIỀU EM",
    speech: "Quỹ yêu chiều em mèo 100% full bảo hành! 🧧",
    altSpeeches: [
      "Lì xì tuổi 21 may mắn ngập tràn nè! 🧧",
      "Muốn ăn gì, mua gì cứ bảo tui lo nha! 💸",
      "Voucher này có hạn sử dụng trọn đời! 💖",
    ],
    icon: "🐷",
    propEmoji: "🧧",
    side: "right",
    xDesktop: "calc(100vw - 115px)",
    yDesktop: "24vh",
    xMobile: "calc(100vw - 58px)",
    yMobile: "16vh",
    glowColor: "rgba(231, 185, 106, 0.5)",
  },
  // 3. Letter (Lá thư - Bé heo đưa thư tình)
  {
    chapter: 3,
    name: "Sứ giả đưa thư",
    badge: "💌 THƯ TÌNH",
    speech: "Từng nét chữ viết tay đều là thương em nhiều lắm... ✍️",
    altSpeeches: [
      "Mở thư ra đọc nha em yêu ơi 📜",
      "Trái tim tui gửi trọn trong bức thư này 💌",
      "Thương em nhất trên đời luôn á! 🤍",
    ],
    icon: "🐷",
    propEmoji: "💌",
    side: "right",
    xDesktop: "calc(100vw - 115px)",
    yDesktop: "70vh",
    xMobile: "calc(100vw - 58px)",
    yMobile: "80vh",
    glowColor: "rgba(245, 158, 11, 0.45)",
  },
  // 4. Moments (Kỷ niệm - Bé heo nhiếp ảnh gia)
  {
    chapter: 4,
    name: "Nhiếp ảnh gia Heo",
    badge: "📸 KỶ NIỆM",
    speech: "Nụ cười của mèo là khoảnh khắc đẹp nhất thế gian! 📸",
    altSpeeches: [
      "Tách! Lưu lại nụ cười rạng rỡ của em 🌟",
      "Lật từng tấm ảnh xem kỷ niệm của chúng mình nè! 📷",
      "Mãi bên nhau như thế này nhé em 🤍",
    ],
    icon: "🐷",
    propEmoji: "📸",
    side: "left",
    xDesktop: "44px",
    yDesktop: "24vh",
    xMobile: "12px",
    yMobile: "14vh",
    glowColor: "rgba(14, 165, 233, 0.5)",
  },
  // 5. Finale (Ước - Đôi bạn sinh nhật Heo & Mèo)
  {
    chapter: 5,
    name: "Đôi bạn sinh nhật",
    badge: "🎂 HAPPY 21ST!",
    speech: "Chúc em mèo tuổi 21 rạng rỡ, bình yên và thật hạnh phúc! 💖",
    altSpeeches: [
      "Nhắm mắt lại và ước một điều thật đẹp nha em! 🕯️",
      "Thổi nến sinh nhật cùng tui nèee! 🎂🥳",
      "Yêu em mèo nhiều ơi là nhiều! 💖✨",
    ],
    icon: "🐷",
    propEmoji: "🎉",
    side: "right",
    xDesktop: "calc(100vw - 120px)",
    yDesktop: "68vh",
    xMobile: "calc(100vw - 64px)",
    yMobile: "70vh",
    glowColor: "rgba(244, 63, 94, 0.55)",
  },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function ScrollCompanion() {
  const { currentChapter } = useChapterFlow();
  const [isMobile, setIsMobile] = useState(false);
  const [showSpeech, setShowSpeech] = useState(true);
  const [speechText, setSpeechText] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTraveling, setIsTraveling] = useState(false);
  const prevChapterRef = useRef(currentChapter);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = COMPANION_CONFIGS[currentChapter] ?? COMPANION_CONFIGS[0];

  // Sync speech text and trigger transition flight stardust when chapter changes
  useEffect(() => {
    setSpeechText(config.speech);
    setShowSpeech(true);

    if (prevChapterRef.current !== currentChapter) {
      setIsTraveling(true);
      // Spawn flight trail sparkles
      const travelParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        emoji: ["✨", "✦", "💖", "🌸", "⭐"][i % 5],
      }));
      setParticles((prev) => [...prev, ...travelParticles]);

      const timer = setTimeout(() => {
        setIsTraveling(false);
        setParticles([]);
      }, 1400);

      prevChapterRef.current = currentChapter;
      return () => clearTimeout(timer);
    }
  }, [currentChapter, config]);

  // Interactive click on mascot
  const handleMascotClick = useCallback(() => {
    setClickCount((c) => c + 1);

    // Pick next speech
    const options = [config.speech, ...config.altSpeeches];
    const nextSpeech = options[(clickCount + 1) % options.length];
    setSpeechText(nextSpeech);
    setShowSpeech(true);

    // Burst celebration hearts and sparks
    const burst: Particle[] = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 70,
      y: -20 - Math.random() * 50,
      emoji: ["💖", "✨", "🌸", "🤍", "⭐"][i % 5],
    }));
    setParticles((prev) => [...prev, ...burst]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !burst.includes(p)));
    }, 1000);
  }, [clickCount, config]);

  const targetX = isMobile ? config.xMobile : config.xDesktop;
  const targetY = isMobile ? config.yMobile : config.yDesktop;

  // Flight banking rotation angle
  const isMovingLeft = config.side === "left";
  const bankingRotate = isTraveling ? (isMovingLeft ? -14 : 14) : 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="false">
      {/* The Floating Traveling Companion */}
      <motion.div
        animate={{
          x: targetX,
          y: targetY,
          rotate: bankingRotate,
        }}
        transition={{
          type: "spring",
          stiffness: 55,
          damping: 15,
          mass: 0.85,
        }}
        className="pointer-events-auto absolute left-0 top-0 flex flex-col items-center select-none"
        style={{ touchAction: "manipulation" }}
      >
        {/* Burst / Flight particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 1.3, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="pointer-events-none absolute text-xs sm:text-sm"
              style={{ filter: "drop-shadow(0 0 6px rgba(255,215,0,0.8))" }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Speech Bubble (Adaptive side based on mascot screen position) */}
        <AnimatePresence>
          {showSpeech && (
            <motion.div
              key={`speech-${currentChapter}-${speechText}`}
              initial={{ opacity: 0, scale: 0.82, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.82, y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-[-44px] sm:top-[-60px] z-50 pointer-events-auto ${
                config.side === "right"
                  ? "right-2 sm:right-4 origin-bottom-right"
                  : "left-2 sm:left-4 origin-bottom-left"
              }`}
            >
              <div
                onClick={() => setShowSpeech(false)}
                title="Bấm để ẩn hoặc đổi câu"
                className="group relative flex items-center gap-1.5 rounded-full border border-gold/40 bg-[#14081c]/95 px-2.5 py-1 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs text-cream shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md cursor-pointer hover:border-gold hover:bg-[#200d2b] max-w-[210px] sm:max-w-none"
              >
                <span className="font-hand text-[12px] sm:text-[15px] text-[#ffd6e4] leading-tight truncate sm:whitespace-nowrap">
                  {speechText}
                </span>
                <span className="text-[9px] text-gold/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </span>

                {/* Speech arrow */}
                <div
                  className={`absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-gold/40 bg-[#14081c] ${
                    config.side === "right" ? "right-6" : "left-6"
                  }`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Avatar Container */}
        <motion.button
          onClick={handleMascotClick}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          animate={{
            y: isTraveling ? [0, -12, 0] : [0, -6, 0],
          }}
          transition={{
            duration: isTraveling ? 0.8 : 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="group relative flex flex-col items-center cursor-pointer outline-none focus:outline-none"
          title="Bấm vào tui để nghe lời nhắn nha! 💖"
        >
          {/* Ambient Glow behind mascot */}
          <div
            className="absolute -inset-2 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ background: config.glowColor }}
          />

          {/* Floating Balloon / Halo Prop */}
          <div className="relative flex flex-col items-center">
            {/* Balloon / Cloud */}
            <div
              className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-md border border-white/20"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ff8da1 0%, #d83a56 70%, #85182d 100%)",
              }}
            >
              <span className="text-[10px] sm:text-xs leading-none drop-shadow-sm">
                {config.propEmoji}
              </span>
              <span className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-[#85182d]" />
            </div>

            {/* String to mascot */}
            <div className="h-3 sm:h-4 w-px bg-cream-dim/50 group-hover:bg-gold transition-colors" />

            {/* Main Piggy Character Body */}
            <div className="relative -mt-0.5 flex items-center justify-center">
              {/* Ear wiggle animation */}
              <span className="text-3xl sm:text-4xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_16px_rgba(255,182,193,0.8)] transition-all">
                {config.icon}
              </span>

              {/* Special companion at Finale (Kitty 🐱 standing beside Piggy 🐷) */}
              {currentChapter === 5 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="-ml-1 text-2xl sm:text-3xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                >
                  🐱
                </motion.span>
              )}
            </div>
          </div>

          {/* Chapter Badge Tag */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 rounded-full border border-gold/30 bg-[#160a1d]/85 px-2 py-0.5 backdrop-blur-sm shadow-sm"
          >
            <span className="font-body text-[8px] sm:text-[9px] font-semibold tracking-wider text-gold uppercase">
              {config.badge}
            </span>
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  );
}
