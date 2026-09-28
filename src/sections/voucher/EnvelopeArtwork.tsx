import { useId, type CSSProperties } from "react";
import VoucherAsset from "./VoucherAsset";
import { ENVELOPE_ASSETS, VOUCHERS, VOUCHER_PLACEMENTS, type EnvelopeState } from "./voucherConfig";

/** These same physical parts stay mounted at their final poses after opening. */
export default function EnvelopeArtwork({ state, onToggle, hovered, inspected, interactive = true }: {
  state: EnvelopeState; onToggle: () => void; hovered: string | null; inspected: string | null;
  interactive?: boolean;
}) {
  const contentsId = useId();
  const busy = !interactive || state === "opening" || state === "closing";
  return (
    <div className="envelope" data-hovering={Boolean(hovered)} data-inspecting={Boolean(inspected)}>
      <div className="envelope__body"><VoucherAsset asset={ENVELOPE_ASSETS.liner} stretch /></div>
      <div className="envelope__hinge">
        <div className="envelope__flap"><VoucherAsset asset={ENVELOPE_ASSETS.flap} stretch /></div>
      </div>
      <div className="envelope__contents" id={contentsId}>
        <div className="envelope__letter envelope__paper" style={{ "--paper-delay": ".95s" } as CSSProperties}>
          <VoucherAsset asset={ENVELOPE_ASSETS.letter} />
        </div>
        {VOUCHERS.map(voucher => {
          const placement = VOUCHER_PLACEMENTS[voucher.id];
          return <div key={voucher.id} className="envelope__ticket envelope__paper"
            data-ticket-artwork={voucher.id} data-hovered={hovered === voucher.id} data-inspected={inspected === voucher.id}
            style={{ left: `${placement.x}%`, top: `${placement.y}%`, width: `${placement.width}%`,
              zIndex: placement.order, "--ticket-angle": `${placement.angle}deg`,
            } as CSSProperties}><div className="envelope__ticket-paper"><VoucherAsset asset={voucher.image} /></div></div>;
        })}
      </div>
      <div className="envelope__pocket"><VoucherAsset asset={ENVELOPE_ASSETS.pocket} stretch /></div>
      <div className="envelope-trim-mask" aria-hidden="true"><div className="envelope-trim-light" /></div>
      <button type="button" className="envelope__seal" onClick={onToggle} disabled={busy}
        aria-label={state === "open" || state === "closing" ? "Đóng thư" : "Mở thư"}
        aria-expanded={state === "open" || state === "opening"} aria-controls={contentsId}
        title={state === "open" ? "Chạm để đóng thư" : "Chạm để mở thư"}>
        <span className="envelope__seal-face"><VoucherAsset asset={ENVELOPE_ASSETS.seal} /></span>
        <span className="envelope__seal-hint" aria-hidden="true">
          {state === "open" || state === "closing" ? "Chạm để khép thư" : "Chạm để mở thư"}
        </span>
      </button>
    </div>
  );
}
