import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkle } from "lucide-react";

const HERO_IMG =
  "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/c21a7765.png";

const PRACTICES = [
  "hero.practice1",
  "hero.practice2",
  "hero.practice3",
  "hero.practice4",
];

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-end overflow-hidden bg-navy"
    >
      {/* Background — hero do Mestre */}
      <img
        src={HERO_IMG}
        alt={t("hero.imgAlt")}
        crossOrigin="anonymous"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlays — leitura à esquerda, vinheta nas bordas */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/15 to-navy/60" />
      <div className="pointer-events-none absolute inset-0 starfield opacity-20" />

      {/* Side rails */}
      <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-gold/15 md:block" />
      <div className="pointer-events-none absolute right-6 top-0 hidden h-full w-px bg-gold/15 md:block" />

      {/* Right vertical label */}
      <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 rotate-90 origin-right md:block">
        <span className="font-jost text-[10px] tracking-[0.5em] text-gold/60">
          {t("hero.verticalLabel")}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-40 md:px-10 md:pb-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.45em] text-gold/90">
              {t("footer.guide")} • {t("footer.destiny")}
            </span>
          </div>

          <h1 className="mt-8 font-cinzel text-[15vw] leading-[0.92] text-cream md:text-[9rem]">
            Mestre
            <br />
            <span className="text-gold-gradient drop-shadow-[0_0_30px_hsl(var(--gold)/0.35)]">
              Agnes
            </span>
          </h1>

          <p className="mt-6 max-w-lg font-jost text-base font-light leading-relaxed tracking-wide text-cream/75 md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href="#analise"
              className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 font-jost text-xs uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_30px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light hover:shadow-[0_0_44px_hsl(var(--gold)/0.55)]"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>
            <a
              href="#sobre"
              className="inline-flex items-center gap-3 rounded-full border border-gold/50 px-8 py-4 font-jost text-xs uppercase tracking-[0.3em] text-cream transition hover:border-gold hover:text-gold hover:shadow-[0_0_24px_hsl(var(--gold)/0.25)]"
            >
              {t("hero.ctaSecondary")}
            </a>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-gold/15 pt-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {PRACTICES.map((p, i) => (
              <span key={p} className="flex items-center gap-5">
                <span className="font-jost text-[10px] uppercase tracking-[0.4em] text-cream/60">
                  {t(p)}
                </span>
                {i < PRACTICES.length - 1 && (
                  <Sparkle className="h-2.5 w-2.5 text-gold/70" strokeWidth={1.5} />
                )}
              </span>
            ))}
          </div>
          <span className="font-jost text-[10px] uppercase tracking-[0.4em] text-cream/50">
            {t("hero.consultsNote")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
