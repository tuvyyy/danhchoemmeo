Design a premium interactive flower bouquet builder website where users create a flower arrangement by adding real-looking flowers one stem at a time into a vase.

CORE IDEA:
The main experience is centered around a realistic flower vase and a bouquet that gradually grows as the user selects individual flowers.

The flowers must look like REAL photographed flowers or highly photorealistic botanical imagery.
Do NOT use cartoon flowers, vector illustrations, emoji-like flowers, low-poly 3D, game-style 3D, or generic floral icons.

The interface should feel elegant, editorial, romantic, modern, and premium — similar to a luxury florist, fashion editorial, or high-end botanical studio.

---

PAGE STRUCTURE

Create a desktop-first responsive web interface, approximately 1440px wide.

1. TOP NAVIGATION

Minimal navigation bar.

Left:

* Elegant text logo: “Floré”
* Small understated subtitle if needed: “Build your bouquet”

Center or right:

* Create Bouquet
* Collections
* About

Far right:

* small shopping bag icon
* bouquet count or price

Navigation should be very minimal and visually quiet.

---

2. MAIN BOUQUET BUILDER

Use a large full-height hero workspace.

The page background should be warm ivory / off-white with subtle natural paper texture or soft studio lighting.

Do not place the whole interface inside obvious rectangular cards.

The workspace should feel open and spacious.

MAIN CENTER AREA:

Place a realistic ceramic or transparent glass vase around the lower-center of the screen.

Above and inside the vase is the user's bouquet.

At the initial state:

* vase can be empty
  or
* contain only a few subtle green stems

Flowers should appear as individually separated realistic stems.

Examples:

* rose
* tulip
* peony
* ranunculus
* daisy
* baby's breath
* eucalyptus
* hydrangea

Each flower should preserve its natural stem, leaves, flower head, irregular shape, and imperfections.

The bouquet must NOT look like one flat bouquet image.

It should visually look like separate flowers that have been individually inserted into the vase.

Use believable overlapping:

* some flowers in front
* some behind
* different heights
* slightly different rotations
* natural asymmetry

Leave generous negative space around the bouquet.

---

3. FLOWER SELECTION AREA

Place the flower library along the bottom of the page.

Do NOT design this like a typical ecommerce product grid.

Instead create an elegant horizontal flower tray.

Each flower option should display:

* isolated realistic flower stem
* flower name
* very small price
* subtle + button

Example:

Rose
$4.00
+

Tulip
$3.50
+

Peony
$5.00
+

Show approximately 5–7 flower varieties at once.

Flower images should visually extend outside their container slightly so the interface feels organic rather than boxed.

Allow horizontal scrolling.

The selected flower can have a very subtle highlight or underline.

---

4. INTERACTION CONCEPT

The most important interaction:

When the user presses + on a flower, imagine that ONE REAL FLOWER STEM moves from the flower tray toward the vase and gets inserted into the arrangement.

Design the UI so this animation would make visual sense.

Animation storyboard:

STATE A:
User sees a flower in the bottom flower tray.

STATE B:
After pressing +, the chosen flower lifts out of the tray.

STATE C:
The flower moves upward toward the bouquet using a soft curved path.

During movement:

* flower can rotate slightly
* stem stays visually intact
* scale changes subtly
* motion should feel physical, gentle and organic

STATE D:
The bottom part of the stem passes behind the front rim of the vase.

STATE E:
The flower settles into the bouquet.

The head of the flower gently moves or bounces by a few pixels before becoming still.

Existing flowers may shift slightly to make room.

The final bouquet becomes progressively fuller.

Avoid exaggerated animation.

The motion should feel slow, natural, tactile and satisfying.

---

5. SMALL FLOATING BOUQUET CONTROLS

Near the bouquet, include only subtle controls:

Undo
Redo

Optional:

* Rotate bouquet
* Remove selected flower

Do not create a large toolbar.

Controls should disappear visually when they are not needed.

---

6. BOUQUET SUMMARY

Place a small elegant summary in the lower-right area.

Example:

Your bouquet

12 stems

Roses × 4
Tulips × 3
Peonies × 2
Eucalyptus × 3

$54.00

[ Add to bag ]

Keep this section visually light.

Use typography and whitespace rather than borders.

---

7. OPTIONAL DETAIL

When hovering a flower already inside the bouquet:

* subtly highlight that individual stem
* display flower name
* show a tiny remove control

This helps communicate that each flower remains an individual editable object.

---

VISUAL DIRECTION

Mood:

* natural
* poetic
* editorial
* sophisticated
* soft
* premium
* contemporary

Imagine a combination of:

luxury florist website
+
Kinfolk editorial styling
+
high-end perfume ecommerce
+
botanical photography studio

Avoid:

* SaaS dashboard look
* glassmorphism everywhere
* large rounded cards
* gradients everywhere
* neon colors
* excessive icons
* cartoon aesthetics
* obvious 3D-rendered game look
* cluttered ecommerce layouts

---

COLOR PALETTE

Use restrained natural colors.

Background:
warm ivory
#F6F2EA

Primary text:
deep charcoal
#272622

Secondary text:
muted warm gray
#817B72

Botanical accent:
deep muted green
#39483B

Optional soft accent:
dusty rose
#CBA9A5

The flowers themselves should provide most of the color.

---

TYPOGRAPHY

Use an editorial serif font for large titles.

Examples:

* Cormorant Garamond
* Instrument Serif
* Editorial New style

Use a clean modern sans-serif for interface labels.

Examples:

* Inter
* Neue Haas Grotesk
* Geist

Typography should feel refined, not decorative.

---

HERO TEXT

Keep text minimal.

Possible heading:

“Build something beautiful.”

Small supporting copy:

“Choose each stem and watch your bouquet come together.”

Do not let text compete visually with the flowers.

The bouquet should remain the hero.

---

REALISM REQUIREMENTS

The flowers are the most important visual element.

They must:

* resemble high-resolution real flower photography
* include natural imperfections
* have realistic stems and leaves
* not be perfectly symmetrical
* have believable shadows
* overlap naturally
* have different scale and depth

Create a subtle contact shadow around the vase.

Use very soft environmental shadows from flowers.

Avoid harsh CGI lighting.

---

RESPONSIVE MOBILE CONCEPT

Also create a mobile version around 390px width.

Mobile composition:

* small navigation
* bouquet occupies roughly 55–60% of screen height
* vase centered
* flower tray fixed near bottom
* flower options horizontally scrollable
* bouquet summary opens as a bottom sheet
* * button large enough for touch

The flower-adding interaction remains the main experience.

---

CREATE THESE FIGMA FRAMES

Frame 1:
Empty Vase / Start State

Frame 2:
Bouquet with 5 stems

Frame 3:
Flower selected from tray

Frame 4:
Mid-animation state — one flower travelling toward vase

Frame 5:
Completed bouquet

Frame 6:
Hover / selected flower inside bouquet

Frame 7:
Mobile bouquet builder

The design should make it immediately obvious that the user is building the bouquet by inserting individual realistic flower stems into the vase one by one.
