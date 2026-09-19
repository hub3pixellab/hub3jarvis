import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInitials, getZodiacSign } from "@/lib/zodiac";
import { getChineseZodiacSign } from "@/lib/chineseZodiac";
import { ZODIAC_SIGNS, type ZodiacSignKey } from "@/domain/models";
import { formatDate } from "@/lib/format";
import { ZODIAC_CARD_IMAGES } from "@/lib/zodiacCards";
import { CHINESE_ZODIAC_GLYPHS } from "@/lib/chineseZodiacData";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import SignHoroscopeDialog from "@/components/agnes/SignHoroscopeDialog";
import ChineseZodiacDialog from "@/components/agnes/ChineseZodiacDialog";

export function IdentityCard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const [openSign, setOpenSign] = useState(false);
  const [openAnimal, setOpenAnimal] = useState(false);

  if (isLoading || !user) {
    return (
      <Card className="border-gold/20 bg-card">
        <CardContent className="flex items-center gap-5 p-6">
          <Skeleton className="h-16 w-16 rounded-full bg-gold/10" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40 bg-gold/10" />
            <Skeleton className="h-4 w-28 bg-gold/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = profile?.display_name ?? user.email ?? "Mestre Agnes";
  const initials = getInitials(displayName);
  const email = user.email ?? "";
  const zodiacStored = profile?.zodiac_sign;
  const zodiacDerived = profile?.birth_date
    ? getZodiacSign(profile.birth_date)
    : null;
  // O valor gravado chega como `string` do banco: só aceita se for um signo
  // conhecido. O derivado tem precedência (é recalculado com a lógica atual).
  const zodiacStoredSafe =
    zodiacStored && (ZODIAC_SIGNS as readonly string[]).includes(zodiacStored)
      ? (zodiacStored as ZodiacSignKey)
      : null;
  const zodiac = zodiacDerived ?? zodiacStoredSafe;
  const chineseZodiac = profile?.birth_date
    ? getChineseZodiacSign(profile.birth_date)
    : null;

  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <CardTitle className="font-cinzel text-xl text-cream">
          {t("dashboard.identityTitle")}
        </CardTitle>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-gold hover:bg-gold/10 hover:text-gold"
        >
          <Link to="/dashboard/perfil">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("dashboard.editProfile")}
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 border border-gold/40">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-royal/50 font-cinzel text-xl text-gold-gradient">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-cinzel text-2xl text-cream">{displayName}</p>
            <p className="truncate font-jost text-sm text-cream/55">{email}</p>
          </div>

          {/* Signos em ícones compactos — clicáveis, abrem o horóscopo do dia */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {zodiac && (
              <button
                type="button"
                onClick={() => setOpenSign(true)}
                aria-label={t(`zodiac.${zodiac}`)}
                title={t(`zodiac.${zodiac}`)}
                className="group h-10 w-10 overflow-hidden rounded-full border border-gold/40 transition hover:border-gold hover:shadow-[0_0_16px_hsl(var(--gold)/0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <img
                  src={ZODIAC_CARD_IMAGES[zodiac]}
                  alt={t(`zodiac.${zodiac}`)}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-110"
                />
              </button>
            )}
            {chineseZodiac && (
              <button
                type="button"
                onClick={() => setOpenAnimal(true)}
                aria-label={t(`chineseZodiac.${chineseZodiac}`)}
                title={t(`chineseZodiac.${chineseZodiac}`)}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-lg text-gold-gradient transition hover:border-gold hover:shadow-[0_0_16px_hsl(var(--gold)/0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {CHINESE_ZODIAC_GLYPHS[chineseZodiac]}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gold/10 pt-3">
          {zodiac ? (
            <span className="inline-flex items-center gap-2 font-jost text-xs text-cream/70">
              <Sparkle className="h-3 w-3 text-gold" strokeWidth={1.5} />
              {t(`zodiac.${zodiac}`)}
              {chineseZodiac && (
                <>
                  <span className="text-cream/30">•</span>
                  {t(`chineseZodiac.${chineseZodiac}`)}
                </>
              )}
            </span>
          ) : (
            <span className="font-jost text-xs text-cream/45">
              {t("dashboard.zodiacUnknown")}
            </span>
          )}
          <span className="ml-auto font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
            {t("dashboard.memberSince")}{" "}
            {formatDate(profile?.created_at ?? user.created_at, i18n.resolvedLanguage ?? "pt-BR")}
          </span>
        </div>
      </CardContent>

      <SignHoroscopeDialog
        sign={openSign ? zodiac : null}
        onClose={() => setOpenSign(false)}
        plansHref="/#pagamento"
      />
      <ChineseZodiacDialog
        animal={openAnimal ? chineseZodiac : null}
        onClose={() => setOpenAnimal(false)}
      />
    </Card>
  );
}

export default IdentityCard;
