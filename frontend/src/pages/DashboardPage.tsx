import { useTranslation } from "react-i18next";
import { MessagesSquare } from "lucide-react";
import { IdentityCard } from "@/components/dashboard/IdentityCard";
import { HoroscopeCard } from "@/components/dashboard/HoroscopeCard";
import { AnalysesTeaser } from "@/components/dashboard/AnalysesTeaser";
import { EntitlementsCard } from "@/components/dashboard/EntitlementsCard";
import { WhatsAppConnect } from "@/components/dashboard/WhatsAppConnect";
import { PurchasesCard } from "@/components/dashboard/PurchasesCard";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import Terminal from "@/components/agnes/Terminal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-cinzel text-3xl text-cream md:text-4xl">
          {t("dashboard.welcome")}
        </h2>
        <p className="mt-2 max-w-xl font-jost text-sm font-light text-cream/60">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <IdentityCard />

      <HoroscopeCard />

      <AnalysesTeaser />

      <EntitlementsCard />

      <WhatsAppConnect />

      <Card className="border-gold/20 bg-card">
        <CardHeader className="border-b border-gold/10 pb-3">
          <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
            <MessagesSquare className="h-4 w-4 text-gold" strokeWidth={1.5} />
            {t("dashboard.terminalTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          <Terminal />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PurchasesCard />
        <SubscriptionCard />
      </div>
    </div>
  );
}
