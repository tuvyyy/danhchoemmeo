import type { ChapterId } from "@/chapters/types";

export type SceneEffect = "ribbon" | "garden" | "gold" | "paper" | "scrapbook" | "sunset" | "orb";
export const CHAPTER_EFFECTS: Record<ChapterId, SceneEffect> = {
  hero: "ribbon", flowers: "garden", wallet: "gold", letter: "paper",
  moments: "scrapbook", anniversary: "sunset", finale: "orb",
};
export type SceneQuality = "mobile" | "desktop";
