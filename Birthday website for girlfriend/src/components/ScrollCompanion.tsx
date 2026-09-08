import { motion, useScroll, useSpring, useTransform } from "framer-motion";

// A little pig on a heart balloon that drifts down the right side as you
// scroll — the journey's companion, tying every chapter together.
export default function ScrollCompanion() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });

  const top = useTransform(progress, [0, 1], ["10vh", "82vh"]);
  const sway = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [0, 22, -14, 18, 0]);
  const tilt = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [-6, 6, -5, 6, -4]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed right-5 z-40 hidden sm:block"
      style={{ top, x: sway }}
    >
      <motion.div style={{ rotate: tilt }} className="flex flex-col items-center">
        {/* balloon */}
        <div
          className="relative h-10 w-9 rounded-[50%] shadow-lg"
          style={{ background: "radial-gradient(circle at 35% 30%, #f2a9bd, #b34a63)" }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-sm">♥</span>
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#b34a63]" />
        </div>
        {/* string */}
        <div className="h-6 w-px bg-cream-dim/40" />
        {/* pig, bobbing gently */}
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="-mt-1 text-3xl drop-shadow-[0_0_10px_rgba(225,138,160,0.6)]"
        >
          🐷
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
