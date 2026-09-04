import { ArrowRight, Play } from "lucide-react";

const HERO_IMG =
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/5afdcc8c-c2dc-41.png";

const Hero = () => {
  return (
    <section id="home" className="relative h-screen min-h-[820px] w-full overflow-hidden">
      {/* Background image */}
      <img
        src={HERO_IMG}
        alt="Digital Museum suspended core under cathedral light"
        crossOrigin="anonymous"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-background/40" />
      <div className="absolute inset-0 vignette" />

      {/* Side rails */}
      <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-border md:block" />
      <div className="pointer-events-none absolute right-6 top-0 hidden h-full w-px bg-border md:block" />

      {/* Right vertical timecode */}
      <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 rotate-90 origin-right md:block">
        <span className="font-mono-display text-[10px] tracking-[0.5em] text-muted-foreground">
          01 / 09 — EST. 2026 — N 35.6762° E 139.6503°
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-6 pt-32 pb-16 md:px-12 md:pt-40 md:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-bone/60" />
            <span className="eyebrow text-bone/70">Welcome to</span>
          </div>

          <h1 className="font-display text-[14vw] leading-[0.88] text-bone md:text-[9rem]">
            DIGITAL
            <br />
            <span className="pl-[6vw] italic text-bone/80 md:pl-32">Museum</span>
          </h1>

          <p className="mt-8 max-w-md font-display text-2xl text-bone/85 md:text-3xl">
            数字时代的灵感博物馆
          </p>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            A Museum of Inspiration in the Digital Age — a curated space where
            ideas, visuals, and AI creations are preserved, explored and
            experienced.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <a
              href="#exhibitions"
              className="group inline-flex items-center gap-4 rounded-full border border-bone/40 bg-background/30 px-7 py-3.5 backdrop-blur transition hover:border-accent hover:bg-accent/10"
            >
              <span className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-bone">
                Enter the Museum
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground transition group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>

            <button className="group inline-flex items-center gap-3 text-bone">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/40 transition group-hover:border-bone">
                <Play className="h-3.5 w-3.5 fill-bone text-bone" />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-mono-display text-[10px] uppercase tracking-[0.3em]">
                  Watch Trailer
                </span>
                <span className="font-mono-display text-[10px] text-muted-foreground">
                  02:35
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-mono-display text-[10px] tracking-[0.32em] text-muted-foreground">
              CHAPTER 01 / FLOATING CORE
            </span>
            <span className="font-mono-display text-[10px] tracking-[0.32em] text-muted-foreground">
              SCROLL TO ENTER
            </span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex flex-col items-end">
              <span className="font-mono-display text-[10px] tracking-[0.32em] text-muted-foreground">
                CURATED BY
              </span>
              <span className="font-mono-display text-[11px] tracking-[0.32em] text-bone">
                XIAOYANG
              </span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col items-end">
              <span className="font-mono-display text-[10px] tracking-[0.32em] text-muted-foreground">
                YEAR
              </span>
              <span className="font-mono-display text-[11px] tracking-[0.32em] text-bone">
                MMXXVI
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
