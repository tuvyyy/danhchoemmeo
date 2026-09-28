import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { TOTAL_CHAPTERS } from "./chapterRegistry";
import { useChapterScroll } from "./useChapterScroll";
import type { ChapterFlowContextValue, ChapterLifecycleState } from "./types";

const ChapterFlowContext = createContext<ChapterFlowContextValue | null>(null);

export function ChapterFlowProvider({ children }: { children: ReactNode }) {
  const [unlockedThrough, setUnlockedThrough] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentRef = useRef(0);
  const unlockedRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const destinationRef = useRef<number | null>(null);
  const transition = useRef<gsap.core.Tween | null>(null);
  const stageRefs = useRef<(HTMLElement | null)[]>([]);
  const contentRefs = useRef<(HTMLElement | null)[]>([]);
  currentRef.current = currentChapter;
  unlockedRef.current = unlockedThrough;

  const registerStageRef = useCallback((index: number, el: HTMLElement | null) => {
    stageRefs.current[index] = el;
  }, []);
  const registerContentRef = useCallback((index: number, el: HTMLElement | null) => {
    contentRefs.current[index] = el;
  }, []);
  const isUnlocked = useCallback((index: number) => index <= unlockedThrough, [unlockedThrough]);
  const isCompleted = useCallback((index: number) => completedChapters.has(index), [completedChapters]);

  const getChapterState = useCallback((index: number): ChapterLifecycleState => {
    if (index > unlockedThrough) return "locked";
    if (isTransitioning) {
      if (index === currentChapter) return "leaving";
      if (index === destinationRef.current) return "entering";
    }
    if (index === currentChapter) return completedChapters.has(index) ? "completing" : "active";
    return index < currentChapter ? "completed" : "ready";
  }, [unlockedThrough, currentChapter, completedChapters, isTransitioning]);

  // One navigation owner for wheel, touch, keyboard, chapter buttons and rail.
  // Animate actual page position: no duplicated scene, blur overlay or transformed
  // ancestors that would interfere with the video, fixed dialogs and envelope.
  const navigate = useCallback((index: number, options?: { instant?: boolean; end?: boolean; unlock?: boolean }) => {
    if (isTransitioningRef.current || index < 0 || index >= TOTAL_CHAPTERS) return;
    if (index > unlockedRef.current && !options?.unlock) return;
    isTransitioningRef.current = true;
    destinationRef.current = index;
    document.body.dataset.chapterMoving = "true";
    flushSync(() => {
      setIsTransitioning(true);
      if (options?.unlock) setUnlockedThrough(previous => Math.max(previous, index));
    });
    const stage = stageRefs.current[index];
    const finish = () => {
      transition.current = null;
      currentRef.current = index;
      isTransitioningRef.current = false;
      destinationRef.current = null;
      delete document.body.dataset.chapterMoving;
      setCurrentChapter(index);
      setIsTransitioning(false);
      stage?.focus({ preventScroll: true });
    };
    if (!stage) { finish(); return; }
    const destination = () => stage.getBoundingClientRect().top + window.scrollY
      + (options?.end ? Math.max(0, stage.offsetHeight - window.innerHeight) : 0);
    if (options?.instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: destination(), behavior: "instant" });
      finish();
      return;
    }
    const from = window.scrollY;
    const position = { progress: 0 };
    transition.current = gsap.to(position, {
      progress: 1, duration: .7, ease: "power2.inOut",
      onUpdate: () => window.scrollTo({ top: from + (destination() - from) * position.progress, behavior: "instant" }),
      onComplete: () => {
        window.scrollTo({ top: destination(), behavior: "instant" });
        finish();
      },
    });
  }, []);

  const advance = useCallback((fromIndex: number, options?: { instant?: boolean }) => {
    if (isTransitioningRef.current || fromIndex !== currentRef.current || fromIndex >= TOTAL_CHAPTERS - 1) return;
    setCompletedChapters(previous => new Set(previous).add(fromIndex));
    navigate(fromIndex + 1, { ...options, unlock: true });
  }, [navigate]);

  const step = useCallback((direction: -1 | 1) => {
    if (direction > 0) advance(currentRef.current);
    else navigate(currentRef.current - 1, { end: true });
  }, [advance, navigate]);

  useChapterScroll({ stages: stageRefs, current: currentRef, transitioning: isTransitioningRef, onStep: step });

  const goTo = useCallback((index: number) => {
    if (index === currentRef.current) return;
    navigate(index);
  }, [navigate]);

  useEffect(() => () => {
    transition.current?.kill();
    delete document.body.dataset.chapterMoving;
  }, []);

  // Keep native/programmatic scroll and chapter lifecycle aligned as well.
  useEffect(() => {
    const observer = new IntersectionObserver(() => {
      if (isTransitioningRef.current) return;
      let bestIndex = -1, bestVisible = 0;
      stageRefs.current.forEach((stage, index) => {
        if (!stage || index > unlockedThrough) return;
        const rect = stage.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        if (visible > bestVisible) { bestIndex = index; bestVisible = visible; }
      });
      if (bestIndex >= 0) setCurrentChapter(bestIndex);
    }, { threshold: [0, .1, .25, .5, .75, 1], rootMargin: "0px" });
    stageRefs.current.forEach((stage, index) => {
      if (stage && index <= unlockedThrough) observer.observe(stage);
    });
    return () => observer.disconnect();
  }, [unlockedThrough]);

  return <ChapterFlowContext.Provider value={{
    currentChapter, unlockedThrough, completedChapters, isTransitioning,
    advance, goTo, isUnlocked, isCompleted, getChapterState, registerStageRef, registerContentRef,
  }}>{children}</ChapterFlowContext.Provider>;
}

export function useChapterFlowContext(): ChapterFlowContextValue {
  const ctx = useContext(ChapterFlowContext);
  if (!ctx) throw new Error("useChapterFlow must be used within a ChapterFlowProvider");
  return ctx;
}
