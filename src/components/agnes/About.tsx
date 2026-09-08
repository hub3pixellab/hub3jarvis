const PORTRAIT_IMG =
  "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/72cab091.png";

const SEAL_IMG =
  "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/b2238850.jpeg";

const TAGS = ["Astrólogo", "Numerólogo", "Conselheiro"];

const STATS = [
  { value: "15+", label: "Anos de estudo" },
  { value: "4.200+", label: "Consultas realizadas" },
  { value: "3", label: "Tradições sagradas" },
];

const About = () => {
  return (
    <section
      id="sobre"
      className="relative overflow-hidden bg-navy py-24 md:py-32"
    >
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-15" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-12 md:gap-12 md:px-10">
        {/* Portrait */}
        <div className="min-w-0 md:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 rounded-sm border border-gold/20" />
            <div className="relative overflow-hidden rounded-sm border border-gold/30 bg-card">
              <img
                src={PORTRAIT_IMG}
                alt="Retrato do Mestre Agnes"
                crossOrigin="anonymous"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/40 to-transparent p-5">
                <div className="font-jost text-[9px] uppercase tracking-[0.32em] text-gold">
                  Mestre Agnes
                </div>
                <div className="mt-1 font-jost text-[9px] uppercase tracking-[0.32em] text-gold/70">
                  Astrólogo &amp; Numerólogo
                </div>
              </div>
            </div>

            {/* Floating seal */}
            <div className="absolute -bottom-8 -right-4 hidden h-28 w-28 items-center justify-center rounded-full border border-gold/40 bg-navy/90 p-1.5 shadow-[0_0_30px_hsl(var(--gold)/0.25)] backdrop-blur md:flex">
              <img
                src={SEAL_IMG}
                alt="Selo Mestre Agnes"
                crossOrigin="anonymous"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="min-w-0 md:col-span-7 md:pl-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              O Mestre
            </span>
          </div>

          <h2 className="mt-8 font-cinzel text-6xl leading-[0.9] text-cream md:text-[8rem]">
            Agnes
          </h2>

          <p className="mt-8 max-w-xl font-jost text-base leading-relaxed tracking-wide text-cream/85">
            Sou o Agnes, seu consultor em astrologia e numerologia cabalística.
            Há mais de quinze anos estudo os céus, os números e a alma humana
            para ajudar você a ler a própria jornada com clareza.
          </p>
          <p className="mt-4 max-w-xl font-jost text-sm font-light leading-relaxed tracking-wide text-cream/65">
            Cada consulta é uma conversa íntima: nada de horóscopos genéricos.
            Eu mergulho no seu mapa, ouço as suas perguntas e devolvo uma
            orientação prática, feita para a sua vida — e para o momento que
            você vive agora.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-gold/30 bg-royal/30 px-4 py-1.5 font-jost text-[10px] uppercase tracking-[0.3em] text-gold"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-gold/15 pt-8">
            {STATS.map((s) => (
              <div key={s.label} className="min-w-0">
                <div className="font-cinzel text-2xl text-gold-gradient md:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2 font-jost text-[10px] uppercase tracking-[0.3em] text-cream/55">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
