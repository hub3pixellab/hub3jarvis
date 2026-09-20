import { supabase } from "@/integrations/supabase/client";

/** Direitos concedidos ao usuário conforme o plano comprado. */
export interface Entitlements {
  has_plan: boolean;
  plan_key?: string;
  plan_name?: string;
  questions_remaining?: number;
  compatibility_remaining?: number;
  analyses_avulsas?: string[];
  weekly_available?: boolean;
  weekly_used?: number;
}

type RpcResult = {
  ok?: boolean;
  error?: string;
  remaining?: number;
  kind?: "avulsa" | "semanal";
};

/** Lê os direitos do usuário logado (security definer, usa auth.uid()). */
export async function getMyEntitlements(): Promise<Entitlements> {
  const { data, error } = await supabase.rpc("get_my_entitlements");
  if (error) throw error;
  return (data as unknown as Entitlements) ?? { has_plan: false };
}

/** Consome 1 pergunta no terminal; retorna ok e o saldo restante. */
export async function consumeTerminalQuestion(): Promise<RpcResult> {
  const { data, error } = await supabase.rpc("consume_terminal_question");
  if (error) throw error;
  return (data ?? {}) as RpcResult;
}

/** Consome uma análise (avulsa comprada ou a semanal da assinatura). */
export async function consumeAnalysis(analysisKey: string): Promise<RpcResult> {
  const { data, error } = await supabase.rpc("consume_analysis", {
    p_analysis_key: analysisKey,
  });
  if (error) throw error;
  return (data ?? {}) as RpcResult;
}

/** Consome 1 teste de compatibilidade da assinatura. */
export async function consumeCompatibility(): Promise<RpcResult> {
  const { data, error } = await supabase.rpc("consume_compatibility");
  if (error) throw error;
  return (data ?? {}) as RpcResult;
}
