import { publicAsset } from "@/lib/assets/publicAsset";
export type EnvelopeState = "closed" | "opening" | "open" | "closing";
// Seal lands on the taller envelope's flap tip without scaling the round seal.
export const CLOSED_SEAL_Y_PERCENT = -190;

export type PaperAsset = {
  src: string;
  width: number;
  height: number;
  // Display bounds inside the supplied PNG; original pixels remain untouched.
  crop: readonly [x: number, y: number, width: number, height: number];
};

const ASSET_ROOT = publicAsset("/assets/envelope-voucher/chapter02_envelope_final_assets/");

// Percentages are tied to the supplied composition, not viewport coordinates.
export const VOUCHER_PLACEMENTS: Record<string, { x: number; y: number; width: number; angle: number; order: number; exposed: string }> = {
  food: { x: 44.7, y: 15.7, width: 14.4, angle: -8, order: 2, exposed: "polygon(0 0, 100% 0, 100% 91%, 0 86%)" },
  coffee: { x: 56.9, y: 6.7, width: 15.6, angle: -2, order: 5, exposed: "polygon(0 0, 100% 0, 100% 94%, 0 94%)" },
  movie: { x: 72.6, y: 15.6, width: 13.7, angle: 3, order: 3, exposed: "polygon(0 0, 100% 0, 100% 93%, 0 95%)" },
  anywhere: { x: 82.5, y: 18.3, width: 12.2, angle: 8, order: 1, exposed: "polygon(0 0, 100% 0, 100% 56%, 0 95%)" },
};
const asset = (name: string, width: number, height: number, crop: PaperAsset["crop"]): PaperAsset => ({
  src: `${ASSET_ROOT}${name}`, width, height, crop,
});

export const ENVELOPE_ASSETS = {
  flap: asset("02_envelope_top_flap.png", 1448, 1086, [0, 240, 1448, 553]),
  pocket: asset("03_envelope_bottom_pocket.png", 1448, 1086, [12, 350, 1425, 492]),
  // Only the rectangular interior. The triangular liner would be a second lid.
  liner: asset("04_envelope_inner_liner.png", 1448, 1086, [38, 535, 1376, 535]),
  seal: asset("05_wax_seal.png", 1254, 1254, [82, 70, 1122, 1113]),
  letter: asset("06_letter_note.png", 1122, 1402, [3, 94, 1120, 1280]),
} as const;

export type Voucher = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  image: PaperAsset;
};

export const VOUCHERS: readonly Voucher[] = [
  {
    id: "food", number: "01", title: "Ăn ngon thoả thích", shortTitle: "Ăn ngon",
    description: "Một bữa thật ngon, đúng món em đang thèm. Em chọn quán, chọn món — phần chiều em cứ để tui lo nha.",
    image: asset("07_voucher_01_food.png", 1086, 1448, [113, 60, 864, 1331]),
  },
  {
    id: "coffee", number: "02", title: "Đi cà phê cùng nhau", shortTitle: "Cà phê",
    description: "Một góc quán yên yên, món nước em thích và một buổi chẳng cần vội. Để dành hôm mình gặp nhau, ngồi kể đủ chuyện nha.",
    image: asset("08_voucher_02_coffee.png", 1086, 1448, [145, 53, 796, 1326]),
  },
  {
    id: "movie", number: "03", title: "Xem phim tuỳ em chọn", shortTitle: "Xem phim",
    description: "Phim tình cảm, hoạt hình hay phim em chờ mãi — hôm nay em chọn hết. Tui nhận phần bắp rang và ngồi cạnh em.",
    image: asset("09_voucher_03_movie.png", 1086, 1448, [118, 56, 852, 1330]),
  },
  {
    id: "anywhere", number: "04", title: "Đi đâu cũng được", shortTitle: "Đi chơi",
    description: "Một vòng dạo phố hay một chuyến đi xa hơn một chút. Cứ nói nơi em muốn đến, mình cùng dành một ngày cho nơi đó.",
    image: asset("10_voucher_04_anywhere.png", 1086, 1448, [144, 96, 798, 1270]),
  },
];

export const LETTER_NOTE_ITEM: Voucher = {
  id: "letter", number: "00", title: "Lá thư tay dành cho em", shortTitle: "Thư tay",
  description: "Tui không ở cạnh để dẫn em đi ăn, nên gửi em một chút để tiêu nè. Tuỳ em thích gì thì dùng nhé, chỉ cần em vui là được. Luôn thương em ♡",
  image: ENVELOPE_ASSETS.letter,
};

export const ALL_INSPECTABLES: readonly Voucher[] = [LETTER_NOTE_ITEM, ...VOUCHERS];


let pendingAssets: Promise<void> | undefined;
export function preloadEnvelopeAssets() {
  return pendingAssets ??= Promise.all([
    ...Object.values(ENVELOPE_ASSETS).map(asset => asset.src), ...VOUCHERS.map(voucher => voucher.image.src),
  ].map(async src => {
    const image = new Image();
    image.src = src;
    await image.decode();
  })).then(() => undefined).catch(error => {
    pendingAssets = undefined;
    throw error;
  });
}
