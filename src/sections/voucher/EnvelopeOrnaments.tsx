const ROOT = "/assets/envelope-voucher/chapter02_envelope_final_assets/chapter02_envelope_final_assets/";

export default function EnvelopeOrnaments() {
  return (
    <div className="envelope-frame" aria-hidden="true">
      {/* ── Top ornament — centered above envelope ── */}
      <img
        src={`${ROOT}ornament-top.png`}
        alt=""
        className="envelope-frame__piece envelope-frame__ornament-top"
        draggable={false}
        decoding="async"
      />

      {/* ── Top-Left Corner + subtle frame lines ── */}
      <img
        src={`${ROOT}corner-tl.png`}
        alt=""
        className="envelope-frame__piece envelope-frame__corner-tl"
        draggable={false}
        decoding="async"
      />
      <div className="envelope-frame__line envelope-frame__line--tl-h" />
      <div className="envelope-frame__line envelope-frame__line--tl-v" />

      {/* ── Top-Right Corner + subtle frame lines ── */}
      <img
        src={`${ROOT}corner-tr.png`}
        alt=""
        className="envelope-frame__piece envelope-frame__corner-tr"
        draggable={false}
        decoding="async"
      />
      <div className="envelope-frame__line envelope-frame__line--tr-h" />
      <div className="envelope-frame__line envelope-frame__line--tr-v" />

      {/* ── Bottom-Left Corner + subtle frame lines ── */}
      <img
        src={`${ROOT}corner-bl.png`}
        alt=""
        className="envelope-frame__piece envelope-frame__corner-bl"
        draggable={false}
        decoding="async"
      />
      <div className="envelope-frame__line envelope-frame__line--bl-h" />
      <div className="envelope-frame__line envelope-frame__line--bl-v" />

      {/* ── Bottom-Right Corner + subtle frame lines ── */}
      <img
        src={`${ROOT}corner-br.png`}
        alt=""
        className="envelope-frame__piece envelope-frame__corner-br"
        draggable={false}
        decoding="async"
      />
      <div className="envelope-frame__line envelope-frame__line--br-h" />
      <div className="envelope-frame__line envelope-frame__line--br-v" />
    </div>
  );
}