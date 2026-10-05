# Flowers ↔ Voucher rendered review

Four capture/review rounds, at 1440 × 900 and 390 × 844. Final sampling includes
every 5% in both directions (84 rendered frames, including endpoints).

The baseline is the workspace implementation from the start of this task,
including its existing uncommitted edits. Baseline forward frames sample the
actual 1.35s chapter timeline; 100% shows the settled envelope after its separate
arrival. Baseline reverse samples native document displacement. New frames
sample the actual 0.7s handoff timeline, triggered by the CTA and reverse wheel.
The garden video is paused at 2s for comparison. Assets and envelope art are unchanged.

## Perceptual empty-frame test — manually reviewed rendered PNGs

Reject any sampled frame in which neither the garden/reel nor the envelope is
prominent. Geometry assertions in `tests/flowers-voucher-visual.mjs` are supporting
checks only; they cannot approve this visual gate.

| Forward progress | Baseline | Final desktop | Final mobile |
| --- | --- | --- | --- |
| 20% | Garden dimmed, still recognizable | Garden leads; envelope already visible | Garden leads; envelope and seal entering |
| 40% | FAIL: empty dark field | Envelope leads; garden and reel behind | Envelope leads; garden and reel behind |
| 50% | FAIL: empty dark field | Strong sealed envelope, moonlit garden/reel overlap | Seal and folded paper prominent, garden/reel above |
| 60% | FAIL: empty dark field | Envelope dominant, garden remains | Envelope dominant, garden remains |
| 80% | FAIL: burgundy field, floating UI | Stable envelope; last garden trace exits above | Stable envelope; last garden trace exits above |

Dead-frame count over the seven required forward samples: **4 before → 0 after**.
Final dense sampling: **0/84 dead frames**, desktop/mobile, forward/reverse.
This is a count of inspected samples, not a claim of measuring every display refresh.

Reverse 20/40/50/60/80%: PASS on both viewports. The envelope holds while the
garden comes back behind it; then the envelope retreats downward. At 50%, the
visible horizontal edge belongs to the physical envelope overlapping the tilted
garden artwork, not to a viewport-wide boundary between document sections.
The matching forward and reverse midpoints were also inspected at full resolution.

Companion, speech bubble, cursor/paw and navigation are suppressed during the
handoff. They restore on completion. Copy exits before the garden; ornaments
arrive last. Native inner-chapter scrolling resumes after the fixed composition
returns to document flow. The envelope never runs a second arrival animation.

## Iterations

1. Integrated the envelope with the handoff. Removed the dark bridge for this
   boundary. Review rejected the stray paw and excessively horizontal composition.
2. Suppressed the cursor along with the companion; tilted the garden for overlap.
3. Added cold-cache staging and wheel overshoot handling; captured every 5%.
   Dense review prompted an explicit continuous starting position for the final exit.
4. Set the garden exit start explicitly and recaptured both directions and viewports.

## Artifacts and reproduction

- `flowers-voucher-before-after.png`: CURRENT / NEW, 0/20/40/50/60/80/100%.
- `flowers-voucher-reverse-before-after.png`: matching reverse comparison.
- `flowers-voucher-final/forward-050.png` and `reverse-050.png`: desktop midpoints.
- `flowers-voucher-final-mobile/`: full-resolution mobile frames.
- `flowers-voucher-final-*-dense.png` and `flowers-voucher-final-mobile-*-dense.png`:
  all final samples, labeled by progress.

Run the app on port 3333, then:

```sh
node tests/flowers-voucher-visual.mjs final
node tests/flowers-voucher-visual.mjs final --mobile
python tests/flowers-voucher-sheets.py
node tests/flowers-voucher-interaction.mjs
```

Inspect the dense sheets and both full-resolution midpoints after any choreography
change. Fail the iteration if any empty field, orphaned UI, page seam or missing
midpoint world appears, even if the browser assertions pass.

Validation: `corepack pnpm run typecheck` PASS; `corepack pnpm run build` PASS
(Vite reports a non-blocking bundle-size warning). Browser interaction suite PASS
on desktop, mobile and reduced motion: native inner scroll, boundary wheel,
closed arrival, seal opening, all four voucher inspections, reverse navigation,
repeat navigation and UI restoration. Mobile reverse also passes a dispatched
touch swipe. Cold-cache interception passes: the garden holds until delayed
envelope assets are released and decoded.
