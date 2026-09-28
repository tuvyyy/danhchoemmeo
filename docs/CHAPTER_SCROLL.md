# Chapter scrolling — 2026-09-28

Reference: [QClay](https://qclay.design/), researched through its public [JavaScript bundle](https://qclay.design/static/js/main.b9149932.js) and [stylesheet](https://qclay.design/static/css/main.62f88bea.css). An interactive reference browser was unavailable during this task, so these are source findings, not a claim of frame-by-frame visual matching.

The reference has a custom controller with full-height sections translating vertically. It interpolates movement within long sections, moves to the neighbouring section only at an edge, and locks input during a change. The application config specifies a 700ms section transition. Its section-specific animation timelines also react to scroll progress; those bespoke QClay scenes are not copied into the birthday site.

## Implementation

- `useChapterScroll.ts` handles vertical wheel gestures, touch and Page Up/Down, arrows and Space. Tall chapters scroll internally with a short eased movement. Once at an edge, a fresh gesture slides to the next/previous chapter.
- `ChapterFlowContext.tsx` owns the 700ms page-position tween. It uses the existing GSAP dependency and actual document scrolling, keeping semantic page sections and fixed overlays intact. Chapter wrappers receive no blur/scale transforms and no blackout overlay is created.
- One continuous wheel gesture advances at most one chapter, including residual trackpad events. Additional chapters mount only when first reached. Next buttons and the navigation rail use the same motion. The opening CTA retains its own covered split and direct handoff; wheel navigation uses the vertical slide.
- Returning to a tall previous chapter lands at its bottom for uninterrupted upward reading. Reduced motion moves immediately.
- Modal reading blocks background scrolling and chapter navigation, while nested scrollable content retains its own scrolling. Horizontal envelope swipes, text inputs, pinch/ctrl-wheel zoom and normal button activation are preserved.
- Envelope entry remains closed, including return visits. Only pressing the seal opens it. Video/reel and envelope animation lifecycles remain chapter-scoped.

## Verification

`node tests/chapter-scroll.mjs` covers within-chapter damping, continuous wheel bursts, vertical direction, all seven chapters, final boundary, keyboard navigation, voucher modal isolation, reduced motion and real emulated touch gestures (including horizontal envelope panning).

The existing `tests/envelope-cinematic.mjs` and `tests/garden-video.mjs` cover the envelope and media interactions after navigation. Tests use local Chrome; phone tests emulate viewport/touch behavior rather than a physical device.
