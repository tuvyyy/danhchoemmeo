# Chapter 03: restore the pre-video flower meadow

Reviewed 2026-10-06. This supersedes the bouquet arrangement documented in LETTER_FLOWER_CLUSTER_REVIEW.md.

## Source and requested layout

The planting comes from `src/sections/FlowersSection.tsx` at commit `624a0c0`, before that chapter was replaced with video: the same 13 tulip positions, scales, colors and staggered delays; the two lily sequences; and the original tall side grasses and ground strip. Only that flower scene is transplanted. The current video remains in chapter 01.

Chapter 03 now places the letter on the left and the flower field on the right, with grass along the bottom. The introduction headline/button and unused decorative thread are removed. A plain dark stage replaces the plum backdrop; no garden photograph loads. On narrow screens the letter sits above the flower bed so the page and reading controls remain usable.

## Rendered review

Desktop 1440 × 900 and mobile 390 × 844 were inspected as full-size screenshots and seven-frame bloom sequences (0/20/40/50/60/80/100%).

- **Focal hierarchy:** the bright paper on the left remains the main reading target. The lower right meadow supplies the second focal point, without an extra headline competing with the letter.
- **Composition:** the flower spacing is the old meadow planting rather than the previous fan-shaped bouquet. Dark space separates the page from the blooms; the grass connects the lower edge across both sides.
- **Material and lighting:** the original alpha cutouts, stem masks and dimmed grass remain. The paper keeps its existing overlapping sheets, seal and shadows. There is no unrelated photographic background behind the cutouts.
- **Motion:** closed buds remain visible before the staggered openings. Flowers begin only when chapter 03 is active and the decoded sequences are ready. Off-chapter/hidden/reading states pause animation. CSS grass sway avoids an added per-frame JavaScript loop.
- **Iteration:** the first mobile layout left too much space between the page, blooms and grass. The final layout reduces the paper height and field height, keeping all three grouped in the phone viewport. The full reader remains available for larger text.
- **Handoffs:** individual flower elements join the existing upward fragment dissolve; grass and atmosphere fade beneath it. Seven forward and reverse frames show an identifiable letter or incoming photos throughout. The book entrance follows the letter's new left-hand position.

## Local visual evidence

Captures are ignored by Git to avoid adding binary history. They remain available in the workspace:

- [Desktop before / after](captures/restored-meadow/desktop-before-after.png)
- [Mobile before / after](captures/restored-meadow/mobile-before-after.png)
- [Desktop staggered bloom](captures/restored-meadow/desktop-bloom-contact-sheet.png)
- [Mobile staggered bloom](captures/restored-meadow/mobile-bloom-contact-sheet.png)
- [Chapter 03 / 04 forward and reverse dissolve](captures/restored-meadow/chapter-3-4-contact-sheet.png)
- [Desktop book entrance and reversal](captures/restored-meadow/desktop-book-contact-sheet.png)
- [Mobile book entrance and reversal](captures/restored-meadow/mobile-book-contact-sheet.png)
- [Final desktop letter and meadow](captures/restored-meadow/desktop-final/04-letter-open.png)
- [Final mobile letter and meadow](captures/restored-meadow/mobile-final/04-letter-open.png)

## Validation

- `corepack pnpm run typecheck`: passed.
- `corepack pnpm run build`: passed; the existing large-chunk advisory remains.
- `tests/letter-bloom.mjs`: desktop, mobile and reduced-motion journeys passed. Checks cover preserved video playback, 15 blooms, three loaded grass assets, removed introduction, left/right desktop placement, no scenic background, open/fold, two-page reader, pause and chapter completion.
- `tests/book-handoff.mjs`: desktop and mobile forward/reverse book opening, held midpoint, arrival and cleanup passed.
- `tests/moments-workflow.mjs restored-meadow`: real wheel input, pause/reversal, actual rasterized fragments, four photo flips, preserved state, chapter completion and cleanup passed.

The local screenshots establish layout and continuity. They are not a claim that browser performance will be identical on every device.
