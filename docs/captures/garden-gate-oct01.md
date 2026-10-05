# Cánh cổng vào khu vườn — 1 October 2026

The opening relief now leads through an ornate limestone garden gate. Two separately hinged bronze iron leaves open with a slight stagger, the camera centers on the entrance and passes through it, and the original cat garden video fills the viewport. The garden chapter title arrives over the film before it settles into the existing keepsake frame. The subsequent envelope and letter journey is preserved.

## Reference and art direction

Source: the user's `Quay màn hình 2026-10-01 213043.mp4`, 1906 × 956, 48.3 seconds, showing The Symphony of Vines. Its entrance opens at approximately 6.4–8.8 seconds: large left-aligned typography, a gate right of center, warm directional light, lateral camera alignment followed by forward movement, and an incoming chapter title. The entrance occupies roughly a quarter of that recording's viewport width before the camera moves.

The implementation uses original architecture with roses, two lanterns, cream limestone, bronze ironwork and a deep olive wall. At 1440 × 900, the architectural layer is 672 × 1008, centered at 66% of viewport width. Its doorway occupies about half that width; the display title anchors at 8% from the left and 21% from the top. At 390 × 844, the architecture is centered, begins at 31svh and extends below the viewport; two lines of copy occupy the clear space above it. Outer pillars are deliberately cropped on mobile.

The structure is a transparent raster architectural layer with independently animated native SVG ironwork in CSS perspective. It is not a fully modeled 3D building. GSAP controls camera position, hinges, atmospheric light, copy and the existing video frame. There are no source assets or copied code from the reference website.

## Interaction

- Wheel, touch and keyboard drive a reversible timeline. Stopping input holds the camera; reversing retraces the passage.
- The opening CTA plays the choreography over 4.9 seconds. Gesture input can take over during playback.
- Escape returns to the starting chapter. Resizing settles at the nearest endpoint and restores native layout.
- Both chapter contents are inert during the passage, preventing invisible controls from opening dialogs underneath the gate. Focus returns to the settled chapter.
- Reduced motion bypasses the gate and camera. Failed gate artwork falls back to a simple architectural surround and still permits navigation.
- The original garden video is reused throughout; no additional decoder or duplicate video is created. The hidden hero WebGL renderer pauses.
- The new 448 kB WebP is preloaded with the existing bounded loader. It is stored in the workspace, with alpha preserved.

## Visual review

Reviewed the seven required milestones and dense 5% steps, both directions, at 1440 × 900 and 390 × 844. The gate and incoming garden retain a focal subject through the middle of the passage. Iteration corrected mobile word spacing and line breaks, softened the garden's initial reveal, deepened the wall color and kept cancellation faster than the full cinematic CTA.

- [Desktop preview](garden-gate-final/preview.mp4)
- [Mobile preview](garden-gate-final-mobile/preview.mp4)
- [Desktop milestones, forward and reverse](garden-gate-final/contact-sheet.png)
- [Mobile milestones, forward and reverse](garden-gate-final-mobile/contact-sheet.png)
- [Dense desktop review](garden-gate-final/dense-contact-sheet.jpg)
- [Dense mobile review](garden-gate-final-mobile/dense-contact-sheet.jpg)
- [Reference versus implementation](garden-gate-final/reference-comparison.jpg)
- [Actual playback cadence](garden-gate-final/timing.jpg)
- [Asset origin and complete ImageGen prompt](../../public/assets/garden-gate/README.md)

## Validation

Passed:

- `node tests/garden-gate.mjs --record` and `--mobile --record`: 42 frames per viewport, actual wheel/touch input, forward/reverse travel, held camera, fullscreen coverage, clean endpoints, CTA playback and continued video.
- `node tests/garden-gate-controls.mjs`: keyboard isolation, Escape and focus restoration, reduced motion in both directions, failed-image fallback and continued navigation.
- `node tests/hero-gallery-controls.mjs`: idle renderer, wake/sleep, Escape, resize during the transition, tablet geometry, WebGL context loss and no-WebGL navigation.
- `node tests/hero-gallery.mjs gate-reduced --mobile --reduced`: mobile hero interactions, reduced-motion navigation, portrait controls and video autoplay.
- `node tests/letter-workflow.mjs gate-regression`: garden → envelope → letter, thread layering, scroll hold/reversal, letter pages, reading dialog, Escape and repeated CTA navigation. Its initial wait now observes chapter completion instead of assuming a 2.1-second opening.
- `node tests/scroll-motion-driver.mjs`: rapid reversals, bounded progress, one animation loop, idle sleep and disposal.
- TypeScript and production build. The pre-existing main bundle advisory remains (approximately 514 kB minified / 167 kB gzip).

Passing browser runs reported no page errors. Visual testing uses Chrome desktop and emulated mobile; no hardware-wide frame-rate or Safari-device guarantee is claimed.
