import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkle,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { usePublicMembers } from "@/hooks/useSocial";
import { getZodiacSign } from "@/lib/zodiac";
import { compatibleSigns } from "@/lib/signCompatibility";
import { ZODIAC_SIGNS } from "@/domain/models";

const GENDERS = ["homem", "mulher", "sem_genero"];
const SEXUALITIES = [
  "heterossexual",
  "homossexual",
  "bissexual",
  "pansexual",
  "assexual",
  "queer",
  "outro",
];
const AGE_RANGES: { key: string; min: number; max: number }[] = [
  { key: "18_25", min: 18, max: 25 },
  { key: "26_35", min: 26, max: 35 },
  { key: "36_45", min: 36, max: 45 },
  { key: "46_60", min: 46, max: 60 },
  { key: "60plus", min: 60, max: 130 },
];

/** Página "Rede": membros com perfil público + filtros de descoberta. */
export default function RedePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: members, isLoading } = usePublicMembers();

  const [query, setQuery] = useState("");
  const [sign, setSign] = useState("all");
  const [ageRange, setAgeRange] = useState("all");
  const [location, setLocation] = useState("");
  const [onlyCompatible, setOnlyCompatible] = useState(false);
  const [sexuality, setSexuality] = useState("all");
  const [gender, setGender] = useState("all");

  const mySign = profile?.birth_date ? getZodiacSign(profile.birth_date) : null;
  const myCompatible = useMemo(() => compatibleSigns(mySign), [mySign]);

  const hasFilters =
    sign !== "all" ||
    ageRange !== "all" ||
    location.trim() !== "" ||
    onlyCompatible ||
    sexuality !== "all" ||
    gender !== "all";

  const clear = () => {
    setSign("all");
    setAgeRange("all");
    setLocation("");
    setOnlyCompatible(false);
    setSexuality("all");
    setGender("all");
  };

  const filtered = (members ?? []).filter((m) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const name = (m.display_name ?? "").toLowerCase();
      const signName = t(`zodiac.${m.zodiac_sign}`).toLowerCase();
      if (!name.includes(q) && !signName.includes(q)) return false;
    }
    if (sign !== "all" && m.zodiac_sign !== sign) return false;
    if (ageRange !== "all") {
      const range = AGE_RANGES.find((r) => r.key === ageRange);
      if (!range || m.age == null || m.age < range.min || m.age > range.max) {
        return false;
      }
    }
    if (
      location.trim() &&
      !(m.location ?? "").toLowerCase().includes(location.trim().toLowerCase())
    ) {
      return false;
    }
    if (onlyCompatible && !myCompatible.includes(m.zodiac_sign ?? "")) {
      return false;
    }
    if (sexuality !== "all" && m.sexuality !== sexuality) return false;
    if (gender !== "all" && m.gender !== gender) return false;
    return true;
  });

  const filterSelect = (value: string, onChange: (v: string) => void, label: string, children: React.ReactNode) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="h-10 w-full border-gold/25 bg-navy/60 font-jost text-xs text-cream focus:border-gold sm:w-auto sm:min-w-[9.5rem]"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );

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

      {/* Busca */}
      <div className="flex items-center gap-3 rounded-full border border-gold/25 bg-navy/60 px-5 py-3">
        <Search className="h-4 w-4 shrink-0 text-gold/70" strokeWidth={1.5} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("social.searchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent font-jost text-sm tracking-wide text-cream placeholder:text-cream/35 focus:outline-none"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-md border border-gold/20 bg-navy/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("social.filters")}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.25em] text-cream/50 transition hover:text-gold"
            >
              <X className="h-3 w-3" strokeWidth={1.5} />
              {t("social.filterClear")}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filterSelect(sign, setSign, t("social.filterSign"), (
            <>
              <SelectItem value="all">{t("social.filterAllSigns")}</SelectItem>
              {ZODIAC_SIGNS.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`zodiac.${s}`)}
                </SelectItem>
              ))}
            </>
          ))}

          {filterSelect(ageRange, setAgeRange, t("social.filterAge"), (
            <>
              <SelectItem value="all">{t("social.filterAllAges")}</SelectItem>
              {AGE_RANGES.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {t(`social.ageRange.${r.key}`)}
                </SelectItem>
              ))}
            </>
          ))}

          {filterSelect(sexuality, setSexuality, t("social.filterSexuality"), (
            <>
              <SelectItem value="all">{t("social.filterAll")}</SelectItem>
              {SEXUALITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`profile.sexuality.${s}`)}
                </SelectItem>
              ))}
            </>
          ))}

          {filterSelect(gender, setGender, t("social.filterGender"), (
            <>
              <SelectItem value="all">{t("social.filterAll")}</SelectItem>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {t(`profile.gender.${g}`)}
                </SelectItem>
              ))}
            </>
          ))}

          {/* Localidade */}
          <div className="flex h-10 w-full items-center gap-2 rounded-md border border-gold/25 bg-navy/60 px-3 sm:w-auto sm:min-w-[12rem]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gold/70" strokeWidth={1.5} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("social.filterLocation")}
              className="min-w-0 flex-1 bg-transparent font-jost text-xs tracking-wide text-cream placeholder:text-cream/35 focus:outline-none"
            />
          </div>

          {/* Compatibilidade */}
          <button
            type="button"
            onClick={() => setOnlyCompatible((v) => !v)}
            aria-pressed={onlyCompatible}
            className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 font-jost text-[10px] uppercase tracking-[0.25em] transition ${
              onlyCompatible
                ? "border-gold bg-gold/15 text-gold"
                : "border-gold/25 text-cream/60 hover:text-gold"
            }`}
          >
            <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("social.filterCompatibility")}
          </button>
        </div>

        {onlyCompatible && !mySign && (
          <p className="font-jost text-[11px] text-cream/45">
            {t("social.filterCompatibilityHint")}
          </p>
        )}
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
            {query || hasFilters ? t("social.noResults") : t("social.noMembers")}
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
              age={m.age}
              location={m.location}
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
  age,
  location,
}: {
  id: string;
  name: string | null;
  bio: string | null;
  sign: string | null;
  avatar: string | null;
  followers: number;
  age: number | null;
  location: string | null;
}) {
  const { t } = useTranslation();
  return (
    <Link to={`/dashboard/membro/${id}`} className="group block h-full">
      <Card className="h-full border-gold/20 bg-card transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-gold/50">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-gold/30">
              {avatar ? (
                <AvatarImage src={avatar} alt={name ?? ""} crossOrigin="anonymous" />
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

          {(age != null || location) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-jost text-[10px] uppercase tracking-[0.2em] text-cream/50">
              {age != null && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3 text-gold/60" strokeWidth={1.5} />
                  {t("profile.ageValue", { count: age })}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-gold/60" strokeWidth={1.5} />
                  {location}
                </span>
              )}
            </div>
          )}

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
