import { ArrowRight, Circle } from "lucide-react";
import Reveal from "@/components/shared/Reveal";

const BG_VIDEO =
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/19ead89a-e039-45.mp4";

interface Entry {
  code: string;
  title: string;
  meta: string;
  year: string;
  live?: boolean;
}

const LAB: Entry[] = [
  { code: "L–001", title: "AI Generated Worlds", meta: "Spatial · Generative", year: "live", live: true },
  { code: "L–002", title: "Interactive Story Systems", meta: "Narrative · Code", year: "in lab", live: true },
  { code: "L–003", title: "Spatial UI Experiments", meta: "Interface · Motion", year: "draft" },
  { code: "L–004", title: "Narrative Interfaces", meta: "Text · Interaction", year: "live", live: true },
];

const ARC: Entry[] = [
  { code: "A–001", title: "2024 Collection", meta: "Visual · Editorial", year: "2024" },
  { code: "A–002", title: "Concept Studies", meta: "Sketch · Research", year: "2023" },
  { code: "A–003", title: "AI Experiments", meta: "Generative · Loop", year: "2023" },
  { code: "A–004", title: "Visual Research", meta: "Photography · Field", year: "2022" },
];

const YEAR_TICKS = ["2026", "2025", "2024", "2023", "2022"];

const LabArchive = () => {
  return (
    <section
      id="lab"
      className="relative isolate overflow-hidden bg-background py-28 md:py-36"
    >
      {/* Background video */}
      <video
        src={BG_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background/75" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_25%,hsl(var(--background))_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        {/* ───────── Header band ───────── */}
        <div className="flex items-end justify-between border-b border-border/60 pb-6">
          <Reveal variant="mask" delay={0}>
            <div className="flex items-center gap-4">
              <span className="font-mono-display text-[10px] uppercase tracking-[0.4em] text-accent">
                ⌗ Catalogue
              </span>
              <span className="font-mono-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                MMXXVI · No. 04
              </span>
            </div>
          </Reveal>
          <Reveal variant="up" delay={0.06}>
            <div className="hidden items-center gap-6 font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex">
              <span>I. Lab</span>
              <span className="h-px w-6 bg-border" />
              <span>II. Archive</span>
            </div>
          </Reveal>
        </div>

        {/* ───────── Spread ───────── */}
        <div className="relative mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_72px_1fr] lg:gap-0">
          <Page
            roman="I"
            title="The Lab"
            italic="where ideas are still warm"
            cn="实验室"
            desc="Experimental works in motion — half-finished, fully alive, allowed to break their own rules."
            entries={LAB}
            side="left"
            cta="Enter the Lab"
          />

          <YearAxis />

          <Page
            roman="II"
            title="The Archive"
            italic="where ideas are kept cold"
            cn="档案室"
            desc="A preserved record of past works, concept studies and explorations once let go."
            entries={ARC}
            side="right"
            cta="Explore Archive"
          />
        </div>

        {/* ───────── Footer band ───────── */}
        <div className="mt-20 flex items-center justify-between border-t border-border/60 pt-6 font-mono-display text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          <span>End of Catalogue · Volume IV</span>
          <span>{LAB.length + ARC.length} entries indexed</span>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
interface PageProps {
  roman: string;
  title: string;
  italic: string;
  cn: string;
  desc: string;
  entries: Entry[];
  side: "left" | "right";
  cta: string;
}

const Page = ({
  roman,
  title,
  italic,
  cn,
  desc,
  entries,
  side,
  cta,
}: PageProps) => {
  const isLeft = side === "left";
  const [first, ...rest] = title.split(" ");
  return (
    <article className={`relative ${isLeft ? "lg:pr-14" : "lg:pl-14"}`}>
      {/* Giant roman numeral watermark */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-10 select-none font-display text-[14rem] leading-none text-bone/[0.04] ${
          isLeft ? "right-0" : "left-0"
        }`}
      >
        {roman}
      </span>

      <Reveal variant="mask" delay={0.02}>
        <div className="flex items-center gap-3">
          <span className="font-mono-display text-[11px] text-accent">
            {roman}.
          </span>
          <span className="eyebrow">Chapter {roman}</span>
        </div>
      </Reveal>

      <Reveal variant="blur" delay={0.06}>
        <h3 className="mt-6 font-display text-6xl text-bone md:text-7xl">
          {first} <span className="italic text-bone/75">{rest.join(" ")}</span>
        </h3>
      </Reveal>

      <Reveal variant="up" delay={0.1}>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="font-display text-2xl text-bone/60">{cn}</span>
          <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            — {italic}
          </span>
        </div>
      </Reveal>

      <Reveal variant="up" delay={0.14}>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </Reveal>

      {/* Entries — single Reveal with stagger so the WHOLE list fires
         when the title region enters view, instead of waiting for each
         row to cross the trigger line on its own. */}
      <Reveal
        as="ul"
        variant="up"
        delay={0.18}
        stagger={0.05}
        className="mt-12 divide-y divide-border/60 border-y border-border/60"
      >
        {entries.map((e) => (
          <li key={e.code} className="group relative">
            <a
              href="#"
              className="grid grid-cols-[68px_1fr_auto] items-center gap-4 py-4 transition-colors duration-300 hover:bg-bone/[0.025]"
            >
              <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-accent">
                {e.code}
              </span>
              <span className="font-display text-lg text-bone transition-transform duration-500 group-hover:translate-x-2">
                {e.title}
                <span className="ml-3 hidden font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:inline-block">
                  / {e.meta}
                </span>
              </span>
              <span className="flex items-center gap-2 font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {e.live && (
                  <Circle
                    aria-hidden
                    className="h-1.5 w-1.5 animate-pulse fill-accent stroke-none text-accent"
                  />
                )}
                {e.year}
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
              />
            </a>
          </li>
        ))}
      </Reveal>

      <Reveal variant="up" delay={0.46}>
        <a
          href="#"
          className="mt-10 inline-flex items-center gap-3 text-accent"
        >
          <span className="font-mono-display text-[11px] uppercase tracking-[0.3em]">
            {cta}
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </Reveal>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/*  Year axis (center column) — redesigned for legibility              */
/* ------------------------------------------------------------------ */
const YearAxis = () => (
  <Reveal
    variant="scale"
    delay={0.15}
    className="relative hidden self-stretch lg:block"
  >
    {/* main vertical line, brighter than border tokens */}
    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-bone/30" />
    {/* soft inner glow */}
    <span className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,hsl(var(--accent)/0.18),transparent)]" />

    {/* Top + bottom caps */}
    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-3 rounded-full bg-background px-2 font-mono-display text-[10px] uppercase tracking-[0.32em] text-bone">
      NOW
    </span>
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-background px-2 font-mono-display text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
      THEN
    </span>

    {/* Year ticks */}
    <div className="absolute inset-y-12 left-1/2 flex w-px -translate-x-1/2 flex-col justify-between">
      {YEAR_TICKS.map((y, i) => {
        const onLeft = i % 2 === 0;
        return (
          <div key={y} className="relative h-0 w-full">
            {/* Tick mark */}
            <span
              className={`absolute top-0 h-px ${
                onLeft ? "right-1 w-4" : "left-1 w-4"
              } bg-bone/40`}
            />
            <span
              className={`absolute top-0 -translate-y-1/2 whitespace-nowrap font-mono-display text-[10px] tracking-[0.3em] text-bone/80 ${
                onLeft ? "right-7" : "left-7"
              }`}
            >
              {y}
            </span>
          </div>
        );
      })}
    </div>

    {/* "Present" pulsing marker near top */}
    <span className="absolute left-1/2 top-12 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <span className="absolute h-6 w-6 animate-pulse rounded-full bg-accent/20" />
      <span className="relative h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent))]" />
    </span>
  </Reveal>
);

export default LabArchive;
