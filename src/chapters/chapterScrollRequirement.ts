/** The same interaction gate drives both scrolling and the visible next-step cue. */
export function chapterScrollRequirement(index: number, stage: HTMLElement): string | null {
  if (index === 2 && !stage.querySelector('.chapter-envelope-scene[data-state="open"]')) return "Mở phong thư để đi tiếp";
  if (index === 3 && !stage.querySelector('.letter-atelier[data-open="true"]')) return "Mở lá thư để đi tiếp";
  if (index === 4 && !stage.querySelector('.celebration-scene[data-blown="true"]')) return "Thổi nến để đi tiếp";
  return null;
}
