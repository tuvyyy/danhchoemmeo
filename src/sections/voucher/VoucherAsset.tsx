import type { PaperAsset } from "./voucherConfig";

/** Crops only the transparent margins in CSS, using the original PNG unchanged. */
export default function VoucherAsset({ asset, alt = "", stretch = false }: { asset: PaperAsset; alt?: string; stretch?: boolean }) {
  const [x, y, width, height] = asset.crop;
  return (
    <span className="voucher-asset" style={{ aspectRatio: stretch ? undefined : `${width} / ${height}`, height: stretch ? "100%" : undefined }}>
      <img src={asset.src} alt={alt} width={asset.width} height={asset.height}
        decoding="async" draggable={false}
        style={{ width: `${asset.width / width * 100}%`, height: stretch ? `${asset.height / height * 100}%` : undefined, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
    </span>
  );
}
