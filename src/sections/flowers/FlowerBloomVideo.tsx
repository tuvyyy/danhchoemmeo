import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import fullBloomLily from "@/assets/flowers/lily_frame_05_full_bloom.png";

interface FlowerBloomVideoProps {
  isActive: boolean;
  hasBloomed: boolean;
  onQuoteTrigger: () => void;
  onBloomComplete: () => void;
}

// Target asset paths for true continuous botanical bloom video
const VIDEO_CANDIDATES = [
  "/src/assets/flowers/lily-bloom.webm",
  "/assets/flowers/lily-bloom.webm",
  "/src/assets/flowers/lily-bloom.mp4",
  "/assets/flowers/lily-bloom.mp4",
];

export default function FlowerBloomVideo({
  isActive,
  hasBloomed,
  onQuoteTrigger,
  onBloomComplete,
}: FlowerBloomVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track video asset availability
  // Defaults to false until video load or probe succeeds
  const [videoAvailable, setVideoAvailable] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);

  // Callback refs to avoid stale closures
  const onQuoteTriggerRef = useRef(onQuoteTrigger);
  const onBloomCompleteRef = useRef(onBloomComplete);
  const quoteTriggeredRef = useRef(false);
  const bloomCompleteTriggeredRef = useRef(false);

  useEffect(() => {
    onQuoteTriggerRef.current = onQuoteTrigger;
    onBloomCompleteRef.current = onBloomComplete;
  });

  // ── 1. Botanical breeze sway on container (runs continuously for organic garden feel) ──
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(containerRef.current, {
        rotation: 0.45,
        x: 2,
        duration: 7.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── 2. Probe for video asset existence on mount ──
  useEffect(() => {
    let isCancelled = false;

    const probeCandidates = async () => {
      for (const candidate of VIDEO_CANDIDATES) {
        try {
          const res = await fetch(candidate, { method: "HEAD" });
          if (res.ok && !isCancelled) {
            const contentType = res.headers.get("content-type") || "";
            // Vite serves text/html for missing files due to SPA fallback.
            // Must strictly verify genuine video MIME type and avoid HTML fallbacks.
            if (
              !contentType.includes("text/html") &&
              (contentType.startsWith("video/") ||
                contentType.includes("video/webm") ||
                contentType.includes("video/mp4"))
            ) {
              setVideoAvailable(true);
              return;
            }
          }
        } catch {
          // Candidate not reachable, try next
        }
      }

      if (!isCancelled) {
        setVideoAvailable(false);
        console.info(
          "[FlowerBloomVideo] TRUE BLOOM ASSET REQUIRED: Awaiting botanical bloom video asset at /src/assets/flowers/lily-bloom.webm. Displaying static mature lily with ambient breeze."
        );
      }
    };

    probeCandidates();

    return () => {
      isCancelled = true;
    };
  }, []);

  // ── 3. Fallback flow when video is not present (NO 5-frame slideshow!) ──
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // If video is available, let the video timeupdate handler control callbacks
    if (videoAvailable) return;

    // If already bloomed (return visit), keep unlocked
    if (hasBloomed) {
      if (!quoteTriggeredRef.current) {
        quoteTriggeredRef.current = true;
        onQuoteTriggerRef.current();
      }
      if (!bloomCompleteTriggeredRef.current) {
        bloomCompleteTriggeredRef.current = true;
        onBloomCompleteRef.current();
      }
      return;
    }

    // Reduced motion: immediate unlock
    if (prefersReducedMotion) {
      quoteTriggeredRef.current = true;
      bloomCompleteTriggeredRef.current = true;
      onQuoteTriggerRef.current();
      onBloomCompleteRef.current();
      return;
    }

    // First visit with static mature flower:
    // Natural pacing to appreciate the garden scene before quote and CTA reveal
    if (!isActive) return;

    const quoteTimer = window.setTimeout(() => {
      if (!quoteTriggeredRef.current) {
        quoteTriggeredRef.current = true;
        onQuoteTriggerRef.current();
      }
    }, 1800);

    const completeTimer = window.setTimeout(() => {
      if (!bloomCompleteTriggeredRef.current) {
        bloomCompleteTriggeredRef.current = true;
        onBloomCompleteRef.current();
      }
    }, 3200);

    return () => {
      window.clearTimeout(quoteTimer);
      window.clearTimeout(completeTimer);
    };
  }, [isActive, hasBloomed, videoAvailable]);

  // ── 4. Video playback & lifecycle controls when true video asset is available ──
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const progress = video.currentTime / video.duration;

    // Trigger quote around 70-75% bloom completion
    if (progress >= 0.72 && !quoteTriggeredRef.current) {
      quoteTriggeredRef.current = true;
      onQuoteTriggerRef.current();
    }

    // Trigger completion near end of bloom video (or on ended event)
    if ((progress >= 0.96 || video.ended) && !bloomCompleteTriggeredRef.current) {
      bloomCompleteTriggeredRef.current = true;
      video.pause();
      onBloomCompleteRef.current();
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    if (!quoteTriggeredRef.current) {
      quoteTriggeredRef.current = true;
      onQuoteTriggerRef.current();
    }
    if (!bloomCompleteTriggeredRef.current) {
      bloomCompleteTriggeredRef.current = true;
      onBloomCompleteRef.current();
    }
  }, []);

  useEffect(() => {
    if (!videoAvailable) return;
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Return visit: keep at end of video, paused
    if (hasBloomed) {
      if (video.duration) {
        video.currentTime = video.duration;
      }
      video.pause();
      return;
    }

    // Reduced motion: jump immediately to end
    if (prefersReducedMotion) {
      if (video.duration) {
        video.currentTime = video.duration;
      }
      video.pause();
      if (!quoteTriggeredRef.current) {
        quoteTriggeredRef.current = true;
        onQuoteTriggerRef.current();
      }
      if (!bloomCompleteTriggeredRef.current) {
        bloomCompleteTriggeredRef.current = true;
        onBloomCompleteRef.current();
      }
      return;
    }

    // Normal playback on chapter activation
    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[FlowerBloomVideo] Playback deferred:", err);
        });
      }
    } else {
      video.pause();
    }
  }, [isActive, hasBloomed, videoAvailable, videoLoaded]);

  return (
    <div
      data-layer="flower-bloom"
      data-bloom-mode={videoAvailable ? "video" : "static-fallback"}
      ref={containerRef}
      className="absolute bottom-0 left-[46%] z-[2] w-[32vw] max-w-[380px] min-w-[220px] origin-bottom select-none"
      style={{ transformOrigin: "center bottom" }}
    >
      <div className="relative aspect-[3/4] w-full">
        {videoAvailable ? (
          <video
            ref={videoRef}
            playsInline
            muted
            preload="auto"
            onLoadedMetadata={() => setVideoLoaded(true)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onError={() => {
              console.warn("[FlowerBloomVideo] Video element error. Reverting to static mature lily.");
              setVideoAvailable(false);
            }}
            className="pointer-events-none absolute inset-0 h-full w-full origin-bottom object-contain will-change-[transform,opacity]"
            style={{
              transformOrigin: "center bottom",
              filter: "drop-shadow(0 26px 44px rgba(0,0,0,0.55))",
            }}
          >
            <source src="/src/assets/flowers/lily-bloom.webm" type="video/webm" />
            <source src="/assets/flowers/lily-bloom.webm" type="video/webm" />
            <source src="/src/assets/flowers/lily-bloom.mp4" type="video/mp4" />
            <source src="/assets/flowers/lily-bloom.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Single static mature flower with ambient wind sway (NO fake slideshow crossfade) */
          <img
            src={fullBloomLily}
            alt="Hoa ly trắng nở rộ ngát hương"
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full origin-bottom object-contain will-change-[transform]"
            style={{
              transformOrigin: "center bottom",
              filter: "drop-shadow(0 26px 44px rgba(0,0,0,0.55))",
            }}
          />
        )}
      </div>
    </div>
  );
}
