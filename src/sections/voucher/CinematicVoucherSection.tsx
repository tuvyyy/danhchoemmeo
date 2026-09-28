import { useCallback, useEffect, useRef, useState } from "react";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { useScenePreferences } from "@/components/effects/useScenePreferences";
import VoucherEnvelopeScene from "./VoucherEnvelopeScene";
import VoucherDetail, { type VoucherSelection } from "./VoucherDetail";
import CinematicOrnaments, { CORNER_IMAGE } from "./CinematicOrnaments";
import EnvelopePetals from "./EnvelopePetals";
import { preloadEnvelopeAssets, type EnvelopeState } from "./voucherConfig";
import { useEnvelopeMotion } from "./useEnvelopeMotion";
import "./cinematic-envelope.css";

export default function CinematicVoucherSection({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLElement>(null);
  const { isActive, isTransitioning } = useChapterLifecycle(2);
  const { reducedMotion } = useScenePreferences();
  const [assets, setAssets] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<EnvelopeState>("closed");
  const [arrived, setArrived] = useState(false);
  const finishArrival = useCallback(() => setArrived(true), []);
  const [visible, setVisible] = useState(!document.hidden);
  const [selected, setSelected] = useState<VoucherSelection | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [inspected, setInspected] = useState<string | null>(null);
  const closeDetail = useCallback(() => { setSelected(null); setInspected(null); }, []);
  const finishMotion = useCallback(() => setState(previous =>
    previous === "opening" ? "open" : previous === "closing" ? "closed" : previous), []);
  const toggleEnvelope = useCallback(() => {
    closeDetail();
    setHovered(null);
    setState(previous => previous === "closed" ? (reducedMotion ? "open" : "opening")
      : previous === "open" ? (reducedMotion ? "closed" : "closing") : previous);
  }, [reducedMotion, closeDetail]);
  const selectVoucher = useCallback((selection: VoucherSelection) => {
    setHovered(null); setSelected(selection); setInspected(selection.voucher.id);
  }, []);
  const running = isActive && visible && !isTransitioning && !selected;
  useEnvelopeMotion({ root, ready: assets === "ready", running, state, reducedMotion, onFinish: finishMotion, onArrival: finishArrival });

  useEffect(() => {
    let cancelled = false;
    setAssets("loading");
    const corner = new Image(); corner.src = CORNER_IMAGE;
    Promise.all([preloadEnvelopeAssets(), corner.decode()])
      .then(() => { if (!cancelled) setAssets("ready"); })
      .catch(() => { if (!cancelled) setAssets("error"); });
    return () => { cancelled = true; };
  }, [attempt]);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!isActive) { closeDetail(); setHovered(null); setState("closed"); }
  }, [isActive, closeDetail]);

  return <section ref={root} className="chapter-envelope-scene" data-state={state}
    data-running={running} data-ready={assets === "ready"} aria-label="Chương 02 — Lì xì sinh nhật">
    <h2 className="sr-only">Chương 02 — Lì xì sinh nhật</h2>
    <div className="envelope-light" aria-hidden="true" />
    <div className="envelope-grain" aria-hidden="true" />
    <CinematicOrnaments />
    <EnvelopePetals />
    <p className="sr-only">Tui không ở cạnh để dẫn em đi ăn, nên gửi em một chút để tiêu nè.
      Tuỳ em thích gì thì dùng nhé, chỉ cần em vui là được. Luôn thương em.
      Chạm dấu sáp để mở hoặc khép thư. Chọn voucher để xem chi tiết. Trên điện thoại, vuốt ngang để xem trọn phong bì.</p>
    <VoucherEnvelopeScene state={state} ready={assets === "ready"} running={running} interactive={arrived && running}
      onToggle={toggleEnvelope} onSelect={selectVoucher} onHover={setHovered} hovered={hovered} inspected={inspected} />
    <button type="button" className="scene-next" disabled={state !== "open"}
      aria-label="Có thứ này quan trọng hơn — sang Chương 03" title="Sang chương tiếp theo" onClick={onComplete}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M12 4v15m-5-5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {assets !== "ready" && <div className="envelope-load-state" role="status">
      <p>{assets === "error" ? "Ảnh phong bì chưa tải được." : "Đang chuẩn bị món quà của em…"}</p>
      {assets === "error" && <button type="button" onClick={() => setAttempt(value => value + 1)}>Thử lại</button>}
    </div>}
    {selected && <VoucherDetail selection={selected} onClose={closeDetail} onInspect={setInspected} />}
  </section>;
}
