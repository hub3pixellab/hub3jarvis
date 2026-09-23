import { supabase } from "@/integrations/supabase/client";

/** Leitura de compatibilidade entre dois signos. */
export interface SignMatchResult {
  pair: string;
  lang: string;
  sign1: string;
  sign2: string;
  score: number;
  summary: string;
  strengths: string | null;
  challenges: string | null;
  advice: string | null;
  cached: boolean;
  source: string;
}

/**
 * Combinação de dois signos, gerada pela IA do Mestre Agnes.
 * O resultado é cacheado por par+idioma no backend.
 */
export async function getSignMatch(
  sign1: string,
  sign2: string,
  lang: string,
): Promise<SignMatchResult> {
  const { data, error } = await supabase.functions.invoke("sign-match", {
    body: { sign1, sign2, lang },
  });
  if (error) {
    throw new Error(
      (data as { error?: string } | null)?.error ?? error.message,
    );
  }
  return data as SignMatchResult;
}
