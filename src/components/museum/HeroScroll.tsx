import { ArrowUpRight } from "lucide-react";

const VIDEO_SRC =
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/d8b785ac-83f2-41.mp4";

const HeroScroll = () => {
  return (
    <section
      id="home"
      className="relative h-screen min-h-[760px] w-full overflow-hidden bg-background"
    >
      {/* Background video */}
      <video
        src={VIDEO_SRC}
        poster="/template/cover.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Left wash + soft bottom fade so the next dark section blends in */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-background/80 via-background/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-64 bg-gradient-to-b from-transparent via-background/60 to-background" />

      {/* Content */}
      <div className="relative z-[5] mx-auto flex h-full max-w-[1600px] flex-col px-6 md:px-16">
        {/* Top right small label */}
        <div className="flex flex-1 items-start justify-end pt-28">
          <div className="text-right">
            <p className="font-mono-display text-[10px] uppercase tracking-[0.4em] text-bone/55 [text-shadow:0_1px_8px_hsl(0_0%_0%/0.7)]">
              Established
            </p>
            <p className="mt-1 font-mono-display text-[10px] uppercase tracking-[0.4em] text-bone/85 [text-shadow:0_1px_8px_hsl(0_0%_0%/0.7)]">
              MMXXVI
            </p>
          </div>
        </div>

        {/* Bottom-left main content */}
        <div className="pb-28 md:pb-32">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-bone/50" />
            <p className="font-mono-display text-[10px] uppercase tracking-[0.45em] text-bone/70 [text-shadow:0_1px_8px_hsl(0_0%_0%/0.7)]">
              A Museum of Inspiration
            </p>
          </div>

          <h1 className="mt-7 font-display font-light leading-[0.95] tracking-[-0.02em] text-bone [text-shadow:0_6px_40px_hsl(0_0%_0%/0.55)]">
            <span className="block text-6xl md:text-8xl lg:text-[8.5rem]">
              Digital
            </span>
            <span className="-mt-2 block text-6xl italic text-bone/85 md:text-8xl lg:text-[8.5rem]">
              Museum.
            </span>
          </h1>

          <a
            href="#exhibitions"
            className="group mt-12 inline-flex items-center gap-3 text-bone"
          >
            <span className="font-mono-display text-[11px] uppercase tracking-[0.4em] [text-shadow:0_1px_10px_hsl(0_0%_0%/0.7)]">
              Enter the Museum
            </span>
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.25}
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroScroll;
