import type { ComponentType } from "react";

export type ChapterId = "hero" | "flowers" | "wallet" | "letter" | "moments" | "anniversary" | "finale";

export type ChapterLifecycleState =
  | "locked"
  | "ready"
  | "entering"
  | "active"
  | "completing"
  | "completed"
  | "leaving";

export interface ChapterSectionProps {
  onComplete?: (options?: { instant?: boolean }) => void;
}

export interface ChapterMeta {
  id: ChapterId;
  index: number;
  displayNumber: number;
  label: string;
  Component: ComponentType<{ onComplete: (options?: { instant?: boolean }) => void }> | ComponentType<{ onComplete?: (options?: { instant?: boolean }) => void }>;
}

export interface ChapterFlowContextValue {
  /** Current chapter index in focus/view (0..5) */
  currentChapter: number;
  /** Highest chapter index unlocked (0..5) */
  unlockedThrough: number;
  /** Chapters the visitor has advanced past through navigation */
  completedChapters: Set<number>;
  /** True while a chapter advance transition animation/scroll is running */
  isTransitioning: boolean;
  /** Advance from current chapter to the next chapter */
  advance: (fromIndex: number, options?: { instant?: boolean }) => void;
  /** Navigate to an already unlocked chapter (backwards or forwards within unlocked range) */
  goTo: (targetIndex: number) => void;
  /** Check if a given chapter index is unlocked */
  isUnlocked: (index: number) => boolean;
  /** Check if a given chapter index has finished its interaction */
  isCompleted: (index: number) => boolean;
  /** Get fine-grained lifecycle state for a given chapter */
  getChapterState: (index: number) => ChapterLifecycleState;
  /** Stage root element ref registration for scrolling & observation */
  registerStageRef: (index: number, el: HTMLElement | null) => void;
  /** Stage inner content element ref registration for GSAP transitions */
  registerContentRef: (index: number, el: HTMLElement | null) => void;
}
