import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInitials, getZodiacSign } from "@/lib/zodiac";
import { getChineseZodiacSign } from "@/lib/chineseZodiac";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";

export function IdentityCard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

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
  const zodiac = zodiacStored ?? zodiacDerived;
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {zodiac ? (
            <Badge className="border-gold/40 bg-royal/40 text-gold">
              <Sparkle className="mr-1 h-3 w-3" strokeWidth={1.5} />
              {t(`zodiac.${zodiac}`)}
            </Badge>
          ) : (
            <span className="font-jost text-xs text-cream/45">
              {t("dashboard.zodiacUnknown")}
            </span>
          )}
          {chineseZodiac && (
            <Badge className="border-gold/40 bg-royal/40 text-gold">
              <Sparkle className="mr-1 h-3 w-3" strokeWidth={1.5} />
              {t(`chineseZodiac.${chineseZodiac}`)}
            </Badge>
          )}
          <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
            {t("dashboard.memberSince")}{" "}
            {formatDate(profile?.created_at ?? user.created_at, i18n.resolvedLanguage ?? "pt-BR")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
