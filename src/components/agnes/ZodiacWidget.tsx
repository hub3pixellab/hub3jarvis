import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkle } from "lucide-react";
import { ZODIAC_SIGNS, type ZodiacSignKey } from "@/domain/models";
import { ZODIAC_CARD_IMAGES, ZODIAC_BACKGROUND_IMAGE } from "@/lib/zodiacCards";
import { getDailyHoroscope } from "@/lib/horoscope";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/** Intervalos de data de cada signo (rótulo curto, sem tradução). */
const ZODIAC_RANGES: Record<ZodiacSignKey, string> = {
  aries: "21.03 – 19.04",
  taurus: "20.04 – 20.05",
  gemini: "21.05 – 20.06",
  cancer: "21.06 – 22.07",
  leo: "23.07 – 22.08",
  virgo: "23.08 – 22.09",
  libra: "23.09 – 22.10",
  scorpio: "23.10 – 21.11",
  sagittarius: "22.11 – 21.12",
  capricorn: "22.12 – 19.01",
  aquarius: "20.01 – 18.02",
  pisces: "19.02 – 20.03",
};

interface ZodiacWidgetProps {
  /** Destino do CTA de consulta completa. Padrão: âncora dos planos. */
  plansHref?: string;
  /** Id do container — permite ancorar o widget em outras páginas. */
  id?: string;
}

/**
 * Widget de tráfego: grade com os 12 signos; ao clicar, abre um pop-up com o
 * horóscopo do dia e um CTA para a consulta completa (planos).
 * Autocontido e reutilizável em qualquer página.
 */
const ZodiacWidget = ({
  plansHref = "#pagamento",
  id = "horoscopo",
}: ZodiacWidgetProps) => {
  const { t } = useTranslation();
  // Permite link direto para um signo (ex.: /horoscopo?signo=aries), útil para
  // compartilhar e para campanhas de tráfego.
  const [selected, setSelected] = useState<ZodiacSignKey | null>(() => {
    if (typeof window === "undefined") return null;
    const param = new URLSearchParams(window.location.search).get("signo");
    return param && (ZODIAC_SIGNS as readonly string[]).includes(param)
      ? (param as ZodiacSignKey)
      : null;
  });

  const horoscope = selected ? getDailyHoroscope(selected) : null;

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-navy-deep py-20 md:py-28"
    >
      {/* Background — mapa astral em anexo */}
      <img
        src={ZODIAC_BACKGROUND_IMAGE}
        alt=""
        crossOrigin="anonymous"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />

      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-royal/20 blur-[140px]" />
        <div className="starfield absolute inset-0 opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              {t("zodiacWidget.eyebrow")}
            </span>
            <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
          </div>
          <h2 className="font-cinzel text-4xl leading-tight text-cream md:text-5xl">
            {t("zodiacWidget.title1")}{" "}
            <span className="italic text-gold-gradient">
              {t("zodiacWidget.title2")}
            </span>
          </h2>
          <p className="max-w-lg font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            {t("zodiacWidget.subtitle")}
          </p>
        </div>

        {/* Grade dos 12 signos */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign}
              type="button"
              onClick={() => setSelected(sign)}
              className="group relative overflow-hidden rounded-md border border-gold/25 bg-navy/60 text-left transition duration-500 hover:border-gold/70 hover:shadow-[0_0_30px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <img
                src={ZODIAC_CARD_IMAGES[sign]}
                alt={t(`zodiac.${sign}`)}
                crossOrigin="anonymous"
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent p-3">
                <p className="font-cinzel text-base text-cream md:text-lg">
                  {t(`zodiac.${sign}`)}
                </p>
                <p className="font-jost text-[9px] uppercase tracking-[0.25em] text-gold/80">
                  {ZODIAC_RANGES[sign]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pop-up do horóscopo do dia */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
          {selected && horoscope && (
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
              {/* Arte do signo */}
              <div className="relative hidden md:block">
                <img
                  src={ZODIAC_CARD_IMAGES[selected]}
                  alt={t(`zodiac.${selected}`)}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy/70" />
              </div>

              {/* Conteúdo */}
              <div className="flex flex-col gap-5 p-6 md:p-8">
                <div>
                  <p className="font-jost text-[10px] uppercase tracking-[0.4em] text-gold/80">
                    {t("zodiacWidget.dailyLabel")}
                  </p>
                  <DialogTitle className="mt-2 font-cinzel text-3xl text-cream">
                    {t(`zodiac.${selected}`)}
                  </DialogTitle>
                  <p className="mt-1 font-jost text-[11px] uppercase tracking-[0.3em] text-cream/50">
                    {ZODIAC_RANGES[selected]}
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-gold/15 pt-5">
                  <p className="font-jost text-sm leading-relaxed tracking-wide text-cream/85">
                    {t(horoscope.essenceKey)}
                  </p>
                  <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
                    {t(horoscope.toneKey)}
                  </p>
                  <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
                    {t(horoscope.adviceKey)}
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-gold/15 pt-5">
                  <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
                    {t("zodiacWidget.luckyLabel")}
                  </span>
                  {horoscope.luckyNumbers.map((n, i) => (
                    <span
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-sm text-gold"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-gold/15 pt-5">
                  <p className="font-jost text-xs leading-relaxed tracking-wide text-cream/55">
                    {t("zodiacWidget.ctaHint")}
                  </p>
                  <a
                    href={plansHref}
                    onClick={() => setSelected(null)}
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-7 py-3.5 font-jost text-[11px] uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_30px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light hover:shadow-[0_0_44px_hsl(var(--gold)/0.55)]"
                  >
                    {t("zodiacWidget.cta")}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ZodiacWidget;
