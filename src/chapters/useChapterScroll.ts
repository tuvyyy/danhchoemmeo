import { useEffect, type RefObject } from "react";
import gsap from "gsap";

type Options = {
  stages: RefObject<(HTMLElement | null)[]>;
  current: RefObject<number>;
  transitioning: RefObject<boolean>;
  onStep: (direction: -1 | 1) => void;
};

/** Read within a chapter, then use one fresh gesture to slide to its neighbour. */
export function useChapterScroll({ stages, current, transitioning, onStep }: Options) {
  useEffect(() => {
    let innerTween: gsap.core.Tween | null = null;
    let targetY = window.scrollY;
    let lastWheel = 0;
    let consumedWheel = false;
    let boundaryDelta = 0;
    let touch: { x: number; y: number; lastY: number; axis: "x" | "y" | null; consumed: boolean; target: EventTarget | null } | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const blocked = () => Boolean(document.querySelector('[aria-modal="true"], .spider-split')) || document.body.style.overflow === "hidden";
    const editable = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
    const bounds = () => {
      const stage = stages.current[current.current];
      if (!stage) return null;
      const rect = stage.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      return { top, bottom: top + Math.max(0, rect.height - window.innerHeight) };
    };
    const nestedScroll = (target: EventTarget | null, delta: number) => {
      let node = target instanceof Element ? target : null;
      while (node && node !== document.body && !node.hasAttribute("data-chapter-id")) {
        if (node instanceof HTMLElement && /auto|scroll/.test(getComputedStyle(node).overflowY)
          && node.scrollHeight > node.clientHeight + 1
          && (delta < 0 ? node.scrollTop > 1 : node.scrollTop < node.scrollHeight - node.clientHeight - 1)) return true;
        node = node.parentElement;
      }
      return false;
    };
    const stopInner = () => { innerTween?.kill(); innerTween = null; targetY = window.scrollY; };
    const moveWithin = (delta: number, smooth: boolean) => {
      const range = bounds();
      if (!range) return;
      const previousTarget = innerTween?.isActive() ? targetY : window.scrollY;
      targetY = Math.max(range.top, Math.min(range.bottom, previousTarget + delta));
      innerTween?.kill();
      if (!smooth || reduced.matches) {
        window.scrollTo({ top: targetY, behavior: "instant" });
        innerTween = null;
        return;
      }
      const position = { y: window.scrollY };
      innerTween = gsap.to(position, {
        y: targetY, duration: .5, ease: "power2.out",
        onUpdate: () => window.scrollTo({ top: position.y, behavior: "instant" }),
        onComplete: () => { innerTween = null; },
      });
    };
    const atEdge = (direction: number) => {
      const range = bounds();
      return range && (direction > 0 ? window.scrollY >= range.bottom - 2 : window.scrollY <= range.top + 2);
    };
    const step = (direction: -1 | 1) => { stopInner(); boundaryDelta = 0; onStep(direction); };

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)
        || !event.deltaY || !bounds()) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (blocked()) { if (!nestedScroll(event.target, delta)) event.preventDefault(); return; }
      if (editable(event.target)) return;
      if (nestedScroll(event.target, delta)) return;
      event.preventDefault();
      // Use input time, not handler execution time: a busy video frame must not
      // turn queued events from one trackpad gesture into several fresh gestures.
      const now = event.timeStamp;
      if (now - lastWheel > 220) { consumedWheel = false; boundaryDelta = 0; }
      lastWheel = now;
      if (transitioning.current) { consumedWheel = true; stopInner(); return; }
      if (consumedWheel) return;
      const direction = delta > 0 ? 1 : -1;
      if (atEdge(direction)) {
        if (Math.sign(boundaryDelta) !== direction) boundaryDelta = 0;
        boundaryDelta += delta;
        if (Math.abs(boundaryDelta) >= 45) { consumedWheel = true; step(direction); }
      } else { boundaryDelta = 0; moveWithin(delta, true); }
    };

    const touchStart = (event: TouchEvent) => {
      touch = null;
      if (event.touches.length !== 1 || editable(event.target) || !bounds()) return;
      stopInner();
      const point = event.touches[0];
      touch = { x: point.clientX, y: point.clientY, lastY: point.clientY, axis: null, consumed: false, target: event.target };
    };
    const touchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const point = event.touches[0];
      const dx = point.clientX - touch.x, dy = touch.y - point.clientY;
      if (!touch.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) touch.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (touch.axis !== "y") return; // Native horizontal envelope panning stays native.
      const delta = touch.lastY - point.clientY;
      touch.lastY = point.clientY;
      if (nestedScroll(touch.target, delta)) return;
      if (event.cancelable) event.preventDefault();
      if (blocked()) return;
      if (transitioning.current || touch.consumed) { touch.consumed = true; return; }
      if (atEdge(delta)) {
        if (Math.abs(dy) >= 60) { touch.consumed = true; step(dy > 0 ? 1 : -1); }
      } else moveWithin(delta, false);
    };
    const touchEnd = () => { touch = null; };
    const keyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || editable(event.target) || !bounds()) return;
      if (event.key === " " && event.target instanceof Element && event.target.closest('button, a, [role="button"]')) return;
      const direction = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey) ? 1
        : event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey) ? -1 : 0;
      if (!direction) return;
      if (blocked()) { if (!nestedScroll(event.target, direction)) event.preventDefault(); return; }
      event.preventDefault();
      if (transitioning.current || event.repeat) return;
      if (atEdge(direction)) step(direction);
      else moveWithin(direction * (event.key.startsWith("Arrow") ? 90 : window.innerHeight * .85), true);
    };
    const onVisibility = () => { if (document.hidden) stopInner(); };
    const observer = new MutationObserver(() => { if (blocked() || transitioning.current) stopInner(); });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-chapter-moving", "aria-modal"] });
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd);
    window.addEventListener("touchcancel", touchEnd);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("resize", stopInner);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopInner(); observer.disconnect();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("resize", stopInner);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [stages, current, transitioning, onStep]);
}
