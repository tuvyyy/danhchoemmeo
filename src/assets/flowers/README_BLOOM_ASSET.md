# Flower Bloom Video Asset Slot Specification

## Target Asset Paths:
- Primary: `src/assets/flowers/lily-bloom.webm`
- Fallback: `src/assets/flowers/lily-bloom.mp4`

## True Bloom Asset Criteria:
1. **Single Continuous Subject**: One real lily / botanical flower timelapse from closed bud to full bloom.
2. **Fixed Camera & Position**: No panning, zooming, camera cuts, or scene transitions.
3. **Clean Background**: Transparent WebM (alpha channel) or deep black studio backdrop (`#000000` / `#0a0708`).
4. **Clean Edges**: No text, watermark, color fringing, or compression macroblocking around petals.
5. **Stem Emergence**: Vertical or gently angled stem anchored at the bottom (anchored into grass).
6. **Suggested Duration**: 4.0 – 8.0 seconds.
7. **Suggested Resolution**: 1080 × 1080 px or 1440 × 1440 px (square / vertical ratio).

## Status:
**TRUE BLOOM ASSET REQUIRED**
Until a true continuous botanical timelapse video is placed in this slot, `FlowerBloomVideo.tsx` gracefully renders a static mature flower (`lily_frame_05_full_bloom.png`) with live botanical breeze sway, preserving full chapter functionality, accessibility, and narrative gating without resorting to the obsolete 5-frame slideshow crossfade.
