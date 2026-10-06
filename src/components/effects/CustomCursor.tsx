import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useChapterFlow } from "@/chapters/useChapterFlow";
import { useSceneExperience } from "./SceneExperience";
import ChapterCursorShape, { CHAPTER_CURSOR_THEMES } from "./ChapterCursorShape";
import "./chapter-cursor.css";

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  type: "heart" | "star" | "bubble";
  rotation: number;
  rotSpeed: number;
}

export default function CustomCursor() {
  const { currentChapter, isTransitioning } = useChapterFlow();
  const theme = CHAPTER_CURSOR_THEMES[currentChapter] ?? CHAPTER_CURSOR_THEMES[0];
  const themeRef = useRef(theme); themeRef.current = theme;
  const { overlayOpen } = useSceneExperience();
  const paused = isTransitioning || overlayOpen;
  const pausedRef = useRef(paused); pausedRef.current = paused;
  const wakeRef = useRef(() => {});
  const [enabled, setEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Position state with lerp for silky smooth movement
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const lastSpawnPos = useRef({ x: -100, y: -100 });
  const particles = useRef<TrailParticle[]>([]);

  useEffect(() => {
    // Only enable for desktop pointer devices with fine control (mouse / trackpad)
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    setEnabled(true);


    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (pausedRef.current) return;
      setIsVisible(true);
      wakeRef.current();

      // Robust hover detection via elementFromPoint
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (el) {
        const isClickable =
          el.tagName === "BUTTON" ||
          el.tagName === "A" ||
          el.getAttribute("role") === "button" ||
          el.getAttribute("tabindex") !== null ||
          el.closest("button") !== null ||
          el.closest("a") !== null ||
          el.closest('[role="button"]') !== null ||
          window.getComputedStyle(el).cursor === "pointer";
        setIsHovering(!!isClickable);
      } else {
        setIsHovering(false);
      }

      // Check distance from last particle spawn to create a steady fairy-dust trail
      const dx = e.clientX - lastSpawnPos.current.x;
      const dy = e.clientY - lastSpawnPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 14 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        lastSpawnPos.current = { x: e.clientX, y: e.clientY };

        // Spawn 1 or 2 gentle trail sparkles / hearts
        const count = Math.random() > 0.6 ? 2 : 1;
        for (let k = 0; k < count; k++) {
          const colorBase = themeRef.current.trail;
          const type = themeRef.current.particle;

          particles.current.push({
            x: e.clientX + (Math.random() * 12 - 6),
            y: e.clientY + (Math.random() * 12 - 6),
            vx: (Math.random() - 0.5) * 1.2,
            vy: Math.random() * 0.9 + 0.4, // gently drift downward like stardust
            size: type === "heart" ? 9 + Math.random() * 4 : 7 + Math.random() * 5,
            alpha: 1,
            decay: 0.014 + Math.random() * 0.008, // lasts ~1.2s
            color: colorBase,
            type,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08,
          });
        }

        // Cap maximum particles
        if (particles.current.length > 50) {
          particles.current.shift();
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current) return;
      setIsClicking(true);
      wakeRef.current();
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Burst of hearts and stars on click
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 2.4 + Math.random() * 2.8;
        const colorBase = themeRef.current.trail;

        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() > 0.4 ? 10 : 8,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.01,
          color: colorBase,
          type: themeRef.current.particle,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const onMouseUp = () => {
      setIsClicking(false);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      wakeRef.current();
      setIsVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("custom-cursor-enabled", enabled && !paused && isVisible);
    return () => document.body.classList.remove("custom-cursor-enabled");
  }, [enabled, paused, isVisible]);

  useEffect(() => {
    // Discard the previous chapter's trail and resume at the actual pointer.
    particles.current = [];
    lastSpawnPos.current = { ...mousePos.current };
    currentPos.current = { ...mousePos.current };
    setIsHovering(false);
    setIsClicking(false);
    wakeRef.current();
  }, [currentChapter]);

  // Sleep when the pointer settles, and release the canvas during scene changes.
  useEffect(() => {
    if (!enabled || paused) return;

    let animId = 0;

    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
      }
      wakeRef.current();
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const drawHeart = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      color: string,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(
        -size / 2,
        (size + topCurveHeight) / 2,
        0,
        (size + topCurveHeight) / 2 + size * 0.25,
        0,
        size,
      );
      ctx.bezierCurveTo(
        0,
        (size + topCurveHeight) / 2 + size * 0.25,
        size / 2,
        (size + topCurveHeight) / 2,
        size / 2,
        topCurveHeight,
      );
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      color: string,
      rotation: number,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos(((i * 90) * Math.PI) / 180) * size, Math.sin(((i * 90) * Math.PI) / 180) * size);
        ctx.lineTo(
          Math.cos(((i * 90 + 45) * Math.PI) / 180) * (size * 0.28),
          Math.sin(((i * 90 + 45) * Math.PI) / 180) * (size * 0.28),
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      color: string,
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowColor = `${color}0.8)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      animId = 0;
      if (document.hidden) return;
      // 1. Lerp cursor position for buttery feel
      const ease = 0.45;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }

      // 2. Render particle trail on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

          for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha -= p.decay;
            p.rotation += p.rotSpeed;

            if (p.alpha <= 0) {
              particles.current.splice(i, 1);
              continue;
            }

            if (p.type === "heart") {
              drawHeart(ctx, p.x, p.y, p.size, p.alpha, p.color);
            } else if (p.type === "star") {
              drawStar(ctx, p.x, p.y, p.size, p.alpha, p.color, p.rotation);
            } else {
              drawBubble(ctx, p.x, p.y, p.size, p.alpha, p.color);
            }
          }
        }
      }

      const moving = Math.hypot(mousePos.current.x - currentPos.current.x, mousePos.current.y - currentPos.current.y) > .05;
      if (moving || particles.current.length) animId = requestAnimationFrame(loop);
    };
    const wake = () => { if (!animId && !document.hidden) animId = requestAnimationFrame(loop); };
    wakeRef.current = wake;
    document.addEventListener("visibilitychange", wake);
    wake();

    return () => {
      cancelAnimationFrame(animId);
      wakeRef.current = () => {};
      particles.current = [];
      const canvas = canvasRef.current;
      canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [enabled, paused]);

  if (!enabled) return null;

  return (
    <>
      {/* Background canvas for smooth sparkle & heart particle trail */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9998]"
      />

      <div
        ref={cursorRef}
        data-custom-cursor={theme.shape}
        data-cursor-chapter={currentChapter}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform"
        style={{
          opacity: isVisible && !paused ? 1 : 0,
          transition: "opacity 0.2s ease-out",
          '--cursor-accent': theme.accent,
        } as CSSProperties}
      >
        <div className="chapter-cursor__shape" data-hovering={isHovering}
          style={{ transform: `translate(-6px, -4px) scale(${isClicking ? .86 : isHovering ? 1.12 : 1})` }}>
          <div key={theme.shape} className="chapter-cursor__art">
            <ChapterCursorShape shape={theme.shape} />
          </div>
        </div>
      </div>
    </>
  );
}
