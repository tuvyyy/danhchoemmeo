export const CORNER_IMAGE = "/assets/envelope-voucher/chapter02_envelope_final_assets/chapter02_envelope_final_assets/corner-tr.png";

export default function CinematicOrnaments() {
  return <div className="envelope-frame" aria-hidden="true">
    {(["tr", "bl"] as const).map(corner => <div key={corner} className={`royal-corner royal-corner--${corner}`}>
      <div className="corner-ink">
        <img src={CORNER_IMAGE} alt="" width={158} height={162} draggable={false} />
        <span className="corner-line corner-line--h" /><span className="corner-line corner-line--v" />
        <span className="corner-spark" />
      </div>
    </div>)}
  </div>;
}
