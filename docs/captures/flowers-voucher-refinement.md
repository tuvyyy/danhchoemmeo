# Flowers ↔ Voucher — visual refinement

The garden is now the subject, with the film reel behind the right edge of the
video. Its rotating SVG is clipped to its circular housing so it cannot create
horizontal overflow on mobile.

The handoff turns the garden into a paper keepsake, with a cream photographic
border and a restrained moving highlight. A gold satin ribbon traces the route
into the envelope. The envelope enters diagonally, settles, and occludes the
photograph as it slips down behind it. Reverse brings the photograph up from
behind the envelope before expanding it into the garden again. Both cats remain
visible at the midpoint on desktop and mobile.

Four refinement/review rounds: paper composition and reel correction; satin and
paper lighting; rotating reel overflow; final adjustment to keep the paper
entirely behind the envelope during its exit.

Reviewed the required seven milestones plus every 5% in both directions at
1440×900 and 390×844. No dead frames among the 84 inspected samples. At 20% the
envelope is present; at 50% both garden and envelope are prominent. No document
seam or orphaned companion during the handoff. Native live recording also
captures forward → reverse → forward at the unchanged 0.7s duration.

- `flowers-voucher-refined-preview.mp4`: actual browser animation, normal speed.
- `flowers-voucher-refinement-forward-comparison.png`: previous accepted version
  against this refinement at 0/20/40/50/60/80/100%.
- `flowers-voucher-refinement-reverse-comparison.png`: reverse comparison.
- Corresponding `-mobile-comparison.png` files preserve portrait aspect ratio.
- `flowers-voucher-refined-final/` and `flowers-voucher-refined-final-mobile/`:
  full-resolution screenshots and geometry assertions.
- `flowers-voucher-refined-final*-dense.png`: 5% contact sheets.

Validation passed: typecheck, production build, the garden-video suite on
desktop/mobile/tablet (including actual reel stacking and overflow checks),
and the handoff interaction suite on desktop/mobile/reduced motion/cold cache.
The interaction checks cover native scroll, boundary gestures, touch reverse,
opening the seal, all four voucher inspections, repeat navigation and restored UI.

Changed source files:

- `src/styles/scenes.css`
- `src/chapters/ChapterFlowContext.tsx`
- `src/sections/FlowersSection.tsx`
- `src/sections/flowers/VideoGarden.css`
- `src/sections/voucher/CinematicVoucherSection.tsx`
- `src/sections/voucher/cinematic-envelope.css`

Supporting scripts: `tests/garden-video.mjs`, `tests/flowers-voucher-visual.mjs`,
`tests/flowers-voucher-sheets.py`, `tests/flowers-voucher-preview.mjs`.
