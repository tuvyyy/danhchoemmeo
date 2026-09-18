import { useEffect, useRef, useState, type CSSProperties } from "react";

const STAGES = ["01_closed", "02_bud", "03_opening", "04_half_open", "05_nearly_open", "06_full_open"];
const FINAL_STAGE = STAGES.length - 1;
const STAGE_MS = 220;
let sequence: Promise<HTMLImageElement[]> | undefined;
type TulipColor = "ivory" | "butter" | "coral" | "lavender";
type TulipFrame = HTMLImageElement | HTMLCanvasElement;
const coloredSequences = new Map<TulipColor, Promise<TulipFrame[]>>();
const PETAL_TINTS = {
  butter: [1.1, 0.8, 0.32],
  coral: [1.06, 0.47, 0.41],
  lavender: [0.79, 0.59, 1.08],
} as const;

const smoothstep = (low: number, high: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
};

// Every flower draws from the same six decoded V3 images.
export function preloadTulipSequence() {
  return sequence ??= Promise.all(STAGES.map(async (stage) => {
    const image = new Image();
    image.src = `/assets/flowers/tulip-sequence-v3/tulip_v3_${stage}.webp`;
    await image.decode();
    return image;
  }));
}

// Cache each palette once at the display canvas resolution. Tint only pale
// petal pixels; preserve texture, alpha, and the green stem/leaf pixels.
function getTulipFrames(color: TulipColor): Promise<TulipFrame[]> {
  if (color === "ivory") return preloadTulipSequence();
  const cached = coloredSequences.get(color);
  if (cached) return cached;
  const tinted = (async () => {
    const images = await preloadTulipSequence();
    const frames: TulipFrame[] = [];
    for (const image of images) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 768;
      const context = canvas.getContext("2d");
      if (!context) { frames.push(image); continue; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, Math.ceil(canvas.height * 0.44));
      const tint = PETAL_TINTS[color];
      for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
        if (pixels.data[i + 3] === 0) continue;
        const weight = (1 - smoothstep(20, 45, g - (r + b) / 2)) * smoothstep(50, 130, (r + g + b) / 3);
        for (let channel = 0; channel < 3; channel++) {
          pixels.data[i + channel] *= 1 + (tint[channel] - 1) * weight;
        }
      }
      context.putImageData(pixels, 0, 0);
      frames.push(canvas);
      // Yield between frames so decoding/tinting does not block interaction.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    }
    return frames;
  })();
  coloredSequences.set(color, tinted);
  return tinted;
}

interface TulipBloomProps {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  delay: number;
  depth: "foreground" | "midground" | "background";
  color?: TulipColor;
  isActive: boolean;
  hasBloomed: boolean;
  onBloomComplete: () => void;
}

export default function TulipBloom({ id, x, y, scale, rotate, delay, depth, color = "ivory", isActive, hasBloomed, onBloomComplete }: TulipBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);
  const completeCallback = useRef(onBloomComplete);
  const [frames, setFrames] = useState<TulipFrame[]>();
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  useEffect(() => { completeCallback.current = onBloomComplete; });

  useEffect(() => {
    let cancelled = false;
    getTulipFrames(color).then((images) => {
      if (!cancelled) setFrames(images);
    }).catch((error: unknown) => console.error("Tulip sequence failed to load", error));
    return () => { cancelled = true; };
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frames) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = -1;
    const draw = (index: number) => {
      if (frame === index) return;
      frame = index;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frames[index], 0, 0, canvas.width, canvas.height);
      canvas.dataset.bloomStage = String(index + 1);
    };
    const complete = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setIsFullyOpen(true);
      completeCallback.current();
    };
    if (hasBloomed || completedRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(FINAL_STAGE);
      complete();
      return;
    }
    draw(Math.min(FINAL_STAGE, Math.floor(Math.max(0, elapsedRef.current - delay) / STAGE_MS)));
    if (!isActive) return;
    const start = performance.now() - elapsedRef.current;
    let raf = 0;
    const tick = (now: number) => {
      elapsedRef.current = now - start;
      const bloomTime = Math.max(0, elapsedRef.current - delay);
      draw(Math.min(FINAL_STAGE, Math.floor(bloomTime / STAGE_MS)));
      if (bloomTime >= STAGES.length * STAGE_MS) complete();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frames, isActive, delay, hasBloomed]);

  return (
    <div className="nature-bloom__tulip" data-tulip={id} data-depth={depth} data-color={color}
      data-bloom-complete={isFullyOpen} data-sway={isActive && isFullyOpen} aria-hidden="true"
      style={{ "--tulip-x": `${x}%`, "--tulip-bottom": `${y}%`, "--tulip-scale": scale, "--tulip-rotation": `${rotate}deg` } as CSSProperties}>
      <canvas ref={canvasRef} width={512} height={768} data-bloom-stage="1" />
    </div>
  );
}
