import HeroSection from "@/sections/HeroSection";
import FlowersSection from "@/sections/FlowersSection";
import WalletSection from "@/sections/WalletSection";
import LetterSection from "@/sections/LetterSection";
import MomentsSection from "@/sections/MomentsSection";
import FinaleSection from "@/sections/FinaleSection";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import type { ChapterMeta } from "./types";

export const CHAPTER_REGISTRY: ChapterMeta[] = [
  {
    id: "hero",
    index: 0,
    label: BIRTHDAY_DATA.steps[0] ?? "Mở đầu",
    Component: HeroSection,
  },
  {
    id: "flowers",
    index: 1,
    label: BIRTHDAY_DATA.steps[1] ?? "Hoa",
    Component: FlowersSection,
  },
  {
    id: "wallet",
    index: 2,
    label: BIRTHDAY_DATA.steps[2] ?? "Lì xì",
    Component: WalletSection,
  },
  {
    id: "letter",
    index: 3,
    label: BIRTHDAY_DATA.steps[3] ?? "Lá thư",
    Component: LetterSection,
  },
  {
    id: "moments",
    index: 4,
    label: BIRTHDAY_DATA.steps[4] ?? "Khoảnh khắc",
    Component: MomentsSection,
  },
  {
    id: "finale",
    index: 5,
    label: BIRTHDAY_DATA.steps[5] ?? "Ước",
    Component: FinaleSection,
  },
];

export const TOTAL_CHAPTERS = CHAPTER_REGISTRY.length;

export function getChapterMeta(index: number): ChapterMeta | undefined {
  return CHAPTER_REGISTRY[index];
}
