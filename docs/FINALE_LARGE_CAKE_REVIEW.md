# Finale composition and silver butterfly review — 2026-10-05

The cake now bleeds through the left and bottom edges instead of appearing as a small complete cutout. At 1440 × 900 its image width increases from roughly 531 to 855 pixels; at 390 × 844 from 312 to 449 pixels. The candle remains positioned relative to the cake's frosting, independent of changing greeting text. The desktop headline increases from roughly 79 to 103 pixels, body from 17 to 22 pixels, and controls from 10 to 14 pixels. Mobile typography and controls also increase.

Four silver / ivory butterflies match the existing cake decoration; mobile uses three. Each cutout has separately hinged wings and an independent flight wrapper. The foreground route stays beside the cake, and the upper route stays above the desktop headline. The butterflies lift gently after extinguishing the candle. Generic star particles and the redundant footer status line are removed.

Flight and wing motion pause during chapter scrubbing, after leaving the chapter, while a dialog is open, and while the document is hidden. Reduced motion displays still butterflies in positions chosen separately for mobile. Flight uses CSS transforms without another JavaScript frame loop. The 512 × 512 alpha WebP is 84,068 bytes and shared by every sprite. Tool, final prompt and runtime path are documented in `public/assets/birthday-cake/SILVER_BUTTERFLY.md`.

## Rendered review

Actual Chrome screenshots, not mockups:

- Desktop: `docs/captures/finale-large-cake-final/lit.png`, `flight.png`, `smoke.png`, `wish.png`.
- Mobile: `docs/captures/finale-large-cake-final-mobile/` with the same states.
- Mobile reduced motion: `docs/captures/finale-large-cake-final-reduced-mobile/lit.png`.
- Before / after: `docs/captures/finale-large-cake-comparison.jpg` and `finale-large-cake-comparison-mobile.jpg`.
- Seven-frame transitions in both directions: `docs/captures/finale-large-cake-transition.jpg` and `finale-large-cake-transition-mobile.jpg`, at 0 / 20 / 40 / 50 / 60 / 80 / 100 percent.

Focal hierarchy: the cake dominates the left foreground; the enlarged two-line title anchors the right half. Mobile puts the title above the oversized cake and leaves the flame accessible below the controls. Deliberate cropping connects the image to the viewport instead of leaving a small floating object. The ivory background and warm directional light match the cream frosting; soft shadows give the butterflies depth. Negative space around the headline stays clear of the flight paths. Decoration comes from the subject itself, rather than unrelated confetti or ornamental frames.

Transition inspection: the ticket remains visible as the cake enters; the cake carries the midpoint while the headline settles. Both forward and reverse sheets retain a readable focal object at every sampled frame. The enlarged cake stays anchored during the lit-to-wish state change. The second iteration moved the upper butterfly route away from the title and increased wingbeat cadence; static reduced-motion butterflies on mobile were also moved below or beside the copy.

## Verification

- `corepack pnpm run typecheck` and `corepack pnpm run build`.
- `node tests/candle-wind.mjs`: correct flame crossing in both directions; vertical, distant, tiny, slow and stale movements rejected.
- `node tests/finale-workflow.mjs large-cake-final --transition`.
- `node tests/finale-workflow.mjs large-cake-final --mobile --transition`.
- `node tests/finale-workflow.mjs large-cake-final-reduced --mobile --reduced`.
- Desktop reduced motion also checked with `large-cake-reduced --reduced`.

The browser workflow travels through every chapter, captures forward / reverse final handoffs, checks wing motion and paused poses, performs pointer / touch candle gestures, verifies relighting and keyboard focus, retains the wish on chapter re-entry and returns to the beginning. No horizontal overflow or browser exceptions. Binary review captures remain local and ignored by Git; only the production asset and source / review files are committed.

One reduced-motion mobile run timed out waiting for the synthetic touch gesture while three Chrome instances ran concurrently. Its isolated rerun passed completely with the same production build. Final desktop / mobile transition runs also exited successfully.
