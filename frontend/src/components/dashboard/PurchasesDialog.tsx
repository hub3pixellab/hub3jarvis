import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScrollText, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { usePurchases } from "@/hooks/usePurchases";
import { formatDate, formatPrice } from "@/lib/format";
import type { AnalysisStatus } from "@/domain/models";

interface PurchasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Pop-up com todos os serviços adquiridos pelo usuário. */
export function PurchasesDialog({ open, onOpenChange }: PurchasesDialogProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: purchases, isLoading } = usePurchases(user?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        <div className="flex items-center gap-3 border-b border-gold/10 px-6 py-5">
          <ScrollText className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <DialogTitle className="font-cinzel text-xl text-cream">
            {t("dashboard.analysesTitle")}
          </DialogTitle>
        </div>

        <div className="p-5 md:p-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 bg-gold/10" />
              ))}
            </div>
          ) : purchases && purchases.length > 0 ? (
            <ul className="divide-y divide-gold/10">
              {purchases.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-jost text-sm text-cream">
                      {p.product_name}
                    </p>
                    <p className="font-jost text-[11px] text-cream/45">
                      {formatDate(p.purchased_at, i18n.resolvedLanguage ?? "pt-BR")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-cinzel text-lg text-gold-gradient">
                      {formatPrice(p.price_centavos)}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Sparkle className="h-6 w-6 text-gold/40" strokeWidth={1} />
              <p className="max-w-xs font-jost text-sm text-cream/60">
                {t("dashboard.analysesEmpty")}
              </p>
              <Link
                to="/#servicos"
                className="rounded-full border border-gold/50 px-5 py-2 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
              >
                {t("dashboard.analysesEmptyCta")}
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: AnalysisStatus }) {
  const { t } = useTranslation();
  const label = t(`dashboard.purchaseStatus.${status}`);
  const tone =
    status === "pago"
      ? "border-gold/50 bg-gold/10 text-gold"
      : status === "pendente"
        ? "border-cream/30 bg-cream/10 text-cream/70"
        : "border-destructive/40 bg-destructive/10 text-destructive";
  return (
    <Badge variant="outline" className={`border ${tone}`}>
      {label}
    </Badge>
  );
}

export default PurchasesDialog;
