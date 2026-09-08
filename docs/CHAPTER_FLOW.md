# Chapter Flow & Orchestration Architecture — Phase 2

## 1. Overview
The birthday website uses an episodic chapter progression model (`Hero → Flowers → Wallet → Letter → Moments → Finale`) rather than an open continuous landing page. Visitors experience each chapter sequentially, complete its required interaction, and deliberately advance to the next chapter via a smooth GSAP transition.

---

## 2. Chapter State Model & Lifecycle States

### Explicit States
Each chapter exists in one of the following lifecycle states:

| Lifecycle State | Description |
| :--- | :--- |
| `locked` | Chapter index $> \text{unlockedThrough}$. Not mounted or reachable. |
| `ready` | Mounted in DOM and ready for interaction. |
| `entering` | Currently animating into view via GSAP enter timeline. |
| `active` | In full viewport focus; visitor is interacting. |
| `completing` | Internal interaction finished (e.g. 4 polaroids flipped, candle extinguished). |
| `completed` | CTA button clicked; transition triggered. |
| `leaving` | Currently exiting via GSAP subtle blur/scale transition. |

---

## 3. Unlock & Progression Rules

1. **Initial Access**: At initial load, only Chapter 0 (`Hero`) is unlocked and mounted. Chapters 1–5 are locked.
2. **Sequential Unlocking**: Completing Chapter $i$ unlocks Chapter $i+1$. Future chapters remain strictly inaccessible until unlocked.
3. **Double-Click & Mutex Protection**:
   - `advance(fromIndex)` checks `isTransitioningRef.current`. If a transition is already in progress, subsequent clicks are ignored.
   - Prevents double-clicks or rapid tapping from skipping chapters.
4. **Natural Backscroll**:
   - Once unlocked, previous chapters remain mounted in the DOM.
   - The visitor can freely scroll backward to revisit earlier chapters at any time.
   - `IntersectionObserver` dynamically updates `currentChapter` and synchronizes `ProgressRail`.
5. **Re-advancing**:
   - The visitor can scroll forward or click on already-unlocked chapters in `ProgressRail` to jump directly to them.
   - Future locked chapters cannot be selected in `ProgressRail` (`disabled`, `cursor-not-allowed`).

---

## 4. GSAP Transition Ownership & Choreography

All inter-chapter transition animations are owned centrally by `ChapterFlowContext`:

1. **Outgoing Chapter Exit**:
   - `opacity: 0.75`
   - `scale: 0.985`
   - `filter: blur(3px)`
   - Duration: `0.4s`, `ease: "power2.out"`
2. **Viewport Movement**:
   - `scrollIntoView({ behavior: "smooth", block: "start" })`
3. **Incoming Chapter Entry**:
   - From `opacity: 0, y: 30px` to `opacity: 1, y: 0`
   - Duration: `0.6s`, `ease: "power2.out"`
4. **Cleanup**:
   - `gsap.set(outgoingContent, { clearProps: "opacity,transform,filter" })`
   - Ensures returning via backscroll presents a clean, unblurred view.
   - Calls `focus({ preventScroll: true })` on the incoming stage for accessibility.
   - Releases transition lock (`isTransitioning = false`).

---

## 5. Section Lifecycle Hook API (`useChapterLifecycle`)

Sections can observe their own lifecycle states without managing global window scroll:

```tsx
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";

export default function ExampleSection() {
  const { state, isActive, isUnlocked, isCompleted } = useChapterLifecycle(1);

  useEffect(() => {
    if (isActive) {
      // Start section-specific animation timeline (e.g. flower bloom)
    }
  }, [isActive]);

  return <div>...</div>;
}
```

---

## 6. Viewport Normalization & Accessibility

- **Modern Viewport Sizing**: `min-height: 100svh` (`min-h-[100svh]`) on `ChapterStage` prevents viewport jumping on mobile browsers (Safari / Chrome dynamic address bars).
- **Focus Management**: `ChapterStage` has `tabIndex={-1}`. Focus is shifted programmatically with `preventScroll: true` upon transition completion.
- **Escape Key**: Modal viewers (such as Letter zoom reader) dismiss cleanly upon `Escape` key press.
- **Prefers Reduced Motion**: When `prefers-reduced-motion: reduce` is active, blur/scale animations are bypassed in favor of instant transition, preserving all functionality.
