import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const FLOATING_IMG =
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/museum_floating_core_e6a792e4.png";

const STEPS = [
  {
    id: "01",
    title: "Spatial",
    sub: "Storytelling",
    cn: "空间叙事",
    desc: "Layered narratives unfold as you descend into the building.",
  },
  {
    id: "02",
    title: "Immersive",
    sub: "Transitions",
    cn: "沉浸过渡",
    desc: "Cinematic cuts between rooms, ideas and atmospheres.",
  },
  {
    id: "03",
    title: "Curated",
    sub: "Artifacts",
    cn: "策展精选",
    desc: "Each piece selected for resonance, not novelty.",
  },
  {
    id: "04",
    title: "Narrative",
    sub: "Exploration",
    cn: "叙事探索",
    desc: "Read it like a film, walk it like a place.",
  },
];

const Experience = () => {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = railRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const ratio = Math.min(
        1,
        Math.max(0, (vh * 0.6 - rect.top) / (rect.height - vh * 0.4))
      );
      const idx = Math.min(STEPS.length - 1, Math.floor(ratio * STEPS.length));
      setActive(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative bg-background pt-32 pb-32 md:pt-40 md:pb-40">
      {/* top fade in */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background to-transparent" />

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-12">
        {/* Manifesto marquee */}
        <div className="relative overflow-hidden border-y border-border py-6 md:py-8">
          <div className="flex animate-marquee whitespace-nowrap font-display text-5xl italic text-bone/15 md:text-7xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="px-8">
                — Walk Through Ideas —&nbsp;Walk Through Ideas&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Headline + sub */}
        <div className="mt-20 grid grid-cols-12 gap-8 md:gap-16">
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="eyebrow">The Experience</span>
            </div>
            <h2 className="mt-10 font-display text-5xl leading-[1.05] text-bone md:text-6xl">
              <span className="italic text-bone/55">This is not</span>
              <br />
              a website.
              <br />
              <span className="italic text-bone/55">It is a space</span>
              <br />
              to walk through.
            </h2>
          </div>

          {/* Right: stage with floating core + walk-through rail */}
          <div className="col-span-12 md:col-span-8">
            <div ref={railRef} className="relative grid grid-cols-12 gap-6">
              {/* Stage — floating core artifact */}
              <div className="col-span-12 md:sticky md:top-24 md:col-span-5 md:h-fit">
                <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-card">
                  <img
                    src={FLOATING_IMG}
                    alt="The Floating Core"
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                  />

                  {/* Concentric pulsing rings */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-[88%] w-[88%] rounded-full border border-bone/15" />
                    <span className="absolute h-[72%] w-[72%] rounded-full border border-bone/20 animate-pulse-glow" />
                    <span className="absolute h-[56%] w-[56%] rounded-full border border-accent/30" />
                  </div>

                  {/* Rotating frame */}
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full animate-[spin_60s_linear_infinite]"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <path
                        id="circle-path"
                        d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                      />
                    </defs>
                    <text className="fill-bone/40" style={{ fontSize: 3.2, letterSpacing: 1.2 }}>
                      <textPath href="#circle-path">
                        DIGITAL MUSEUM · FLOATING CORE · DIGITAL MUSEUM · FLOATING CORE ·
                      </textPath>
                    </text>
                  </svg>

                  {/* HUD corners */}
                  <Corner className="left-3 top-3" />
                  <Corner className="right-3 top-3 rotate-90" />
                  <Corner className="bottom-3 left-3 -rotate-90" />
                  <Corner className="bottom-3 right-3 rotate-180" />

                  {/* Footer label */}
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                    <div>
                      <div className="font-mono-display text-[10px] tracking-[0.32em] text-bone/60">
                        Featured Installation
                      </div>
                      <div className="mt-1 font-display text-xl text-bone">
                        The Floating Core
                      </div>
                    </div>
                    <div className="font-mono-display text-[10px] tracking-[0.32em] text-bone/60">
                      NO. 07
                    </div>
                  </div>
                </div>

                <a
                  href="#lab"
                  className="group mt-6 inline-flex items-center gap-3 text-bone"
                >
                  <span className="font-mono-display text-[11px] uppercase tracking-[0.35em]">
                    Interact with the Core
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.25}
                  />
                </a>
              </div>

              {/* Walk-through rail */}
              <ol className="col-span-12 md:col-span-7">
                {STEPS.map((s, i) => {
                  const isOn = i === active;
                  return (
                    <li
                      key={s.id}
                      className={`group relative border-t border-border py-8 transition-all duration-700 md:py-12 ${
                        isOn ? "opacity-100" : "opacity-50 hover:opacity-90"
                      }`}
                      style={{ minHeight: "44vh" }}
                    >
                      {/* Active vertical bar */}
                      <span
                        className={`absolute left-0 top-0 h-[2px] origin-left bg-accent transition-transform duration-700 ${
                          isOn ? "scale-x-100" : "scale-x-0"
                        }`}
                        style={{ width: "60px" }}
                      />

                      <div className="flex items-start gap-8">
                        <span className="font-mono-display text-[10px] tracking-[0.35em] text-bone/50">
                          {s.id}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-display text-4xl leading-[1.02] text-bone md:text-5xl">
                            {s.title}
                            <br />
                            <span className="italic text-bone/70">{s.sub}</span>
                          </h3>
                          <p className="mt-3 font-mono-display text-[10px] uppercase tracking-[0.35em] text-bone/45">
                            {s.cn}
                          </p>
                          <p
                            className={`mt-5 max-w-md text-sm leading-relaxed text-muted-foreground transition-all duration-700 ${
                              isOn
                                ? "max-h-32 opacity-100"
                                : "max-h-0 overflow-hidden opacity-0"
                            }`}
                          >
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

const Corner = ({ className = "" }: { className?: string }) => (
  <span
    className={`pointer-events-none absolute h-3 w-3 border-l border-t border-bone/60 ${className}`}
  />
);

export default Experience;
