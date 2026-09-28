import gardenPoster from "@/assets/garden/night-garden-poster.jpg";

let preloaded = false;

/**
 * Intelligent background preloader caching botanical assets into browser cache
 * without blocking Hero initial load or UI interactivity.
 * Preloads the video poster; the original Full HD video loads on chapter mount.
 */
export function preloadFlowerAssets(): void {
  if (preloaded || typeof window === "undefined") return;
  preloaded = true;

  const load = () => {
    const poster = new Image();
    poster.src = gardenPoster;
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(load);
  } else {
    setTimeout(load, 300);
  }
}
