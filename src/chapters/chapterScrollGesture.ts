type Input = 'wheel' | 'touch' | 'key';
type GestureClock = {
  now: () => number;
  schedule: (callback: () => void, delay: number) => number;
  cancel: (id: number) => void;
};

/** A chapter owns one gesture, including its inertial tail after arrival. */
export function chapterScrollGesture(release: () => void, clock?: GestureClock) {
  const timing = clock ?? {
    now: () => performance.now(),
    schedule: (callback: () => void, delay: number) => window.setTimeout(callback, delay),
    cancel: (id: number) => window.clearTimeout(id),
  };
  let timer = 0, lastWheel = -Infinity, locked = false, released = true;
  const clearTimer = () => { if (timer) timing.cancel(timer); timer = 0; };
  const end = () => { clearTimer(); released = true; release(); };
  return {
    input(source: Input, repeat = false, eventTime?: number) {
      if (source === 'wheel') {
        // Queued wheel packets keep their original timestamp even after a slow frame.
        const now = eventTime ?? timing.now();
        if (now - lastWheel > 180) locked = false;
        lastWheel = now;
      } else if (source === 'key' && !repeat) locked = false;
      clearTimer();
      // A finger may pause while still down. Pointer up/cancel owns its release;
      // only wheel/key gestures need an idle timer.
      if(source !== 'touch')timer = timing.schedule(end, 140);
      released = false;
      return !locked;
    },
    startTouch() { clearTimer(); locked = false; released = false; },
    end,
    settleIfReleased() { if (released) release(); },
    landed() { locked = true; },
    cancel: clearTimer,
  };
}
