# Grass Asset Pack

Contents:
- 1 wide grass back strip (`grass_back_strip.png`)
- 9 transparent grass clumps (`grass_clump_01...09`)

Suggested use:
- Use `grass_back_strip.png` as the far background layer.
- Layer 4-6 clumps across the bottom for the mid layer.
- Layer 3-5 larger/taller clumps in front for the front layer.
- Set `transform-origin: center bottom;` on each clump.
- Animate each clump independently with different GSAP durations / delays / amplitudes.

Suggested layering:
- back: `grass_back_strip.png`
- mid: clumps 02, 03, 07, 08
- front: clumps 01, 04, 05, 06, 09

All files are PNGs intended for compositing over a dark background.
