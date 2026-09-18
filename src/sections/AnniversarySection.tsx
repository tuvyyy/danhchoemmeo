import { motion } from "framer-motion";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";

const DAY_MS = 86_400_000;

function daysSinceAnniversary() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const startUtc = Date.UTC(2025, 0, 11);
  return Math.max(0, Math.floor((todayUtc - startUtc) / DAY_MS));
}

export default function AnniversarySection({ onComplete }: { onComplete: () => void }) {
  const { anniversary } = BIRTHDAY_DATA;
  const daysTogether = daysSinceAnniversary();

  return (
    <section className="anniversary-scene relative flex min-h-screen min-h-[100svh] items-center overflow-hidden px-5 py-20 sm:px-10 lg:px-16">
      <div aria-hidden className="anniversary-scene__sun" />
      <div aria-hidden className="anniversary-scene__grain" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          className="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e4a077] sm:text-xs"
        >
          {anniversary.chapter}
        </motion.p>

        <div className="mt-7 grid items-end gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-body text-[clamp(3.8rem,9vw,7.8rem)] font-light leading-[0.78] tracking-[-0.08em] text-[#f5e7ce]">
              11.01
              <span className="ml-3 align-top font-body text-sm font-medium tracking-[0.16em] text-[#e4a077] sm:text-base">2025</span>
            </p>
            <h2 className="mt-8 max-w-2xl font-film text-3xl font-medium leading-[1.05] text-[#f5e7ce] sm:text-5xl lg:text-6xl">
              {anniversary.heading}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ delay: 0.18, duration: 0.75 }}
            className="anniversary-counter"
          >
            <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4b332d]/65">Tụi mình đã bên nhau</span>
            <div className="mt-2 flex items-end gap-3 text-[#37241f]">
              <motion.strong
                initial={{ opacity: 0, scale: 0.82 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, type: "spring", stiffness: 150 }}
                className="font-film text-7xl font-semibold leading-none sm:text-8xl"
              >
                {daysTogether}
              </motion.strong>
              <span className="pb-2 font-film text-2xl italic">ngày</span>
            </div>
            <p className="mt-4 font-body text-sm leading-7 text-[#4b332d]/80">{anniversary.body}</p>
          </motion.div>
        </div>

        <div className="anniversary-timeline relative mt-14 grid gap-7 md:grid-cols-3 md:gap-5">
          <motion.div
            aria-hidden
            className="anniversary-timeline__line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          />
          {anniversary.beats.map((beat, index) => (
            <motion.article
              key={beat.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.25 + index * 0.16, duration: 0.55 }}
              className="anniversary-beat relative"
            >
              <span className="anniversary-beat__dot">
                {index === 0 ? "🐈" : index === 1 ? "♡" : "🐈‍⬛"}
              </span>
              <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#df8a5d]">{beat.label}</p>
              <p className="mt-1 font-film text-2xl italic text-[#f5e7ce] sm:text-3xl">{beat.copy}</p>
            </motion.article>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ delay: 0.65, duration: 0.55 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onComplete}
          className="anniversary-cta mt-12 flex cursor-pointer items-center gap-4 px-6 py-3.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-[#f5e7ce]"
        >
          {anniversary.cta}<span className="text-lg">→</span>
        </motion.button>
      </div>
    </section>
  );
}
