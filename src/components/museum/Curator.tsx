const CURATOR_IMG =
  "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059067/museum_curator_5c41e012.png";

const Curator = () => {
  return (
    <section id="curator" className="relative border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="relative overflow-hidden rounded-sm border border-border">
              <div className="aspect-[4/5] w-full">
                <img
                  src={CURATOR_IMG}
                  alt="Jiaxuan in the museum"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover grayscale"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/30 to-transparent p-5">
                <div className="font-mono-display text-[10px] tracking-[0.32em] text-bone/70">
                  CURATOR — TOKYO / SHANGHAI
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 md:pl-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="eyebrow">The Curator</span>
            </div>

            <h2 className="mt-8 font-display text-7xl text-bone md:text-[10rem] md:leading-[0.9]">
              JIA<span className="italic text-bone/70">xuan</span>
            </h2>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-bone/80">
              A digital creator exploring the boundary between design, AI, and
              narrative systems.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Building immersive worlds where interfaces become experiences,
              and content becomes space. The museum is a slow, deliberate
              attempt to give a body to ideas that usually pass through us
              unnoticed.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {["Designer", "AI Creator", "Visual Storyteller"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.3em] text-bone"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* signature stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat label="Works" value="142" />
              <Stat label="Exhibitions" value="07" />
              <Stat label="Since" value="2019" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="font-display text-4xl text-bone md:text-5xl">{value}</div>
    <div className="mt-2 font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </div>
  </div>
);

export default Curator;
