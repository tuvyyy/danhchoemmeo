---
description: Enforce visual review loop, contact sheets, and perceptual quality gate on all frontend and UI work.
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.html", "**/*.svg"]
always_on: true
---

# Persistent Workspace Rule: Frontend Visual Quality & Perceptual Gate

This rule applies to all tasks modifying frontend code, styles, motion, layout, visual assets, or chapter transitions.

---

## Core Mandate

> **"Automated geometry correctness is not evidence of visual quality."**
> 
> **"If the implementation technically matches the requested transforms but the rendered result does not visibly improve, continue iterating."**

Passing automated tests, TypeScript checks, and CSS transform assertions proves only that the code executes without fatal crashes. It does **NOT** prove that the website looks beautiful, feels continuous, or satisfies interactive art direction.

---

## The Mandatory Completion Requirements

Before declaring any UI, styling, or motion task complete, the agent MUST provide:

### 1. Engineering Verification
- `corepack pnpm run typecheck` $\to$ 0 errors
- `corepack pnpm run build` $\to$ 0 build errors
- Behavioral / unit tests passing where applicable

### 2. Visual Perception Verification
- **Desktop Screenshot** ($1440 \times 900$)
- **Mobile Screenshot** ($390 \times 844$) where responsive layout is touched
- **Transition Contact Sheet** (at minimum $0\%, 20\%, 40\%, 50\%, 60\%, 80\%, 100\%$ keyframes) whenever transitions, boundary handoffs, or animations are modified
- **Perceptual Critique**: Written assessment of focal hierarchy, negative space, lighting, and dead-frame elimination
- **Before / After Comparison**: Explicit side-by-side verification demonstrating that the visual problem was truly solved

---

## Prohibited Behaviors

1. **NEVER** claim completion by only reporting "tests pass", "build succeeded", or "typecheck clean".
2. **NEVER** trust mathematical bounding box calculations without visually inspecting the rendered pixels in a screenshot.
3. **NEVER** allow a transition with "dead frames" (moments where the screen is mostly an empty background void with no identifiable subject).
4. **NEVER** add decorative clutter (extra particles, floating sparkles, redundant borders) to compensate for a weak core composition. The default action is **subtraction**.

---

## Review Loop Workflow

When working on any UI task:
1. Make targeted change.
2. Run development build / ensure server is active.
3. Execute `capture-states.mjs` to capture actual rendered frames.
4. Execute `make-contact-sheet.mjs` to generate a multi-frame contact sheet.
5. Visually inspect the generated image.
6. Identify the single largest remaining visual flaw.
7. Refine code and repeat until the rendered result meets high art-direction standards.
