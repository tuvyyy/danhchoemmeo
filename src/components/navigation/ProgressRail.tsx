interface ProgressRailProps {
  steps: string[];
  current: number;
  unlocked: number;
  onSelect?: (index: number) => void;
}

export default function ProgressRail({ steps, current, unlocked, onSelect }: ProgressRailProps) {
  return (
    <nav
      aria-label="Tiến trình hành trình"
      className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 sm:flex"
    >
      {steps.map((step, i) => {
        const isCurrent = i === current;
        const isUnlocked = i < unlocked; // i <= unlockedThrough

        return (
          <button
            key={step}
            type="button"
            disabled={!isUnlocked}
            onClick={() => isUnlocked && onSelect?.(i)}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`${step} (Chương ${i + 1})${isUnlocked ? "" : " - Chưa mở"}`}
            className={`group flex items-center gap-3 text-left transition-opacity outline-none ${
              isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-40"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                isCurrent
                  ? "scale-150 bg-gold"
                  : isUnlocked
                    ? "bg-cream-dim/60 group-hover:bg-gold/80"
                    : "bg-cream-dim/20"
              }`}
            />
            <span
              className={`font-body text-[10px] uppercase tracking-[0.25em] transition-all duration-300 ${
                isCurrent
                  ? "text-gold opacity-100"
                  : isUnlocked
                    ? "text-cream-dim opacity-0 group-hover:opacity-75"
                    : "text-cream-dim/30 opacity-0"
              }`}
            >
              {step}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
