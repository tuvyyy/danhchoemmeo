# Garden gate architecture

The current entrance uses [`estate-sunset.webp`](estate-sunset.webp), converted at quality 93 from the user's supplied 1774 × 887 sunset photograph on 3 October 2026. `sunset-reference.png` preserves the original attachment. No generated replacement image is used.

`SunlitIronGate.tsx` builds actual Three.js geometry from the existing ironwork paths: tubular rails, extruded ornaments, bronze hinges and raised handles. A perspective camera and two independently hinged leaves provide depth; warm light from the right matches the sun in the photograph. It renders on opening/resize changes instead of continuously when idle. The original SVG doors remain available when WebGL is unavailable or its context is lost.

The previous `estate-mist.webp` and floral `limestone-arch.webp` are retained as unused earlier iterations. The mist plate's generation notes remain in [estate-mist.md](estate-mist.md).

- Asset: `limestone-arch.webp` — 1024 × 1536, RGBA, 447,782 bytes.
- Generated with the built-in ImageGen tool for this project. The alpha channel is preserved; the doorway and exterior are transparent.
- Original: `C:/Users/Thang/.codex/generated_images/01a0f76f-54b8-73f0-9c49-3a964b91ada3/exec-1867706c-69b5-4396-83ec-d534d2e465c1.png`.
- Converted to WebP at quality 88 for delivery. All runtime references use the workspace asset.
- Iron doors, their relief ornaments, opening geometry, light and camera movement are native SVG/CSS/GSAP in `src/sections/hero/GardenGate.tsx` and `src/chapters/heroGardenHandoff.ts`.
- Visual reference: the user's 48.3-second recording of The Symphony of Vines; no artwork or source code from that website is included.

## Generation prompt

Use case: stylized-concept.
Asset type: isolated architectural environment layer for a premium cinematic interactive romantic website. Generate a tall portrait 1024x1536 image with genuine alpha transparency.
Subject: a monumental antique French garden archway, symmetrical front elevation camera, warm ivory limestone, exquisitely carved thin moldings, substantial rounded Roman arch, thick stone piers and subtle weathered floral bas relief. Small climbing dark olive foliage and ivory roses around the outer edges and top, restrained and sophisticated. Pair of tiny aged brass wall lanterns attached to outer sides. Photorealistic architectural visualization, tactile limestone pores and beautiful soft shadowed bevels, champagne late afternoon light from upper left, subtle golden rim light on INNER opening. Calm, mysterious, elegant cinematic editorial aesthetic.
Composition: entire arch is visible, standing vertically, centered, bottom piers touch bottom edge. Arch fills 90% of image width and 95% of image height. Interior doorway opening is completely EMPTY and TRANSPARENT, wide and tall, extends all the way through bottom edge. Interior clear opening bounded approximately x=27% to x=73%, arch apex at y=23%, arch shoulders y=39%, vertical sides down to y=100%. Both the OUTSIDE background and entire INSIDE opening must be true alpha transparent. We will put a moving garden scene and separate animated iron doors inside later.
No doors, no gates, no ground plane, no floor, no steps, no sky, no scenery inside opening, no backdrop, no text, no letters, no watermark. Render ONLY stone architecture, sparse foliage and small lanterns. Strict front view, no tilted perspective.
