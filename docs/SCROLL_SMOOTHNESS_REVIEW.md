# Scroll and content review — 2026-10-05

Wheel and keyboard reading now ease toward one accumulated destination instead of jumping immediately within tall chapters. Only distance left after reaching a chapter edge enters the transition. Direction changes cancel pending travel in the opposite direction. Dialogs, editable fields, native scroll containers, touch gestures, external navigation and reduced motion keep their own behavior.

Chapter scrubbing keeps its velocity when the user changes direction, settles without overshoot and stops requesting frames when stationary. Minor mobile browser toolbar height changes no longer finish a transition halfway through a gesture.

The letter still dissolves into small pieces of its actual rendered content, with the incoming photos arriving from a distance. Appearance snapshots are cached and prepared during reading. Polygon edges are drawn into an atlas once, rather than clipped again for every particle on every frame. Video folding caches its starting geometry instead of reading layout after every animation update. Mascot obstacle measurements wait until scrolling pauses; decorative CSS animations pause in inactive chapters.

Removed repeated eyebrows, handwritten annotations, footer slogans, decorative counters and duplicated interaction hints. Main chapter headings, the letter, photo messages, voucher details, dates and action buttons remain. The mascot speaks on interaction rather than automatically at every chapter.

## Verification

- `npm run typecheck`
- `npm run build`
- `node tests/scroll-motion-driver.mjs`: 180 reversals, one animation loop, idle sleep, bounded progress, endpoint cleanup and suspended frames.
- `node tests/smooth-chapter-scroll.mjs`: gradual reading, preserved wheel distance, edge handoff, reversal, dialog isolation, external scrolling, cancellation and reduced motion.
- `tests/journey-scroll-audit.mjs`: all six boundaries in both directions at 0/20/40/50/60/80/100%, including pauses and direction changes at the midpoint; voucher opening, flower completion, letter reading dialog isolation, photo interactions and candle action. Desktop 1440 × 900 and touch mobile 390 × 844. Checks JavaScript errors and horizontal overflow.
- Forward and reverse contact sheets were inspected for subject continuity, clipping and the relationship between text, flowers, paper and backgrounds.

Local development measurements before/after the fragment optimization (same desktop viewport): the letter → photos forward sequence's 95th-percentile frame interval went from 41.6 ms to 24.9 ms, and its worst interval from 1083.3 ms to 201 ms. Reverse went from 41.6 ms to 24.9 ms, with the worst interval falling from 874.8 ms to 166.7 ms. These automated runs include screenshot and preparation overhead; they are comparative evidence, not a guarantee of a fixed frame rate on every device.

Final production captures and raw measurements are local under `docs/captures/scroll-production` and `docs/captures/scroll-production-mobile`. Reproduce by running `npm run preview -- --host 127.0.0.1 --port 3334`, setting `JOURNEY_URL=http://127.0.0.1:3334`, then running `node tests/journey-scroll-audit.mjs production` and `node tests/journey-scroll-audit.mjs production --mobile`.

## Git upload correction

The failed upload contained roughly 2.5 GB of generated screenshots and recordings in `docs/captures`. These files remain on the local machine but are excluded from version control, along with generated images and videos in `tests`. Production assets remain tracked. Capture review Markdown remains tracked.

The sole unpublished commit was replaced with the cleaned tree, so its large capture blobs do not travel with the main branch. The original commit is preserved locally by `backup/before-scroll-cleanup-20261005`. Its parent is the existing remote main commit, allowing a normal fast-forward push without force.
