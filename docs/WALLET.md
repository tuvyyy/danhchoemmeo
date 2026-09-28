# Chapter 02 — Cinematic envelope

Chapter 02 is registered to `src/sections/voucher/CinematicVoucherSection.tsx`. The previous static `src/sections/VoucherSection.tsx` is no longer the registered chapter. Other chapters keep their existing components.

## One coordinated entrance

`useEnvelopeMotion.ts` owns a single GSAP timeline, paused when the chapter or document is inactive and reverted on unmount. Arrival reveals only the sealed envelope: corners start at .20s, the envelope rises from .60–1.45s, and the light settles at 1.70s. Papers remain hidden and the lid remains closed throughout. The seal becomes interactive once arrival finishes. Reduced motion shows the closed pose immediately.

The timeline is then reused for explicit seal interactions. Opening times below are relative to the seal press:

The opening CTA performs its own covered handoff. Other chapter navigation uses the vertical page slide described in `CHAPTER_SCROLL.md`, without scaling, blurring or fading the envelope wrapper; Chapter 02 owns its entrance. The former global scroll effect is no longer mounted, so it cannot overwrite chapter transforms.

| Time | Action |
| --- | --- |
| 0.05–0.70 | Wax seal releases onto the pocket. |
| 0.30–1.35 | Lid physically rotates 0 to -180 degrees around its fixed hinge, with changing shadow. |
| 0.75–1.15 | Ivory interior becomes visible. |
| 0.95–1.80 | Letter rises 70px and settles at -3 degrees. |
| 1.15 / 1.30 / 1.45 / 1.60 | Vouchers rise 80px one by one, each lasting .85s, ending at -8 / -2 / +3 / +8 degrees. |
| 1.35–2.50 | Corner light pulse and moving gold-trim highlight follow the fully open lid. |
| 1.85–2.55 | Wax seal gets a warm highlight, then settles. |
| 2.55 onward | Subtle 5.8s corner breathing, restrained seal shimmer and falling flowers. |

Only top-right and bottom-left corners remain. Both load the exact same `corner-tr.png`; the bottom-left is permanently rotated 180 degrees. They never spin. The corners are on a pointer-transparent layer below the envelope. Mobile uses 68px motifs and shorter lines. No cursor parallax is used.

Scene width is capped at 86vw and 84svh on desktop, with additional side space. Portrait phones keep horizontal panning within a frame with safe margins. Letter and ticket images keep their natural aspect ratios.

The envelope body is now 68% of the artwork height (formerly 50%, a 36% increase), with its bottom retained. The hinge, pocket, paper placements and seal landing were adjusted together; the letter, voucher images and round seal are not stretched. Portrait phones reserve another 8% above the artwork so the raised lid remains inside the viewport.

`EnvelopePetals.tsx` renders 16 ivory/pink blossoms and petals descending from above the scene at staggered 17–26s periods. All are behind the envelope, ignore pointer input, and pause with the scene or while reading a voucher. Reduced motion hides them.

## Interactions

- Every chapter entry starts with a closed envelope, including return visits. Opening requires a seal press. The existing pig companion remains available.
- Wax seal has a caption, hover/press feedback, restrained shimmer and a closed-state invitation pulse; tapping closes or reopens the same physical envelope.
- Hover raises the selected voucher by 18px, scales it 1.025, turns it toward the viewer and lowers/dims the neighbors.
- Clicking pulls the actual voucher image into the center; its original in the envelope is hidden until it returns. No panel/card container is introduced.
- While reading, a separate backdrop blurs the scene by 10px and dims it; the voucher and controls stay sharp. Background motion pauses until the detail closes. The backdrop fades in over .3s, or appears immediately with reduced motion.
- Reduced motion immediately shows the closed envelope, disables petals/idle motion and keeps seal controls instantaneous.

## Verification

- `corepack pnpm run typecheck`
- `corepack pnpm run build`
- `node tests/envelope-cinematic.mjs desktop mobile reduced tablet landscape`
- `tests/envelope-voucher.mjs` is the legacy alias for this same acceptance suite.
- Screenshots and individual timeline frames: `docs/screenshots/chapter02-cinematic/`.
