# Workflow upgrade — 01 October 2026

This pass strengthens the scroll controller shared by chapters 1–6 and makes chapter 4 a photographic scene with an interactive album.

## Visual direction

References reviewed in the browser:

- [Lusion — WebGL Scroll Sync](https://webgl-scroll-sync.lusion.co/) and its [official implementation notes](https://github.com/lusionltd/WebGL-Scroll-Sync): preserve an image anchor while scroll controls the composition. In the captured viewport the portrait is approximately 30% of viewport width; the oversize title sits above it.
- [Immersive Garden](https://immersive-g.com/): restrained serif typography, asymmetry and large areas of breathing room. The captured editorial text occupies approximately the left 40% of the viewport.
- [Rain Forest Food case study](https://immersive-g.com/projects/rain-forest-food/): foreground occlusion and layered camera depth. Applied to independently approaching prints in front of the receding letter.

[Reference/local comparison and before/after](reference-motion/comparison.png)

Chapter 4 now shows the photographs immediately. The first print is larger; the other three stagger in size, position and rotation. On mobile, the prints form two offset pairs. Prints still turn over to reveal their notes. They approach from outside the viewport, while the letter recedes behind them.

The new album expands a print from its position on the page. Large photography, a restrained caption column, image thumbnails, arrow keys and mobile swiping provide a second level of interaction. Closing returns the image toward its print. Image changes crossfade within the paper frame.

## Motion and resilience

- Five handoffs use one critically damped animation driver. New wheel/touch input updates the destination without killing and recreating a tween.
- The driver retains velocity when direction changes and stops scheduling frames when held still.
- CTA navigation, manual input, Escape and resize share the same cleanup and endpoint behavior.
- A gesture crossing the end of a tall chapter passes its remaining distance into the next transition.
- Cursor canvas rendering sleeps after the pointer and particles settle. It releases its loop during transitions and overlays, then wakes on input. Reduced-motion mode suppresses cursor particles.
- Album uses a native modal dialog, locks background scrolling, returns keyboard focus and supports closing during its opening animation.
- Decorative petals stop during the final chapter handoff, keeping the subjects readable.

## Validation

Passed in Chromium at 1440×900 and 390×844, with a 1000×800 resize check:

- `node tests/scroll-motion-driver.mjs`: 180 rapid reversals, at most one pending frame, exact settled progress, idle sleep, bounded progress, cleanup once, Escape in both directions, non-finite input and suspended frames.
- `node tests/moments-workflow.mjs album1 --dense --record`: desktop forward/reverse, held frames, photo flips, chapter 3 cursor, retained state and next CTA.
- `node tests/moments-workflow.mjs album2 --mobile --dense --record`: corresponding mobile touch sequence.
- `node tests/memory-viewer.mjs final`: album focus, scroll locking, keyboard, thumbnails, arrows, Escape, reopen, early close, focus restoration and cursor idle/wake behavior.
- `node tests/memory-viewer.mjs review1 --mobile`: mobile album, including touch swipe.
- `node tests/memory-viewer.mjs reduced --mobile --reduced`: reduced-motion album and navigation.
- `node tests/workflow-controls.mjs smooth-controls`: burst input, Escape forward/reverse, resize while held, native layout restoration and reduced-motion navigation.
- `node tests/letter-workflow.mjs smooth --dense`: video autoplay, rotating reel, thread behind the envelope, letter handoff forward/reverse, pages and reader.
- `node tests/flowers-voucher-scroll.mjs smooth --mobile`: thread length follows input, hold/reverse and layer checks.
- `node tests/anniversary-workflow.mjs smooth --dense --record` and the mobile dense capture: incoming ticket composition, reverse continuity, milestone interactions and retained state.
- `node tests/finale-workflow.mjs clean --mobile`: final handoff, candle blowing/reignition, reverse and state preservation.
- TypeScript and production build passed. Vite still reports the existing main-chunk size warning (>500 kB); no hardware FPS claim is made. Photographs still depend on their existing remote image URLs.

## Rendered evidence

- [Desktop chapter 4](moments-album1/moments-closed.png)
- [Mobile chapter 4](moments-album2-mobile/moments-closed.png)
- [Desktop album](album-final/album-01.png)
- [Mobile album](album-review1-mobile/album-03.png)
- [Letter → memories, desktop](moments-album1/contact-sheet.png)
- [Letter → memories, mobile](moments-album2-mobile/contact-sheet.png)
- [Memories → together, desktop](anniversary-smooth/contact-sheet.png)
- [Memories → together, mobile](anniversary-smooth-mobile/contact-sheet.png)
- [Envelope → letter](letter-smooth/contact-sheet.png)
- [Garden → envelope](flowers-voucher-smooth-mobile/contact-sheet.png)
- [Together → finale](finale-clean-mobile/contact-sheet.png)
- [Desktop motion recording](moments-album1/workflow.mp4)
- [Mobile motion recording](moments-album2-mobile/workflow.mp4)

Reviewed seven positions in each direction (0, 20, 40, 50, 60, 80, 100 percent), plus dense 5-percent captures for the principal letter/memories/together handoffs. The incoming subject establishes itself while the outgoing subject remains identifiable; the inspected frames preserve material and visual continuity. Mobile content can scroll naturally where it exceeds the viewport.
