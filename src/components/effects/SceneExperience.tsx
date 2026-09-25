import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ReactNode } from "react";

type Experience = {
  overlayOpen: boolean;
  celebration: number;
  celebrate: () => void;
  setOverlay: (id: string, open: boolean) => void;
};
const Context = createContext<Experience | null>(null);

export function SceneExperienceProvider({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<Set<string>>(() => new Set());
  const [celebration, setCelebration] = useState(0);
  const setOverlay = useCallback((id: string, open: boolean) => {
    setOverlays(previous => {
      if (previous.has(id) === open) return previous;
      const next = new Set(previous);
      if (open) next.add(id); else next.delete(id);
      return next;
    });
  }, []);
  const celebrate = useCallback(() => setCelebration(value => value + 1), []);
  const value = useMemo(() => ({ overlayOpen: overlays.size > 0, celebration, celebrate, setOverlay }), [overlays, celebration, celebrate, setOverlay]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSceneExperience() {
  const value = useContext(Context);
  if (!value) throw new Error("SceneExperienceProvider is required");
  return value;
}

export function useSceneOverlay(open: boolean) {
  const id = useId();
  const { setOverlay } = useSceneExperience();
  useEffect(() => {
    setOverlay(id, open);
    return () => setOverlay(id, false);
  }, [id, open, setOverlay]);
}
