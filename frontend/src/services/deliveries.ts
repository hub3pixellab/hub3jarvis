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
  created_at: string;
}

export interface GenerateAnalysisResult {
  delivered: boolean;
  analysis: DeliveredAnalysis;
}

/**
 * Gera (ou retorna a já entregue) a análise via IA do Mestre Agnes.
 * O texto é produzido pelo backend agnes e salvo em delivered_analyses.
 */
export async function generateAnalysis(
  analysisKey: string,
): Promise<GenerateAnalysisResult> {
  const { data, error } = await supabase.functions.invoke("generate-analysis", {
    body: { analysisKey },
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
