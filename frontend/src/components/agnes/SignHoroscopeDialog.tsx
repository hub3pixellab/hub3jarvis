import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Link2, Loader2, Share2, Sparkle } from "lucide-react";
import type { ZodiacSignKey } from "@/domain/models";
import { ZODIAC_CARD_IMAGES, ZODIAC_RANGES } from "@/lib/zodiacCards";
import { useDailyHoroscope } from "@/hooks/useDailyHoroscope";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SignHoroscopeDialogProps {
  sign: ZodiacSignKey | null;
  onClose: () => void;
  plansHref?: string;
}

/**
 * Pop-up do horóscopo do dia no layout da referência: "Leitura do dia",
 * seções (Panorama, Amor, Carreira, Conselho), números da sorte, cor do dia,
 * compartilhamento e a assinatura do Mestre Agnes.
 * A leitura vem da mesma fonte dos cards (Mestre Agnes).
 */
const SignHoroscopeDialog = ({
  sign,
  onClose,
  plansHref = "#pagamento",
}: SignHoroscopeDialogProps) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDailyHoroscope(sign);
  const [copied, setCopied] = useState(false);

  const shareUrl = sign
    ? `${window.location.origin}/horoscopo?signo=${sign}`
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* clipboard indisponível */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    const text = t("zodiacWidget.shareText", {
      sign: sign ? t(`zodiac.${sign}`) : "",
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mestre Agnes", text, url: shareUrl });
      } else {
        await copy();
      }
    } catch {
      /* compartilhamento cancelado */
    }
  };

  return (
    <Dialog open={sign !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        {sign && (
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

              {isLoading ? (
                <div className="flex flex-col items-center gap-4 py-14 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-gold" strokeWidth={1.5} />
                  <p className="font-jost text-sm text-cream/60">
                    {t("zodiacWidget.readingLoading")}
                  </p>
                </div>
              ) : isError || !data ? (
                <p className="py-8 font-jost text-sm text-cream/60">
                  {t("signMatch.error")}
                </p>
              ) : (
                <>
                  {/* Essência do dia */}
                  {data.essence && (
                    <p className="font-jost text-sm leading-relaxed tracking-wide text-cream/85">
                      {data.essence}
                    </p>
                  )}

                  {/* Seções */}
                  <div className="flex flex-col gap-4 border-t border-gold/15 pt-5">
                    {data.panorama && (
                      <Section label={t("horoscope.section.overview")} text={data.panorama} />
                    )}
                    {data.love && (
                      <Section label={t("horoscope.section.love")} text={data.love} />
                    )}
                    {data.career && (
                      <Section label={t("horoscope.section.career")} text={data.career} />
                    )}
                    {data.advice && (
                      <Section label={t("horoscope.section.advice")} text={data.advice} />
                    )}
                  </div>

                  {/* Números da sorte e cor do dia */}
                  {(data.lucky_numbers.length > 0 || data.lucky_color) && (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gold/15 pt-5">
                      {data.lucky_numbers.length > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
                            {t("zodiacWidget.luckyLabel")}
                          </span>
                          {data.lucky_numbers.map((n, i) => (
                            <span
                              key={i}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-sm text-gold"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {data.lucky_color && (
                        <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
                          {t("zodiacWidget.colorLabel")}:{" "}
                          <span className="text-gold">{data.lucky_color}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Compartilhar */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-gold/15 pt-4">
                    <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/45">
                      {t("signMatch.shareLabel")}
                    </span>
                    <button
                      type="button"
                      onClick={() => void share()}
                      className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10"
                    >
                      <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t("signMatch.share")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void copy()}
                      className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                      {copied ? t("signMatch.copied") : t("signMatch.copyLink")}
                    </button>
                  </div>

                  {/* Assinatura */}
                  <div className="flex items-center gap-3 border-t border-gold/15 pt-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40">
                      <Sparkle className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-cinzel text-sm text-cream">
                        {t("zodiacWidget.byMaster")}
                      </p>
                      <p className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
                        {t("zodiacWidget.updatedBy")}
                      </p>
                    </div>
                  </div>

                  {/* CTA dos planos */}
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
                </>
              )}
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
