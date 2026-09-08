import { useEffect, useRef } from "react";
import gsap from "gsap";
import altFull from "@/assets/flowers/lily_static_alt_full_bloom.png";

export default function StaticFlower() {
  const flowerRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (flowerRef.current) {
        gsap.to(flowerRef.current, {
          rotation: 0.65,
          y: -2.5,
          x: -2,
          duration: 8.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, flowerRef);

    return () => ctx.revert();
  }, []);

  return (
    <img
      data-layer="flower-static"
      ref={flowerRef}
      src={altFull}
      alt="Hoa ly trắng nở bên cạnh"
      aria-hidden
      loading="eager"
      decoding="async"
      className="pointer-events-none absolute bottom-0 left-[24%] z-[1] w-[18vw] max-w-[220px] min-w-[130px] origin-bottom object-contain select-none"
      style={{
        transformOrigin: "center bottom",
        filter: "brightness(0.78) opacity(0.85) drop-shadow(0 20px 34px rgba(0,0,0,0.5))",
      }}
    />
  );
}
