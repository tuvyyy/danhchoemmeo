# Chapter 3: transparent flower cluster

The letter previously sat in a photographic garden, with two lilies and thirteen tulips spread across the whole bottom edge above a grass strip. Chapter 3 now uses a quiet plum background drawn with CSS. The garden photograph, grass image, and dark meadow overlays are absent. The original flower cutouts and their staggered bloom sequences form one fan-shaped cluster around the foot of the letter.

The cluster occupies the right-hand composition on desktop, leaving the headline and reading action clear. On mobile, its footprint is inset and the outer stems lean less, keeping the flower heads inside the viewport. A stem-tip mask softens the cluster's base without adding scenery. The flowers pause while the reader is open or their chapter is inactive. The reader, paper pagination and next-chapter controls remain available.

The largest flaw in the first mobile capture was the outer flower heads being clipped at the edges. Reducing their spread and rotation made the arrangement read as one compact cluster. In the final desktop capture, the ivory paper remains the main focal point; flower colour draws attention to its base, while the empty left-hand background gives the title room. There are no landscape details competing with the blooms. The closed letter's empty control pill is hidden while preserving its layout space.

Visual evidence is generated locally under `docs/captures/letter-cluster/`: desktop/mobile before-and-after comparisons, seven bloom frames at 0/20/40/50/60/80/100%, and the chapter 3-to-4 transition in both directions. The letter and flower fragments still rise into the arriving photographs, with no empty intermediate frame. Scene selectors were cleaned up to remove the obsolete grass animation target.

Validation: `corepack pnpm run typecheck`, `corepack pnpm run build`; `tests/letter-bloom.mjs` on desktop, mobile and reduced motion; `tests/moments-workflow.mjs letter-cluster` for scroll hold, reverse motion, fragment readiness, photograph flips, state persistence and transition cleanup. Tests also verify that the garden background image is not requested, all fifteen flowers complete blooming, the reading overlay pauses them, pagination works and there is no horizontal overflow or page error.

The prior full-garden screenshots used in the comparison are archived design captures. The original supplied flower assets are reused; no new bitmap asset is generated.
