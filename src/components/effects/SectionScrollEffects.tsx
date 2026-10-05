import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SectionScrollEffects() {
  useEffect(() => {
    let triggers: ScrollTrigger[] = [];

    const init = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter-content]")
      );

      // Set initial states for off-screen elements (all except first)
      elements.forEach((el, i) => {
        if (i > 0) {
          gsap.set(el, {
            scale: 1.03,
            opacity: 0.4,
            filter: "blur(3px)",
          });
        }
      });

      elements.forEach((el, i) => {
        if (i >= elements.length - 1) return;

        // A) EXIT effect: current element leaves viewport upward
        const exitTrigger = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
          onUpdate: (self) => {
            gsap.set(el, {
              scale: gsap.utils.interpolate(1, 0.96, self.progress),
              opacity: gsap.utils.interpolate(1, 0.55, self.progress),
              filter: `blur(${gsap.utils.interpolate(0, 4, self.progress)}px)`,
            });
          },
        });

        // B) ENTER effect: next element enters viewport
        const nextEl = elements[i + 1];
        const enterTrigger = ScrollTrigger.create({
          trigger: nextEl,
          start: "top bottom",
          end: "top top",
          scrub: 0.8,
          onUpdate: (self) => {
            gsap.set(nextEl, {
              scale: gsap.utils.interpolate(1.03, 1, self.progress),
              opacity: gsap.utils.interpolate(0.4, 1, self.progress),
              filter: `blur(${gsap.utils.interpolate(3, 0, self.progress)}px)`,
            });
          },
        });

        triggers.push(exitTrigger, enterTrigger);
      });
    };

    requestAnimationFrame(init);

    return () => {
      triggers.forEach((t) => t.kill());
      triggers = [];
    };
  }, []);

  return null;
}
