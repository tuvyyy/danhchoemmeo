import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  getCachedBloomFrames,
  preloadBloomSequence,
  TOTAL_BLOOM_FRAMES,
  getBloomFrameUrl,
  createKeyedBloomFrame,
  type BloomCanvasFrame,
} from "@/lib/assets/preloadBloomSequence";

interface FlowerBloomCanvasProps {
  isActive: boolean;
  hasBloomed: boolean;
  onQuoteTrigger?: () => void;
  onBloomComplete?: () => void;
  onStageTrigger?: (stage: number) => void;
  isSecondary?: boolean;
  delayMs?: number;
  durationMs?: number;
  baseRotation?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_BLOOM_DURATION_MS = 5000; // ~12 FPS across 60 frames = 5.0 seconds

export default function FlowerBloomCanvas({
  isActive,
  hasBloomed,
  onQuoteTrigger,
  onBloomComplete,
  onStageTrigger,
  isSecondary = false,
  delayMs = 0,
  durationMs = DEFAULT_BLOOM_DURATION_MS,
  baseRotation = 0,
  className,
  style,
}: FlowerBloomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playback & frame tracking refs (avoid React rerendering during 60fps RAF loop)
  const currentFrameIndexRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const elapsedRef = useRef(0);
  const [isFullyOpen, setIsFullyOpen] = useState(hasBloomed);

  // Milestone triggers
  const quoteTriggeredRef = useRef<boolean>(false);
  const completeTriggeredRef = useRef<boolean>(false);
  const triggeredStagesRef = useRef<Set<number>>(new Set());

  // Callback refs to avoid stale closures
  const onQuoteTriggerRef = useRef(onQuoteTrigger);
  const onBloomCompleteRef = useRef(onBloomComplete);
  const onStageTriggerRef = useRef(onStageTrigger);
  useEffect(() => {
    onQuoteTriggerRef.current = onQuoteTrigger;
    onBloomCompleteRef.current = onBloomComplete;
    onStageTriggerRef.current = onStageTrigger;
  });

  // Image cache refs
  const cachedFramesRef = useRef<BloomCanvasFrame[] | null>(getCachedBloomFrames());
  const initialFrameImgRef = useRef<BloomCanvasFrame | null>(null);
  const finalFrameImgRef = useRef<BloomCanvasFrame | null>(null);
  const [framesReady, setFramesReady] = useState<boolean>(
    () => !!cachedFramesRef.current && cachedFramesRef.current.length === TOTAL_BLOOM_FRAMES
  );

  // ── Draw helper with Retina / High-DPI support ──
  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pick target image
    let targetImg: BloomCanvasFrame | null = null;
    if (cachedFramesRef.current && cachedFramesRef.current[frameIdx]) {
      targetImg = cachedFramesRef.current[frameIdx];
    } else if (frameIdx === TOTAL_BLOOM_FRAMES - 1 && finalFrameImgRef.current) {
      targetImg = finalFrameImgRef.current;
    } else if (initialFrameImgRef.current) {
      targetImg = initialFrameImgRef.current;
    }

    if (!targetImg) return;
    if ("complete" in targetImg && (!targetImg.complete || targetImg.naturalWidth === 0)) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || 480;
    const displayHeight = rect.height || 480;

    const targetWidth = Math.round(displayWidth * dpr);
    const targetHeight = Math.round(displayHeight * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const isCanvas = "getContext" in targetImg;
    const srcWidth = isCanvas
      ? (targetImg as HTMLCanvasElement).width
      : (targetImg as HTMLImageElement).naturalWidth || 1024;
    const srcHeight = isCanvas
      ? (targetImg as HTMLCanvasElement).height
      : (targetImg as HTMLImageElement).naturalHeight || 1024;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(targetImg, 0, 0, srcWidth, srcHeight, 0, 0, displayWidth, displayHeight);

    ctx.restore();
  };

  // ── 1. Botanical breeze sway on container ──
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !isActive || !isFullyOpen || !containerRef.current) return;

    const ctx = gsap.context(() => {
      if (isSecondary) {
        gsap.to(containerRef.current, {
          rotation: baseRotation - 0.3,
          x: -0.5,
          duration: 8.8,
          delay: 0.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      } else {
        gsap.to(containerRef.current, {
          rotation: baseRotation + 0.25,
          x: 0.5,
          duration: 7.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isSecondary, isActive, isFullyOpen, baseRotation]);

  // ── 2. Ensure initial frame (001) and final frame (060) are quickly ready ──
  useEffect(() => {
    let cancelled = false;
    // Standalone preloading for instant placeholder and instant reduced motion
    const img001 = new Image();
    img001.src = getBloomFrameUrl(1);
    img001.onload = () => {
      if (cancelled) return;
      try {
        initialFrameImgRef.current = createKeyedBloomFrame(img001);
      } catch {
        initialFrameImgRef.current = img001;
      }
      if (!hasBloomed && currentFrameIndexRef.current === 0) {
        drawFrame(0);
      }
    };

    const img060 = new Image();
    img060.src = getBloomFrameUrl(60);
    img060.onload = () => {
      if (cancelled) return;
      try {
        finalFrameImgRef.current = createKeyedBloomFrame(img060);
      } catch {
        finalFrameImgRef.current = img060;
      }
      if (hasBloomed || (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        drawFrame(TOTAL_BLOOM_FRAMES - 1);
      }
    };

    // Preload full sequence
    preloadBloomSequence().then((images) => {
      if (cancelled) return;
      cachedFramesRef.current = images;
      setFramesReady(true);
      if (hasBloomed) {
        drawFrame(TOTAL_BLOOM_FRAMES - 1);
      } else if (currentFrameIndexRef.current === 0) {
        drawFrame(0);
      }
    });
    return () => {
      cancelled = true;
      img001.onload = null;
      img060.onload = null;
    };
  }, [hasBloomed]);

  // ── 3. Chapter Lifecycle, RAF Playback & Timing ──
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Return Visit: show frame 60 immediately, do not replay
    if (hasBloomed || completeTriggeredRef.current) {
      setIsFullyOpen(true);
      currentFrameIndexRef.current = TOTAL_BLOOM_FRAMES - 1;
      drawFrame(TOTAL_BLOOM_FRAMES - 1);
      if (containerRef.current) {
        containerRef.current.setAttribute("data-bloom-frame", String(TOTAL_BLOOM_FRAMES));
        containerRef.current.setAttribute("data-bloom-complete", "true");
      }
      triggeredStagesRef.current = new Set([1, 2, 3, 4]);
      onStageTriggerRef.current?.(4);
      if (!quoteTriggeredRef.current) {
        quoteTriggeredRef.current = true;
        onQuoteTriggerRef.current?.();
      }
      if (!completeTriggeredRef.current) {
        completeTriggeredRef.current = true;
        onBloomCompleteRef.current?.();
      }
      return;
    }

    // Reduced Motion: immediate final frame, no animation
    if (prefersReducedMotion) {
      setIsFullyOpen(true);
      currentFrameIndexRef.current = TOTAL_BLOOM_FRAMES - 1;
      drawFrame(TOTAL_BLOOM_FRAMES - 1);
      if (containerRef.current) {
        containerRef.current.setAttribute("data-bloom-frame", String(TOTAL_BLOOM_FRAMES));
        containerRef.current.setAttribute("data-bloom-complete", "true");
      }
      triggeredStagesRef.current = new Set([1, 2, 3, 4]);
      onStageTriggerRef.current?.(4);
      quoteTriggeredRef.current = true;
      completeTriggeredRef.current = true;
      onQuoteTriggerRef.current?.();
      onBloomCompleteRef.current?.();
      return;
    }

    // If not active, pause animation
    if (!isActive) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isPlayingRef.current = false;
      return;
    }

    if (!framesReady) return;

    // First visit & active: begin continuous bloom playback
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      startTimeRef.current = performance.now() - elapsedRef.current;

      // Ensure frame 1 is visible at start
      drawFrame(currentFrameIndexRef.current);
      containerRef.current?.setAttribute("data-bloom-frame", String(currentFrameIndexRef.current + 1));

      const tick = (now: number) => {
        if (!startTimeRef.current) startTimeRef.current = now;
        const timeSinceStart = now - startTimeRef.current;
        elapsedRef.current = timeSinceStart;

        // Staggered delay: wait at bud frame 0 until delayMs has elapsed
        if (timeSinceStart < delayMs) {
          if (containerRef.current) {
            containerRef.current.setAttribute("data-bloom-frame", "1");
          }
          rafIdRef.current = requestAnimationFrame(tick);
          return;
        }

        const elapsed = timeSinceStart - delayMs;
        const progress = Math.min(1, elapsed / durationMs);

        // Map elapsed time to 0..59 frame index
        const frameIndex = Math.min(
          TOTAL_BLOOM_FRAMES - 1,
          Math.floor(progress * (TOTAL_BLOOM_FRAMES - 1))
        );

        if (frameIndex !== currentFrameIndexRef.current) {
          currentFrameIndexRef.current = frameIndex;
          drawFrame(frameIndex);
          if (containerRef.current) {
            containerRef.current.setAttribute("data-bloom-frame", String(frameIndex + 1));
          }
        }

        // Sequential 4-quadrant text stage triggers:
        // Stage 1: Top-Left message at progress >= 0.18 (~0.9s)
        if (progress >= 0.18 && !triggeredStagesRef.current.has(1)) {
          triggeredStagesRef.current.add(1);
          onStageTriggerRef.current?.(1);
        }

        // Stage 2: Top-Right message at progress >= 0.45 (~2.25s)
        if (progress >= 0.45 && !triggeredStagesRef.current.has(2)) {
          triggeredStagesRef.current.add(2);
          onStageTriggerRef.current?.(2);
        }

        // Stage 3: Bottom-Left message at progress >= 0.70 (~3.5s)
        if (progress >= 0.70 && !triggeredStagesRef.current.has(3)) {
          triggeredStagesRef.current.add(3);
          onStageTriggerRef.current?.(3);
        }

        // Quote threshold at >= 72% bloom completion (backward compatibility)
        if (progress >= 0.72 && !quoteTriggeredRef.current) {
          quoteTriggeredRef.current = true;
          onQuoteTriggerRef.current?.();
        }

        // Stage 4: Bottom-Right message at progress >= 0.90 (~4.5s)
        if (progress >= 0.90 && !triggeredStagesRef.current.has(4)) {
          triggeredStagesRef.current.add(4);
          onStageTriggerRef.current?.(4);
        }

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(tick);
        } else {
          // Permanently lock final bloom frame (60)
          currentFrameIndexRef.current = TOTAL_BLOOM_FRAMES - 1;
          drawFrame(TOTAL_BLOOM_FRAMES - 1);
          if (containerRef.current) {
            containerRef.current.setAttribute("data-bloom-frame", String(TOTAL_BLOOM_FRAMES));
            containerRef.current.setAttribute("data-bloom-complete", "true");
          }
          isPlayingRef.current = false;
          setIsFullyOpen(true);
          if (!completeTriggeredRef.current) {
            completeTriggeredRef.current = true;
            onBloomCompleteRef.current?.();
          }
        }
      };

      rafIdRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, [isActive, hasBloomed, framesReady, delayMs, durationMs]);

  // Window resize handler to maintain Retina crispness
  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameIndexRef.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const defaultClass = isSecondary
    ? "absolute bottom-[-4vh] sm:bottom-[-6vh] left-[22%] sm:left-[26%] z-[2] w-[20vw] max-w-[280px] min-w-[150px] aspect-square origin-bottom select-none"
    : "relative z-10 flex items-center justify-center w-[75vw] sm:w-[58vw] md:w-[44vw] max-w-[440px] min-w-[260px] aspect-square select-none mx-auto";

  return (
    <div
      ref={containerRef}
      data-layer="flower-bloom"
      data-flower-role={isSecondary ? "secondary" : "main"}
      data-flower-main={!isSecondary ? "true" : undefined}
      data-flower-secondary={isSecondary ? "true" : undefined}
      data-bloom-mode="canvas-sequence"
      data-bloom-frame={String(currentFrameIndexRef.current + 1)}
      className={className || defaultClass}
      style={{
        transformOrigin: "center bottom",
        transform: `rotate(${baseRotation}deg)`,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label={isSecondary ? "Bông hoa ly nhỏ đang hé nở" : "Bông hoa ly chính đang nở rộ"}
        className="h-full w-full object-contain pointer-events-none"
      />
    </div>
  );
}
