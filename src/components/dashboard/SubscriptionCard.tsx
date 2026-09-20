import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useEntitlements } from "@/hooks/useEntitlements";
import { SubscriptionDialog } from "@/components/dashboard/SubscriptionDialog";

/**
 * Resumo do plano vigente. Ao clicar, abre o pop-up com os detalhes
 * do plano de assinatura / pacote ativo.
 */
export function SubscriptionCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: entitlements, isLoading } = useEntitlements(Boolean(user));
  const [open, setOpen] = useState(false);

  const planName = entitlements?.has_plan ? entitlements.plan_name : null;

  return (
    <>
      <Card className="border-gold/20 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
            <Crown className="h-4 w-4 text-gold" strokeWidth={1.5} />
            {t("dashboard.subscriptionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between gap-4 rounded-md py-1 text-left transition hover:bg-gold/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {isLoading ? (
              <Skeleton className="h-8 w-2/3 bg-gold/10" />
            ) : (
              <>
                <span className="flex flex-col">
                  <span className="font-cinzel text-2xl text-gold-gradient">
                    {planName ?? t("dashboard.subscriptionNone")}
                  </span>
                  <span className="font-jost text-[11px] text-cream/50">
                    {planName
                      ? t("subscriptionCard.detailsCta")
                      : t("dashboard.subscriptionCta")}
                  </span>
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </>
            )}
          </button>
        </CardContent>
      </Card>

      <SubscriptionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export default SubscriptionCard;
