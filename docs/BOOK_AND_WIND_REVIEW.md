# Horizontal book transition and wind candle — 2026-10-05

The gold thread between the video and voucher has been removed, including its SVG surface and per-frame path sampling. The video still folds and fades into the envelope. Transition progress now belongs to the garden scene itself.

Chapter 02 → 03 now transfers the envelope's letter into the center of the viewport while the envelope travels left. The actual cover turns around its left spine in perspective, revealing the handwritten page. Its reverse face shares the same hinge and mirrored local coordinates. The open paper settles at the existing desk position; entering chapter 03 opens the letter automatically. Scroll distance controls the motion, stopping holds the composition, and reverse input closes the book and returns to the voucher. Temporary paper faces are removed at either endpoint.

The finale uses an ivory background with dark type and the user's ivory / black rose and butterfly cake reference. The cake is anchored at the lower left, with a separately rendered candle attached to the upper frosting. Desktop copy occupies the right side; mobile copy occupies the upper area while the cake remains lower left. The previous burgundy scene, centered stand, gold thread and floating star field are gone. The desktop cursor is a small wind icon.

A recent horizontal pointer segment must cross the flame to extinguish it. Vertical movement, distant movement, very slow movement and stale coordinates do not count. Short samples accumulate so normal mouse movement still works. The flame bends briefly, goes out, and releases smoke. Native vertical touch scrolling remains available; horizontal touch swipes are reserved for candle wind using `touch-action: pan-y pinch-zoom`. The explicit blow button supports keyboard / alternative input. Relighting restores the action control and flame. The wish remains extinguished after leaving and returning to the finale. Pointer listeners and pending gesture timers are cancelled when the scene is inactive, transitioning or covered by a dialog.

## Perceptual review

- The cake's black roses provide the main contrast against the warm ivory field; the heading balances its visual weight on the opposite side. Pale candlelight and contact shadows share the cake's warm lighting. The mobile layout fits the full candle and cake together without hiding the action prompt.
- The book stays near the center at 40–60%, so the eye has an identifiable paper subject as the envelope leaves. Cover, reverse face and page have a shared spine, thickness and shadow; they move as stationery rather than a whole webpage sliding.
- Forward and reverse transition sheets were checked at 0/20/40/50/60/80/100%. An initial gap between the envelope and incoming book was rejected and corrected by bringing the book forward earlier. The reverse paper face was then corrected to unfold to the left of its spine.
- Before / after screenshots compare the former burgundy, centered cake scene against the ivory scene with the new cake at lower left. Final candle coordinates stay fixed when the greeting changes.

## Verification

- `npm run typecheck` / `npm run build` and `corepack pnpm run typecheck` / `corepack pnpm run build`. The pnpm lockfile was synchronized with the existing Three / Three types dependencies so pnpm installs reproduce the declared package set.
- `node tests/candle-wind.mjs` and the existing scroll driver / reading motion tests.
- `tests/journey-scroll-audit.mjs`: all six chapter boundaries in both directions on desktop and touch mobile, midpoint pause / reversal, dialog isolation, no horizontal overflow, no JavaScript errors, actual candle wind, relight and button fallback.
- `tests/book-handoff.mjs`: the final cover and reverse face, forward / reverse seven-frame captures, pause, automatic open arrival and temporary-face cleanup on desktop and mobile.
- `tests/finale-workflow.mjs`: desktop wind, touch wind, harmless movement, anchored candle, light extinguishing, keyboard focus, relight, retained wish and replay. Also checked desktop and mobile with reduced motion.

Evidence is local in `docs/captures/book-opening*`, `scroll-book-wind-*`, `finale-wind-*` and `finale-wind-comparison*.jpg`. Image generation provenance and the complete final prompt are in `public/assets/birthday-cake/README.md`. The runtime asset is `public/assets/birthday-cake/ivory-noir-cake.webp` (479,018 bytes); source PNGs and test captures remain local and excluded from Git.
