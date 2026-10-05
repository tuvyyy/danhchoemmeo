# Interactive opening garden — 01 October 2026

## Result

The opening screen is now a full-viewport ivory relief garden. Moving a mouse reveals sculpted cats and flowers under the pointer, leaves a softly fading trail, and returns the wall to its quiet state. Touch interaction provides the same local reveal without preventing vertical navigation.

“Khu vườn đêm” opens a dark botanical composition through an iris originating near the last pointer position. Foreground depth, subtle sway and pointer-controlled illumination make it respond to movement. The user's original couple photograph is available through “Tấm hình của tụi mình”, with a native modal and keyboard focus restoration.

Hero → garden now has its own reversible scroll handoff: the video garden emerges through a growing aperture as the ivory surface recedes. The original Spider split and separate ScrollTrigger animation are no longer mounted. CTA navigation uses the same handoff as wheel/touch input.

## Reference review

Reviewed the live opening interaction at [Immersive Garden](https://immersive-g.com/) and extracted frames across the complete 25.43-second user recording. The live homepage has monochrome sculptural forms emerging beneath the pointer, while the supplied recording shows dark botanicals moving around a quiet central text area.

Observed geometry: a full-viewport surface; a compact identity at roughly 10–20% of viewport width; central serif copy around the vertical midpoint; quiet controls at the edges. The implementation uses this composition with two lines of personal birthday copy and its own kitten/botanical artwork.

- [Reference versus implementation](hero-gallery-final/reference-comparison.jpg)
- [Reference hover recording](pointer-reference/reference-hover.mp4)
- [User recording contact sheet](pointer-reference/video-sheet.jpg)

## Implementation and bounds

- One WebGL pass combines the generated relief, a low-resolution fading paint field, and the night artwork. These are raster surfaces with simulated depth and lighting.
- Day rendering sleeps when the pointer settles and after the trail expires. Rendering pauses when the chapter is inactive, during its handoff, when the photograph is open, and when the document is hidden.
- Reduced motion uses a static revealed composition and direct theme changes. No-WebGL and context-loss states keep static artwork and working controls.
- Pointer response uses elapsed time, smooth target following and interpolated brush stamps. The paint field is 30% of the display dimensions; canvas device-pixel ratio is capped.
- Day and night have separate mobile crops so the cats remain discoverable and the night title retains a dark backdrop.
- The loader prioritizes the two opening images and fonts, releases after a bounded wait, and no longer requests 60 unused bloom frames (4,102,620 compressed bytes). Opening WebP artwork totals 590,058 bytes.
- [Generated asset paths and complete prompts](../../public/assets/hero-gallery/README.md), using built-in image generation.

## Validation

Passed:

- `node tests/hero-gallery.mjs final --record`: desktop relief positions, night reveal, portrait modal and focus return, wheel forward/reverse at seven positions, CTA, autoplay including loop wrap, no page errors.
- `node tests/hero-gallery.mjs final --mobile --record`: equivalent mobile touch interactions and handoffs.
- `node tests/hero-gallery.mjs reduced --mobile --reduced`: reduced-motion navigation and theme states.
- `node tests/hero-gallery-controls.mjs`: initial/held-pointer idle, wake on input, readable day heading, Escape, resize during transition, tablet layout, WebGL context loss and no-WebGL fallback.
- `node tests/hero-gallery-loading.mjs`: stalled artwork cannot indefinitely block entry; controls still advance; unused bloom requests are absent.
- `node tests/letter-workflow.mjs gallery-regression`: continued navigation through garden, envelope and letter; autoplay, reel, rear thread and letter interactions remain functional.
- TypeScript and production build pass. Vite retains a main-chunk warning (~505 kB before gzip). No device-wide FPS guarantee is asserted.

## Visual evidence

- [14-second desktop preview](hero-gallery-final/preview.mp4)
- [Full mobile interaction recording](hero-gallery-final-mobile/interaction.mp4)
- [Desktop relief](hero-gallery-final/relief-cats.png)
- [Desktop night garden](hero-gallery-final/night-left.png)
- [Mobile night garden](hero-gallery-final-mobile/night-right.png)
- [Desktop handoff, both directions](hero-gallery-final/contact-sheet.png)
- [Mobile handoff, both directions](hero-gallery-final-mobile/contact-sheet.png)
- [Fallback after context loss](hero-gallery-controls/gpu-fallback.png)

Visual iteration corrected low-contrast day typography from an older CSS rule, removed per-pixel distortions from the night parallax, reframed the mobile garden, and brought the incoming video into the handoff earlier. The final inspected sequences retain a readable outgoing title while the incoming video establishes the next focal point.
