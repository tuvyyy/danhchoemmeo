# Sunlit entrance — 3 October 2026

Replaced the entrance background with the exact image supplied by the user, converted to WebP. The stone architecture remains photographic; the iron gate is live Three.js geometry, not a Blender export. Retained the existing hover/touch opening, keyboard preview, photograph modal and entrance into the day/night gallery.

Reference geometry: 2:1 plate, aperture left 49.9%, width 28%, apex 40.4%. Sun at approximately 77.5% / 67%; warm grazing light comes from behind the right jamb. Left-hand typography occupies 46% of the desktop viewport. The complete 2:1 photograph fits inside the desktop viewport without cropping. Mobile shows the complete photograph below the text at the screen width. There is no image edge mask. The background and interactive hit area share the same dimensions and position.

The ironwork uses round stock, beveled solid ornaments, raised handles and bronze hinges. Perspective rotation shares the existing `--gate-open` animation, including entrance scrubbing and cancellation. Lazy loaded Three.js draws on geometry/size/opening changes; geometry, materials, observers and context are disposed on unmount. SVG fallback survives unavailable or lost WebGL and recovers when the context returns.

Validation passed:

- `npm run typecheck` and `npm run build` (Vite reports the size warning for the lazy Three.js chunk).
- `node tests/sunlit-gate.mjs`: exact artwork, desktop/mobile 3D, opening, context loss/restoration, remount, WebGL unavailable, overflow and runtime errors.
- `node tests/restored-entrance.mjs` and `--mobile`: gate/gallery/garden flow, Escape, reverse, photo focus, theme retention.
- `node tests/garden-gate-controls.mjs`: keyboard preview, resize, reduced motion and missing artwork.
- Inspected desktop 1440 × 900 and mobile 390 × 844 captures, open/closed states, reference comparison and seven passage milestones.

Captures: [open and closed](captures/sunlit-gate/contact-sheet.png), [reference comparison](captures/sunlit-gate/reference-comparison.png), [desktop passage](captures/sunlit-gate/desktop-transition-sheet.png), [mobile passage](captures/sunlit-gate/mobile-transition-sheet.png).
