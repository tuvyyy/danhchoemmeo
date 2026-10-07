type Input = 'wheel' | 'touch' | 'key';
type GestureClock = {
  now: () => number;
  schedule: (callback: () => void, delay: number) => number;
  cancel: (id: number) => void;
};

/** Reading remains responsive after arrival; only a decaying tail cannot start another handoff. */
export function chapterScrollGesture(release: () => void, clock?: GestureClock) {
  const timing = clock ?? {
    now: () => performance.now(),
    schedule: (callback: () => void, delay: number) => window.setTimeout(callback, delay),
    cancel: (id: number) => window.clearTimeout(id),
  };
  let timer = 0, lastWheel = -Infinity, locked = false, released = true;
  let lastMagnitude = 0, lastDirection = 0, continuedTravel = 0;
  let landedAt = -Infinity;
  const clearTimer = () => { if (timer) timing.cancel(timer); timer = 0; };
  const end = () => { clearTimer(); released = true; release(); };
  return {
    input(source: Input, repeat = false, eventTime?: number, delta = 0) {
      if (source === 'wheel') {
        // Queued wheel packets keep their original timestamp even after a slow frame.
        const now = eventTime ?? timing.now();
        const afterArrival = now >= landedAt;
        if (afterArrival && now - lastWheel > 180) { locked = false; continuedTravel = 0; }
        const magnitude = Math.abs(delta), direction = Math.sign(delta);
        if (locked && afterArrival && magnitude) {
          // Steady/growing input is continued scrolling. Falling input is the
          // trackpad's momentum tail, which may read but cannot skip a chapter.
          if (direction !== lastDirection) continuedTravel = magnitude;
          else continuedTravel = magnitude >= lastMagnitude * .9 ? continuedTravel + magnitude : 0;
          if (continuedTravel >= 96) locked = false;
        }
        lastMagnitude = magnitude; lastDirection = direction;
        lastWheel = now;
      } else if (source === 'key' && !repeat) locked = false;
      clearTimer();
      // A finger may pause while still down. Pointer up/cancel owns its release;
      // only wheel/key gestures need an idle timer.
      if(source !== 'touch')timer = timing.schedule(end, 140);
      released = false;
      return source !== 'key' || !locked;
    },
    startTouch() { clearTimer(); locked = false; released = false; },
    end,
    settleIfReleased() { if (released) release(); },
    canHandoff() { return !locked; },
    landed() { locked = true; continuedTravel = 0; landedAt = timing.now(); },
    cancel: clearTimer,
  };
}
