# Estate gate review — 2 October 2026

Reference: the supplied recording and https://symphonyofvines.unseen.co/.

The opening now uses a dark stone estate wall, warm featureless mist, independently hinged iron leaves, and large veiled Vietnamese serif lettering. The wall is a generated image plate; the doors, fanlight, lettering and motion are native SVG, HTML, CSS and GSAP. This recreates the reference's composition and atmosphere, rather than its full 3D environment.

Hover opens the gate and leaving closes it, including when direction changes mid-animation. Keyboard focus previews the gate; Escape closes the preview. On touch screens, tapping toggles the preview. The main call to action enters the story.

The journey moves through the gate into a dark chapter title, then reveals the existing garden. The garden stays invisible until transition progress 0.78. Wheel and touch gestures can scrub, hold and reverse the transition. Reduced motion, missing background artwork and viewport resize have fallbacks.

## Validation

- TypeScript and production build passed.
- Desktop and mobile gate interaction, interrupted motion, seven forward/reverse capture positions, camera hold, video reveal timing, and page overflow checks passed.
- Keyboard preview, photo dialog focus restoration, transition inert isolation, Escape, resize, reduced motion and missing-art checks passed.
- Full desktop and mobile journeys through the letter, memories, anniversary and candles passed. One earlier concurrent mobile run timed out waiting for the envelope; the isolated rerun passed, so that timeout is not claimed as a diagnosed fix.
- Rendered desktop/mobile contact sheets were reviewed. Camera clipping and the mobile background seam were corrected before the final captures.

## Reproduce

Run the Vite server on port 3333, then:

```sh
node tests/estate-gate.mjs --label=review --record
node tests/estate-gate.mjs --label=review --mobile --record
node tests/garden-gate-controls.mjs
node tests/finale-workflow.mjs review
node tests/finale-workflow.mjs review --mobile
python tests/journey-sheets.py estate-review estate-review-mobile
```

Final gate screenshots and videos: `docs/captures/estate-final/` and `docs/captures/estate-final-mobile/`. Full journey results: `docs/captures/finale-estate-final/` and `docs/captures/finale-estate-recheck-mobile/`.

Active background and generation prompt: [estate-mist.md](../public/assets/garden-gate/estate-mist.md).
