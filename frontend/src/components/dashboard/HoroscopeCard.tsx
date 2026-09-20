import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarDays, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { getZodiacSign } from "@/lib/zodiac";
import { getDailyHoroscope } from "@/lib/horoscope";
import { ZODIAC_CARD_IMAGES, ZODIAC_RANGES } from "@/lib/zodiacCards";
import SignHoroscopeDialog from "@/components/agnes/SignHoroscopeDialog";

/**
 * Horóscopo do dia na área de membros: mostra apenas o signo e a leitura de
 * hoje. "Saiba mais" abre o pop-up completo (leitura, números da sorte,
 * história do símbolo e CTA para os planos).
 */
export function HoroscopeCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const [openSign, setOpenSign] = useState(false);

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

  // Sem data de nascimento — convite para preencher o perfil.
  if (!birthDate || !sign) {
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

  const horoscope = getDailyHoroscope(sign);

  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader className="border-b border-gold/10 pb-3">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
          <Sparkle className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t("horoscopeCard.dailyLabel")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5 md:p-6">
        {/* Signo */}
        <div className="flex items-center gap-4">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gold/40">
            <img
              src={ZODIAC_CARD_IMAGES[sign]}
              alt={t(`zodiac.${sign}`)}
              className="h-full w-full object-cover object-top"
            />
          </span>
          <div className="min-w-0">
            <p className="font-cinzel text-2xl text-cream">{t(`zodiac.${sign}`)}</p>
            <p className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
              {ZODIAC_RANGES[sign]}
            </p>
          </div>
        </div>

        {/* Leitura do dia */}
        <div className="flex flex-col gap-2.5">
          <p className="font-jost text-sm leading-relaxed tracking-wide text-cream/85">
            {t(horoscope.essenceKey)}
          </p>
          <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
            {t(horoscope.toneKey)}
          </p>
        </div>

        {/* Ação */}
        <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-gold/15 pt-4">
          <button
            type="button"
            onClick={() => setOpenSign(true)}
            className="group inline-flex items-center gap-2 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:text-gold-light"
          >
            {t("horoscopeCard.learnMore")}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
              {t("zodiacWidget.luckyLabel")}
            </span>
            {horoscope.luckyNumbers.map((n, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-xs text-gold"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <SignHoroscopeDialog
        sign={openSign ? sign : null}
        onClose={() => setOpenSign(false)}
        plansHref="/#pagamento"
      />
    </Card>
  );
}

export default HoroscopeCard;
