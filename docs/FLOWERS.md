# Chapter 02 — Flowers Garden Experience & Bloom Architecture

## 1. Overview & 60-Frame Bloom Sequence Architecture

In accordance with the Flowers Correction mandate:
- **REMOVED**: The artificial 5-frame PNG crossfade/blur/scale slideshow (`lily_frame_01_bud.png` through `lily_frame_05_full_bloom.png`).
- **DELIVERED**: A **true 60-frame continuous botanical bloom sequence** rendered via HTML5 Canvas in `FlowerBloomCanvas.tsx`.
- **ASSET SOURCE**: `C:\Danhchoemmeo\lily_bloom_sequence_60_webp` (read-only reference; 0 files modified).
- **PRODUCTION DEPLOYMENT**: Copied to `public/assets/flowers/lily-bloom/lily_bloom_001.webp` through `060.webp` + `manifest.json`.
- **PAYLOAD EFFICIENCY**: 769.83 KB total asset size for all 60 frames (vs. ~7.7 MB for the legacy 5 PNG images—a 10× payload reduction!).

---

## 2. Technical Implementation: `FlowerBloomCanvas.tsx`

### 2.1 Rendering Engine & Botanical Alpha Keying
- **HTML5 Canvas Engine**: Responsive `<canvas>` element rendered via `requestAnimationFrame` with an elapsed-time clock (~12 FPS across 60 frames over 5,000ms).
- **Retina / High-DPI Scaling**: Automatically scales canvas internal resolution by `window.devicePixelRatio`.
- **Botanical Alpha Keying (`preloadBloomSequence.ts`)**:
  - Automatically extracts the dark studio backdrop ($RGB \le 26$) into transparent alpha while flower petals and green foliage ($RGB \ge 62$) maintain 100% solid opacity.
  - Linear perimeter attenuation within 24px of canvas borders completely eliminates rectangular bounding boxes and hard edge artifacts.
  - Source cropped to 488px height (`ctx.drawImage(..., 0, 0, 512, 488, ...)`) to cleanly eliminate the contact sheet grid divider line present at the bottom of early frames.
- **Zero React Re-renders**: All frame playback indices and RAF IDs are managed via mutable refs, preventing unnecessary React component re-renders.

### 2.2 Lifecycle & Narrative Gating
- **Quote Reveal**: Romantic quote ("*My darling, you will never be unloved by me.*") triggers when bloom progress reaches $\ge 72\%$ (Frame 44).
- **Chapter CTA Unlock**: Progression CTA ("*MÓN QUÀ NHỎ TIẾP THEO ↓*") triggers upon completion at $\ge 96\%$ (Frame 58–60).
- **Return-Visit Persistence**: When user navigates back to Flowers after progressing, the canvas immediately renders final Frame 60 with quote and CTA unlocked; never replays.
- **Reduced Motion**: Users with `prefers-reduced-motion: reduce` immediately receive Frame 60, quote, and CTA without animation delay.


## 4. Garden Scene Composition & Supporting Elements

The botanical scene surrounding the main flower remains intact and fully functional:

### 4.1 Depth Flower (`StaticFlower.tsx`)
- Secondary mature lily (`lily_static_alt_full_bloom.png`) positioned behind and to the left (`left-[26%]`, `z-[1]`).
- Runs independent asymmetric GSAP breeze sway (`duration: 8.8s`, `rotation: 0.65deg`, `y: -2.5px`, `x: -2px`) to ensure organic asynchronous motion relative to the main flower.

### 4.2 3-Layer Grass Wind Field (`GrassField.tsx`)
- Deep background (`grass_back.png`), midground (`grass_mid.png`), and immediate foreground (`grass_front.png`).
- Driven by three independent GSAP timelines with prime-numbered oscillation periods (`11.5s`, `8.2s`, `6.4s`) and phase delays, creating natural wind gusts without mechanical synchrony.

### 4.3 Ambient Elements
- **Editorial Marquee (`FlowerMarquee.tsx`)**: Infinitely moving typography banner with `"with you — loving you — blooming with you —"`.
- **Halo Glow**: Soft radial breathing gradient (`rgba(224,138,170,0.16)`) pulsing behind the petals.
- **Floating Petals (`FloatingPetals.tsx`)**: Ambient romantic petals drifting softly across the garden.

---

## 5. Verification & Acceptance Evidence

Visual evidence captured in `docs/screenshots/phase-3/`:
- `desktop-flower-00.png`: Chapter entry state (static mature flower swaying, quote hidden, CTA gated).
- `desktop-flower-25.png`: Mid-intro progress.
- `desktop-flower-50.png`: Mid-intro progress.
- `desktop-flower-75.png`: Romantic quote revealed (`"My darling, you will never be unloved by me."`).
- `desktop-flower-100.png`: Bloom completed, CTA unlocked (`"MÓN QUÀ NHỎ TIẾP THEO ↓"`).
- `desktop-flower-return.png`: Return visit state (retained mature flower, quote, and CTA without replay).
- `mobile-flower-00.png` & `mobile-flower-100.png`: Clean mobile responsiveness (390×844) with zero text overlap and zero horizontal overflow.
- `desktop-flower-reduced-motion.png`: Instant unlock for users requesting reduced motion.
