import type { MoneyBillConfig } from "./wallet.types";

/**
 * 6 deterministic decorative banknotes styled after Vietnamese denomination colors
 * with playful watermark, serial numbers, and guilloche accents.
 * Fanned gracefully above the inner wallet pocket.
 */
export const STYLIZED_BILLS: MoneyBillConfig[] = [
  {
    id: 1,
    label: "500.000₫",
    serial: "TY-20031110-A",
    xOffset: -85,
    yOffset: -128,
    rotation: -22,
    scale: 0.96,
    delay: 0.22,
    tilt: -10,
  },
  {
    id: 2,
    label: "500.000₫",
    serial: "TY-20031110-B",
    xOffset: -50,
    yOffset: -148,
    rotation: -13,
    scale: 0.98,
    delay: 0.28,
    tilt: -6,
  },
  {
    id: 3,
    label: "500.000₫",
    serial: "TY-20031110-C",
    xOffset: -16,
    yOffset: -158,
    rotation: -4,
    scale: 1.0,
    delay: 0.34,
    tilt: -2,
  },
  {
    id: 4,
    label: "500.000₫",
    serial: "TY-20031110-D",
    xOffset: 18,
    yOffset: -156,
    rotation: 5,
    scale: 1.0,
    delay: 0.4,
    tilt: 3,
  },
  {
    id: 5,
    label: "500.000₫",
    serial: "TY-20031110-E",
    xOffset: 52,
    yOffset: -144,
    rotation: 14,
    scale: 0.98,
    delay: 0.46,
    tilt: 7,
  },
  {
    id: 6,
    label: "500.000₫",
    serial: "TY-20031110-F",
    xOffset: 86,
    yOffset: -124,
    rotation: 23,
    scale: 0.96,
    delay: 0.52,
    tilt: 11,
  },
];

/**
 * Slot positions for the 4 gift vouchers sitting in the front pocket.
 */
export const GIFT_CARD_SLOTS = [
  { rot: -10, x: -84, y: -60 },
  { rot: -3, x: -28, y: -70 },
  { rot: 3, x: 28, y: -68 },
  { rot: 10, x: 84, y: -58 },
];

export const GIFT_CARD_SLOTS_MOBILE = [
  { rot: -9, x: -62, y: -50 },
  { rot: -3, x: -20, y: -58 },
  { rot: 3, x: 20, y: -56 },
  { rot: 9, x: 62, y: -48 },
];
