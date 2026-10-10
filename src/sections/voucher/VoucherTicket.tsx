import type { CSSProperties } from "react";
import VoucherAsset from "./VoucherAsset";
import { VOUCHER_RECIPIENT, type Voucher } from "./voucherConfig";

/** Live lettering follows the paper through the envelope and its enlarged view. */
export default function VoucherTicket({ voucher, alt = "" }: { voucher: Voucher; alt?: string }) {
  if (!voucher.print) return <VoucherAsset asset={voucher.image} alt={alt} />;
  const words = voucher.title.split(/\s+/);
  const lines = [words.slice(0, voucher.print.lineBreakAfter).join(" "), words.slice(voucher.print.lineBreakAfter).join(" ")].filter(Boolean);
  return <span className="voucher-ticket" data-printed-voucher={voucher.id} style={{
    "--title-top": `${voucher.print.titleTop}%`, "--recipient-top": `${voucher.print.recipientTop}%`,
  } as CSSProperties}>
    <VoucherAsset asset={voucher.image} alt={alt} />
    <span className="voucher-ticket__title" aria-hidden="true">{lines.map(line => <span key={line}>{line}</span>)}</span>
    <span className="voucher-ticket__recipient" aria-hidden="true">{VOUCHER_RECIPIENT}</span>
  </span>;
}
