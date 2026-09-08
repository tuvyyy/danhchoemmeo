Rebuild ONLY the flower/garden section using the image assets that already exist inside this project.

Do NOT generate new flowers.
Do NOT use Unsplash.
Do NOT use remote image URLs.
Do NOT draw SVG/vector flowers or vector grass.
Do NOT replace the uploaded assets with placeholders.

USE THESE EXISTING LOCAL ASSETS

The uploaded assets are located under:

src/img/birthday_flower_asset_pack/

Use these exact files for the blooming flower:

lily_frame_01_bud.png
lily_frame_02_opening.png
lily_frame_03_half_bloom.png
lily_frame_04_almost_open.png
lily_frame_05_full_bloom.png

Use these exact files for the garden:

grass_mid.png
grass_front.png

If grass_back.png exists in the folder, also use it as the background grass layer.

These PNG files already have transparent backgrounds.

DO NOT apply mix-blend-screen.

Render them normally as transparent PNG assets.

SECTION STRUCTURE

Keep the existing full-screen dark section approximately 100vh.

Background:

dark near-black / deep brown-black radial background.

Keep the large low-opacity marquee text behind the flower:

“growing with you — blooming with you — loving you”

It should move slowly horizontally from right to left.

Opacity around 6–10%.

MAIN BLOOMING FLOWER

Place ONE blooming lily around the upper-center / slightly right of center.

IMPORTANT:

All five lily image frames represent ONE flower animation.

They must NOT appear as five separate flowers.

They must NOT appear next to each other.

They must occupy the exact same visual position.

Create one container:

flower-bloom-sequence

Inside it, stack all 5 PNG images absolutely on top of each other.

Every frame must use:

same width
same height
same center
same stem-base anchor
same object-fit: contain

Normalize the visual placement so the flower does not jump left/right/up/down between frames.

Use the bottom-center of the stem as the transform origin.

BLOOM ANIMATION

Animate the flower using the uploaded sequence:

01 bud
→
02 opening
→
03 half bloom
→
04 almost open
→
05 full bloom

Do NOT instantly swap images.

Do NOT make it look like a slideshow.

Each transition must have a soft overlap:

previous frame fades out while next frame fades in.

Suggested transition:

opacity 1 → 0

while next frame:

opacity 0 → 1

overlap for approximately 300–450ms.

During the whole sequence also add only a tiny organic movement:

scale: 0.97 → 1
rotate: -0.5deg → 0.4deg
y: 2px → 0

This should feel like the SAME physical flower slowly opening.

Never move each frame to a different location.

INTERACTION FLOW

When the user reaches this section:

Keep the section locked / active.
Start with lily_frame_01_bud.png.
Show a very small status:

“hoa đang nở…”

Play the bloom sequence over approximately 3.5–4.5 seconds.
After the flower reaches lily_frame_05_full_bloom.png, fade in the main quote.
Only after the bloom finishes should the “Món quà nhỏ tiếp theo ↓” button become available.

The user should experience the flower blooming before moving to the next section.

SECOND FLOWER

Create one smaller secondary flower using:

lily_frame_05_full_bloom.png

Place it slightly behind and to the left of the main flower.

Make it approximately 55–65% of the main flower size.

Do NOT animate another bloom sequence for it.

It should only sway gently from wind:

rotate: -0.7deg → 0.7deg → -0.7deg

y: 0 → -3px → 0

duration around 6–8 seconds

with smooth easing.

Make the two flowers overlap naturally, not float independently.

GREEN GRASS GARDEN

The entire bottom edge of the section should become a green garden.

Use the uploaded grass PNG assets.

Do NOT use CSS rectangles or generated grass lines.

Back layer

If grass_back.png exists:

full viewport width
placed furthest back
slightly darker
scale approximately 1.05
subtle blur 0–1px
Middle layer

Use:

grass_mid.png

full width
most visually readable grass layer
positioned at the bottom
Front layer

Use:

grass_front.png

full width
slightly larger
positioned closest to camera
blur approximately 1.5–2.5px
allow some blades to extend higher into the scene

The garden should occupy around 20–25% of the viewport height.

Do not put the grass inside rectangular cards.

WIND EFFECT

Animate every grass layer separately.

The bottom of each grass layer must stay anchored.

Use:

transform-origin: center bottom

Create a gentle irregular wind movement.

Example:

grass-back
rotate approximately -0.25deg ↔ 0.25deg
duration 12–14s

grass-mid
rotate approximately -0.5deg ↔ 0.5deg
duration 8–10s

grass-front
rotate approximately -0.8deg ↔ 0.8deg
duration 6–8s

Slightly vary skewX and horizontal translation.

Do NOT animate every grass layer with identical timing.

The result should feel like a light breeze passing through the garden.

Keep it subtle.

MAIN QUOTE

After the blooming animation finishes, reveal:

“My darling,
you will never be unloved by me.”

Use an elegant ivory serif.

Keep it centered below the flowers but ABOVE the grass.

Do not place text over the densest part of the garden.

Animate:

opacity 0 → 1

y 12px → 0

duration around 1.2s.

PETALS

Use only 3–5 tiny petals maximum.

They may drift slowly across the viewport.

Do not create heavy particle effects.

The scene should remain calm.

FINAL LAYER ORDER

Use this exact visual hierarchy:

dark background
marquee text
secondary flower
main blooming flower sequence
quote
grass back
grass mid
grass front
occasional petals
next-section button
IMPORTANT IMPLEMENTATION RULES

Keep everything separated into components/layers so it can later be refined with GSAP.

Add useful selectors/data attributes:

data-layer="marquee"

data-layer="flower-bloom"

data-layer="flower-static"

data-layer="grass-back"

data-layer="grass-mid"

data-layer="grass-front"

data-layer="quote"

Do not fetch assets from the internet.

Do not modify or redraw the uploaded PNGs.

Do not replace them.

Use the local files already present under src/img/birthday_flower_asset_pack/.

After implementation, run the existing typecheck/build and fix any errors before reporting completion.