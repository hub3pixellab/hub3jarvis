import { useTranslation } from "react-i18next";
import { ArrowRight, ScrollText } from "lucide-react";
import type { ZodiacSignKey } from "@/domain/models";
import { ZODIAC_CARD_IMAGES, ZODIAC_RANGES } from "@/lib/zodiacCards";
import { getDailyHoroscope } from "@/lib/horoscope";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SignHoroscopeDialogProps {
  sign: ZodiacSignKey | null;
  onClose: () => void;
  plansHref?: string;
}

/**
 * Pop-up do horóscopo do dia de um signo ocidental: arte, leitura do dia,
 * números da sorte, a história do símbolo/constelação e o CTA para os planos.
 */
const SignHoroscopeDialog = ({
  sign,
  onClose,
  plansHref = "#pagamento",
}: SignHoroscopeDialogProps) => {
  const { t } = useTranslation();
  const horoscope = sign ? getDailyHoroscope(sign) : null;

  return (
    <Dialog open={sign !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        {sign && horoscope && (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            {/* Arte do signo */}
            <div className="relative hidden md:block">
              <img
                src={ZODIAC_CARD_IMAGES[sign]}
                alt={t(`zodiac.${sign}`)}
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
                  {t(`zodiac.${sign}`)}
                </DialogTitle>
                <p className="mt-1 font-jost text-[11px] uppercase tracking-[0.3em] text-cream/50">
                  {ZODIAC_RANGES[sign]}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-gold/15 pt-5">
                <p className="font-jost text-sm leading-relaxed tracking-wide text-cream/85">
                  {t(horoscope.essenceKey)}
                </p>

                {/* Seções: panorama, amor, carreira, conselho */}
                <div className="mt-2 flex flex-col gap-4">
                  <Section label={t("horoscope.section.overview")} text={t(horoscope.overviewKey)} />
                  <Section label={t("horoscope.section.love")} text={t(horoscope.loveKey)} />
                  <Section label={t("horoscope.section.career")} text={t(horoscope.careerKey)} />
                  <Section label={t("horoscope.section.advice")} text={t(horoscope.adviceKey)} />
                </div>
              </div>

              {/* História do símbolo e da constelação */}
              <div className="flex flex-col gap-2 border-t border-gold/15 pt-5">
                <span className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
                  <ScrollText className="h-3.5 w-3.5 text-gold/80" strokeWidth={1.5} />
                  {t("signDialog.storyLabel")}
                </span>
                <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/65">
                  {t(`zodiacStory.${sign}`)}
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
                  onClick={onClose}
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
  );
};

export default SignHoroscopeDialog;

/** Bloco com título dourado + texto da seção. */
function Section({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-gold/80">
        {label}
      </span>
      <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/75">
        {text}
      </p>
    </div>
  );
}
