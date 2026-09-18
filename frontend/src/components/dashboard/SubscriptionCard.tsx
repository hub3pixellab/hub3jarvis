import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Crown, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useActiveSubscription } from "@/hooks/useSubscription";
import { formatDate } from "@/lib/format";
import type { SubscriptionStatus } from "@/domain/models";

export function SubscriptionCard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: subscription, isLoading } = useActiveSubscription(user?.id);

  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
          <Crown className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t("dashboard.subscriptionTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3 bg-gold/10" />
            <Skeleton className="h-4 w-1/2 bg-gold/10" />
          </div>
        ) : subscription ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-cinzel text-2xl text-gold-gradient">
                {subscription.plan_name}
              </p>
              <StatusBadge status={subscription.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t border-gold/10 pt-4 text-sm">
              <div>
                <dt className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
                  {t("dashboard.subscriptionStart")}
                </dt>
                <dd className="mt-1 font-jost text-cream/85">
                  {formatDate(subscription.current_period_start, i18n.resolvedLanguage ?? "pt-BR")}
                </dd>
              </div>
              <div>
                <dt className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
                  {t("dashboard.subscriptionEnd")}
                </dt>
                <dd className="mt-1 font-jost text-cream/85">
                  {formatDate(subscription.current_period_end, i18n.resolvedLanguage ?? "pt-BR")}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Sparkle className="h-6 w-6 text-gold/40" strokeWidth={1} />
            <p className="max-w-xs font-jost text-sm text-cream/60">
              {t("dashboard.subscriptionNone")}
            </p>
            <Link
              to="/#pagamento"
              className="rounded-full border border-gold/50 px-5 py-2 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
            >
              {t("dashboard.subscriptionCta")}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const { t } = useTranslation();
  const label = t(`dashboard.subStatus.${status}`);
  const tone =
    status === "active" || status === "trialing"
      ? "border-gold/50 bg-gold/10 text-gold"
      : status === "past_due"
        ? "border-cream/30 bg-cream/10 text-cream/70"
        : "border-destructive/40 bg-destructive/10 text-destructive";
  return (
    <Badge variant="outline" className={`border ${tone}`}>
      {label}
    </Badge>
  );
}
