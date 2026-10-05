---
name: motion-ui-director
description: >-
  Design and critique interactive motion based on human perception, continuity, weight, staging, and timing.
  Distinguish functional transitions from directed choreography. Use this skill to evaluate motion hierarchy,
  inertia, reverse continuity, transition contact sheets, and detect dead frames.
---

# Motion UI Director Skill

This skill acts as an animation director and motion designer.
It guarantees that animation is not merely "functional" (moving pixels from A to B), but **directed**—communicating physical relationships, guiding viewer gaze, maintaining continuity, and feeling intentional and cinematic.

---

## Core Distinction: Functional vs. Directed Transitions

| Transition Type | What It Does | Why It Fails / Succeeds |
| :--- | :--- | :--- |
| **Functional Transition** | Moves layer A offscreen, moves layer B onscreen. Tweens scroll or CSS transform values mathematically. | **REJECTED**: Mechanical, sterile, feels like sliding PowerPoint slides or crossing stacked webpage sections. |
| **Directed Transition** | Choreographs a continuous journey. Visual focal points transfer intentionally; anticipation, inertia, and depth cues create an immersive narrative handoff. | **ACCEPTED**: Cinematic, continuous, tactile, and natural. |

---

## Motion Review Protocol

When designing or evaluating any transition or animation sequence:

### 1. Visual Continuity & Attention Handoff
At every intermediate millisecond of the motion:
- **Lead Subject**: What visual object is carrying the viewer's attention during the handoff?
- **Overlap**: Does the incoming scene's hero object begin arriving *before* the outgoing scene's focal point completely leaves?
- **Zero Blank Voids**: Never allow:
  $$\text{Scene A vanishes} \implies \text{Blank background void} \implies \text{Scene B appears}$$
- **Eye Guidance**: The eye must glide smoothly between focal points without disorientation or having to search the screen.

### 2. Motion Hierarchy & Staggering
Never move an entire scene as a rigid monolithic block:
- **Primary Movement**: The anchor subject moves first (e.g. envelope body entering).
- **Secondary Movement**: Supporting items follow with slight offset (e.g. decorative corners, typography reveal).
- **Settling Detail**: Ambient micro-motion settles into place last (e.g. gentle particle drift, gold foil shimmer).
- **Rule**: Avoid synchronized mass motion where 10 elements start and stop at the exact same frame.

### 3. Physical Weight & Inertia
DOM elements represent simulated physical stationery and objects:
- **Anticipation**: Heavy objects compress or gather tension before taking off.
- **Velocity & Friction**: Fast initial acceleration smoothly braking with `power2.out`, `cubic-bezier(0.16, 1, 0.3, 1)`, or spring settling.
- **Depth Parallax**: Background textures move at a slower velocity than midground items, while foreground atmospheric layers sweep by quickly.
- **Mass Distinction**: A delicate paper voucher cannot move with the same rigidity as a solid envelope base.

### 4. Reverse Interaction Integrity
Reverse scrolling must be inspected visually by playing backward:
- It cannot be treated as a mere mathematical negative transform.
- When scrubbing or reversing, does the incoming subject emerge organically, or does it feel like a film played backward with awkward upside-down mechanics?
- The reverse journey must feel as directed and deliberate in reverse as forward does forward.

### 5. Transition Contact Sheet (The 7-Frame Gate)
For every major chapter boundary or state transition, capture at minimum 7 key progression frames:
- **0%**: Outgoing scene stable
- **20%**: Transition initiating, initial displacement
- **40%**: Mid-handoff, incoming subject entering
- **50%**: Exact midpoint boundary
- **60%**: Incoming subject claiming primary focus
- **80%**: Outgoing subject cleared, incoming settling
- **100%**: Incoming scene stable

**Review Rule**:
Assemble all 7 frames into a single contact sheet.
The sequence must look like storyboard stills from a single unified film sequence.
If frames between 40%–60% look like two unrelated web pages sliced in half, or reveal an empty void, **THE TRANSITION FAILS**.

### 6. Dead-Frame Detection
A **dead frame** is any frame during a transition that contains:
1. Mostly background or empty gradients.
2. No strong, identifiable focal subject.
3. Outgoing subject already scrolled out of view while the incoming subject has not yet arrived or established itself.

**Zero Tolerance**: There must be **ZERO** dead frames in any transition. The viewer must never look at a vacuum.
