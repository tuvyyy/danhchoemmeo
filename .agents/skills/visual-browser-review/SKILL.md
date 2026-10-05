---
name: visual-browser-review
description: >-
  Automate browser visual capture, multi-viewport state rendering, transition sequence extraction,
  and contact sheet generation using headless Puppeteer. Enforce the rapid iteration review loop:
  change -> capture -> contact sheet -> visual critique -> iterate.
---

# Visual Browser Review Skill

This skill provides the automated tooling and workflow to capture rendered browser viewports, extract transition progression frames, and compile high-resolution contact sheets for visual inspection.

---

## The Visual Review Loop

Engineering tests (TypeScript compile, Vite build, DOM unit tests, transform checks) answer:
> *"Does the code run without throwing errors?"*

The visual browser review loop answers:
> *"Does the rendered interface look high-quality, continuous, and visually compelling to a human?"*

### The 8-Step Review Procedure:
1. **Make code change** (layout, styling, motion, typography).
2. **Ensure application is running** (dev server on localhost).
3. **Capture screenshots** via `capture-states.mjs` across viewports (1440×900 desktop, 390×844 mobile) and transition progression frames.
4. **Build contact sheet** via `make-contact-sheet.mjs` combining all frames with clear labels, timestamps, and progress percentages.
5. **Visually inspect output** at 100% scale using image viewing tools.
6. **Identify the single largest visible flaw** (dead frame, awkward seam, clutter, focal loss).
7. **Refine the implementation**.
8. **Capture again**.

**Rule**: Never stop at "typecheck PASS" or "geometry test PASS". You may only declare a task complete when the rendered contact sheet passes visual art direction.

---

## Scripts & Tools

Located in `./scripts/`:

### 1. `capture-states.mjs`
Launches headless Chrome, navigates to the app, drives interactions/scroll positions, captures static viewports or scrubs transition timelines to capture exact progression frames:
```bash
node .agents/skills/visual-browser-review/scripts/capture-states.mjs [options]
```

### 2. `make-contact-sheet.mjs`
Assembles captured frames into a labeled, high-DPI contact sheet:
```bash
node .agents/skills/visual-browser-review/scripts/make-contact-sheet.mjs --input <dir-or-glob> --output <sheet-path> --title <title>
```
