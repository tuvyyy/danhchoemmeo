# Chapter 03: flowers around the letter

Restored the two animated pink lilies and thirteen tulips from the flower scene in commit `624a0c0`. The letter, its two pages, reader and navigation remain intact, as requested. Chapter 01 retains its current video garden.

`LetterBloomGarden` is anchored to the chapter itself, spanning the bottom 32% (up to 320px) indicated in the user's red annotation. The flowers are distributed across the full width instead of rising beside the letter. The paper and controls remain above the decorative layer. Lilies unfold over 6.2–6.5 seconds; tulips unfold over three seconds, staggered from one to four seconds. The complete garden takes about seven seconds. Mobile uses a 250px bottom band, with space below the paper for the flowers.

Playback begins when Chapter 03 is active, the chapter transition has finished, and the flowers are in view. It pauses while reading in the overlay, outside the viewport, outside the chapter or while the tab is hidden. Completed blooms remain open on return. Reduced motion displays the open flowers immediately. Decorative flowers do not intercept pointer events or enter the accessibility tree.

Validation: `npm run typecheck`, `npm run build`, and `tests/letter-bloom.mjs` for desktop, mobile and reduced motion in Chapter 03. Verified fifteen canvases, gradual intermediate frames, completion, opening the letter, reader pagination, Escape, the next chapter, and no horizontal overflow or runtime errors. Captured and inspected the original buds, intermediate bloom, complete flowers and open letter on desktop and mobile.

- [Desktop progression](captures/letter-bloom/contact-sheet.png)
- [Mobile progression](captures/letter-bloom-mobile/contact-sheet.png)

## Unified garden art direction

Replaced the burgundy geometric backdrop with the existing dusk garden artwork and forest-green shading. Removed the diagonal light panel and decorative thread from view. Animated flowers now form uneven groups with varied heights, muted petal colors and softly shaded stems merging into the ground. They remain within the requested bottom band. The paper remains the brightest object; sage type, outlined invitation button, and shaded reader controls share the garden palette. The garden background fades in with the voucher-to-letter transition.

Desktop and mobile bloom/reader/navigation checks, TypeScript and production build passed. Reviewed open and closed letter screenshots and the bloom progression sheets.
