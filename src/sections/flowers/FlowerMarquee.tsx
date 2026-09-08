import { BIRTHDAY_DATA } from "@/data/birthdayContent";

export default function FlowerMarquee() {
  const { flowers } = BIRTHDAY_DATA;

  return (
    <div
      data-layer="marquee"
      aria-hidden
      className="pointer-events-none absolute top-[26%] z-[1] w-full -translate-y-1/2 select-none overflow-hidden"
    >
      <div
        className="flex w-max whitespace-nowrap font-display text-[15vw] italic leading-none text-cream opacity-[0.08] sm:text-[10vw]"
        style={{ animation: "marquee 48s linear infinite" }}
      >
        <span>{flowers.marquee.repeat(4)}</span>
        <span>{flowers.marquee.repeat(4)}</span>
      </div>
    </div>
  );
}
