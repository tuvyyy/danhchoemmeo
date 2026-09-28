import type { CSSProperties } from "react";
import type { VoucherSelection } from "./VoucherDetail";
import { VOUCHER_PLACEMENTS, type EnvelopeState, type Voucher } from "./voucherConfig";

export default function VoucherCard({ voucher, state, onSelect, onHover, hovered }: {
  voucher: Voucher; state: EnvelopeState; onSelect: (selection: VoucherSelection) => void;
  onHover: (id: string | null) => void; hovered: boolean;
}) {
  const placement = VOUCHER_PLACEMENTS[voucher.id];
  return (
    <div className={`scene-ticket scene-ticket--${voucher.id}`} style={{
      left: `${placement.x}%`, top: `${placement.y}%`, width: `${placement.width}%`,
      aspectRatio: `${voucher.image.crop[2]} / ${voucher.image.crop[3]}`,
      "--ticket-angle": `${placement.angle}deg`, "--ticket-order": placement.order,
      "--ticket-exposed": placement.exposed,
    } as CSSProperties}>
      <button type="button" className="scene-ticket__hit" disabled={state !== "open"}
        aria-label={`Mở voucher: ${voucher.title}`} aria-haspopup="dialog" data-voucher={voucher.id}
        onPointerEnter={event => { if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (min-width: 768px)").matches) onHover(voucher.id); }}
        onPointerLeave={() => onHover(null)} onBlur={() => onHover(null)}
        onClick={event => {
          const paper = event.currentTarget.closest('.scene-artwork')?.querySelector<HTMLElement>(`[data-ticket-artwork="${voucher.id}"] .envelope__ticket-paper`);
          const rect = (paper ?? event.currentTarget).getBoundingClientRect();
          onSelect({ voucher, origin: { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
            paperWidth: (paper?.offsetWidth ?? event.currentTarget.offsetWidth) * (hovered ? 1.025 : 1), angle: placement.angle * (hovered ? .65 : 1) } });
        }} />
    </div>
  );
}
