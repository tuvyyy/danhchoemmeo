import type { GiftCardData } from "@/data/birthdayContent";

export type WalletOpenState = "closed" | "opening" | "open";

export interface MoneyBillConfig {
  id: number;
  label: string;
  serial: string;
  xOffset: number;
  yOffset: number;
  rotation: number;
  scale: number;
  delay: number;
  tilt: number;
}

export interface GiftCardItem extends GiftCardData {
  slotRotation: number;
  slotOffset: { x: number; y: number };
}
