import { useTranslation } from "react-i18next";
import { Loader2, MessageCircle, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { buildWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

interface AnalysisResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nome da análise já traduzido. */
  title: string;
  /** Texto gerado pela IA (vazio enquanto carrega). */
  content: string;
  isLoading: boolean;
  provider: string | null;
}

/**
 * Pop-up com o resultado da análise gerado pela IA do Mestre Agnes.
 * Também oferece o envio do resultado pelo WhatsApp.
 */
export function AnalysisResultDialog({
  open,
  onOpenChange,
  title,
  content,
  isLoading,
  provider,
}: AnalysisResultDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-gold/15 pb-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
              <Sparkle className="h-5 w-5" strokeWidth={1.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                {t("delivery.eyebrow")}
              </p>
              <DialogTitle className="mt-1 font-cinzel text-2xl text-cream md:text-3xl">
                {title}
              </DialogTitle>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-14 text-center">
              <Loader2
                className="h-7 w-7 animate-spin text-gold"
                strokeWidth={1.5}
              />
              <p className="font-jost text-sm text-cream/60">
                {t("delivery.generating")}
              </p>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-line font-jost text-sm leading-relaxed tracking-wide text-cream/85">
                {content}
              </p>

              <div className="flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/40">
                  {t("delivery.generatedBy", {
                    provider: provider ?? "IA",
                  })}
                </span>
                <a
                  href={buildWhatsAppLink(
                    undefined,
                    WHATSAPP_MESSAGES.analysisRequest(title),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t("delivery.sendWhatsApp")}
                </a>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AnalysisResultDialog;
