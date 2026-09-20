import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Sparkle, UserPlus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth-context";
import { usePublicMembers } from "@/hooks/useSocial";

/** Página "Rede": lista de membros com perfil público visível. */
export default function RedePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: members, isLoading } = usePublicMembers();
  const [query, setQuery] = useState("");

  const filtered = (members ?? []).filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = (m.display_name ?? "").toLowerCase();
    const sign = t(`zodiac.${m.zodiac_sign}`).toLowerCase();
    return name.includes(q) || sign.includes(q);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-cinzel text-3xl text-cream md:text-4xl">
          {t("social.networkTitle")}
        </h2>
        <p className="mt-2 max-w-xl font-jost text-sm font-light text-cream/60">
          {t("social.networkSubtitle")}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-gold/25 bg-navy/60 px-5 py-3">
        <Search className="h-4 w-4 shrink-0 text-gold/70" strokeWidth={1.5} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("social.searchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent font-jost text-sm tracking-wide text-cream placeholder:text-cream/35 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 bg-gold/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <Users className="h-8 w-8 text-gold/40" strokeWidth={1} />
          <p className="max-w-sm font-jost text-sm text-cream/60">
            {query ? t("social.noResults") : t("social.noMembers")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MemberCard
              key={m.id}
              id={m.id}
              name={m.display_name}
              bio={m.bio}
              sign={m.zodiac_sign}
              avatar={m.avatar_url}
              followers={m.followers}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({
  id,
  name,
  bio,
  sign,
  avatar,
  followers,
}: {
  id: string;
  name: string | null;
  bio: string | null;
  sign: string | null;
  avatar: string | null;
  followers: number;
}) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/dashboard/membro/${id}`}
      className="group block h-full"
    >
      <Card className="h-full border-gold/20 bg-card transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-gold/50">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-gold/30">
              {avatar ? (
                <AvatarImage
                  src={avatar}
                  alt={name ?? ""}
                  crossOrigin="anonymous"
                />
              ) : null}
              <AvatarFallback className="bg-royal/50 font-cinzel text-lg text-gold">
                {(name ?? "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-cinzel text-lg text-cream">
                {name ?? t("social.unnamed")}
              </p>
              <Badge className="mt-0.5 border-gold/30 bg-gold/5 px-2 py-0 font-jost text-[9px] uppercase tracking-[0.2em] text-gold">
                {sign ? t(`zodiac.${sign}`) : t("profile.zodiacUnknown")}
              </Badge>
            </div>
          </div>

          {bio ? (
            <p className="line-clamp-2 font-jost text-xs leading-relaxed text-cream/60">
              {bio}
            </p>
          ) : (
            <p className="font-jost text-xs italic text-cream/35">
              {t("social.noBio")}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-gold/10 pt-3">
            <span className="inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.2em] text-cream/50">
              <Sparkle className="h-3 w-3 text-gold/60" strokeWidth={1.5} />
              {t("social.followers", { count: followers })}
            </span>
            <span className="inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.2em] text-gold transition group-hover:text-gold-light">
              <UserPlus className="h-3 w-3" strokeWidth={1.5} />
              {t("social.viewProfile")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export { MemberCard };
