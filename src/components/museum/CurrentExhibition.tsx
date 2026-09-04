import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/shared/Reveal";

const HERO_IMG =
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/museum_beyond_boundaries_9573f9e3.png";

const THUMBS = [
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/museum_silent_harmony_bb678263.png",
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/museum_future_origins_47e99c77.png",
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/museum_neural_spaces_78b1a9e6.png",
];

/**
 * Delays here are in PROGRESS units (0–1), not ms. The Reveal component
 * samples each element's own scroll position and feeds that into the
 * opacity / transform / blur, so values like 0.1 mean "this element
 * finishes 10% of progress later than the baseline".
 */
const CurrentExhibition = () => {
  return (
    <section
      id="exhibitions"
      className="relative isolate overflow-hidden bg-background pt-40 pb-32 md:pt-48 md:pb-40"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          {/* Left meta */}
          <div className="col-span-12 md:col-span-3">
            <Reveal variant="mask" delay={0.05}>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-accent" />
                <span className="eyebrow">Current Exhibition</span>
              </div>
            </Reveal>

            <Reveal variant="blur" delay={0.12}>
              <h2 className="mt-8 font-display text-5xl leading-[0.95] text-bone md:text-6xl">
                Beyond
                <br />
                <span className="italic text-bone/80">Boundaries</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={0.2}>
              <p className="mt-4 font-display text-2xl text-bone/70">
                超越边界
              </p>
            </Reveal>

            <Reveal variant="up" delay={0.28}>
              <p className="mt-10 max-w-xs text-sm leading-relaxed text-muted-foreground">
                An exploration of AI-generated worlds, where imagination
                becomes architecture and data becomes space.
              </p>
            </Reveal>

            <Reveal variant="up" delay={0.36}>
              <a
                href="#halls"
                className="mt-10 inline-flex items-center gap-3 text-bone"
              >
                <span className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-accent">
                  View Full Collection
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-accent" />
              </a>
            </Reveal>
          </div>

          {/* Featured visual */}
          <div className="col-span-12 md:col-span-7">
            <Reveal variant="scale" delay={0.04}>
              <div className="group relative aspect-[16/9] overflow-hidden rounded-sm border border-border">
                <img
                  src={HERO_IMG}
                  alt="Beyond Boundaries exhibition"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-bone">
                  <div>
                    <div className="font-mono-display text-[10px] tracking-[0.32em] text-bone/60">
                      EXH — 01 / ONGOING
                    </div>
                    <div className="mt-1 font-display text-2xl">
                      The intersection of creativity, AI &amp; digital
                      storytelling
                    </div>
                  </div>
                  <button className="hidden h-12 w-12 items-center justify-center rounded-full border border-bone/40 backdrop-blur transition hover:border-accent hover:text-accent md:flex">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Thumbnails — cascading rise */}
          <Reveal
            as="div"
            variant="rise"
            delay={0.15}
            stagger={0.08}
            className="col-span-12 flex flex-col gap-3 md:col-span-2"
          >
            {THUMBS.map((src, i) => (
              <div
                key={src}
                className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-border"
              >
                <img
                  src={src}
                  alt={`Exhibition still ${i + 1}`}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/30 transition-opacity group-hover:opacity-0" />
                <div className="absolute bottom-2 left-2 font-mono-display text-[9px] tracking-[0.3em] text-bone/80">
                  0{i + 2}
                </div>
              </div>
            ))}
            <button className="mt-2 self-end font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent">
              View All →
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default CurrentExhibition;
