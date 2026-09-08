import { ArrowRight, MessagesSquare } from "lucide-react";

const MASCOT_IMG =
  "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/0083b577.jpeg";

const STEPS = [
  {
    n: "01",
    title: "Compartilhe seus dados",
    desc: "Envie nome completo, data, hora e local de nascimento pelo formulário seguro.",
  },
  {
    n: "02",
    title: "Receba seu mapa",
    desc: "Carta astral e numerologia calculadas com precisão e interpretadas por mim.",
  },
  {
    n: "03",
    title: "Consulte o Mestre",
    desc: "Tire suas dúvidas no terminal de chat, no momento em que precisar.",
  },
  {
    n: "04",
    title: "Siga orientado",
    desc: "Orientações práticas para cada fase, ciclo e decisão importante da sua vida.",
  },
];

const Analysis = () => {
  return (
    <section
      id="analise"
      className="relative overflow-hidden bg-navy-deep py-24 md:py-32"
    >
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-royal/20 blur-[140px]" />
        <div className="starfield absolute inset-0 opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
            Fazer Análise
          </span>
        </div>
        <h2 className="mt-6 max-w-2xl font-cinzel text-4xl leading-tight text-cream md:text-5xl">
          Sua análise em
          <br />
          <span className="italic text-gold-gradient">quatro passos.</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Sticky mascot */}
          <div className="min-w-0 md:col-span-5">
            <div className="md:sticky md:top-24">
              <div className="relative overflow-hidden rounded-sm border border-gold/25">
                <img
                  src={MASCOT_IMG}
                  alt="Mascote Mestre Agnes"
                  crossOrigin="anonymous"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
                      O Guardião do Terminal
                    </div>
                    <div className="mt-1 font-cinzel text-xl text-cream">
                      Pronto para te atender
                    </div>
                  </div>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-gold/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="min-w-0 md:col-span-7 md:pl-6">
            <ol>
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="group relative border-t border-gold/15 py-10 transition-colors first:border-t-0"
                >
                  <span className="absolute left-0 top-10 h-[2px] w-14 origin-left bg-gold/0 transition-all duration-700 group-hover:bg-gold group-hover:shadow-[0_0_12px_hsl(var(--gold)/0.6)]" />
                  <div className="flex items-start gap-8">
                    <span className="shrink-0 font-cinzel text-2xl text-gold/50 transition-colors group-hover:text-gold md:text-3xl">
                      {s.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-cinzel text-2xl text-cream md:text-3xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-md font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-gold/15 pt-8">
              <a
                href="#pagamento"
                className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 font-jost text-xs uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_30px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light hover:shadow-[0_0_44px_hsl(var(--gold)/0.55)]"
              >
                Fazer minha análise
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </a>
              <a
                href="#terminal"
                className="inline-flex items-center gap-3 rounded-full border border-gold/50 px-8 py-4 font-jost text-xs uppercase tracking-[0.3em] text-cream transition hover:border-gold hover:text-gold"
              >
                <MessagesSquare className="h-4 w-4" strokeWidth={1.5} />
                Abrir o Terminal
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analysis;
