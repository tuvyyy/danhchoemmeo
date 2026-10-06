/** Wheel/key motion within a chapter, handing unused distance to its transition at the edge. */
export function smoothChapterScroll({ bounds, handoff, blocked }: {
  bounds: () => { top: number; bottom: number } | null;
  handoff: (delta: number) => void;
  blocked: () => boolean;
}) {
  let frame = 0, target = scrollY, position = scrollY, remainder = 0, previous = 0;
  const cancel = () => {
    cancelAnimationFrame(frame); frame = 0; remainder = 0;
    target = position = scrollY;
  };
  const tick = (time: number) => {
    frame = 0;
    if (blocked()) { cancel(); return; }
    const dt = Math.min(.05, Math.max(.001, (time - previous) / 1000)); previous = time;
    position += (target - position) * (1 - Math.exp(-22 * dt));
    // Do not wait for the last subpixel of reading easing before the next scene moves.
    const settled = Math.abs(target - position) < (remainder ? 2 : .45);
    if (settled) position = target;
    window.scrollTo({ top: position, behavior: 'instant' });
    if (settled) {
      const delta = remainder; remainder = 0;
      if (delta) handoff(delta);
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  return {
    move(delta: number, immediate = false) {
      const limits = bounds();
      if (!limits || !Number.isFinite(delta)) return false;
      if (!frame) { target = position = scrollY; previous = performance.now(); }
      // New input after an external scroll starts from the actual position.
      if (Math.abs(scrollY - position) > 3) { target = position = scrollY; remainder = 0; }
      if (remainder && Math.sign(delta) !== Math.sign(remainder)) remainder = 0;
      const requested = target + delta;
      target = Math.max(limits.top, Math.min(limits.bottom, requested));
      remainder += requested - target;
      if (immediate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cancelAnimationFrame(frame); frame = 0;
        position = target; window.scrollTo({top:target,behavior:'instant'});
        const rest = remainder; remainder = 0; if (rest) handoff(rest);
      } else if (!frame) frame = requestAnimationFrame(tick);
      return true;
    },
    cancel,
  };
}
