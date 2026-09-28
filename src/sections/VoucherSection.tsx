import { useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { useScenePreferences } from "@/components/effects/useScenePreferences";
import "./voucher/voucher.css";

const ASSET_BASE = "/assets/envelope-voucher/";

interface VoucherItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cls: string;
  delay: number;
}

const VOUCHER_LIST: VoucherItem[] = [
  {
    id: "food",
    number: "01",
    title: "Ăn ngon thoả thích",
    subtitle: "FOR: EM MÈO · VALID FOREVER",
    description: "Một bữa thật ngon, đúng món em đang thèm. Em chọn quán, chọn món — phần chiều em cứ để tui lo nha.",
    image: `${ASSET_BASE}07_voucher_01_food.png`,
    cls: "env-voucher-1",
    delay: 0.75,
  },
  {
    id: "coffee",
    number: "02",
    title: "Đi cà phê cùng nhau",
    subtitle: "FOR: EM MÈO · VALID FOREVER",
    description: "Một góc quán yên yên, món nước em thích và một buổi chẳng cần vội. Để dành hôm mình gặp nhau, ngồi kể đủ chuyện nha.",
    image: `${ASSET_BASE}08_voucher_02_coffee.png`,
    cls: "env-voucher-2",
    delay: 0.90,
  },
  {
    id: "movie",
    number: "03",
    title: "Xem phim tuỳ em chọn",
    subtitle: "FOR: EM MÈO · VALID FOREVER",
    description: "Phim tình cảm, hoạt hình hay phim em chờ mãi — hôm nay em chọn hết. Tui nhận phần bắp rang và ngồi cạnh em.",
    image: `${ASSET_BASE}09_voucher_03_movie.png`,
    cls: "env-voucher-3",
    delay: 1.05,
  },
  {
    id: "anywhere",
    number: "04",
    title: "Đi đâu cũng được",
    subtitle: "FOR: EM MÈO · VALID FOREVER",
    description: "Một vòng dạo phố hay một chuyến đi xa hơn một chút. Cứ nói nơi em muốn đến, mình cùng dành một ngày cho nơi đó.",
    image: `${ASSET_BASE}10_voucher_04_anywhere.png`,
    cls: "env-voucher-4",
    delay: 1.20,
  },
];

export default function VoucherSection({
  onComplete,
}: {
  onComplete?: (options?: { instant?: boolean }) => void;
}) {
  const { isActive } = useChapterLifecycle(2);
  const { reducedMotion } = useScenePreferences();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drawerId = useId();

  const handleSelectVoucher = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedId(null);
  }, []);

  const activeVoucher = VOUCHER_LIST.find(v => v.id === selectedId);

  return (
    <section className="chapter-voucher-section" aria-label="Chương 02 — Lì xì sinh nhật">
      <h2 className="sr-only">Chương 02 — Lì xì sinh nhật</h2>

      {/* Ambient background glow */}
      <div className="voucher-ambient-glow" aria-hidden="true" />

      {/* Header */}
      <div className="voucher-header">
        <div className="voucher-chapter-tag">CHƯƠNG 02</div>
        <span className="voucher-chapter-star" aria-hidden="true">✦</span>
      </div>

      {/* Main Open Envelope Stage */}
      <motion.div
        className={`open-envelope-stage ${selectedId ? "has-selection" : ""}`}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Layer 2: Top Flap */}
        <motion.img
          className="env-layer env-top-flap"
          src={`${ASSET_BASE}02_envelope_top_flap.png`}
          alt=""
          draggable={false}
          initial={reducedMotion ? false : { y: -10, opacity: 0.85 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Layer 3: Ivory Inner Liner */}
        <img
          className="env-layer env-inner-liner"
          src={`${ASSET_BASE}04_envelope_inner_liner.png`}
          alt=""
          draggable={false}
        />

        {/* Contents Viewport (Clipped behind pocket) */}
        <div className="env-contents-viewport">
          {/* Layer 4: Handwritten Letter (Left) */}
          <motion.img
            className="env-letter-card"
            src={`${ASSET_BASE}06_letter_note.png`}
            alt="Thư gửi em mèo: Tui không ở cạnh để dẫn em đi ăn, nên gửi em một chút để tiêu nè. Tuỳ em thích gì thì dùng nhé, chỉ cần em vui là được. Luôn thương em."
            draggable={false}
            initial={reducedMotion ? false : { y: 28, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Layer 5: Voucher Fan (Right) */}
          <div className={`env-voucher-fan ${selectedId ? "has-selection" : ""}`}>
            {VOUCHER_LIST.map((voucher) => {
              const isSelected = selectedId === voucher.id;
              return (
                <motion.button
                  key={voucher.id}
                  type="button"
                  className={`env-voucher-item ${voucher.cls} ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSelectVoucher(voucher.id)}
                  aria-label={`Voucher ${voucher.number}: ${voucher.title}`}
                  aria-expanded={isSelected}
                  initial={reducedMotion ? false : { y: 28, opacity: 0.8 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: voucher.delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src={voucher.image} alt="" draggable={false} />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Layer 6: Bottom Burgundy Pocket */}
        <img
          className="env-layer env-bottom-pocket"
          src={`${ASSET_BASE}03_envelope_bottom_pocket.png`}
          alt=""
          draggable={false}
        />

        {/* Pocket Decorative Gold Flower + Branding Text */}
        <div className="env-pocket-branding" aria-hidden="true">
          <svg className="env-pocket-flower" viewBox="0 0 24 24" fill="none" stroke="#d4af72" strokeWidth="1.2">
            <path d="M12 3c-1.5 3-3.5 5-6 6 2.5 1 4.5 3 6 6 1.5-3 3.5-5 6-6-2.5-1-4.5-3-6-6z" />
            <path d="M12 9c-1 2-2 3-4 4 2 .8 3 1.8 4 4 1-2.2 2-3.2 4-4-2-1-3-2-4-4z" />
          </svg>
          <div className="env-pocket-title">NHỮNG ĐIỀU NHỎ BÉ</div>
          <div className="env-pocket-subtitle">CHO NGƯỜI THẬT ĐẶC BIỆT</div>
        </div>

        {/* Layer 7: Wax Seal (Decorative detail near flap seam) */}
        <img
          className="env-layer env-wax-seal"
          src={`${ASSET_BASE}05_wax_seal.png`}
          alt="Dấu sáp kỷ niệm 10 · 11 · 2003"
          draggable={false}
        />

        {/* Selected Voucher Detail Float Card */}
        <AnimatePresence>
          {activeVoucher && (
            <motion.div
              id={drawerId}
              className="voucher-detail-drawer"
              role="region"
              aria-label={`Chi tiết voucher ${activeVoucher.title}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="voucher-detail-top">
                <span className="voucher-detail-badge">VOUCHER {activeVoucher.number}</span>
                <button
                  type="button"
                  className="voucher-detail-close"
                  onClick={closeDrawer}
                  aria-label="Đóng chi tiết"
                >
                  ✕
                </button>
              </div>
              <h3 className="voucher-detail-title">{activeVoucher.title}</h3>
              <p className="voucher-detail-desc">{activeVoucher.description}</p>
              <span className="voucher-detail-valid">{activeVoucher.subtitle}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next Chapter CTA Button */}
      <div className="voucher-next-action">
        <button
          type="button"
          className="voucher-next-btn"
          onClick={() => onComplete?.()}
          title="Sang chương tiếp theo"
          aria-label="Chuyển sang Chương 03: Lá thư"
        >
          <span>Có thứ này quan trọng hơn — sang Chương 03</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 4v15m-5-5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}