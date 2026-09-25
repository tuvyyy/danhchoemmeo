> Generated captures and result JSON files under `docs/screenshots/` are not retained in the working project. Run `node test-scene-journey.js` to regenerate them; the results described below refer to the original run.

# Mascot and chapter effects

The production React application remains at the repository root. The Figma
prototype archive is unchanged. No package dependency or lockfile changes are
needed for these effects.

## Art direction

| Chapter | Effect | Pig accessory |
| --- | --- | --- |
| hero | ThreeUI Ribbon Field + gentle photo tilt | pilot goggles and scarf |
| flowers | layered scroll depth on the existing garden | flower |
| wallet | floating closed wallet, gold opening light | red envelope |
| letter | warm paper lighting and existing folding interaction | sealed letter |
| moments | taped polaroids with alternating entry and pointer tilt | camera |
| anniversary | sunset breathing light, existing timeline/count reveal | heart |
| finale | ThreeUI Energy Orb, sparse stars, one wish pulse | party hat |

`CHAPTER_EFFECTS` and `MASCOT_SCENES` are keyed by `ChapterId`, including the
anniversary and finale separately. The existing chapter gates and interaction
state are retained on backscroll. Outer chapter transforms belong to GSAP;
new transforms operate on section children or the independent `translate`
property.

Active chapter detection compares the visible pixel height of unlocked stages,
so backscroll cannot select an outgoing intersection entry or miss a tall mobile
chapter. Reduced-motion chapter navigation scrolls immediately.

## Mascot

`PigMascot` is original SVG art. CSS animates the eyes, ears, arm and body.
Desktop pointer movement adjusts the gaze; touch devices use tap reactions.
The mascot is 88px wide on desktop and 56px below 768px. A corner-placement
pass avoids visible text and buttons, recalculating on scroll, resize, chapter
change and speech changes. Speech auto-dismisses after five seconds; mobile
opens speech only after a tap. Collapse state persists across chapters.

`SceneExperienceProvider` tracks open overlays by stable IDs. Both the letter
reader and voucher modal call `useSceneOverlay`; this hides the mascot until
all overlays have closed. Finale calls `celebrate` after blowing out the candle.

## WebGL lifecycle

`SceneBackground` keeps a CSS gradient present at all times. It imports the
renderer chunk 250ms after an eligible active section has mounted. Reduced
motion skips that import; import failure, unavailable WebGL, compilation errors
or context loss leave the gradient available.

`ThreeUIBackground` adapts only two upstream renderers and their exact shaders.
Provenance, pinned commit and license are beside the source. The production
build also includes `/third-party-notices.txt`.

Only an active chapter mounts its renderer. Intersection and page visibility
stop/resume its loop, with elapsed time paused while hidden. Desktop caps DPR
at 1.5 and draw rate at 45fps; mobile caps DPR at 1 and draw rate at 30fps. These
are upper limits, not a guaranteed device frame rate. The finale uses 24 CSS
stars on desktop and 12 on mobile. All listeners, observers, buffers, programs,
shaders and pending animation frames are cleaned up on unmount. No Three.js
runtime, full catalog, remote asset or iframe is required.

## Validation

Run `npm run typecheck`, `npm run build`, then start Vite on port 3333 and run
`node test-scene-journey.js`. The browser audit uses installed Chrome and covers
1440px, 390px, 360px, reduced motion and WebGL disabled. It checks chapter gates,
mascot messages/collapse/accessories, overlay hiding, tab pause/resume, chapter
renderer teardown, interactive state on backscroll, overflow and console errors.
Screenshots and the successful-run JSON report are stored in
`docs/screenshots/scene-journey/`.

Completed verification (2026-09-24): typecheck, production build and whitespace
checks passed. Chrome journeys passed at 1440px, 390px and 360px, plus reduced
motion and disabled WebGL. The final 1440px run used the production preview and
also verified pointer tilt, DPR caps during viewport changes, WebGL context-loss
fallback, rapid-click gating and keyboard focus inside both dialogs. Reduced
motion and disabled-WebGL runs recorded zero WebGL draws. The combined results
are in `docs/screenshots/scene-journey/results.json`; these are browser viewport
tests, not measurements on physical mobile devices.

To repeat one case against a production preview, set `SCENE_TEST_URL` to its
URL and run `node test-scene-journey.js 1440`. Other case arguments are `390`,
`360`, `reduced` and `no-webgl`.
