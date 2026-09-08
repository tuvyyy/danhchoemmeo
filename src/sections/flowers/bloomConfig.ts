import bud from "@/assets/flowers/lily_frame_01_bud.png";
import opening from "@/assets/flowers/lily_frame_02_opening.png";
import half from "@/assets/flowers/lily_frame_03_half_bloom.png";
import almost from "@/assets/flowers/lily_frame_04_almost_open.png";
import full from "@/assets/flowers/lily_frame_05_full_bloom.png";
import type { BloomFrameConfig } from "./flowers.types";

export const BLOOM_FRAMES: BloomFrameConfig[] = [
  {
    src: bud,
    label: "Nụ hoa chúm chím",
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  },
  {
    src: opening,
    label: "Cánh hoa khẽ hé",
    x: -2,
    y: 1,
    scale: 1.01,
    rotation: 0.2,
  },
  {
    src: half,
    label: "Hoa bắt đầu hé nở",
    x: 2,
    y: 2,
    scale: 1.02,
    rotation: -0.2,
  },
  {
    src: almost,
    label: "Gần nở trọn vẹn",
    x: -1,
    y: 1,
    scale: 1.03,
    rotation: 0.1,
  },
  {
    src: full,
    label: "Hoa nở rộ ngát hương",
    x: 0,
    y: 0,
    scale: 1.04,
    rotation: 0,
  },
];
