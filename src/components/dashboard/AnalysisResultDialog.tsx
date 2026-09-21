import { useTranslation } from "react-i18next";
import { Loader2, MessageCircle, Sparkle, Trash2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buildWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { downloadAnalysisPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/format";

interface AnalysisResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nome da análise já traduzido. */
  title: string;
  /** Texto gerado pela IA (vazio enquanto carrega). */
  content: string;
  isLoading: boolean;
  provider: string | null;
  /** Data da entrega (ISO) — usada no PDF. */
  deliveredAt?: string | null;
  /** Quando informado, habilita a exclusão da análise entregue. */
  onDelete?: () => void;
  isDeleting?: boolean;
}

/**
 * Pop-up com o resultado da análise gerado pela IA do Mestre Agnes.
 * Oferece download em PDF, envio pelo WhatsApp e exclusão (para refazer
 * após uma nova compra).
 */
export function AnalysisResultDialog({
  open,
  onOpenChange,
  title,
  content,
  isLoading,
  provider,
  deliveredAt,
  onDelete,
  isDeleting,
}: AnalysisResultDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "pt-BR";
  const hasContent = !isLoading && content.trim().length > 0;

  const download = () => {
    downloadAnalysisPdf({
      title,
      content,
      date: deliveredAt ? formatDate(deliveredAt, locale) : undefined,
    });
  };

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
                  {t("delivery.signedBy")}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {hasContent && (
                    <button
                      type="button"
                      onClick={download}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t("delivery.downloadPdf")}
                    </button>
                  )}
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
              </div>

              {onDelete && (
                <div className="flex flex-col gap-2 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md font-jost text-[11px] leading-relaxed text-cream/45">
                    {t("delivery.deleteHint")}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={isDeleting}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-destructive/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        )}
                        {t("delivery.deleteCta")}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-gold/30 bg-navy text-cream">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-cinzel text-cream">
                          {t("delivery.deleteTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-jost text-cream/65">
                          {t("delivery.deleteConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gold/30 bg-transparent text-cream hover:bg-gold/10 hover:text-cream">
                          {t("deliveryForm.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("delivery.deleteCta")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AnalysisResultDialog;
