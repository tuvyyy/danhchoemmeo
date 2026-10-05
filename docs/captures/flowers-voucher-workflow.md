# Scroll-controlled Flowers → Voucher journey

The golden thread now grows with wheel/touch distance and shortens when the user reverses. Releasing input holds both the picture/envelope composition and the thread at their current progress. A short 160 ms settling tween smooths input; it never completes the journey without further input. One viewport of input completes the handoff (minimum 720 px). The existing CTA remains an automatic shortcut.

## Interactive additions

- Three milestones: **Khu vườn → Giữ kỷ niệm → Gửi cho em**. Click any milestone to travel there; the middle milestone holds the keepsake composition.
- A draggable, keyboard-accessible range controls the same playhead.
- Progress percentage, active step, changing captions, and a luminous leading tip all reflect actual progress.
- Arrow/Page keys step through the journey; Escape returns to the originating scene.
- Viewport resizing releases fixed geometry and settles at the nearest scene. Reduced motion uses direct chapter navigation.
- The reel stays behind the video. Native inner-chapter scrolling, seal opening, voucher inspection and horizontal envelope panning remain available.

## Visual review

Iteration 1 exposed a mismatched SVG tip and stroke caused by non-scaling strokes on a stretched SVG, plus overlapping headings. Iteration 2 fixes the stroke coordinate system, shifts the path below the caption, and hands typography over in sequence.

Inspected desktop 1440×900 and mobile 390×844, forward/reverse at 5% intervals (84 rendered frames total), plus actual input recordings. Both cats and the envelope remain identifiable at the midpoint. No dead frames or horizontal overflow were observed in the samples.

- [Desktop comparison](flowers-voucher-workflow-comparison.png)
- [Mobile comparison](flowers-voucher-workflow-comparison-mobile.png)
- [Desktop forward/reverse sheet](flowers-voucher-workflow2-sheet.png)
- [Mobile forward/reverse sheet](flowers-voucher-workflow2-mobile-sheet.png)
- [Desktop recording](flowers-voucher-workflow-preview.mp4)
- [Mobile recording](flowers-voucher-workflow-preview-mobile.mp4)

## Validation

- `corepack pnpm typecheck`
- `corepack pnpm build`
- `node tests/flowers-voucher-scroll.mjs workflow2 --dense` (and `--mobile`): actual wheel progression, idle hold, reversal, thread length, layer visibility, endpoint release and horizontal overflow.
- `node tests/flowers-voucher-interaction.mjs`: native scroll, milestone buttons, range drag, keyboard, Escape, resize, seal, four voucher inspections, touch reverse, repeat navigation, reduced motion and delayed asset loading.
- `ENVELOPE_TEST_URL=http://127.0.0.1:3333 node tests/garden-video.mjs`: desktop/mobile/tablet video playback and reel layering.

The production JavaScript entry remains approximately 525 kB before gzip. No asset compression or unrelated chapter changes were made in this iteration.

## Main files

- `src/chapters/ChapterFlowContext.tsx`: scroll-driven controller, reversal, shortcuts and cleanup.
- `src/chapters/FlowersVoucherFlow.tsx`, `flowers-voucher-flow.css`: thread, tip, captions and interactive controls. Progress paints this isolated surface without rerendering all chapters.
- `src/sections/FlowersSection.tsx`, `flowers/VideoGarden.css`: discoverable scroll cue.
- `src/sections/voucher/CinematicVoucherSection.tsx`, `cinematic-envelope.css`: removal of the old time-driven ribbon.
