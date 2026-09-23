import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth-context";
import { useEntitlements, useInvalidateEntitlements } from "@/hooks/useEntitlements";
import { consumeAnalysis, consumeCompatibility } from "@/services/entitlements";
import { AnalysisFormDialog } from "@/components/dashboard/AnalysisFormDialog";
import { AnalysisResultDialog } from "@/components/dashboard/AnalysisResultDialog";
import {
  generateAnalysis,
  useDeleteDelivery,
  useDeliveredAnalyses,
  useInvalidateDeliveries,
} from "@/hooks/useDeliveries";

/**
 * Fluxo de entrega das análises (formulário → IA → resultado → PDF/exclusão).
 * Reutilizado pelo card "Seus direitos" e pelo card de combinação de signos,
 * garantindo o mesmo comportamento em todas as páginas.
 */
export function useAnalysisDelivery() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: entitlements } = useEntitlements(Boolean(user));
  const { data: delivered } = useDeliveredAnalyses(user?.id);
  const invalidate = useInvalidateEntitlements();
  const invalidateDeliveries = useInvalidateDeliveries();
  const deleteDelivery = useDeleteDelivery();

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState("s1");
  const [formTitle, setFormTitle] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultContent, setResultContent] = useState("");
  const [resultProvider, setResultProvider] = useState<string | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultDocumentPath, setResultDocumentPath] = useState<string | null>(null);
  const [resultDate, setResultDate] = useState<string | null>(null);

  const deliveredMap = new Map((delivered ?? []).map((d) => [d.analysis_key, d]));

  const openDelivered = (analysisKey: string, name: string) => {
    const item = deliveredMap.get(analysisKey);
    if (!item) return;
    setResultTitle(name);
    setResultContent(item.content);
    setResultProvider(item.provider);
    setResultId(item.id);
    setResultDocumentPath(item.document_path);
    setResultDate(item.created_at);
    setResultLoading(false);
    setResultOpen(true);
  };

  const startDelivery = (analysisKey: string, name: string) => {
    setFormKey(analysisKey);
    setFormTitle(name);
    setFormOpen(true);
  };

  const removeDelivered = async () => {
    if (!resultId) return;
    try {
      await deleteDelivery.mutateAsync({ id: resultId, documentPath: resultDocumentPath });
      setResultOpen(false);
      setResultId(null);
      setResultDocumentPath(null);
      setResultDate(null);
      invalidate();
      toast.success(t("delivery.deleted"));
    } catch {
      toast.error(t("delivery.deleteError"));
    }
  };

  const runDelivery = async (
    formData: Record<string, unknown>,
    documentPath: string | null,
  ) => {
    const key = formKey;
    setBusyKey(key);
    setResultTitle(formTitle);
    setResultContent("");
    setResultProvider(null);
    setResultId(null);
    setResultDocumentPath(documentPath);
    setResultDate(null);
    setResultLoading(true);
    setResultOpen(true);
    try {
      const generated = await generateAnalysis(key, formData, documentPath);
      setResultContent(generated.analysis.content);
      setResultProvider(generated.analysis.provider);
      setResultId(generated.analysis.id);
      setResultDocumentPath(generated.analysis.document_path);
      setResultDate(generated.analysis.created_at);
      invalidateDeliveries();

      const isCompatCredit =
        key === "s4" && !(entitlements?.analyses_avulsas ?? []).includes("s4");
      const consumed = isCompatCredit
        ? await consumeCompatibility()
        : await consumeAnalysis(key);
      if (!consumed.ok && !consumed.kind) {
        toast.error(
          t(
            consumed.error === "weekly_limit"
              ? "entitlements.weeklyUsed"
              : "entitlements.error",
          ),
        );
      }
      invalidate();
    } catch {
      setResultOpen(false);
      toast.error(t("delivery.error"));
    } finally {
      setResultLoading(false);
      setBusyKey(null);
    }
  };

  const dialogs = (
    <>
      <AnalysisFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        analysisKey={formKey}
        title={formTitle}
        onSubmitted={(formData, documentPath) => void runDelivery(formData, documentPath)}
      />
      <AnalysisResultDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        title={resultTitle}
        content={resultContent}
        isLoading={resultLoading}
        provider={resultProvider}
        deliveredAt={resultDate}
        onDelete={resultId ? () => void removeDelivered() : undefined}
        isDeleting={deleteDelivery.isPending}
      />
    </>
  );

  return {
    busyKey,
    deliveredMap,
    openDelivered,
    startDelivery,
    dialogs,
    isDeleting: deleteDelivery.isPending,
  };
}
