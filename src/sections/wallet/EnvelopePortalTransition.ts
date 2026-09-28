/**
 * EnvelopePortalTransition
 * ─────────────────────────────────────────────────────────────────────────
 * Orchestrates the full cinematic "open envelope -> enter next chapter"
 * sequence using GSAP.
 *
 * Timeline (approx 2.4–3.0 s):
 *   0.00–0.20  seal compress
 *   0.18–0.85  flap opens (CSS 3D on the flap element)
 *   0.55–1.20  letter + cards rise from inside
 *   1.10–1.75  camera push (scale scene wrapper)
 *   1.55–2.20  paper mask expands from envelope center
 *   2.00–2.70  mask tints: ivory → warm grey → blue-grey → deep navy
 *   2.50–3.00  next chapter fades in; mask removed
 */
import gsap from "gsap";

const EASE_CINEMATIC = "power3.inOut";
const EASE_OPEN      = "cubic-bezier(.22,.75,.18,1)"; // custom — not a GSAP string, applied via CSS

/** Kick off the full portal sequence. Returns a cleanup fn. */
export function playEnvelopePortal(opts: {
  sealEl:      HTMLElement;
  flapEl:      HTMLElement;
  envelopeEl:  HTMLElement;   // the LoveLetter root div
  cardsEl:     HTMLElement;   // GiftCardRack root
  sceneEl:     HTMLElement;   // right-col inner scale wrapper
  ornamentsEl: HTMLElement;   // OrnamentFrame div
  sectionEl:   HTMLElement;   // full <section> wallet-scene
  advance:     () => void;    // ChapterFlowContext advance()
  reducedMotion: boolean;
}): () => void {
  const {
    sealEl, flapEl, envelopeEl, cardsEl, sceneEl,
    ornamentsEl, sectionEl, advance, reducedMotion,
  } = opts;

  if (reducedMotion) {
    advance();
    return () => {};
  }

  /* ── Paper mask element ── */
  const mask = document.createElement("div");
  mask.setAttribute("aria-hidden", "true");
  Object.assign(mask.style, {
    position:       "fixed",
    inset:          "0",
    zIndex:         "8888",
    pointerEvents:  "none",
    borderRadius:   "50%",
    background:     "#f2e8d8",
    transform:      "scale(0)",
    transformOrigin:"center center",
    opacity:        "1",
  });
  document.body.appendChild(mask);

  /* ── Position mask origin at envelope center on screen ── */
  const envRect = envelopeEl.getBoundingClientRect();
  const originX = ((envRect.left + envRect.width  / 2) / window.innerWidth  * 100).toFixed(1) + "%";
  const originY = ((envRect.top  + envRect.height * 0.45) / window.innerHeight * 100).toFixed(1) + "%";
  mask.style.transformOrigin = `${originX} ${originY}`;

  const tl = gsap.timeline();

  /* ── STEP 1: Seal compress 0.00–0.20s ── */
  tl.to(sealEl, {
    scale: 0.92,
    duration: 0.12,
    ease: "power2.in",
  })
  .to(sealEl, {
    scale: 1.05,
    duration: 0.10,
    ease: "power2.out",
  })
  .to(sealEl, {
    scale: 1,
    duration: 0.08,
    ease: "power2.inOut",
  });

  /* ── STEP 2: Flap opens 0.18–0.85s ── */
  /* Flap uses CSS perspective, we override its transform directly via GSAP */
  tl.to(flapEl, {
    rotateX: -170,
    duration: 0.70,
    ease: EASE_CINEMATIC,
  }, "0.18");

  /* ── STEP 3: Cards / letter rise 0.55–1.20s ── */
  const cards = cardsEl.querySelectorAll<HTMLElement>(".gift-card-item");
  if (cards.length) {
    cards.forEach((card, i) => {
      tl.fromTo(card,
        { y: 60, scale: 0.96, opacity: 0.3 },
        { y: 0,  scale: 1,    opacity: 1, duration: 0.55, ease: "power2.out" },
        0.55 + i * 0.07,
      );
    });
  }

  /* ── STEP 4: Camera push on scene 1.10–1.75s ── */
  tl.to(sceneEl, {
    scale: 1.10,
    duration: 0.72,
    ease: EASE_CINEMATIC,
  }, "1.10");

  /* Ornaments fade during camera push */
  tl.to(ornamentsEl, {
    opacity: 0,
    duration: 0.45,
    ease: "power2.in",
  }, "1.10");

  /* BG darkens a bit */
  tl.to(sectionEl, {
    filter: "brightness(0.65)",
    duration: 0.60,
    ease: "power2.inOut",
  }, "1.15");

  /* ── STEP 5: Paper mask expands 1.55–2.20s ── */
  /* Scale to a value large enough to cover full screen as circle */
  const diagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
  const targetScale = (diagonal / (envelopeEl.offsetWidth * 0.5)) * 1.1;

  tl.to(mask, {
    scale: targetScale,
    duration: 0.80,
    ease: "power3.inOut",
  }, "1.55");

  /* ── STEP 6: Paper tints ivory → warm grey → blue-grey → navy 2.00–2.70s ── */
  tl.to(mask, { background: "#d8cfc0", duration: 0.18, ease: "none" }, "2.10");
  tl.to(mask, { background: "#8a909e", duration: 0.22, ease: "none" }, "2.28");
  tl.to(mask, { background: "#3a4460", duration: 0.22, ease: "none" }, "2.50");
  tl.to(mask, { background: "#0e1424", duration: 0.20, ease: "none" }, "2.72");

  /* ── STEP 7: Trigger advance() while mask is full-screen dark ── */
  tl.call(advance, [], "2.78");

  /* ── STEP 8: Mask fades out, next chapter visible 2.85–3.15s ── */
  tl.to(mask, {
    opacity: 0,
    duration: 0.45,
    ease: "power2.out",
    onComplete: () => {
      mask.remove();
      /* Restore section filter */
      gsap.set(sectionEl, { clearProps: "filter" });
      gsap.set(sceneEl,   { clearProps: "transform" });
    },
  }, "2.90");

  return () => {
    tl.kill();
    mask.remove();
    gsap.set([sectionEl, sceneEl, ornamentsEl], { clearProps: "all" });
  };
}
