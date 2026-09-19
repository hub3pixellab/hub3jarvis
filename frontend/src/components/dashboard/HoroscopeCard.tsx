import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarDays, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { getZodiacSign } from "@/lib/zodiac";
import { getDailyHoroscope } from "@/lib/horoscope";
import { ZODIAC_CARD_IMAGES } from "@/lib/zodiacCards";

/** Intervalos de data de cada signo (rótulo curto, sem tradução). */
const ZODIAC_RANGES: Record<string, string> = {
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

/**
 * Card "Horóscopo do dia" da área do membro.
 * - Com data de nascimento no perfil: mostra o horóscopo do signo do usuário
 *   (mesma lógica do widget de tráfego) + números da sorte + CTA para os planos.
 * - Sem data de nascimento: convida a preencher o perfil.
 */
export function HoroscopeCard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

  if (isLoading || !user) {
    return (
      <Card className="border-gold/20 bg-card">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-2/3 bg-gold/10" />
          <Skeleton className="mt-3 h-4 w-1/2 bg-gold/10" />
          <Skeleton className="mt-6 h-20 bg-gold/10" />
        </CardContent>
      </Card>
    );
  }

  const birthDate = profile?.birth_date ?? null;
  const sign = birthDate ? getZodiacSign(birthDate) : null;
  const horoscope = sign ? getDailyHoroscope(sign) : null;

  // Sem data de nascimento ainda — convite para preencher o perfil.
  if (!birthDate || !sign || !horoscope) {
    return (
      <Card className="border-gold/20 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
            <Sparkle className="h-4 w-4 text-gold" strokeWidth={1.5} />
            {t("horoscopeCard.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="max-w-md font-jost text-sm font-light leading-relaxed tracking-wide text-cream/65">
            {t("horoscopeCard.noBirthDate")}
          </p>
          <Link
            to="/dashboard/perfil"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
          >
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("horoscopeCard.addBirthDate")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-gold/20 bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
        {/* Arte do signo */}
        <div className="relative">
          <img
            src={ZODIAC_CARD_IMAGES[sign]}
            alt={t(`zodiac.${sign}`)}
            className="h-44 w-full object-cover object-top sm:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent sm:bg-gradient-to-r" />
        </div>

        {/* Horóscopo */}
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div>
            <p className="font-jost text-[10px] uppercase tracking-[0.4em] text-gold/80">
              {t("horoscopeCard.dailyLabel")} ·{" "}
              {new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "pt-BR", {
                dateStyle: "medium",
              }).format(new Date())}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-cinzel text-2xl text-cream">
                {t(`zodiac.${sign}`)}
              </span>
              <span className="font-jost text-[11px] uppercase tracking-[0.3em] text-cream/50">
                {ZODIAC_RANGES[sign]}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
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

          <div className="flex flex-wrap items-center gap-3 border-t border-gold/15 pt-4">
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

          <div className="mt-auto flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xs font-jost text-xs leading-relaxed tracking-wide text-cream/55">
              {t("zodiacWidget.ctaHint")}
            </p>
            <a
              href="/#pagamento"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 font-jost text-[11px] uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] transition hover:bg-gold-light"
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
    </Card>
  );
}

export default HoroscopeCard;
