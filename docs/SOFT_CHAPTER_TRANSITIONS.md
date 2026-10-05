# Scroll-directed chapter transitions

- Video → voucher: capture the current local video frame on a temporary 48 × 24 WebGL mesh. Its lower edge gathers into a narrow leading `V` tip while the shoulders stay wide. Radiating creases converge toward this grip, with corresponding highlights and shadows. The surface fades as it is drawn behind the envelope; the tip is occluded inside the pocket. Match the original video crop and aspect ratio on each viewport. Without WebGL or a decoded frame, retain the native video and its gradual fade.
- Letter → memories: independently enlarge, lift, soften and fade the letter, copy and flowers. Preserve the flowers' original colour treatment. Let the garden recede behind the incoming scene.
- Memories: photos start small near a shared vanishing point and approach their resting positions, becoming sharper as they arrive. Slight staggering separates their depth. Existing photo flipping and album state remain intact.

The existing scroll driver owns every transform. Stopping holds the pose; reversing retraces it. Temporary canvases, GPU resources, source bitmaps and the fragment canvas, inline styles and transition layers are released at either endpoint. Reduced-motion mode uses the existing immediate chapter change.

Validation: TypeScript and production build; real wheel/touch navigation at 1440 × 900 and 390 × 844; seven frames in each direction; hold and mid-gesture reversal; photo flips and state persistence; no horizontal overflow; reduced motion; WebGL fallback.

Visual evidence in `docs/captures/flowers-voucher-pulled-paper{,-mobile}` and `docs/captures/moments-fine-canvas-final{,-mobile}`. At the midpoint the envelope/photographs carry focus while the outgoing object remains visible. No blank transition frames.
