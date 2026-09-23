import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Compass,
  Crown,
  Hash,
  Heart,
  Loader2,
  MessageCircle,
  Triangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAnalysisDelivery } from "@/hooks/useAnalysisDelivery";

/** As 5 análises do Mestre (chaves i18n em services.s*Name). */
const ANALYSES = [
  { key: "s1", nameKey: "services.s1Name", Icon: Compass },
  { key: "s2", nameKey: "services.s2Name", Icon: Hash },
  { key: "s3", nameKey: "services.s3Name", Icon: Triangle },
  { key: "s4", nameKey: "services.s4Name", Icon: Heart },
  { key: "s5", nameKey: "services.s5Name", Icon: BookOpen },
];

/** Card "Seus direitos": plano atual + análises/perguntas/compatibilidade liberadas. */
export function EntitlementsCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: entitlements, isLoading } = useEntitlements(Boolean(user));
  const { busyKey, deliveredMap, openDelivered, startDelivery, dialogs } =
    useAnalysisDelivery();

  const hasPlan = entitlements?.has_plan;
  const isCiclo = entitlements?.plan_key === "ciclo97";
  const available = isCiclo
    ? ANALYSES
    : ANALYSES.filter((a) =>
        (entitlements?.analyses_avulsas ?? []).includes(a.key),
      );
  const analyses = ANALYSES.filter(
    (a) => available.some((x) => x.key === a.key) || deliveredMap.has(a.key),
  );
  const weeklyAvailable = Boolean(entitlements?.weekly_available);
  const compatRemaining = entitlements?.compatibility_remaining ?? 0;

  return (
    <Card id="direitos" className="border-gold/20 bg-card">
      <CardHeader className="border-b border-gold/10 pb-3">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
          <Crown className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t("entitlements.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-5 md:p-6">
        {isLoading || !user ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-2/3 bg-gold/10" />
            <Skeleton className="h-10 bg-gold/10" />
          </div>
        ) : !hasPlan ? (
          <div className="flex flex-col items-start gap-3">
            <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/65">
              {t("entitlements.noPlan")}
            </p>
            <a
              href="/#pagamento"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
            >
              {t("entitlements.cta")}
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-gold/50 bg-royal/40 font-jost text-xs text-gold">
                {entitlements.plan_name}
              </Badge>
              {isCiclo && (
                <span className="font-jost text-xs text-cream/55">
                  {t("entitlements.weeklyHint")}
                </span>
              )}
              {compatRemaining > 0 && (
                <span className="font-jost text-xs text-cream/55">
                  {t("entitlements.compatLeft", { count: compatRemaining })}
                </span>
              )}
            </div>

            {analyses.length > 0 && (
              <ul className="flex flex-col gap-2">
                {analyses.map(({ key, nameKey, Icon }) => {
                  const isDelivered = deliveredMap.has(key);
                  const isCompatCredit =
                    key === "s4" &&
                    !(entitlements?.analyses_avulsas ?? []).includes("s4");
                  const disabled =
                    busyKey !== null ||
                    (isDelivered
                      ? false
                      : isCompatCredit
                        ? compatRemaining <= 0
                        : isCiclo && !weeklyAvailable);
                  return (
                    <li key={key} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.25} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-jost text-sm text-cream/85">
                        {t(nameKey)}
                      </span>
                      {isDelivered && (
                        <Badge
                          variant="outline"
                          className="hidden shrink-0 border-gold/40 bg-gold/5 px-2 py-0 font-jost text-[8px] uppercase tracking-[0.2em] text-gold sm:inline-flex"
                        >
                          {t("delivery.deliveredBadge")}
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          isDelivered
                            ? openDelivered(key, t(nameKey))
                            : startDelivery(key, t(nameKey))
                        }
                        disabled={disabled}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isDelivered
                            ? "border border-gold/50 text-gold hover:bg-gold/10"
                            : "bg-gold text-navy-deep hover:bg-gold-light"
                        }`}
                      >
                        {busyKey === key ? (
                          <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                        ) : (
                          <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                        )}
                        {isDelivered
                          ? t("delivery.viewCta")
                          : t("entitlements.receiveCta")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {compatRemaining > 0 && !analyses.some((a) => a.key === "s4") && (
              <div className="flex items-center gap-3 border-t border-gold/10 pt-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                  <Heart className="h-3.5 w-3.5" strokeWidth={1.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-jost text-sm text-cream/85">
                    {t("services.s4Name")}
                  </p>
                  <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-cream/45">
                    {t("entitlements.compatLeft", { count: compatRemaining })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startDelivery("s4", t("services.s4Name"))}
                  disabled={busyKey !== null}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold/50 px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyKey === "s4" ? (
                    <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                  )}
                  {t("entitlements.compatCta")}
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {dialogs}
    </Card>
  );
}

export default EntitlementsCard;
