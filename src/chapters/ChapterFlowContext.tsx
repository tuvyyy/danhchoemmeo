import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { TOTAL_CHAPTERS } from "./chapterRegistry";
import type { ChapterFlowContextValue, ChapterLifecycleState } from "./types";

const ChapterFlowContext = createContext<ChapterFlowContextValue | null>(null);

export function ChapterFlowProvider({ children }: { children: ReactNode }) {
  // Highest chapter index unlocked (0..5).
  // Chapters > unlockedThrough cannot be reached or scrolled to.
  const [unlockedThrough, setUnlockedThrough] = useState<number>(0);

  // Active chapter in viewport (0..5).
  const [currentChapter, setCurrentChapter] = useState<number>(0);

  // Chapters that have finished their primary interaction.
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());

  // Mutex lock to prevent duplicate transitions, button double-clicks, or competing scrolls.
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);

  // Refs for stage outer containers and inner animatable content containers.
  const stageRefs = useRef<(HTMLElement | null)[]>([]);
  const contentRefs = useRef<(HTMLElement | null)[]>([]);

  const registerStageRef = useCallback((index: number, el: HTMLElement | null) => {
    stageRefs.current[index] = el;
  }, []);

  const registerContentRef = useCallback((index: number, el: HTMLElement | null) => {
    contentRefs.current[index] = el;
  }, []);

  const isUnlocked = useCallback(
    (index: number) => index <= unlockedThrough,
    [unlockedThrough],
  );

  const isCompleted = useCallback(
    (index: number) => completedChapters.has(index),
    [completedChapters],
  );

  const getChapterState = useCallback(
    (index: number): ChapterLifecycleState => {
      if (index > unlockedThrough) return "locked";
      if (isTransitioningRef.current) {
        if (index === currentChapter) return "leaving";
        if (index === currentChapter + 1) return "entering";
      }
      if (index === currentChapter) {
        if (completedChapters.has(index)) return "completing";
        return "active";
      }
      if (index < currentChapter) return "completed";
      return "ready";
    },
    [unlockedThrough, currentChapter, completedChapters],
  );

  /**
   * Idempotent advance to next chapter:
   * 1. Marks `fromIndex` as completed.
   * 2. Unlocks `fromIndex + 1`.
   * 3. Orchestrates smooth GSAP transition & native scrollIntoView.
   * 4. Focuses new stage without scroll jump (`preventScroll: true`).
   * 5. Releases transition lock.
   */
  const advance = useCallback(
    (fromIndex: number) => {
      // Transition lock: reject duplicate clicks / race conditions
      if (isTransitioningRef.current) return;
      if (fromIndex < 0 || fromIndex >= TOTAL_CHAPTERS - 1) return;

      const nextIndex = fromIndex + 1;
      isTransitioningRef.current = true;
      setIsTransitioning(true);

      setCompletedChapters((prev) => {
        const next = new Set(prev);
        next.add(fromIndex);
        return next;
      });

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Fast/direct transition for reduced motion users
        flushSync(() => {
          setUnlockedThrough((prev) => Math.max(prev, nextIndex));
          setCurrentChapter(nextIndex);
        });
        const targetStage = stageRefs.current[nextIndex];
        targetStage?.scrollIntoView({ behavior: "instant", block: "start" });
        targetStage?.focus({ preventScroll: true });
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        return;
      }

      const outgoingContent = contentRefs.current[fromIndex];

      // Synchronously flush state so the new chapter stage mounts and registers its refs immediately
      flushSync(() => {
        setUnlockedThrough((prev) => Math.max(prev, nextIndex));
      });

      const incomingStage = stageRefs.current[nextIndex];
      const incomingContent = contentRefs.current[nextIndex];

      // GSAP Reusable Chapter Transition Choreography
      const tl = gsap.timeline({
        onComplete: () => {
          if (outgoingContent) {
            gsap.set(outgoingContent, { clearProps: "opacity,transform,filter" });
          }
          if (incomingContent) {
            gsap.set(incomingContent, { clearProps: "opacity,transform,filter" });
          }
          setCurrentChapter(nextIndex);
          incomingStage?.focus({ preventScroll: true });
          isTransitioningRef.current = false;
          setIsTransitioning(false);
        },
      });

      // 1. Subtle exit on outgoing chapter: opacity 1 -> ~0.75, scale 1 -> ~0.985, blur 0 -> ~3px
      if (outgoingContent) {
        tl.to(outgoingContent, {
          opacity: 0.75,
          scale: 0.985,
          filter: "blur(3px)",
          duration: 0.4,
          ease: "power2.out",
        });
      }

      // 2. Smoothly move viewport to incoming chapter
      tl.call(
        () => {
          incomingStage?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        [],
        "-=0.1",
      );

      // 3. Incoming chapter: opacity 0, y 30px -> opacity 1, y 0
      if (incomingContent) {
        tl.fromTo(
          incomingContent,
          { opacity: 0, y: 30, filter: "blur(0px)" },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "+=0.15",
        );
      }
    },
    [],
  );

  /**
   * Navigate to an already unlocked chapter (e.g. via ProgressRail click)
   */
  const goTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex > unlockedThrough) return;
      if (targetIndex === currentChapter) return;
      if (isTransitioningRef.current) return;

      const targetStage = stageRefs.current[targetIndex];
      if (targetStage) {
        targetStage.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        targetStage.focus({ preventScroll: true });
      }
    },
    [unlockedThrough, currentChapter],
  );

  // Centralized IntersectionObserver for robust active chapter detection across backscroll & forward scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      () => {
        if (isTransitioningRef.current) return;
        // An outgoing entry may still be "intersecting" below its threshold.
        // Compare current geometry instead of letting the last callback entry win.
        // Visible pixels also work for mobile chapters taller than two viewports.
        let bestIndex = -1;
        let bestVisible = 0;
        stageRefs.current.forEach((stage, index) => {
          if (!stage || index > unlockedThrough) return;
          const rect = stage.getBoundingClientRect();
          const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
          if (visible > bestVisible) { bestIndex = index; bestVisible = visible; }
        });
        if (bestIndex >= 0) setCurrentChapter(bestIndex);
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: "0px",
      },
    );

    stageRefs.current.forEach((stage, idx) => {
      if (stage && idx <= unlockedThrough) {
        observer.observe(stage);
      }
    });

    return () => observer.disconnect();
  }, [unlockedThrough]);

  return (
    <ChapterFlowContext.Provider
      value={{
        currentChapter,
        unlockedThrough,
        completedChapters,
        isTransitioning,
        advance,
        goTo,
        isUnlocked,
        isCompleted,
        getChapterState,
        registerStageRef,
        registerContentRef,
      }}
    >
      {children}
    </ChapterFlowContext.Provider>
  );
}

export function useChapterFlowContext(): ChapterFlowContextValue {
  const ctx = useContext(ChapterFlowContext);
  if (!ctx) {
    throw new Error("useChapterFlow must be used within a ChapterFlowProvider");
  }
  return ctx;
}
