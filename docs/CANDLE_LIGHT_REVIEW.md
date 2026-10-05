# Candle-driven room lighting — 2026-10-05

The lit candle now places the finale in a nearly black room, with a broad warm light field originating from the actual flame wrapper. An irregular 2.8-second CSS cycle changes flame height and room-light intensity at matching keyframes. Light opacity ranges from .42 to 1; the cake is dimmed to make the candle and its warm spill the focal light source. A wind gust reduces the spill before extinguishing the flame.

Extinguishing the candle fades the warm field and reveals the existing ivory room over 1.8 seconds. Relighting returns the scene to darkness. Text, borders and the cake adapt to each lighting state; text colours settle within .36 seconds to stay clear during the room reveal. The native wind cursor also has a light variant for the dark room. No image asset generation was needed.

The light field sits inside the flame wrapper, so it follows the cake on desktop and mobile without layout measurements or another JavaScript frame loop. Flame and spill animation pause during chapter transitions, dialogs and hidden documents. Reduced motion uses steady light and a short .15-second theme transition.

Chapter handoff layers disable CSS opacity transitions while GSAP scrubs them, eliminating delayed opacity when scroll stops. Reversing the chapter during a room reveal starts from its current visible darkness and current flame / aura opacity rather than snapping to the final lighting state.

## Visual inspection

Chrome screenshots at 1440 × 900 and 390 × 844:

- `docs/captures/finale-candle-light-final/` and `finale-candle-light-final-mobile/`: lit, smoke, bright wish, flicker cycle, brightening / darkening, and forward / reverse chapter handoffs.
- `docs/captures/candle-light-comparison.jpg` and `candle-light-comparison-mobile.jpg`: previous cream scene, lit black room and extinguished bright room side by side.
- `docs/captures/candle-light-change.jpg` / `-mobile.jpg`: seven-frame brightening and relighting sheets at 0 / 20 / 40 / 50 / 60 / 80 / 100 percent.
- `docs/captures/candle-flicker.jpg` / `-mobile.jpg`: seven sampled flame / light poses.
- `docs/captures/candle-handoff.jpg` / `-mobile.jpg`: both directions of the chapter boundary at the same seven milestones.
- Reduced motion: `docs/captures/finale-candle-light-reduced-mobile/`.

The black / amber room gives the ivory cake and gold flame a clear hierarchy. The warm field comes from the candle, without unrelated particles or decoration. The cake remains large against the viewport edges and stays anchored when its greeting changes. The bright ending provides a strong contrast with the initial room. The ticket and cake overlap in the chapter handoff, retaining an identifiable subject at every sampled frame. Faster text colour settling improves the first intermediate reveal frames.

## Verification

- `corepack pnpm run typecheck` and `corepack pnpm run build`.
- `node tests/finale-workflow.mjs candle-light-final --lighting --transition`.
- `node tests/finale-workflow.mjs candle-light-final --mobile --lighting --transition`.
- `node tests/finale-workflow.mjs candle-light-reduced --mobile --reduced`.

The browser workflow verifies active flicker, steady reduced-motion light, darkness while lit, brightening after a pointer / touch wind gesture, relighting darkness, keyboard focus, anchored candle geometry, reverse-scroll pause, retained wishes, chapter re-entry and replay. Transition sampling pauses CSS transitions only; butterfly play states continue to be controlled by the production lifecycle. Binary review captures remain local and ignored by Git.
