import { publicAsset } from "@/lib/assets/publicAsset";
/**
 * Preloader and memory cache for the 60-frame continuous WebP flower bloom sequence.
 * Uses the existing transparent version of the lily sequence, with opaque petals.
 */

export const TOTAL_BLOOM_FRAMES = 60;
export type BloomSequence = 'pink' | 'blue';

export function getBloomFrameUrl(frameIndex1Based: number, sequence: BloomSequence = 'pink'): string {
  const numStr = String(frameIndex1Based).padStart(3, "0");
  if (sequence === 'blue') return publicAsset(`/assets/flowers/lily-blue-bloom/lily_blue_${numStr}.webp`);
  return publicAsset(`/assets/flowers/lily-bloom-hd/lily_bloom_${numStr}.webp`);
}

export type BloomCanvasFrame = HTMLCanvasElement | HTMLImageElement;

const cachedFrames = new Map<BloomSequence, BloomCanvasFrame[]>();
const preloadPromises = new Map<BloomSequence, Promise<BloomCanvasFrame[]>>();

/**
 * Existing cutout frames need no pixel processing or blend effects.
 */
export function createKeyedBloomFrame(source: HTMLImageElement): BloomCanvasFrame {
  return source;
}

/**
 * Preloads all 60 pack frames in the background.
 */
export function preloadBloomSequence(sequence: BloomSequence = 'pink'): Promise<BloomCanvasFrame[]> {
  const cached = cachedFrames.get(sequence);
  if (cached && cached.length === TOTAL_BLOOM_FRAMES) {
    return Promise.resolve(cached);
  }
  const pending = preloadPromises.get(sequence);
  if (pending) {
    return pending;
  }

  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }

  const promise = new Promise<BloomCanvasFrame[]>((resolve, reject) => {
    const rawImages: HTMLImageElement[] = new Array(TOTAL_BLOOM_FRAMES);
    let loadedCount = 0;

    const onAllLoaded = () => {
      cachedFrames.set(sequence, rawImages);
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
        reject(new Error(`Failed to load ${sequence} bloom frame ${i}`));
      };

      img.src = getBloomFrameUrl(i, sequence);
      rawImages[idx] = img;
    }
  });

  preloadPromises.set(sequence, promise);
  // Failed requests can retry on a later mount instead of caching broken images.
  void promise.catch(() => preloadPromises.delete(sequence));
  return promise;
}

export function getCachedBloomFrames(sequence: BloomSequence = 'pink'): BloomCanvasFrame[] | null {
  return cachedFrames.get(sequence) ?? null;
}
