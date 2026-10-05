# Chapter flow refinement — 1 October 2026

## Direction

The requested distinction is now explicit: memories arrive from outside the viewport and approach at different depths. They no longer originate at the letter. The four photos briefly face the viewer during entry, then turn to their handwritten covers. Each remains individually flippable.

Chapter 05 uses a cream travel keepsake against a warm brown scene, with an overlapping photograph, a live days-together count, and three selectable milestones. The selected milestone updates the handwritten message and illuminated route. On mobile, the ticket appears before the longer body copy.

Chapter 04 to 05 gathers the photos into a stack behind the ticket. Paper becomes opaque early in its entry so overlapping objects do not appear translucent. Scene copy yields before the incoming title establishes itself. The mascot avoids the ticket and does not automatically open a speech bubble over the memory/table scenes.

## Runtime repairs

The latest workspace version had replaced individual transitions with one timed vertical page slide. Reconnected the scene-specific drivers for garden/envelope, envelope/letter, letter/memories, memories/anniversary, and anniversary/finale. Wheel, touch, and keyboard input drive progress; stopping holds the frame and reversing retraces it. CTA navigation plays the same choreography automatically.

Locked chapters remain pre-mounted for assets but cannot occupy scroll space. Restored the gold thread portal behind the envelope. Kept the custom cursor available in Chapter 03 and hid global overlays during handoffs. The envelope seal waits until its arrival is finished, avoiding clicks on a moving target.

## Visual evidence

- [Memory approach, desktop](moments-approach/contact-sheet.png)
- [Memory approach, mobile](moments-approach-mobile/contact-sheet.png)
- [Memory approach recording](moments-approach-mobile/workflow.mp4)
- [Anniversary, desktop](anniversary-polished/contact-sheet.png)
- [Anniversary, mobile](anniversary-polished2-mobile/contact-sheet.png)
- [Anniversary recording](anniversary-polished2-mobile/workflow.mp4)
- [Anniversary stable mobile layout](anniversary-polished2-mobile/anniversary.png)

Reviewed 1440 × 900 desktop and 390 × 844 mobile. Memory approach was captured at 21 positions in each direction; anniversary had dense desktop frames plus seven-keyframe forward/reverse mobile sheets. Actual touch input was used for mobile memories/anniversary tests.

## Validation

- `moments-workflow.mjs approach --dense --record` — passed.
- `moments-workflow.mjs approach --mobile --dense --record` — passed.
- `anniversary-workflow.mjs polished --dense --record` — passed.
- `anniversary-workflow.mjs polished2 --mobile --record` — passed after correcting copy choreography for the mobile layout.
- `anniversary-workflow.mjs reduced --mobile --reduced` — passed.
- `flowers-voucher-scroll.mjs restored` and `restored --mobile` — passed progress, hold, reversal, thread length, layer and overflow assertions.
- `finale-workflow.mjs restored --mobile` — passed forward/reverse navigation, candle blowing, re-ignition, and state preservation.
- `flowers-voucher-scroll.mjs solid --mobile` — passed after separating material opacity from position; the photo no longer shows through the envelope at midpoint.
- `workflow-controls.mjs controls` — passed Escape in both directions, resize during a held transition, restored native geometry, and reduced-motion navigation. This caught a 48 px tablet overflow from the garden reel; horizontal clipping is now owned by the garden scene.
- TypeScript and production build passed. The existing bundle-size advisory remains nonblocking.

The browser runs verified all four existing remote memory photos loaded. No page errors were reported in passing runs. Assets and personal copy from the current project were retained.
