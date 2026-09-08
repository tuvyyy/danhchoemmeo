# Baseline Architecture & Migration Documentation — Phase 1

Document version: 1.0.0  
Date: 2026-09-06  
Status: Phase 1 Complete (Clean Development Baseline Established)

---

## 1. Stack Thực Tế (Actual Production Tech Stack)

- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Language**: TypeScript 5.9.3 with strict mode (`tsconfig.json`, `moduleResolution: "bundler"`, path alias `@/*` -> `./src/*`)
- **Build Tool / Bundler**: Vite 8 (`vite` 8.2.2, `@vitejs/plugin-react` 6.1.1)
- **Styling**: Tailwind CSS v4 (`tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3)
- **Typography & Fonts**:
  - Display / Serif: `Playfair Display` (`--font-display`)
  - Body / Sans: `Be Vietnam Pro` (`--font-body`)
  - Handwritten / Script: `Dancing Script` (`--font-hand`)
- **Animation Stack**:
  - Current baseline runtime: `framer-motion` 13.2.0 (used for UI state transitions, chapter fades, 3D card flips, wallet open, hover/tap feedback)
  - Prepared for upcoming phases: `gsap` 3.15.0 (installed and ready in `package.json` for scroll-driven choreographies, timelines, and bloom sequencing)
- **Package Manager**: pnpm (`v11.25.0`)

---

## 2. Source Prototype Path & Verification

- **Source Prototype Path**: `C:\Danhchoemmeo\Birthday website for girlfriend`
- **Mode**: READ-ONLY FIGMA ARCHIVE
- **Source Prototype Files Modified**: **0** (Verified by MD5 hash inventory and timestamp audit across all 47 files)

---

## 3. Production Project Path

- **Production Root**: `C:\Danhchoemmeo`
- Direct repository root structure containing `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/`, `public/`, and `docs/`.
- Zero nested wrappers (no `frontend/`, `new-project/`, or `birthday-app/`).
- Fully isolated runtime with zero imports pointing back to `Birthday website for girlfriend`.

---

## 4. Production Folder Structure

```
C:\Danhchoemmeo
│
├── Birthday website for girlfriend\  [READ-ONLY FIGMA SOURCE ARCHIVE]
│
├── docs\
│   └── BASELINE.md                   [This baseline documentation]
│
├── public\                           [Static public assets, favicons]
│
├── src\
│   ├── app\
│   │   └── App.tsx                   [Chapter controller, unlock state, smooth scroll]
│   │
│   ├── assets\
│   │   ├── flowers\                  [Photographic transparent PNG flower bloom frames]
│   │   │   ├── lily_frame_01_bud.png
│   │   │   ├── lily_frame_02_opening.png
│   │   │   ├── lily_frame_03_half_bloom.png
│   │   │   ├── lily_frame_04_almost_open.png
│   │   │   ├── lily_frame_05_full_bloom.png
│   │   │   └── lily_static_alt_full_bloom.png
│   │   ├── grass\                    [Layered photographic transparent PNG grass]
│   │   │   ├── grass_back.png
│   │   │   ├── grass_mid.png
│   │   │   └── grass_front.png
│   │   ├── letters\                  [Slot for authentic letter scan pages]
│   │   │   └── README.md
│   │   ├── moments\                  [Slot for authentic couple photos]
│   │   │   └── README.md
│   │   ├── decorative\               [Future SVG / raster decorative assets]
│   │   └── fonts\                    [Local font assets if bundled offline]
│   │
│   ├── components\
│   │   ├── effects\
│   │   │   ├── Petals.tsx            [Stable deterministic ambient falling petals]
│   │   │   └── ScrollCompanion.tsx   [Floating pig on balloon tracking scroll progress]
│   │   ├── layout\
│   │   │   └── AmbientGlow.tsx       [Fixed radial background blur glows]
│   │   ├── navigation\
│   │   │   └── ProgressRail.tsx      [Left fixed chapter rail indicator]
│   │   └── ui\                       [Reusable micro-components]
│   │
│   ├── data\
│   │   ├── birthdayContent.ts        [Centralized copywriting, labels, dates, placeholder URLs]
│   │   └── vietnamMapPath.ts         [Vector silhouette path for Vietnam flight animation]
│   │
│   ├── hooks\                        [Custom hooks for animation, scroll, sensors]
│   │
│   ├── lib\
│   │   ├── animation\                [GSAP timeline and easing helpers]
│   │   └── utils\                    [Utility functions]
│   │
│   ├── sections\
│   │   ├── HeroSection.tsx           [Flight route Sài Gòn -> Hà Nội, pig arrival, hero reveal]
│   │   ├── FlowersSection.tsx        [FlowerBloomVideo component, grass wind engine, marquee, quote]
│   │   ├── WalletSection.tsx         [Interactive 3D wallet, 500K bill fountain, custom message]
│   │   ├── LetterSection.tsx         [3D folding book cover, 2-page scan spread, modal reader]
│   │   ├── MomentsSection.tsx        [4 polaroids with flip interaction to reveal captions]
│   │   └── FinaleSection.tsx         [Interactive candle extinguishing, confetti, wish reveal]
│   │
│   ├── styles\
│   │   ├── tokens.css                [Color variables and Tailwind v4 @theme declarations]
│   │   ├── animations.css            [Keyframes for fall, sway, marquee, shimmer, breathe]
│   │   └── globals.css               [Google fonts import, reset, scrollbar normalization]
│   │
│   ├── main.tsx                      [React 19 root entrypoint]
│   └── vite-env.d.ts                 [Vite client type definitions]
│
├── index.html                        [HTML5 template with font preconnects]
├── package.json                      [Clean dependencies and scripts]
├── pnpm-lock.yaml                    [Strict dependency lockfile]
├── tsconfig.json                     [TypeScript configuration with @ alias]
└── vite.config.ts                    [Vite build configuration]
```

---

## 5. Section Flow (User Experience Architecture)

The site is designed not as a free-scrolling brochure, but as an intimate episodic narrative (chapter by chapter):

1. **Chapter 00 — Hero / Flight (`HeroSection.tsx`)**:
   - Quote: *“Tui phi từ Nam ra Bắc, tui mang tình yêu từ Sài Gòn đến mèo đây hayyaaaaaa~” 🐷💨*
   - Visual: Vector map of Vietnam with an animated dashed flight path originating from Sài Gòn and terminating at Hà Nội.
   - Interaction: Pig emoji plane traverses along the path (`offset-path`). Upon landing in Hà Nội, a burst of hearts triggers, revealing the main greeting heading, the birth date (`10 · 11 · 2003`), and unlocking the button *“Bắt đầu hành trình ↓”*.

2. **Chapter 01 — Flowers (`FlowersSection.tsx`)**:
   - Visual: Ambient dark backdrop with a massive drifting marquee text (*“growing with you — blooming with you — loving you — ”*) at 8% opacity.
   - Bloom Architecture (`FlowerBloomVideo.tsx`): Built for continuous botanical blooming video. (Status: **TRUE BLOOM ASSET REQUIRED**; currently renders single mature lily with live breeze sway, preserving narrative pacing without fake slideshow crossfading).
   - Visual: Multi-depth grass garden at the bottom (`grass_back`, `grass_mid`, `grass_front`) swaying independently in the breeze.
   - Resolution: When bloom completes, the romantic quote reveals (*“My darling, you will never be unloved by me.”*) and unlocks *“Món quà nhỏ tiếp theo ↓”*.

3. **Chapter 02 — Wallet (`WalletSection.tsx`)**:
   - Visual: 3D wallet card with pulsing golden ring.
   - Interaction: User taps the wallet to open the flap (`rotateX: -150deg`), releasing a fan fountain of 14 deterministic "500K" banknote tokens floating outwards.
   - Resolution: Displays a warm handwritten note (*“Coi như tui đang ngồi đối diện, dúi vào tay em và nói: Thích gì mua nấy, đừng tiết kiệm nha.”*) and enables *“Có thứ này quan trọng hơn ↓”*.

4. **Chapter 03 — Letter (`LetterSection.tsx`)**:
   - Visual: Centered vintage paper folio folded in half (`for you · 10.11 · chạm để mở ↗`).
   - Interaction: Tapping the cover swings the left and right halves open in 3D perspective to reveal a two-page handwritten letter spread.
   - Zoom Feature: Tapping either page opens a high-resolution reading modal with page navigation (`← 01 / 02 →`) and smooth close.
   - Resolution: Revealing the letter unlocks *“Nhớ lại tụi mình ↓”*.

5. **Chapter 04 — Moments (`MomentsSection.tsx`)**:
   - Visual: Grid of 4 polaroid photograph cards, each tilted with slight organic rotations.
   - Interaction: User taps each polaroid to flip / peel back the overlay, revealing an intimate memory caption for each photo.
   - Gate / Progression: All 4 polaroids must be flipped before the button *“Điều cuối tui muốn nói ↓”* unlocks.

6. **Chapter 05 — Finale (`FinaleSection.tsx`)**:
   - Visual: Handcrafted CSS birthday cake with an animated flickering candle flame.
   - Interaction: User taps the cake to "blow out" the candle.
   - Resolution: The flame extinguishes, a celebratory burst of 60 colorful confetti pieces cascades across the scene, and the heartfelt final birthday letter and permanent promise fade in with a golden shimmer title.

---

## 6. Unlock & Chapter Flow Implementation

- **State Management**:
  - `unlocked: number` (initial state: `1`). Controls how many chapter divs are mounted and rendered inside `App.tsx`'s `<AnimatePresence>`.
  - `current: number` (initial state: `0`). Managed via `IntersectionObserver` observing DOM nodes with `data-idx`. Dynamically highlights the current chapter in the left `ProgressRail`.
  - `advance(i: number)`: Increments `unlocked` to `Math.max(u, i + 2)` and executes a delayed smooth scroll (`scrollIntoView({ behavior: "smooth", block: "start" })`) to the freshly mounted section.
- **Section Locking Principle**: Unvisited chapters do not mount in the DOM until unlocked. This guarantees the narrative order and prevents users from skipping directly to the finale.

---

## 7. Assets Đã Migrate (Migrated Local Assets)

All high-resolution transparent PNG assets were copied directly from the Figma source prototype into clean production directories without modification, compression loss, or redrawing:

| Category | File Name | Resolution / Size | Location |
| :--- | :--- | :--- | :--- |
| **Flowers** | `lily_frame_01_bud.png` | 967 KB (Alpha PNG) | `src/assets/flowers/` |
| **Flowers** | `lily_frame_02_opening.png` | 1,324 KB (Alpha PNG) | `src/assets/flowers/` |
| **Flowers** | `lily_frame_03_half_bloom.png` | 1,786 KB (Alpha PNG) | `src/assets/flowers/` |
| **Flowers** | `lily_frame_04_almost_open.png` | 1,816 KB (Alpha PNG) | `src/assets/flowers/` |
| **Flowers** | `lily_frame_05_full_bloom.png` | 1,834 KB (Alpha PNG) | `src/assets/flowers/` |
| **Flowers** | `lily_static_alt_full_bloom.png`| 1,825 KB (Alpha PNG) | `src/assets/flowers/` |
| **Garden** | `grass_back.png` | 1,252 KB (Alpha PNG) | `src/assets/grass/` |
| **Garden** | `grass_mid.png` | 2,244 KB (Alpha PNG) | `src/assets/grass/` |
| **Garden** | `grass_front.png` | 2,332 KB (Alpha PNG) | `src/assets/grass/` |

---

## 8. Remote Placeholders Còn Lại (Remaining Remote Placeholders)

The following remote image assets from Unsplash were kept as layout placeholders according to Phase 1 guidelines, with ready-to-replace asset slots created in `src/assets/`:

1. **Letter Section**:
   - `leftScan`: `https://images.unsplash.com/photo-1561812938-f6e60cbf95e3` -> Ready to replace with `src/assets/letters/letter-page-01.webp`
   - `rightScan`: `https://images.unsplash.com/photo-1730342754571-93f5462e6d2f` -> Ready to replace with `src/assets/letters/letter-page-02.webp`
   - `faintFlower`: `https://images.unsplash.com/photo-1623183074617-90611646e4ca` (ambient blurred flower)
2. **Moments Section**:
   - 4 photo placeholders:
     - Moment 1 (*Lần đầu mình nắm tay*): `https://images.unsplash.com/photo-1615966650071-855b15f29ad1`
     - Moment 2 (*Buổi tối gọi video tới sáng*): `https://images.unsplash.com/photo-1591969851586-adbbd4accf81`
     - Moment 3 (*Hoàng hôn mình từng hứa sẽ ngắm cùng*): `https://images.unsplash.com/photo-1542460533-50ac46fb13d7`
     - Moment 4 (*Và rất nhiều khoảnh khắc phía trước*): `https://images.unsplash.com/photo-1640273296013-e4b54eaf52eb`
     -> Ready to replace in `src/assets/moments/` and updated via `src/data/birthdayContent.ts`.

---

## 9. Animation Library Hiện Tại (Current Animation Architecture)

- **Framer Motion 13.2.0**:
  - `useScroll`, `useSpring`, `useTransform` for `ScrollCompanion` balloon pig.
  - `offset-path` animation for the flying pig in `HeroSection`.
  - Timer-based crossfade transitions (`opacity`, `scale`) for flower blooming.
  - CSS 3D transforms (`rotateX`, `rotateY`, `perspective`) for the wallet lid and letter book cover.
  - `<AnimatePresence>` for mounted chapter fades, modal zoom transitions, and button unlocks.
- **CSS Animations (`src/styles/animations.css`)**:
  - GPU-accelerated keyframe loops for `fall` (ambient petals & dust), `sway` (layered grass breeze), `marquee` (background typography), `breathe` (halo glow), and `shimmer` (gradient text shine).

---

## 10. Planned GSAP Responsibilities (Upcoming Phases)

`gsap` (v3.15.0) has been installed and integrated into the project dependencies. In subsequent phases, GSAP + ScrollTrigger will be systematically introduced for:
1. **Scroll-Bound Timelines & Pinning**: Pinned chapter transitions replacing simple `setTimeout` auto-scrolls.
2. **True Continuous Flower Blooming**: Scrubbing between flower frames linked to scroll position or continuous high-fidelity morphing.
3. **Organic Wind Physics**: Multi-frequency wind gusts affecting grass layers and falling petals simultaneously with dynamic skew, velocity, and damping.
4. **Cinematic 3D Unfolding**: Physically accurate paper unfold timelines for the letter with interactive page curl effects.
5. **Interactive Moments Gallery**: Inertia-driven dragging, 3D tilt on mouse hover, and stacked deck animations.

---

## 11. Known Technical Debt & Known Limitations

1. **Flower Bloom Sequence**:
   - *Current implementation*: Discrete 5-frame PNG crossfade triggered sequentially via `setTimeout`.
   - *Limitation*: Transition between frames is a simple opacity fade rather than true continuous biological blooming or smooth interpolation.
   - *Planned upgrade*: GSAP canvas scrub or frame-blending shader.
2. **Grass Wind Effect**:
   - *Current implementation*: Pure CSS keyframe rotation (`sway`) with fixed oscillation limits (`-0.25deg` to `0.8deg`).
   - *Limitation*: Fixed periodicity without organic variation, wind speed fluctuation, or interactive touch/cursor response.
   - *Planned upgrade*: GSAP dynamic physics simulation with noise-based wind bursts.
3. **Wallet Interaction**:
   - *Current implementation*: Single click opens lid; precalculated bill trajectory animation plays once.
   - *Limitation*: Flying bills disappear after a single cycle without re-collection or interactive touch.
4. **Handwritten Letter Section**:
   - *Current implementation*: Remote Unsplash scans with generic calligraphy.
   - *Limitation*: Not authentic personal letters yet.
   - *Planned upgrade*: Scan authentic handwritten letter pages at 300 DPI, crop, compress to WebP with transparent/clean paper alpha, and bind to zoom viewer.
5. **Moments Section**:
   - *Current implementation*: Remote placeholder photos from Unsplash.
   - *Limitation*: Generic stock imagery.
   - *Planned upgrade*: Import real couple photos, adjust custom rotations, and fine-tune captions.
6. **Finale Section**:
   - *Current implementation*: CSS-styled cake with simple pulsating flame. Confetti is purely client-side 2D particles.
   - *Limitation*: Candle extinguishing is a simple click rather than microphone blow detection or realistic particle smoke.
7. **Random Stability Audit**:
   - *Resolved in Phase 1*: All `Math.random()` calls inside render loops (petals, map hearts, wallet bills, confetti) were audited and converted into stable deterministic arrays or seeded PRNG sequences. Re-renders will no longer cause flickering or jumpy positions.

---

## 12. Responsive Status

Tested and audited viewports:
- **Mobile (390px — iPhone 14/15/16)**:
  - Vietnam map scales down automatically via `scale-[0.82]` with `origin-top`.
  - Progress rail and companion are hidden (`hidden sm:flex` / `hidden sm:block`) to prevent viewport clutter.
  - Moments grid cleanly collapses to 2 columns (`grid-cols-2`).
  - Letter folio width constrained via `min(46vh, 82vw)`.
  - Zero horizontal scroll or overflow issues (`overflow-x: hidden` / viewport clamps).
- **Tablet (768px — iPad / Medium Screens)**:
  - Progress rail and companion pig appear cleanly.
  - Map renders at full 360px stage.
  - Moments layout transitions comfortably.
- **Desktop (1440px — Primary Reference)**:
  - Full aesthetic parity with the Figma prototype.
  - Generous negative space, large background marquee, balanced typography, and centered flower composition.

---

## 14. Chapter Orchestration — Phase 2

Status: Complete & Verified via Puppeteer Automated Browser Suite.

### Architecture Highlights
- **Central Flow System**: Refactored chapter progression into `src/chapters/` (`chapterRegistry.ts`, `ChapterFlowContext.tsx`, `ChapterStage.tsx`, `useChapterFlow.ts`, `useChapterLifecycle.ts`).
- **Explicit State Machine**: Chapters transition through `locked` → `ready` → `entering` → `active` → `completing` → `completed` → `leaving`.
- **Sequential Gating**: Future chapters remain locked and unmounted until preceding chapter interactions complete.
- **Double-Click Mutex**: `isTransitioning` lock prevents rapid tap / double-click from skipping chapters.
- **Natural Backscroll**: Completed chapters remain accessible in DOM; users can scroll back freely. `IntersectionObserver` dynamically synchronizes `currentChapter` and `ProgressRail`.
- **GSAP Transition Choreography**: Centralized 700–1000ms transition with subtle blur/scale exit (`opacity: 0.75, scale: 0.985, filter: blur(3px)`), smooth viewport scroll, and soft y-offset entry (`opacity: 0, y: 30px → opacity: 1, y: 0`). Outgoing styles reset cleanly for revisiting.
- **Viewport Normalization**: `min-h-[100svh]` across stages ensures stable mobile Safari/Chrome viewport behavior.
- **Accessibility**: Stage `tabIndex={-1}` with `focus({ preventScroll: true })`; modal dismissable via `Escape` key.
- **Reduced Motion Support**: Detects `prefers-reduced-motion: reduce` and provides immediate transitions.
- **Companion Progress Smoothing**: `ScrollCompanion` balloon pig spring-interpolates based on chapter progression, eliminating abrupt jumps when new chapters mount.
- **Zero Magic Timeouts in Navigation**: Removed navigation `setTimeout` from `App.tsx`; transition completion is driven by GSAP timeline callbacks.

---

## 15. Flowers Garden Experience — Phase 3

Status: Complete & Verified via Puppeteer Automated Browser Suite.

### Architecture Highlights
- **Subcomponent Modularization**: Decomposed `FlowersSection.tsx` into clean, testable subcomponents in `src/sections/flowers/`:
  - `FlowerBloom.tsx`: 5-frame blooming lily engine with overlapping dissolve, micro-scale expansion, optical blur softening, and continuous stem sway.
  - `StaticFlower.tsx`: Secondary open lily (`lily_static_alt_full_bloom.png`) providing compositional depth with asymmetric breeze oscillation.
  - `GrassField.tsx`: 3-layer garden floor (`grass_back`, `grass_mid`, `grass_front`) powered by a multi-frequency GSAP wind engine.
  - `FlowerMarquee.tsx`: Editorial typography ticker scrolling seamlessly behind the botanical layers.
  - `FloatingPetals.tsx`: Subtle ambient drifting petals.
  - `bloomConfig.ts`: Empirical stem alignment, transform offsets, and scale normalization factors.
  - `flowers.types.ts`: TypeScript interfaces and props contracts.
- **Preloading Pipeline (`src/lib/assets/preloadFlowers.ts`)**: Background preloader triggered during idle time in `HeroSection` to preload all 6 flower PNGs and 3 grass PNGs (~15 MB) before the user enters Chapter 2.
- **Micro-Alignment & Stem Anchor**: All frames anchored at `transform-origin: 50% 92%` with empirical micro-offsets to eliminate visual jumping between camera angles.
- **Multi-Frequency Wind Physics**: 3 distinct oscillation periods (`11.5s`, `8.2s`, `6.4s`) with phased delays and foreground-weighted angular deflection for natural, non-repeating grass motion.
- **Return-Visit Persistence**: One-way state latch combined with native JSX opacity styles (`hasBloomed ? (i === 4 ? 1 : 0) : (i === 0 ? 1 : 0)`) prevents timeline replay or reversion to bud when scrolling back from subsequent chapters.
- **Gated Narrative Progression**: Poetic quote appears synchronously as flower achieves full bloom (~3.8s); navigation CTA button is unlocked only when bloom completes.
- **Reduced Motion Support**: Immediate display of full bloom, static typography marquee, and instant CTA unlock when `prefers-reduced-motion: reduce` is active.
- **Viewport & Responsiveness**: Scaled botanical containers and grass heights ensure zero horizontal overflow (`0px`) on mobile viewports (390px) while maintaining full desktop editorial richness (1440px).

---

## 16. Secret Wallet Experience — Phase 4

Status: Complete & Verified via Puppeteer Automated Browser Suite.

### Architecture Highlights
- **Subcomponent Modularization**: Decomposed `WalletSection.tsx` into clean, tactile subcomponents in `src/sections/wallet/`:
  - `LeatherWallet.tsx`: Physical leather wallet container with 3D folding flap (`rotateX: -155deg`), embossed gold foil monogram (`quỹ chiều em`), magnetic clasp, interior velvet lining, and front pocket lip holding items inside.
  - `MoneyFan.tsx`: 6 stylized decorative banknotes (`500.000₫`, mascot watermark `🐷`, guilloche bands, serial numbers) fanned gracefully above the pocket.
  - `GiftCardRack.tsx`: 4 interactive romantic voucher cards nested in the pocket slot with hover lift and individual click triggers.
  - `GiftCardModal.tsx`: Accessible inspection modal with backdrop blur, detailed terms, official stamp, close button, and `Escape` key dismiss.
  - `walletConfig.ts`: Deterministic bill fanning geometry, slot coordinates, and responsive mobile parameters.
  - `wallet.types.ts`: TypeScript contracts for wallet state and vouchers.
- **Narrative Gating & Progression**:
  - Wallet starts closed on first visit; open trigger button is available with subtle pulse ring.
  - Next-chapter CTA (`Có thứ này quan trọng hơn ↓`) is strictly locked and hidden until the wallet opening animation finishes (~1.1s).
- **Return-Visit Persistence**:
  - Advancing to Chapter 03 (Letter) or Chapter 04 (Moments) and backscrolling preserves the opened wallet state, visible banknotes, and immediate CTA readiness.
  - Selected voucher dialog automatically resets to closed on revisit.
- **Accessibility & Reduced Motion**:
  - Full keyboard accessibility: trigger button semantics, voucher tab focus, `Enter`/`Space` activation, and `Escape` modal closing with focus restoration.
  - Detects `prefers-reduced-motion: reduce`: instantly opens wallet and presents CTA in <100ms.
- **Mobile Responsiveness**:
  - Clamped spreads for bills and vouchers on viewports <640px.
  - Selected card modal constrained to `w-[86vw] max-w-[340px]`.
  - Zero horizontal overflow (`0px`) on 390 × 844 iPhone viewport.



