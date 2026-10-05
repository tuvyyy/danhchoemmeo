# Restored opening — 2 October 2026

Correction to the preceding estate-gate iteration: the gate is an entrance to the existing interactive ivory relief / dark botanical gallery. It must not replace that gallery or skip directly to the video garden.

The original ReliefGarden renderer, generated relief and botanical assets, typography, theme toggle, pointer reveal and photograph dialog are restored. The order is gate → ivory/day or botanical/night gallery → video garden → envelope → letter → memories → anniversary → candles. Returning from the video garden restores the selected gallery theme. The gallery's “Cánh cổng” button revisits the entrance.

The gate has its own local reversible wheel/touch transition and CTA. It locks chapter navigation until the gallery is reached; the gallery then uses the chapter handoff to enter the video garden. Escape cancels an entrance gesture, resize settles it, and reduced motion enters directly. Gallery controls remain inert while the gate is visible.

Validation commands (Vite on port 3333):

```sh
node tests/restored-entrance.mjs
node tests/restored-entrance.mjs --mobile
node tests/restored-entrance.mjs --mobile --reduced
node tests/garden-gate-controls.mjs
node tests/hero-gallery.mjs restored
node tests/hero-gallery.mjs restored --mobile
node tests/finale-workflow.mjs restored
```

Captures are in `docs/captures/restored-entrance/`, its mobile variants, and `docs/captures/hero-gallery-restored/`. The earlier `ESTATE_GATE_REVIEW.md` and estate-final captures document the superseded gate-to-video behavior.
