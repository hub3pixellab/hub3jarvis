import { Mail, Sparkle, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-background pt-20 pb-10">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        {/* Big statement */}
        <div className="border-b border-border pb-14">
          <p className="font-display text-5xl leading-[1.05] text-bone md:text-[5.5rem]">
            Digital Museum —
            <br />
            <span className="italic text-bone/60">
              Where ideas become space.
            </span>
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-8 pt-14">
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-center gap-3">
              <Sparkle className="h-5 w-5 text-bone" strokeWidth={1} />
              <div className="leading-tight">
                <div className="font-mono-display text-[12px] tracking-[0.28em] text-bone">
                  JIAXUAN
                </div>
                <div className="font-mono-display text-[9px] tracking-[0.32em] text-muted-foreground">
                  DIGITAL MUSEUM
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
              A curated space where ideas, visuals, and AI creations are
              preserved, explored, and experienced.
            </p>
          </div>

          <FooterCol
            title="Navigate"
            items={["Exhibitions", "Lab", "Archive", "About", "Contact"]}
          />
          <FooterCol
            title="Halls"
            items={[
              "Memory Fragments",
              "Future Origins",
              "Silent Harmony",
              "Neural Spaces",
            ]}
          />
          <FooterCol
            title="Index"
            items={["2024 Collection", "Concept Studies", "AI Experiments", "Visual Research"]}
          />
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <span className="font-mono-display text-[10px] uppercase tracking-[0.3em]">
              © 2026 Digital Museum
            </span>
            <span className="font-mono-display text-[10px] uppercase tracking-[0.3em]">
              All rights reserved
            </span>
          </div>

          <div className="flex items-center gap-5">
            {[
              { label: "Behance", icon: "Be" },
              { label: "Dribbble", icon: "Dr" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border font-mono-display text-[10px] uppercase tracking-[0.2em] text-bone transition hover:border-accent hover:text-accent"
              >
                {s.icon}
              </a>
            ))}
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-bone transition hover:border-accent hover:text-accent"
            >
              <Twitter className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-bone transition hover:border-accent hover:text-accent"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>

      {/* big watermark */}
      <div className="pointer-events-none mt-20 select-none overflow-hidden">
        <div className="font-display text-[18vw] leading-[0.85] tracking-tighter text-bone/[0.06]">
          DIGITAL MUSEUM
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div className="col-span-6 md:col-span-2 lg:col-span-2">
    <div className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {title}
    </div>
    <ul className="mt-5 space-y-2.5">
      {items.map((i) => (
        <li key={i}>
          <a
            href="#"
            className="text-sm text-bone/80 transition hover:text-accent"
          >
            {i}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
