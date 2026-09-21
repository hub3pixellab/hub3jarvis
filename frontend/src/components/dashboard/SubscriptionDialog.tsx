import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Crown, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useActiveSubscription } from "@/hooks/useSubscription";
import { formatDate } from "@/lib/format";
import type { SubscriptionStatus } from "@/domain/models";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Pop-up com o plano vigente do usuário (o que foi liberado pela compra). */
export function SubscriptionDialog({
  open,
  onOpenChange,
}: SubscriptionDialogProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: entitlements, isLoading } = useEntitlements(Boolean(user));
  const { data: subscription } = useActiveSubscription(user?.id);

  const hasPlan = Boolean(entitlements?.has_plan);
  const isCiclo = entitlements?.plan_key === "ciclo97";
  const analyses = entitlements?.analyses_avulsas ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        <div className="flex items-center gap-3 border-b border-gold/10 px-6 py-5">
          <Crown className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <DialogTitle className="font-cinzel text-xl text-cream">
            {t("dashboard.subscriptionTitle")}
          </DialogTitle>
        </div>

        <div className="p-5 md:p-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-2/3 bg-gold/10" />
              <Skeleton className="h-4 w-1/2 bg-gold/10" />
            </div>
          ) : hasPlan ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-cinzel text-2xl text-gold-gradient">
                  {entitlements?.plan_name}
                </p>
                <Badge className="border-gold/50 bg-gold/10 text-gold">
                  {t("entitlements.activeBadge")}
                </Badge>
              </div>

              <ul className="flex flex-col gap-2 border-t border-gold/10 pt-4">
                {isCiclo ? (
                  <li className="font-jost text-sm text-cream/80">
                    {t("entitlements.weeklyHint")}
                  </li>
                ) : (
                  <li className="font-jost text-sm text-cream/80">
                    {t("entitlements.planAnalyses", { count: analyses.length })}
                  </li>
                )}
                {(entitlements?.compatibility_remaining ?? 0) > 0 && (
                  <li className="font-jost text-sm text-cream/80">
                    {t("entitlements.compatLeft", {
                      count: entitlements?.compatibility_remaining ?? 0,
                    })}
                  </li>
                )}
              </ul>

              {subscription && (
                <dl className="grid grid-cols-2 gap-3 border-t border-gold/10 pt-4 text-sm">
                  <div>
                    <dt className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
                      {t("dashboard.subscriptionStart")}
                    </dt>
                    <dd className="mt-1 font-jost text-cream/85">
                      {formatDate(
                        subscription.current_period_start,
                        i18n.resolvedLanguage ?? "pt-BR",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
                      {t("dashboard.subscriptionEnd")}
                    </dt>
                    <dd className="mt-1 font-jost text-cream/85">
                      {formatDate(
                        subscription.current_period_end,
                        i18n.resolvedLanguage ?? "pt-BR",
                      )}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={subscription.status} />
                  </div>
                </dl>
              )}
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
        </div>
      </DialogContent>
    </Dialog>
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

export default SubscriptionDialog;
