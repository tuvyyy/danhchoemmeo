import { useEffect, useState, type ComponentType } from "react";
import { useScenePreferences } from "./useScenePreferences";
import type { SceneQuality } from "./sceneConfig";

export interface SceneBackgroundProps {
  effect: "ribbon" | "orb";
  active: boolean;
  quality?: SceneQuality;
  blown?: boolean;
}

export default function SceneBackground({ effect, active, quality, blown = false }: SceneBackgroundProps) {
  const preferences = useScenePreferences();
  const [Renderer, setRenderer] = useState<ComponentType<SceneBackgroundProps & { onUnavailable: () => void }> | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!active || preferences.reducedMotion || Renderer || failed) return;
    let cancelled = false;
    // Let the photograph, text and CTA paint before importing the shader chunk.
    const timer = window.setTimeout(() => {
      import("./threeui/ThreeUIBackground").then(module => {
        if (!cancelled) setRenderer(() => module.default);
      }).catch(() => { if (!cancelled) setFailed(true); });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [active, preferences.reducedMotion, Renderer, failed]);
  const render = Renderer && active && !preferences.reducedMotion && !failed;
  return <div className={`scene-background scene-background--${effect}`} data-blown={blown}
    data-fallback={!render} aria-hidden="true">
    {render && <Renderer effect={effect} active={active} quality={quality ?? preferences.quality} blown={blown} onUnavailable={() => setFailed(true)} />}
  </div>;
}
