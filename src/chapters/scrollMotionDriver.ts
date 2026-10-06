export interface MotionClock {
  now: () => number;
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
}

/** One frame loop for a gesture. New input changes the destination, not the clock. */
export function scrollMotionDriver({ reverse, scrollDelta, paint, cleanup, finish, distance, clock, autoDuration, response = 10, maxSpeed = .5 }: {
  reverse: boolean;
  scrollDelta?: number;
  paint: (progress: number) => void;
  cleanup: () => void;
  finish: (atPrevious: boolean) => void;
  distance?: number;
  clock?: MotionClock;
  /** Optional cinematic CTA duration; gesture input still scrubs without autoplay. */
  autoDuration?: number;
  /** Critically damped response rate; lower values give a heavier page turn. */
  response?: number;
  /** Maximum chapter progress per second, including strong wheel/trackpad input. */
  maxSpeed?: number;
}) {
  const timing = clock ?? {
    now: () => performance.now(),
    request: (callback: (time: number) => void) => window.requestAnimationFrame(callback),
    cancel: (id: number) => window.cancelAnimationFrame(id),
  };
  const travel = distance ?? Math.max(720, window.innerHeight);
  let position = reverse ? 1 : 0;
  let target = position;
  let velocity = 0;
  let frame = 0;
  let previousTime = timing.now();
  let disposed = false;
  let automatic: { start: number; from: number; duration: number } | null = null;
  let direction = 0, directionalTravel = 0, intent = 0;
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (frame) timing.cancel(frame);
    frame = 0;
    cleanup();
  };
  const complete = (atPrevious: boolean) => {
    if (disposed) return;
    dispose();
    finish(atPrevious);
  };
  const tick = (time: number) => {
    frame = 0;
    if (disposed) return;
    const dt = Math.min(.05, Math.max(.001, (time - previousTime) / 1000));
    previousTime = time;
    if (automatic) {
      const t = clamp((time - automatic.start) / automatic.duration);
      position = automatic.from + (target - automatic.from) * (t * t * (3 - 2 * t));
      if (t === 1) automatic = null;
    } else {
      // Analytic critically damped response: velocity survives rapid wheel reversals.
      const omega = response;
      const error = position - target;
      const impulse = (velocity + omega * error) * dt;
      const decay = Math.exp(-omega * dt);
      const next = target + (error + impulse) * decay;
      velocity = (velocity - omega * impulse) * decay;
      const change = Math.max(-maxSpeed * dt, Math.min(maxSpeed * dt, next - position));
      // Pace the visible handoff, not just its target. A large wheel delta or
      // endpoint release cannot skip the choreography in a handful of frames.
      if (Math.abs(next - position) > maxSpeed * dt) velocity = change / dt;
      position += change;
      if (position < 0 || position > 1) { position = clamp(position); velocity = 0; }
    }
    const settled = !automatic && Math.abs(position - target) < .00008 && Math.abs(velocity) < .003;
    if (settled) { position = target; velocity = 0; }
    paint(position);
    if (settled) {
      if (target === 0 || target === 1) complete(target === 0);
      return; // No animation frame remains scheduled while the scene is held.
    }
    frame = timing.request(tick);
  };
  const wake = () => {
    if (disposed || frame) return;
    previousTime = timing.now();
    frame = timing.request(tick);
  };
  const seek = (progress: number, animate = true, duration?: number) => {
    if (disposed || !Number.isFinite(progress)) return;
    target = clamp(progress);
    if (target < .0001) target = 0;
    if (target > .9999) target = 1;
    automatic = animate ? { start: timing.now(), from: position, duration: duration ?? (450 + Math.abs(target - position) * 850) } : null;
    if (animate) velocity = 0;
    wake();
  };
  const driver = {
    move: (delta: number) => {
      if (disposed || !Number.isFinite(delta)) return;
      if (!delta) return;
      const sign = Math.sign(delta);
      directionalTravel = sign === direction ? directionalTravel + Math.abs(delta) : Math.abs(delta);
      direction = sign;
      // Ignore tiny direction noise, but honor a deliberate reversal immediately.
      if (directionalTravel >= 40) intent = sign;
      const next = (automatic ? position : target) + delta / travel;
      seek(next, false);
    },
    release: () => {
      if (disposed || automatic) return;
      // Keep the spring's velocity so releasing the wheel/finger does not restart motion.
      seek(intent ? (intent > 0 ? 1 : 0) : (target < .5 ? 0 : 1), false);
    },
    seek,
    cancel: () => seek(reverse ? 1 : 0),
    settle: () => complete(position < .5),
    dispose,
  };
  paint(position);
  if (scrollDelta === undefined) seek(reverse ? 0 : 1, true, autoDuration);
  else driver.move(scrollDelta);
  return driver;
}
