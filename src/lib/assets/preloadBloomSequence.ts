/**
 * Preloader and memory cache for the 60-frame continuous WebP flower bloom sequence.
 * Frames are static public assets located at /assets/flowers/lily-bloom/lily_bloom_001.webp ... 060.webp.
 */

export const TOTAL_BLOOM_FRAMES = 60;

export function getBloomFrameUrl(frameIndex1Based: number): string {
  const numStr = String(frameIndex1Based).padStart(3, "0");
  return `/assets/flowers/lily-bloom-hd/lily_bloom_${numStr}.webp`;
}

export type BloomCanvasFrame = HTMLCanvasElement | HTMLImageElement;

let cachedFrames: BloomCanvasFrame[] | null = null;
let preloadPromise: Promise<BloomCanvasFrame[]> | null = null;

/**
 * Returns the image element directly as HD assets are pre-processed and transparent.
 */
export function createKeyedBloomFrame(source: HTMLImageElement): BloomCanvasFrame {
  return source;
}

/**
 * Preloads all 60 HD frames in the background.
 */
export function preloadBloomSequence(): Promise<BloomCanvasFrame[]> {
  if (cachedFrames && cachedFrames.length === TOTAL_BLOOM_FRAMES) {
    return Promise.resolve(cachedFrames);
  }
  if (preloadPromise) {
    return preloadPromise;
  }

  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }

  preloadPromise = new Promise<BloomCanvasFrame[]>((resolve) => {
    const rawImages: HTMLImageElement[] = new Array(TOTAL_BLOOM_FRAMES);
    let loadedCount = 0;

    const onAllLoaded = () => {
      cachedFrames = rawImages;
      resolve(rawImages);
    };

    for (let i = 1; i <= TOTAL_BLOOM_FRAMES; i++) {
      const img = new Image();
      const idx = i - 1;

      img.onload = () => {
        if ("decode" in img) {
          img.decode().catch(() => {}).finally(() => {
            loadedCount++;
            if (loadedCount === TOTAL_BLOOM_FRAMES) {
              onAllLoaded();
            }
          });
        } else {
          loadedCount++;
          if (loadedCount === TOTAL_BLOOM_FRAMES) {
            onAllLoaded();
          }
        }
      };

      img.onerror = () => {
        console.warn(`[preloadBloomSequence] Failed to load frame ${i} at ${img.src}`);
        loadedCount++;
        if (loadedCount === TOTAL_BLOOM_FRAMES) {
          onAllLoaded();
        }
      };

      img.src = getBloomFrameUrl(i);
      rawImages[idx] = img;
    }
  });

  return preloadPromise;
}

export function getCachedBloomFrames(): BloomCanvasFrame[] | null {
  return cachedFrames;
}
