import { useEffect, useRef, type RefObject } from 'react';

type Ripple = { x: number; y: number; born: number; size: number };

/** Water and wakes share the pond's coordinates, even while the swans move. */
export default function PondWaterCanvas({ running, pond }: {
  running: boolean;
  pond: RefObject<HTMLDivElement | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0);
  const ripples = useRef<Ripple[]>([]);
  const nextEmission = useRef([0, .65]);

  useEffect(() => {
    const surface = canvas.current;
    const root = pond.current;
    const ctx = surface?.getContext('2d');
    if (!surface || !root || !ctx) return;
    const image = root.querySelector<HTMLImageElement>('.pond-water');
    const swans = [...root.querySelectorAll<HTMLElement>('.pond-swimmer')];
    if (!image) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous = 0;
    let width = 0;
    let height = 0;
    let disposed = false;

    const clipWater = () => {
      ctx.beginPath();
      ctx.moveTo(width * .28, height * .49);
      ctx.lineTo(width * .91, height * .49);
      ctx.lineTo(width * .96, height * .77);
      ctx.quadraticCurveTo(width * .62, height * .88, width * .36, height * .80);
      ctx.closePath();
      ctx.clip();
    };

    const draw = () => {
      if (!image.complete || !image.naturalWidth || !width || !height) return;
      const time = clock.current;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      // Only the open water moves; the shore and its plants remain grounded.
      // The moonlight already in the photo is refracted by the same sine waves.
      ctx.save();
      clipWater();
      for (let y = height * .49; y < height * .87; y += 2) {
        const depth = (y / height - .49) / .38;
        const envelope = Math.sin(Math.min(1, depth) * Math.PI);
        const shift = reduced.matches ? 0 : envelope * width * .0018
          * (Math.sin(y / height * 95 - time * .85) + .35 * Math.sin(y / height * 157 + time * .52));
        ctx.drawImage(image, 0, y / height * image.naturalHeight,
          image.naturalWidth, 2 / height * image.naturalHeight,
          shift, y, width, 2);
      }
      ctx.restore();

      if (!reduced.matches) {
        const bounds = root.getBoundingClientRect();
        if (running && bounds.width > 0 && bounds.height > 0) {
          swans.forEach((swan, index) => {
            if (time < nextEmission.current[index]) return;
            const rect = swan.getBoundingClientRect();
            ripples.current.push({
              x: (rect.left + rect.width * .52 - bounds.left) / bounds.width,
              y: (rect.top + rect.height * .84 - bounds.top) / bounds.height,
              born: time,
              size: rect.width / bounds.width,
            });
            nextEmission.current[index] = time + (index ? 1.55 : 1.35);
          });
        }
        ripples.current = ripples.current.filter(ripple => time - ripple.born < 5.8);
        ctx.save();
        clipWater();
        for (const ripple of ripples.current) {
          const age = time - ripple.born;
          const progress = age / 5.8;
          const radius = width * (ripple.size * .30 + age * .012);
          const alpha = Math.sin(Math.min(1, age / .45) * Math.PI / 2)
            * (1 - progress) ** 1.7 * .27;
          const x = ripple.x * width;
          const y = ripple.y * height;
          // A soft silver edge, with a dim trough, gives the water slight depth.
          ctx.beginPath();
          ctx.ellipse(x, y + .9, radius, radius * .22, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 32, 39, ${alpha * .65})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(x, y, radius, radius * .22, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(205, 221, 224, ${alpha})`;
          ctx.lineWidth = .85;
          ctx.stroke();
        }
        ctx.restore();
      }
      root.dataset.waterReady = 'true';
    };

    const animate = (now: number) => {
      if (previous) clock.current += Math.min((now - previous) / 1000, .05);
      previous = now;
      draw();
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      surface.dataset.running = String(running && !reduced.matches && !document.hidden);
      draw();
      if (running && !reduced.matches && !document.hidden) frame = requestAnimationFrame(animate);
    };
    const resize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    image.addEventListener('load', sync);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    resize();
    sync();
    // decode also covers an image already loading when this effect starts.
    void image.decode().then(() => { if (!disposed) sync(); }).catch(() => {});
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      image.removeEventListener('load', sync);
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [running, pond]);

  return <canvas ref={canvas} className="pond-water-canvas" data-water-effects="ripples-refraction" aria-hidden="true" />;
}
