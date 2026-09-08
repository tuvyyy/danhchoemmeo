import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BLOOM_FRAMES } from "./bloomConfig";

interface FlowerBloomProps {
  isActive: boolean;
  hasBloomed: boolean;
  onStageTrigger?: (stage: number) => void;
  onBloomComplete?: () => void;
}

export default function FlowerBloom({
  isActive,
  hasBloomed,
  onStageTrigger,
  onBloomComplete,
}: FlowerBloomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLImageElement | null)[]>([]);
  const hasStartedRef = useRef<boolean>(false);

  // Keep latest callbacks in refs
  const onStageTriggerRef = useRef(onStageTrigger);
  const onBloomCompleteRef = useRef(onBloomComplete);
  useEffect(() => {
    onStageTriggerRef.current = onStageTrigger;
    onBloomCompleteRef.current = onBloomComplete;
  });

  // Gentle botanical breeze sway
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(containerRef.current, {
        rotation: 0.6,
        x: 3,
        duration: 7.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Main bloom timeline (5 clean transparent PNG frames)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Return visit: ensure frame 4 is fully visible
    if (hasBloomed) {
      frameRefs.current.slice(0, 4).forEach((el) => {
        if (el) el.style.opacity = "0";
      });
      if (frameRefs.current[4]) {
        frameRefs.current[4].style.opacity = "1";
      }
      return;
    }

    // Reduced motion: immediate reveal
    if (prefersReducedMotion) {
      frameRefs.current.slice(0, 4).forEach((el) => {
        if (el) el.style.opacity = "0";
      });
      if (frameRefs.current[4]) {
        frameRefs.current[4].style.opacity = "1";
      }
      onStageTriggerRef.current?.(1);
      onStageTriggerRef.current?.(2);
      onStageTriggerRef.current?.(3);
      onStageTriggerRef.current?.(4);
      onBloomCompleteRef.current?.();
      return;
    }

    if (!isActive || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const ctx = gsap.context(() => {
      // 1. Initial opacities before bloom begins
      frameRefs.current.forEach((el, i) => {
        if (el) {
          gsap.set(el, {
            opacity: i === 0 ? 1 : 0,
            scale: i === 0 ? 1 : 0.985,
            filter: i === 0 ? "blur(0px)" : "blur(1.5px)",
          });
        }
      });

      // 2. Timeline transitions across all 5 frames with quadrant stage triggers
      const DURATION = 0.95;
      const OVERLAP = "-=0.75";

      const tl = gsap.timeline({
        delay: 0.3,
        onComplete: () => {
          // Permanently lock final bloom state
          frameRefs.current.slice(0, 4).forEach((el) => {
            if (el) el.style.opacity = "0";
          });
          if (frameRefs.current[4]) {
            frameRefs.current[4].style.opacity = "1";
          }
          onBloomCompleteRef.current?.();
        },
      });

      const f0 = frameRefs.current[0];
      const f1 = frameRefs.current[1];
      const f2 = frameRefs.current[2];
      const f3 = frameRefs.current[3];
      const f4 = frameRefs.current[4];

      if (f0 && f1 && f2 && f3 && f4) {
        // Stage 1: Frame 0 (bud) -> Frame 1 (opening)
        tl.call(() => onStageTriggerRef.current?.(1))
          .to(f0, { opacity: 0, scale: 1.015, filter: "blur(1.5px)", duration: DURATION, ease: "power1.inOut" })
          .to(f1, { opacity: 1, scale: 1.0, filter: "blur(0px)", duration: DURATION, ease: "power1.inOut" }, OVERLAP)
        // Stage 2: Frame 1 (opening) -> Frame 2 (half bloom)
          .call(() => onStageTriggerRef.current?.(2), [], "+=0.1")
          .to(f1, { opacity: 0, scale: 1.015, filter: "blur(1.5px)", duration: DURATION, ease: "power1.inOut" })
          .to(f2, { opacity: 1, scale: 1.0, filter: "blur(0px)", duration: DURATION, ease: "power1.inOut" }, OVERLAP)
        // Stage 3: Frame 2 (half bloom) -> Frame 3 (almost open)
          .call(() => onStageTriggerRef.current?.(3), [], "+=0.1")
          .to(f2, { opacity: 0, scale: 1.015, filter: "blur(1.5px)", duration: DURATION, ease: "power1.inOut" })
          .to(f3, { opacity: 1, scale: 1.0, filter: "blur(0px)", duration: DURATION, ease: "power1.inOut" }, OVERLAP)
        // Stage 4: Frame 3 (almost open) -> Frame 4 (full bloom)
          .call(() => onStageTriggerRef.current?.(4), [], "+=0.1")
          .to(f3, { opacity: 0, scale: 1.015, filter: "blur(1.5px)", duration: DURATION, ease: "power1.inOut" })
          .to(f4, { opacity: 1, scale: 1.0, filter: "blur(0px)", duration: DURATION + 0.15, ease: "power1.inOut" }, OVERLAP);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isActive]);

  return (
    <div
      data-layer="flower-bloom"
      ref={containerRef}
      className="relative z-10 flex items-center justify-center w-[70vw] max-w-[420px] min-w-[260px] aspect-square select-none mx-auto"
      style={{
        transformOrigin: "center bottom",
        maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
      }}
    >
      <div className="relative h-full w-full">
        {BLOOM_FRAMES.map((cfg, i) => {
          const isFinalFrame = i === BLOOM_FRAMES.length - 1;
          const defaultOpacity = hasBloomed ? (isFinalFrame ? 1 : 0) : (i === 0 ? 1 : 0);

          return (
            <img
              key={cfg.src}
              ref={(el) => {
                frameRefs.current[i] = el;
              }}
              src={cfg.src}
              alt={isFinalFrame ? cfg.label : ""}
              aria-hidden={!isFinalFrame}
              loading="eager"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full origin-bottom object-contain will-change-[opacity,transform,filter]"
              style={{
                opacity: defaultOpacity,
                transformOrigin: "center bottom",
                transform: `translate(${cfg.x}px, ${cfg.y}px) scale(${cfg.scale}) rotate(${cfg.rotation}deg)`,
                filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.5))",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
