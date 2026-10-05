import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { SceneExperienceProvider } from "@/components/effects/SceneExperience";
import LoadingScreen from "@/components/loading/LoadingScreen";
import AmbientGlow from "@/components/layout/AmbientGlow";
import ProgressRail from "@/components/navigation/ProgressRail";
import ScrollCompanion from "@/components/effects/ScrollCompanion";
import CustomCursor from "@/components/effects/CustomCursor";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { ChapterFlowProvider } from "@/chapters/ChapterFlowContext";
import { useChapterFlow } from "@/chapters/useChapterFlow";
import { CHAPTER_REGISTRY } from "@/chapters/chapterRegistry";
import ChapterStage from "@/chapters/ChapterStage";

function BirthdayJourney() {
  const [isLoading, setIsLoading] = useState(true);
  const { currentChapter, unlockedThrough, isTransitioning, advance, goTo, isUnlocked } = useChapterFlow();

  return (
    <div className="relative min-h-screen min-h-[100svh] w-full bg-ink text-cream">
      {/* Romantic Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading-screen" onFinish={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* Ambient background glow */}
          <AmbientGlow />

          {/* Floating petals and journey companion */}
          {currentChapter > 0 && <ScrollCompanion />}
          <div data-journey-ui className="contents">{currentChapter > 0 && currentChapter !== 2 && currentChapter !== 6 && <CustomCursor />}</div>

          {/* Chapter navigation rail */}
          {currentChapter > 2 && (
            <ProgressRail
              compact={currentChapter >= 3 && currentChapter <= 5}
              steps={BIRTHDAY_DATA.steps}
              current={currentChapter}
              unlocked={unlockedThrough + 1}
              onSelect={goTo}
            />
          )}

          {/* Pre-mount upcoming chapter so geometry and assets are ready for seamless handoff */}
          <main className="relative z-10 w-full">
            {CHAPTER_REGISTRY.map((meta) =>
              meta.index <= unlockedThrough + 1 ? (
                <ChapterStage key={meta.id} meta={meta}>
                  <meta.Component onComplete={(opts) => advance(meta.index, opts)} />
                </ChapterStage>
              ) : null,
            )}
          </main>

        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ChapterFlowProvider>
        <SceneExperienceProvider>
          <BirthdayJourney />
        </SceneExperienceProvider>
      </ChapterFlowProvider>
    </MotionConfig>
  );
}
