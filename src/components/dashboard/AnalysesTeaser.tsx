import { useTranslation } from "react-i18next";
import { BookOpen, Compass, Crown, Hash, Heart, Triangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** Outras leituras oferecidas pelo Mestre — liberadas por assinatura. */
const ANALYSES = [
  { key: "services.s1Name", Icon: Compass },
  { key: "services.s2Name", Icon: Hash },
  { key: "services.s3Name", Icon: Triangle },
  { key: "services.s4Name", Icon: Heart },
  { key: "services.s5Name", Icon: BookOpen },
];

/**
 * Versão simplificada das demais análises na área de membros.
 * A leitura completa é exclusiva para assinantes.
 */
export function AnalysesTeaser() {
  const { t } = useTranslation();

  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
          <Crown className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t("analysesTeaser.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {ANALYSES.map(({ key, Icon }) => (
            <li key={key} className="flex items-center gap-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.25} />
              </span>
              <span className="min-w-0 flex-1 truncate font-jost text-sm text-cream/85">
                {t(key)}
              </span>
              <Badge
                variant="outline"
                className="border-gold/30 bg-gold/5 px-2 py-0 font-jost text-[8px] uppercase tracking-[0.2em] text-gold/80"
              >
                {t("analysesTeaser.badge")}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm font-jost text-xs leading-relaxed tracking-wide text-cream/55">
            {t("analysesTeaser.note")}
          </p>
          <a
            href="/#pagamento"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
          >
            {t("analysesTeaser.cta")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalysesTeaser;
