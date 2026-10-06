# Whole-chapter page turn and denser chapter-three meadow

Reviewed 2026-10-06. Supersedes the book-opening behavior and sparse planting described in LETTER_MEADOW_RESTORATION_REVIEW.md.

## Result

The page-turn effect now belongs to the chapter boundary. Chapter 02 rotates as one viewport-sized page around its right edge, progressively uncovering chapter 03. The letter stays flat in its final left-hand position throughout the transition. The rotating letter cover, temporary blank reverse face and fold control have been removed; the two letter pages and enlarged reader remain.

The meadow retains the established cutout flowers, bloom sequences and grass. It now has 31 tulips (previously 13) in staggered back, middle and front rows, plus the two lilies. Tulip height and placement vary by row. The grass is lower and less prominent, with the ground strip raised to meet the planted stems. The page tilt is reduced and the reading controls are more legible. Mobile retains a readable letter above the meadow. The video chapter is unchanged.

## Continuity and frame work

The old handoff moved the letter, opened a separate cover/reverse face and changed its open state at arrival. The new handoff measures chapter geometry before positioning, reserves the native chapter heights, and animates the outgoing page with transform/opacity only. There are no per-frame layout measurements in its paint callback, and no letter-state or height switch at completion.

The page uses the existing single scroll-motion loop with a gentler critically damped response. Wheel/touch input can hold or reverse the turn; clicking the next control uses a 1.65-second turn. Temporary positioning and the page shade are reverted on completion. Existing response settings for other chapter boundaries remain unchanged.

## Rendered review and iteration

Inspected actual desktop 1440 × 900 and mobile 390 × 844 screenshots, seven bloom frames and seven page-turn frames in each direction.

- **Hierarchy:** the stationary letter remains the reading anchor on the left. The denser tulip meadow fills the lower right without a competing headline. On mobile the letter comes first, followed by the bed of flowers.
- **Composition:** flowers now form varied rows rather than a sparse cluster at the edge. The smaller paper tilt and quieter side grass keep the page readable. The grass bank connects the stems to the bottom of the scene.
- **Lighting/material:** existing alpha cutouts and paper texture remain. The page turn carries the actual outgoing chapter content, with perspective and a subtle surface shade; there is no blank paper sheet attached to the letter and no photographic garden backdrop.
- **Transition continuity:** the incoming letter and buds are visible while the outgoing chapter is still recognizable. Reverse scroll restores the same page path. No inspected keyframe loses both scenes.
- **Iterations:** the initial left-edge turn made the outgoing envelope loom toward the viewer. Moving the hinge to the right exposes the stationary letter earlier. The first expanded flower bed also left stems above the grass; lower planting, a raised ground strip and smaller tulip scale connect the final bed to the ground.

## Local evidence

Generated captures remain ignored by Git to keep binary history small.

- [Desktop final scene](captures/page-meadow/desktop-final/04-letter-open.png)
- [Mobile final scene](captures/page-meadow/mobile-final/04-letter-open.png)
- [Desktop layout before / after](captures/page-meadow/desktop-layout-before-after.png)
- [Mobile layout before / after](captures/page-meadow/mobile-layout-before-after.png)
- [Page-turn scope before / after](captures/page-meadow/page-turn-before-after.png)
- [Desktop forward / reverse turn](captures/page-meadow/desktop-page-turn-contact.png)
- [Mobile forward / reverse turn](captures/page-meadow/mobile-page-turn-contact.png)
- [Desktop staggered blooms](captures/page-meadow/desktop-bloom-contact.png)
- [Mobile staggered blooms](captures/page-meadow/mobile-bloom-contact.png)
- [Chapter 03 / 04 fragment dissolve and reverse](captures/page-meadow/chapter-3-4-contact.png)

## Validation

- TypeScript check and production build passed.
- `tests/book-handoff.mjs`, desktop and mobile: actual wheel/touch input, seven forward/reverse states, midpoint hold, whole-chapter rotation, no letter hinge, no arrival geometry jump, shade cleanup and no overflow/browser errors.
- `tests/letter-bloom.mjs`, desktop/mobile/reduced motion: preserved video playback, 33 flower canvases, 31 completed tulips, loaded grass, flat letter, two-page reader, paused animation, no scenic photograph and chapter completion.
- Scroll-motion-driver and smooth-chapter-scroll tests passed, including reversals, idle sleep, endpoint completion, external scroll changes and reduced motion.
- `tests/moments-workflow.mjs page-meadow`: real-wheel fragment dissolve, hold/reversal, photo flips, preserved state and cleanup passed.

The page-turn test samples requestAnimationFrame intervals during a CTA turn without concurrent screenshot readback. The local desktop run recorded 193 intervals, mean 8.60 ms, maximum 50 ms and none above 50 ms. The mobile-emulated run recorded 197 intervals, mean 8.43 ms, maximum 16.7 ms and none above 50 ms. Arrival bounds differ by less than one pixel from the held 80% frame. These are local headless-Chrome measurements, not a guarantee of presented-frame performance on a physical phone.
