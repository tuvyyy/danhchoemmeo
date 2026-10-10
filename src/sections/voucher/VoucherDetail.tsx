import { useEffect, useId, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useDialogFocus } from "@/components/effects/useDialogFocus";
import { useSceneOverlay } from "@/components/effects/SceneExperience";
import { useScenePreferences } from "@/components/effects/useScenePreferences";
import VoucherTicket from "./VoucherTicket";
import { ALL_INSPECTABLES, VOUCHER_RECIPIENT, type Voucher } from "./voucherConfig";

export type VoucherSelection = {
  voucher: Voucher;
  origin: { x: number; y: number; width: number; height: number; paperWidth: number; angle: number };
};

export default function VoucherDetail({ selection, onClose, onInspect }: {
  selection: VoucherSelection; onClose: () => void; onInspect: (id: string) => void;
}) {
  const id = useId();
  const ref = useDialogFocus(true);
  useSceneOverlay(true);
  const { reducedMotion } = useScenePreferences();
  const [voucher, setVoucher] = useState(selection.voucher);
  const items = ALL_INSPECTABLES;
  const index = items.findIndex(item => item.id === voucher.id);
  const origin = selection.origin;
  const paperWidth = Math.min(window.innerWidth * .62, window.innerHeight * .4, 360);
  useEffect(() => { onInspect(voucher.id); }, [voucher.id, onInspect]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="ticket-inspection-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="ticket-inspection" ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`} tabIndex={-1} style={{ "--inspection-width": `${paperWidth}px` } as CSSProperties}>
        <button type="button" className="ticket-inspection__close" data-dialog-close aria-label="Đóng voucher" onClick={onClose}>×</button>
        <h3 id={`${id}-title`} className="sr-only">{voucher.title}</h3>
        <motion.div className="ticket-inspection__paper"
          initial={reducedMotion ? false : {
            x: origin.x + origin.width / 2 - window.innerWidth / 2,
            y: origin.y + origin.height / 2 - window.innerHeight * .43,
            scale: origin.paperWidth / paperWidth,
            rotate: origin.angle, opacity: .7,
          }}
          animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : .45, ease: [.2, .8, .2, 1] }}>
          <VoucherTicket voucher={voucher} alt={`Voucher ${voucher.number}: ${voucher.title}. ${VOUCHER_RECIPIENT}. Valid forever.`} />
        </motion.div>
        <button type="button" className="ticket-inspection__previous" aria-label="Mục trước"
          onClick={() => setVoucher(items[(index + items.length - 1) % items.length])}>←</button>
        <button type="button" className="ticket-inspection__next" aria-label="Mục tiếp"
          onClick={() => setVoucher(items[(index + 1) % items.length])}>→</button>
        <p id={`${id}-description`} className="ticket-inspection__description">{voucher.description}</p>
      </div>
    </div>, document.body,
  );
}
