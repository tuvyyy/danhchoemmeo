import { useChapterFlowContext } from "./ChapterFlowContext";
import type { ChapterLifecycleState } from "./types";

export interface ChapterLifecycleInfo {
  state: ChapterLifecycleState;
  isActive: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  isTransitioning: boolean;
}

/**
 * Hook allowing individual sections to observe their chapter lifecycle
 * (e.g. knowing when they become 'active' to trigger bloom timelines in Phase 3+)
 * without coupling them to global window scroll events.
 */
export function useChapterLifecycle(chapterIndex: number): ChapterLifecycleInfo {
  const {
    currentChapter,
    unlockedThrough,
    isTransitioning,
    isCompleted,
    getChapterState,
  } = useChapterFlowContext();

  return {
    state: getChapterState(chapterIndex),
    isActive: currentChapter === chapterIndex,
    isUnlocked: chapterIndex <= unlockedThrough,
    isCompleted: isCompleted(chapterIndex),
    isTransitioning,
  };
}
