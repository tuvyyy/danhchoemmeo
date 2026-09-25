import { useEffect, useRef, type PointerEvent } from "react";
import { useScenePreferences } from "./useScenePreferences";

export function useSceneTilt(strength = 4) {
  const { finePointer, reducedMotion } = useScenePreferences();
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!finePointer || reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
    event.currentTarget.style.setProperty("--tilt-x", `${-y * strength}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * strength}deg`);
  };
  const onPointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };
  return { onPointerMove, onPointerLeave };
}

export function useGardenDepth(active: boolean) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, mobile } = useScenePreferences();
  useEffect(() => {
    const element = ref.current;
    if (!element || !active || reducedMotion) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(1, rect.height)));
      element.style.setProperty("--garden-depth", `${progress * (mobile ? 10 : 24)}px`);
    };
    const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      element.style.removeProperty("--garden-depth");
    };
  }, [active, reducedMotion, mobile]);
  return ref;
}
