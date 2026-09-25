# ThreeUI source provenance

Upstream: https://github.com/MengTo/threeui

Pinned commit: `68802d5428071ada5c20db8094b1649e6bb770ed`

Copyright (c) 2026 Meng To. MIT License; the complete notice is in `LICENSE`.

Unmodified source files:
- `src/shaders/ribbon-field/ribbonFieldShaders.ts`
- `src/shaders/energy-orb/energyOrbShaders.ts`

`ThreeUIBackground.tsx` adapts the WebGL setup, full-screen triangle and uniform
mapping from `src/shaders/ribbon-field/RibbonFieldBackground.tsx` and
`src/shaders/energy-orb/EnergyOrb.tsx` at that commit. The local renderer combines
their lifecycle, adds chapter activity gating, tab visibility resume, quality/FPS
caps, context-loss fallback and complete cleanup including failed initialization.
Palette/speed are customized for the birthday site. No catalog, fonts, external
assets, iframe documents, Pro code or Three.js runtime are imported.
