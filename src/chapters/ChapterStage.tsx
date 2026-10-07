import { type ReactNode } from "react";
import { useChapterFlowContext } from "./ChapterFlowContext";
import type { ChapterMeta } from "./types";
import { CHAPTER_EFFECTS } from "@/components/effects/sceneConfig";

interface ChapterStageProps {
  meta: ChapterMeta;
  children: ReactNode;
  className?: string;
}

export default function ChapterStage({ meta, children, className = "" }: ChapterStageProps) {
  const { registerStageRef, registerContentRef, getChapterState } = useChapterFlowContext();
  const state = getChapterState(meta.index);

  return (
    <section
      id={`chapter-${meta.id}`}
      data-idx={meta.index}
      data-chapter-id={meta.id}
      data-scene-effect={CHAPTER_EFFECTS[meta.id]}
      data-chapter-state={state}
      tabIndex={-1}
      style={{ touchAction: 'pan-x pinch-zoom' }}
      ref={(el) => registerStageRef(meta.index, el)}
      className={`relative min-h-screen min-h-[100svh] w-full outline-none transition-colors ${className}`}
      aria-label={`${meta.label} (Chương ${meta.displayNumber})`}
    >
      <div
        data-chapter-content={meta.id}
        inert={state !== 'active' && state !== 'completing' && state !== 'leaving'}
        onClickCapture={event => { if (state === 'leaving') { event.preventDefault(); event.stopPropagation(); } }}
        ref={(el) => registerContentRef(meta.index, el)}
        className="relative h-full min-h-[100svh] w-full"
      >
        {children}
      </div>
    </section>
  );
}
