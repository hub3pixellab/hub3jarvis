import { useTranslation } from "react-i18next";
import { IdentityCard } from "@/components/dashboard/IdentityCard";
import { AnalysesTeaser } from "@/components/dashboard/AnalysesTeaser";
import { EntitlementsCard } from "@/components/dashboard/EntitlementsCard";
import { WhatsAppConnect } from "@/components/dashboard/WhatsAppConnect";
import { PurchasesCard } from "@/components/dashboard/PurchasesCard";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import SignMatchCard from "@/components/agnes/SignMatchCard";

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

      {/* O horóscopo do dia fica nos ícones de signo (ocidental e chinês)
          dentro do cartão de identidade — não na visão geral. */}
      <IdentityCard />

      {/* Combinação dos signos (leitura grátis + sinastria completa do plano) */}
      <SignMatchCard id="combinacao" />

      <AnalysesTeaser />

      <EntitlementsCard />

      <WhatsAppConnect />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PurchasesCard />
        <SubscriptionCard />
      </div>
    </div>
  );
}
