import { preloadBloomSequence } from "./preloadBloomSequence";

let preloaded = false;

/**
 * Intelligent background preloader caching botanical assets into browser cache
 * without blocking Hero initial load or UI interactivity.
 * Preloads the 60-frame continuous WebP bloom sequence.
 */
export function preloadFlowerAssets(): void {
  if (preloaded || typeof window === "undefined") return;
  preloaded = true;

  const load = () => {
    // Preload the 60-frame continuous WebP bloom sequence
    preloadBloomSequence();
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(load);
  } else {
    setTimeout(load, 300);
  }
}
