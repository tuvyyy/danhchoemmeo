import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroFlowersScrollTransition() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ctx: gsap.Context | null = null;

    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        const flowersStage = document.querySelector<HTMLElement>('[data-chapter-id="flowers"]');
        if (!flowersStage) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: flowersStage,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              document.documentElement.dataset.heroFlowersProgress = self.progress.toFixed(3);
            },
          },
        });

        // ── HERO TIMELINE (0.00 -> 1.00) ──
        // 0.00 -> 0.25: Hero typography moves up slightly, photo scales 1 -> 1.04
        tl.to(
          ".cinematic-hero__header, .cinematic-hero__content",
          {
            y: -25,
            ease: "none",
            duration: 0.25,
          },
          0,
        );

        tl.to(
          ".cinematic-hero__image-stage",
          {
            scale: 1.04,
            ease: "none",
            duration: 0.25,
          },
          0,
        );

        // 0.25 -> 0.55: Photo grows further to ~1.08-1.12, metadata moves away faster
        tl.to(
          ".cinematic-hero__image-stage",
          {
            scale: 1.10,
            y: -20,
            ease: "none",
            duration: 0.30,
          },
          0.25,
        );

        tl.to(
          ".cinematic-hero__header",
          {
            y: -80,
            opacity: 0.2,
            ease: "none",
            duration: 0.30,
          },
          0.25,
        );

        tl.to(
          ".cinematic-hero__content",
          {
            y: -65,
            opacity: 0.25,
            ease: "none",
            duration: 0.30,
          },
          0.25,
        );

        // 0.55 -> 0.85: Hero photo reaches ~1.12, Hero typography clears
        tl.to(
          ".cinematic-hero__image-stage",
          {
            scale: 1.12,
            y: -45,
            ease: "none",
            duration: 0.30,
          },
          0.55,
        );

        tl.to(
          ".cinematic-hero__header, .cinematic-hero__content",
          {
            y: -110,
            opacity: 0,
            ease: "none",
            duration: 0.25,
          },
          0.55,
        );

        // 0.85 -> 1.00: Hero leaves upper part of viewport
        tl.to(
          ".cinematic-hero__image-stage",
          {
            y: -70,
            opacity: 0,
            ease: "none",
            duration: 0.15,
          },
          0.85,
        );

        // ── FLOWERS TIMELINE (0.35 -> 1.00) ──
        // Flowers begins entering at 0.35 (visual overlap with Hero!)
        // Flowers background enters first (0.35 -> 0.75)
        tl.fromTo(
          ".nature-bloom__wash, .garden-video-stage",
          {
            yPercent: 10,
            opacity: 0.6,
          },
          {
            yPercent: 0,
            opacity: 1,
            ease: "none",
            duration: 0.40,
          },
          0.35,
        );

        // Flowers intro title (0.40 -> 0.80)
        tl.fromTo(
          ".nature-bloom__intro",
          {
            y: 70,
            opacity: 0.3,
          },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            duration: 0.40,
          },
          0.40,
        );

        // Botanical foreground enters slightly later (0.45 -> 0.90)
        tl.fromTo(
          ".nature-bloom__flower-cluster, .garden-reel",
          {
            y: 120,
            scale: 0.94,
            opacity: 0.4,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            duration: 0.45,
          },
          0.45,
        );

        // Flower message (0.50 -> 0.95)
        tl.fromTo(
          ".nature-bloom__message",
          {
            y: 55,
            opacity: 0.3,
          },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            duration: 0.45,
          },
          0.50,
        );

        // Flowers footer / button (0.55 -> 1.00)
        tl.fromTo(
          ".nature-bloom__footer",
          {
            y: 40,
            opacity: 0.3,
          },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            duration: 0.45,
          },
          0.55,
        );
      });

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx?.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      delete document.documentElement.dataset.heroFlowersProgress;
    };
  }, []);

  return null;
}
