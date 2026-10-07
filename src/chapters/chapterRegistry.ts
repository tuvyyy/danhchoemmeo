import HeroSection from "@/sections/HeroSection";
import FlowersSection from "@/sections/FlowersSection";
import VoucherSection from "@/sections/voucher/CinematicVoucherSection";
import LetterSection from "@/sections/LetterSection";
import AnniversarySection from "@/sections/AnniversarySection";
import FinaleSection from "@/sections/FinaleSection";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import type { ChapterMeta } from "./types";

export const CHAPTER_REGISTRY: ChapterMeta[] = [
  {
    id: "hero",
    index: 0,
    displayNumber: 0,
    label: BIRTHDAY_DATA.steps[0] ?? "Mở đầu",
    Component: HeroSection,
  },
  {
    id: "flowers",
    index: 1,
    displayNumber: 1,
    label: BIRTHDAY_DATA.steps[1] ?? "Hoa",
    Component: FlowersSection,
  },
  {
    id: "wallet",
    index: 2,
    displayNumber: 2,
    label: BIRTHDAY_DATA.steps[2] ?? "Lì xì",
    Component: VoucherSection,
  },
  {
    id: "letter",
    index: 3,
    displayNumber: 3,
    label: BIRTHDAY_DATA.steps[3] ?? "Lá thư",
    Component: LetterSection,
  },
  {
    id: "finale",
    index: 4,
    displayNumber: 4,
    label: BIRTHDAY_DATA.steps[4] ?? "Ước",
    Component: FinaleSection,
  },
  {
    id: "anniversary",
    index: 5,
    displayNumber: 5,
    label: BIRTHDAY_DATA.steps[5] ?? "Tụi mình",
    Component: AnniversarySection,
  },
];

export const TOTAL_CHAPTERS = CHAPTER_REGISTRY.length;

export function getChapterMeta(index: number): ChapterMeta | undefined {
  return CHAPTER_REGISTRY[index];
}
