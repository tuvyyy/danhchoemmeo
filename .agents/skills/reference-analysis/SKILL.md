---
name: reference-analysis
description: >-
  Analyze visual references (e.g. QClay, Awwwards, award-winning scrollytelling sites) before implementation.
  Extract core design principles, viewport composition, lighting, camera/depth, motion cadence, and build
  side-by-side visual comparison sheets comparing rendered frames instead of code.
---

# Reference Analysis Skill

This skill analyzes visual benchmarks and award-winning interactive experiences (such as QClay, Apple special event pages, and high-end scrollytelling sites).
It ensures we do not copy assets blindly, but rigorously deconstruct and adopt their underlying design and motion grammar.

---

## Core Extraction Principles

When reviewing reference material or benchmark recordings:

### 1. Geometric & Viewport Deconstruction
Express the reference geometry numerically before writing code:
- **Hero Object Footprint**: Exactly what percentage of viewport width and height does the primary subject occupy? (e.g., "Envelope fills $72\%$ of viewport width at $1440\times900$, aspect ratio $16:9$").
- **Headline & Anchor Position**: Where is copy anchored? (e.g., "Top $15\%$, centered horizontally, 3 lines max rag").
- **Dominant Negative Space**: Which quadrant or third carries breathing room?
- **Crop Boundaries**: Is the object cropped by viewport edges, or floating freely with padding?
- **Foreground Occlusion**: How much of the hero object is masked or framed by foreground elements?

### 2. Camera, Depth & Lighting Language
- **Camera Staging**: Is the perspective isometric, orthographic, or dramatic perspective ($1200\text{px}-1800\text{px}$ vanishing point)?
- **Key Light & Shadows**: Where is the primary light coming from? How soft are the contact shadows?
- **Atmosphere**: How subtle is the background gradient or vignetting? Does it shift color temperature across scroll?

### 3. Motion Cadence & Continuity Strategy
- **Trigger Mechanic**: Scrubbed scroll vs. boundary threshold handoff vs. momentum drag.
- **Handoff Device**: What object acts as the visual bridge between scenes? (e.g., does an envelope open and zoom toward the camera to reveal the next chapter?).
- **Velocity Curve**: Does motion feel spring-like, heavily damped, or cinematic slow-in?

---

## Side-by-Side Review Protocol

Whenever reference material is available:

1. **Extract Reference Frames**:
   Capture reference keyframes at steady state and across transition intervals ($0\%, 25\%, 50\%, 75\%, 100\%$).
2. **Capture Matching Local Frames**:
   Capture current implementation at the exact same progression milestones.
3. **Build Side-by-Side Comparison Sheet**:
   Assemble a visual 2-column or 2-row comparison:
   $$\text{REFERENCE} \quad \text{vs.} \quad \text{CURRENT IMPLEMENTATION}$$
4. **Compare Rendered Pixels, Not Code**:
   Do not evaluate GSAP ease parameters or CSS rules. Compare the actual rendered images.
5. **Identify Gap**:
   Note differences in scale contrast, shadow realism, focal point clarity, or empty intervals.
