import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { buildWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WhatsAppConnectProps {
  /** Nome do produto comprado (para a mensagem de entrega da análise). */
  productName?: string;
}

/**
 * Card de conexão WhatsApp na área de membros: mostra o número cadastrado no
 * perfil e oferece o link wa.me para (1) receber a análise comprada e (2)
 * fazer as perguntas liberadas direto pelo WhatsApp do Mestre.
 */
export function WhatsAppConnect({ productName }: WhatsAppConnectProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

  if (isLoading || !user) {
    return (
      <Card className="border-gold/20 bg-card">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-2/3 bg-gold/10" />
          <Skeleton className="mt-3 h-10 bg-gold/10" />
        </CardContent>
      </Card>
    );
  }

  const phone = profile?.phone ?? null;
  const analysisLink = buildWhatsAppLink(
    undefined,
    WHATSAPP_MESSAGES.analysisRequest(productName ?? ""),
  );
  const questionLink = buildWhatsAppLink(
    undefined,
    WHATSAPP_MESSAGES.questionRequest(""),
  );

  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader className="border-b border-gold/10 pb-3">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl text-cream">
          <MessageCircle className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t("whatsapp.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
            {t("whatsapp.yourNumber")}
          </span>
          {phone ? (
            <Badge className="border-gold/40 bg-royal/40 font-jost text-xs text-gold">
              {phone}
            </Badge>
          ) : (
            <span className="font-jost text-xs text-cream/45">
              {t("whatsapp.noNumber")}
            </span>
          )}
        </div>

        <p className="max-w-md font-jost text-sm font-light leading-relaxed tracking-wide text-cream/65">
          {t("whatsapp.hint")}
        </p>

        <div className="flex flex-wrap gap-3">
          {productName && (
            <a
              href={analysisLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] transition hover:bg-gold-light"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t("whatsapp.receiveAnalysis")}
            </a>
          )}
          <a
            href={questionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("whatsapp.askQuestion")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default WhatsAppConnect;
