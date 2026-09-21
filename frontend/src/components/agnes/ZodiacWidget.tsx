import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkle } from "lucide-react";
import { ZODIAC_SIGNS, CHINESE_ZODIAC_SIGNS } from "@/domain/models";
import type { ZodiacSignKey, ChineseZodiacSignKey } from "@/domain/models";
import { ZODIAC_CARD_IMAGES, ZODIAC_BACKGROUND_IMAGE, ZODIAC_RANGES } from "@/lib/zodiacCards";
import {
  CHINESE_ZODIAC_GLYPHS,
  getChineseZodiacYears,
} from "@/lib/chineseZodiacData";
import SignHoroscopeDialog from "@/components/agnes/SignHoroscopeDialog";
import ChineseZodiacDialog from "@/components/agnes/ChineseZodiacDialog";

interface ZodiacWidgetProps {
  /** Destino do CTA de consulta completa. Padrão: âncora dos planos. */
  plansHref?: string;
  /** Id do container — permite ancorar o widget em outras páginas. */
  id?: string;
}

/**
 * Widget de tráfego: grade com os 12 signos ocidentais e, abaixo, o zodíaco
 * chinês. Ao clicar, abre o pop-up do horóscopo do dia (e a história do
 * símbolo / a lenda do animal). Autocontido e reutilizável em qualquer página.
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
  const [animal, setAnimal] = useState<ChineseZodiacSignKey | null>(() => {
    if (typeof window === "undefined") return null;
    const param = new URLSearchParams(window.location.search).get("animal");
    return param && (CHINESE_ZODIAC_SIGNS as readonly string[]).includes(param)
      ? (param as ChineseZodiacSignKey)
      : null;
  });

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-navy-deep py-20 md:py-28"
    >
      {/* Background — mapa astral em anexo */}
      <img
        src={ZODIAC_BACKGROUND_IMAGE}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
      />
      {/* Escurece o fundo para os cards se destacarem */}
      <div className="pointer-events-none absolute inset-0 bg-navy-deep/60" />

      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-royal/20 blur-[140px]" />
        <div className="starfield absolute inset-0 opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* Header — signos ocidentais */}
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

        {/* Divider */}
        <div className="mt-20 flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
          <Sparkle className="h-3.5 w-3.5 shrink-0 text-gold/80" strokeWidth={1.5} />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Header — zodíaco chinês */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              {t("chineseWidget.eyebrow")}
            </span>
            <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
          </div>
          <h2 className="font-cinzel text-4xl leading-tight text-cream md:text-5xl">
            {t("chineseWidget.title1")}{" "}
            <span className="italic text-gold-gradient">
              {t("chineseWidget.title2")}
            </span>
          </h2>
          <p className="max-w-lg font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            {t("chineseWidget.subtitle")}
          </p>
        </div>

        {/* Grade dos 12 animais */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
          {CHINESE_ZODIAC_SIGNS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAnimal(a)}
              className="group flex flex-col items-center gap-3 rounded-md border border-gold/25 bg-navy/60 p-5 text-center transition duration-500 hover:border-gold/70 hover:shadow-[0_0_30px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-3xl text-gold-gradient transition group-hover:border-gold">
                {CHINESE_ZODIAC_GLYPHS[a]}
              </span>
              <span className="font-cinzel text-base text-cream md:text-lg">
                {t(`chineseZodiac.${a}`)}
              </span>
              <span className="font-jost text-[9px] uppercase tracking-[0.25em] text-gold/80">
                {getChineseZodiacYears(a, 2).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pop-ups */}
      <SignHoroscopeDialog
        sign={selected}
        onClose={() => setSelected(null)}
        plansHref={plansHref}
      />
      <ChineseZodiacDialog animal={animal} onClose={() => setAnimal(null)} />
    </section>
  );
};

export default ZodiacWidget;
