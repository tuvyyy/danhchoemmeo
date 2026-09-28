import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

try {
  CustomEase.create("cinematicFlap", ".22,.75,.18,1");
} catch {
  // Ignore if already created
}

export interface TransitionElements {
  sectionEl: HTMLElement;
  sceneArtworkEl: HTMLElement;
  sealEl: HTMLElement;
  sealFaceEl: HTMLElement;
  flapEl: HTMLElement;
  letterEl: HTMLElement;
  ticketEls: HTMLElement[];
  ornamentsEl: HTMLElement | null;
  hintEl: HTMLElement | null;
  nextBtnEl: HTMLElement | null;
}

export function playCinematicEnvelopeTransition(
  elements: TransitionElements,
  onComplete: (options?: { instant?: boolean }) => void,
  reducedMotion: boolean
): () => void {
  const {
    sectionEl,
    sceneArtworkEl,
    sealEl,
    sealFaceEl,
    flapEl,
    letterEl,
    ticketEls,
    ornamentsEl,
    hintEl,
    nextBtnEl,
  } = elements;

  if (reducedMotion) {
    onComplete({ instant: true });
    return () => {};
  }

  // 1. Immediately hide mascot via body class
  document.body.classList.add("chapter02-transitioning");

  // 2. Create paper portal elements
  const portal = document.createElement("div");
  portal.className = "envelope-portal-transition";
  Object.assign(portal.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    pointerEvents: "none",
    overflow: "hidden",
  });

  // Calculate center of letter inside envelope on screen
  const letterRect = letterEl.getBoundingClientRect();
  const envRect = sceneArtworkEl.getBoundingClientRect();
  const cx = letterRect.width > 0 ? (letterRect.left + letterRect.width / 2) : (envRect.left + envRect.width * 0.35);
  const cy = letterRect.height > 0 ? (letterRect.top + letterRect.height * 0.42) : (envRect.top + envRect.height * 0.45);

  const initialRadius = 45;
  const circle = document.createElement("div");
  circle.className = "envelope-portal-circle";
  Object.assign(circle.style, {
    position: "absolute",
    left: `${cx}px`,
    top: `${cy}px`,
    width: `${initialRadius * 2}px`,
    height: `${initialRadius * 2}px`,
    borderRadius: "50%",
    backgroundColor: "#f5ede0",
    transform: "translate(-50%, -50%) scale(0)",
    transformOrigin: "center center",
    willChange: "transform, background-color",
  });

  // Paper texture overlay
  const texture = document.createElement("div");
  Object.assign(texture.style, {
    position: "absolute",
    inset: "0",
    borderRadius: "50%",
    opacity: "0.045",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
  });
  circle.appendChild(texture);

  // Subtle star field overlay for navy night phase
  const starField = document.createElement("div");
  starField.className = "envelope-portal-stars";
  Object.assign(starField.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    pointerEvents: "none",
    transition: "opacity 0.25s ease",
  });

  const starPositions = [
    [15, 18, 1.2], [28, 12, 0.9], [44, 22, 1.4], [58, 14, 1.0], [74, 20, 1.5], [88, 15, 0.8],
    [18, 42, 1.1], [34, 48, 1.5], [52, 38, 1.0], [68, 46, 1.3], [82, 40, 0.9], [92, 52, 1.2],
    [12, 68, 1.0], [24, 78, 1.4], [42, 72, 0.8], [56, 78, 1.3], [72, 70, 1.1], [86, 76, 1.5],
    [30, 88, 1.0], [48, 90, 1.2], [64, 88, 0.9], [80, 86, 1.4], [10, 32, 0.8], [94, 28, 1.1],
  ];

  starField.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">
      ${starPositions.map(([x, y, r], i) => `
        <circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="#f0e6cf" opacity="${0.55 + (i % 3) * 0.15}" />
      `).join("")}
    </svg>
  `;
  circle.appendChild(starField);
  portal.appendChild(circle);
  document.body.appendChild(portal);

  // Calculate target scale to cover viewport
  const distToCorners = Math.max(
    Math.hypot(cx, cy),
    Math.hypot(window.innerWidth - cx, cy),
    Math.hypot(cx, window.innerHeight - cy),
    Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
  );
  const targetScale = (distToCorners / initialRadius) * 1.2;

  const tl = gsap.timeline();

  // -------------------------------------------------------------
  // STEP 1 — Seal response (0.00s–0.20s)
  // Compress: scale 1 -> 0.94 -> 1.04, tiny warm highlight, detach
  // -------------------------------------------------------------
  tl.to(sealFaceEl, {
    scale: 0.94,
    filter: "brightness(1.15) drop-shadow(0 0 12px rgba(255,200,120,0.5))",
    duration: 0.10,
    ease: "power2.in",
  }, 0.00)
  .to(sealFaceEl, {
    scale: 1.04,
    filter: "brightness(1.05)",
    duration: 0.10,
    ease: "power2.out",
  }, 0.10);

  // Detach visually from flap
  tl.to(sealEl, {
    y: "+=28",
    opacity: 0.85,
    duration: 0.28,
    ease: "power2.out",
  }, 0.18);

  if (hintEl) {
    tl.to(hintEl, { opacity: 0, duration: 0.20, ease: "power1.out" }, 0.05);
  }
  if (nextBtnEl) {
    tl.to(nextBtnEl, { opacity: 0, duration: 0.20, ease: "power1.out" }, 0.05);
  }

  // -------------------------------------------------------------
  // STEP 2 — Flap opens with real perspective (0.18s–0.85s)
  // perspective: 1200px, transform-origin: center top, rotateX -165deg
  // Easing: cubic-bezier(.22,.75,.18,1)
  // -------------------------------------------------------------
  tl.fromTo(flapEl,
    { rotateX: 0 },
    {
      rotateX: -165,
      duration: 0.67,
      ease: "cinematicFlap",
    },
    0.18
  );

  // -------------------------------------------------------------
  // STEP 3 — Content reveal (0.55s–1.20s)
  // Letter rises first (0.55s), vouchers rise immediately after (60-90ms stagger)
  // translateY(40-80px upward), scale 0.97 -> 1
  // -------------------------------------------------------------
  tl.fromTo(letterEl,
    { y: 65, scale: 0.97 },
    { y: 0, scale: 1, duration: 0.60, ease: "power2.out" },
    0.55
  );

  ticketEls.forEach((ticket, i) => {
    tl.fromTo(ticket,
      { y: 70, scale: 0.97 },
      { y: 0, scale: 1, duration: 0.55, ease: "power2.out" },
      0.62 + i * 0.075
    );
  });

  // -------------------------------------------------------------
  // STEP 4 — Camera push-in (1.10s–1.75s)
  // scale 1 -> 1.10 on scene artwork wrapper
  // Outer burgundy background darkens slightly
  // Corner ornaments fade gradually (opacity -> 0)
  // -------------------------------------------------------------
  tl.to(sceneArtworkEl, {
    scale: 1.10,
    duration: 0.65,
    ease: "power2.inOut",
  }, 1.10);

  tl.to(sectionEl, {
    filter: "brightness(0.60)",
    duration: 0.65,
    ease: "power2.inOut",
  }, 1.10);

  if (ornamentsEl) {
    tl.to(ornamentsEl, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
    }, 1.10);
  }

  // -------------------------------------------------------------
  // STEP 5 — Paper portal transition (1.55s–2.20s)
  // Warm parchment ivory mask expands from envelope interior to full viewport
  // -------------------------------------------------------------
  tl.to(circle, {
    scale: targetScale,
    duration: 0.65,
    ease: "power3.inOut",
  }, 1.55);

  // -------------------------------------------------------------
  // STEP 6 — Cinematic color transition (2.00s–2.70s)
  // parchment ivory -> muted warm grey -> desaturated blue-grey -> deep navy night
  // Subtle stars shimmer in
  // -------------------------------------------------------------
  tl.to(circle, {
    backgroundColor: "#8f877e", // muted warm grey
    duration: 0.20,
    ease: "power1.inOut",
  }, 2.05);

  tl.to(circle, {
    backgroundColor: "#384358", // desaturated blue-grey
    duration: 0.22,
    ease: "power1.inOut",
  }, 2.25);

  tl.to(circle, {
    backgroundColor: "#0a101e", // deep navy night
    duration: 0.23,
    ease: "power1.inOut",
  }, 2.47);

  tl.to(starField, {
    opacity: 0.85,
    duration: 0.25,
    ease: "power2.out",
  }, 2.47);

  // -------------------------------------------------------------
  // STEP 7 — Final reveal (2.68s–3.10s)
  // While mask is fully dark navy with stars, advance to next chapter
  // Then fade out mask smoothly to reveal next chapter
  // -------------------------------------------------------------
  tl.call(() => {
    onComplete({ instant: true });
  }, undefined, 2.68);

  tl.to(portal, {
    opacity: 0,
    duration: 0.45,
    ease: "power2.out",
    onComplete: () => {
      portal.remove();
      document.body.classList.remove("chapter02-transitioning");
      gsap.set(sectionEl, { clearProps: "filter" });
      gsap.set(sceneArtworkEl, { clearProps: "transform" });
      gsap.set([sealEl, sealFaceEl, flapEl, letterEl, ...ticketEls], { clearProps: "all" });
      if (ornamentsEl) gsap.set(ornamentsEl, { clearProps: "all" });
    },
  }, 2.72);

  return () => {
    tl.kill();
    portal.remove();
    document.body.classList.remove("chapter02-transitioning");
    gsap.set(sectionEl, { clearProps: "filter" });
    gsap.set(sceneArtworkEl, { clearProps: "transform" });
    gsap.set([sealEl, sealFaceEl, flapEl, letterEl, ...ticketEls], { clearProps: "all" });
    if (ornamentsEl) gsap.set(ornamentsEl, { clearProps: "all" });
  };
}