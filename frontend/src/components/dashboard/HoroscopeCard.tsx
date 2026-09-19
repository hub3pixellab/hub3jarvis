import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { getZodiacSign } from "@/lib/zodiac";
import { getChineseZodiacSign } from "@/lib/chineseZodiac";
import { getDailyHoroscope } from "@/lib/horoscope";
import { ZODIAC_CARD_IMAGES, ZODIAC_RANGES } from "@/lib/zodiacCards";
import {
  CHINESE_ZODIAC_GLYPHS,
  getChineseZodiacYears,
} from "@/lib/chineseZodiacData";
import SignHoroscopeDialog from "@/components/agnes/SignHoroscopeDialog";
import ChineseZodiacDialog from "@/components/agnes/ChineseZodiacDialog";

/**
 * Cards dos signos do usuário (ocidental + chinês) na área de membros.
 * Aparecem assim que há data de nascimento e, ao clicar, abrem o mesmo pop-up
 * de horóscopo do dia usado no site.
 * Sem data de nascimento: convida a preencher o perfil.
 */
export function HoroscopeCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const [openSign, setOpenSign] = useState(false);
  const [openAnimal, setOpenAnimal] = useState(false);

  if (isLoading || !user) {
    return (
      <Card className="border-gold/20 bg-card">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-2/3 bg-gold/10" />
          <Skeleton className="mt-3 h-4 w-1/2 bg-gold/10" />
          <Skeleton className="mt-6 h-24 bg-gold/10" />
        </CardContent>
      </Card>
    );
  }

  const birthDate = profile?.birth_date ?? null;
  const sign = birthDate ? getZodiacSign(birthDate) : null;
  const animal = birthDate ? getChineseZodiacSign(birthDate) : null;

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
  const years = animal ? getChineseZodiacYears(animal, 2) : [];

  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
          <Sparkle className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t("horoscopeCard.dailyLabel")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Signo ocidental */}
        <button
          type="button"
          onClick={() => setOpenSign(true)}
          className="group relative overflow-hidden rounded-md border border-gold/25 bg-navy/60 text-left transition duration-500 hover:border-gold/70 hover:shadow-[0_0_30px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <img
            src={ZODIAC_CARD_IMAGES[sign]}
            alt={t(`zodiac.${sign}`)}
            className="aspect-[4/3] w-full object-cover object-top transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent p-4">
            <p className="font-jost text-[9px] uppercase tracking-[0.3em] text-gold/80">
              {t("horoscopeCard.yourSign")}
            </p>
            <p className="mt-1 font-cinzel text-2xl text-cream">
              {t(`zodiac.${sign}`)}
            </p>
            <p className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/50">
              {ZODIAC_RANGES[sign]}
            </p>
            <p className="mt-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold/70">
              {t("horoscopeCard.tapToOpen")}
            </p>
          </div>
        </button>

        {/* Animal chinês */}
        {animal && (
          <button
            type="button"
            onClick={() => setOpenAnimal(true)}
            className="group flex flex-col items-center justify-center gap-3 rounded-md border border-gold/25 bg-navy/60 p-6 text-center transition duration-500 hover:border-gold/70 hover:shadow-[0_0_30px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-4xl text-gold-gradient transition group-hover:border-gold">
              {CHINESE_ZODIAC_GLYPHS[animal]}
            </span>
            <span className="font-jost text-[9px] uppercase tracking-[0.3em] text-gold/80">
              {t("horoscopeCard.yourAnimal")}
            </span>
            <span className="font-cinzel text-2xl text-cream">
              {t(`chineseZodiac.${animal}`)}
            </span>
            <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/50">
              {years.join(" · ")}
            </span>
            <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-gold/70">
              {t("horoscopeCard.tapToOpen")}
            </span>
          </button>
        )}

        {/* Números da sorte do dia */}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
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
      </CardContent>

      <SignHoroscopeDialog
        sign={openSign ? sign : null}
        onClose={() => setOpenSign(false)}
        plansHref="/#pagamento"
      />
      <ChineseZodiacDialog
        animal={openAnimal ? animal : null}
        onClose={() => setOpenAnimal(false)}
      />
    </Card>
  );
}

export default HoroscopeCard;
