import { supabase } from "@/integrations/supabase/client";

/** Análise gerada pela IA e entregue ao usuário. */
export interface DeliveredAnalysis {
  id: string;
  user_id: string;
  analysis_key: string;
  plan_key: string | null;
  product_name: string;
  content: string;
  provider: string | null;
  model: string | null;
  form_data: Record<string, unknown> | null;
  document_path: string | null;
  created_at: string;
}

export interface GenerateAnalysisResult {
  delivered: boolean;
  analysis: DeliveredAnalysis;
}

/**
 * Gera (ou retorna a já entregue) a análise via IA do Mestre Agnes,
 * enviando os dados do formulário e o anexo opcional (certidão).
 */
export async function generateAnalysis(
  analysisKey: string,
  formData?: Record<string, unknown> | null,
  documentPath?: string | null,
): Promise<GenerateAnalysisResult> {
  const { data, error } = await supabase.functions.invoke("generate-analysis", {
    body: { analysisKey, formData: formData ?? null, documentPath: documentPath ?? null },
  });
  if (error) {
    throw new Error(
      (data as { error?: string } | null)?.error ?? error.message,
    );
  }
  return data as GenerateAnalysisResult;
}

/** Lista as análises já entregues ao usuário. */
export async function getDeliveredAnalyses(
  userId: string,
): Promise<DeliveredAnalysis[]> {
  const { data, error } = await supabase
    .from("delivered_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DeliveredAnalysis[];
}

/**
 * Apaga uma análise entregue (e o documento anexado, se houver), para que
 * o usuário possa gerá-la de novo depois de uma nova compra.
 */
export async function deleteDeliveredAnalysis(
  id: string,
  documentPath?: string | null,
): Promise<void> {
  if (documentPath) {
    // Não bloqueia a exclusão se o arquivo já não existir.
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([documentPath]);
  }
  const { error } = await supabase
    .from("delivered_analyses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export const DOCUMENTS_BUCKET = "documents";
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

/**
 * Envia a certidão (ou outro documento) para a pasta do próprio usuário
 * e devolve o caminho relativo no bucket.
 */
export async function uploadDocument(
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}
