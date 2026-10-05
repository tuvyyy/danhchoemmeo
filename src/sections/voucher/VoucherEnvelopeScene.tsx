import { useEffect, useRef, type CSSProperties } from "react";
import VoucherCard from "./VoucherCard";
import EnvelopeArtwork from "./EnvelopeArtwork";
import type { VoucherSelection } from "./VoucherDetail";
import { VOUCHERS, LETTER_NOTE_ITEM, type EnvelopeState } from "./voucherConfig";

interface Props {
  state: EnvelopeState;
  ready: boolean;
  running: boolean;
  interactive?: boolean;
  hovered: string | null;
  inspected: string | null;
  onHover: (id: string | null) => void;
  onToggle: () => void;
  onSelect: (selection: VoucherSelection) => void;
}

export default function VoucherEnvelopeScene({ state, ready, running, interactive = true, onToggle, onSelect, hovered, inspected, onHover }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);
  const ratio = 1672 / 941;

  useEffect(() => {
    if (!ready || !viewport.current || !artwork.current) return;
    const view = viewport.current;
    const art = artwork.current;
    const center = () => {
      // On phones start at the boundary between the letter and tickets; native
      // horizontal scrolling lets the user inspect both ends without shrinking.
      if (view.scrollWidth > view.clientWidth) {
        if (!positioned.current) view.scrollLeft = Math.max(0, art.clientWidth * .58 - view.clientWidth / 2);
      } else view.scrollLeft = 0;
      positioned.current = true;
    };
    center();
    const observer = new ResizeObserver(() => { positioned.current = false; center(); });
    observer.observe(view);
    observer.observe(art);
    return () => observer.disconnect();
  }, [ready, ratio]);

  return (
    <div ref={viewport} className="scene-pan" data-ready={ready} data-state={state} data-running={running}>
      <div className="scene-artwork" ref={artwork} style={{ "--art-ratio": ratio } as CSSProperties}>
        {ready && <EnvelopeArtwork state={state} onToggle={onToggle} hovered={hovered} inspected={inspected} interactive={interactive} />}

        <div className="scene-hotspots" role="group" aria-label="Bức thư tay và các voucher trong phong bì">
          <div className="scene-letter-hotspot" style={{
            position: "absolute", left: "11%", top: "4%", width: "28%", height: "72%", zIndex: 10,
            transform: "rotate(-3deg)", pointerEvents: "auto",
          }}>
            <button
              type="button"
              className="scene-ticket__hit"
              disabled={state !== "open"}
              aria-label="Đọc thư tay: Tui không ở cạnh để dẫn em đi ăn, nên gửi em một chút để tiêu nè"
              aria-haspopup="dialog"
              data-voucher="letter-note"
              onPointerEnter={event => {
                if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (min-width: 768px)").matches) onHover("letter");
              }}
              onPointerLeave={() => onHover(null)}
              onBlur={() => onHover(null)}
              onClick={event => {
                const paper = event.currentTarget.closest('.scene-artwork')?.querySelector<HTMLElement>('.envelope__letter-paper');
                const rect = (paper ?? event.currentTarget).getBoundingClientRect();
                onSelect({
                  voucher: LETTER_NOTE_ITEM,
                  origin: {
                    x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                    paperWidth: (paper?.offsetWidth ?? event.currentTarget.offsetWidth) * (hovered === "letter" ? 1.025 : 1),
                    angle: -3 * (hovered === "letter" ? 0.65 : 1),
                  },
                });
              }}
            />
          </div>
          {VOUCHERS.map(voucher => <VoucherCard key={voucher.id} voucher={voucher} state={state} onSelect={onSelect} onHover={onHover} hovered={hovered === voucher.id} />)}
        </div>
      </div>
    </div>
  );
}
