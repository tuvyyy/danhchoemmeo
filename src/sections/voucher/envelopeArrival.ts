import gsap from "gsap";

/** The handoff and the envelope share one arrival; opening the seal remains separate. */
export function settleEnvelopeArrival(scene: HTMLElement) {
  gsap.set(scene.querySelectorAll(".envelope, .royal-corner"), { autoAlpha: 1, y: 0, scale: 1, filter: "none" });
  gsap.set(scene.querySelectorAll(".corner-line--h"), { scaleX: 1 });
  gsap.set(scene.querySelectorAll(".corner-line--v"), { scaleY: 1 });
  gsap.set(scene.querySelectorAll(".envelope-light"), { opacity: .6 });
  gsap.set(scene.querySelectorAll(".envelope-petals"), { opacity: 1 });
  scene.dataset.entered = "true";
}
