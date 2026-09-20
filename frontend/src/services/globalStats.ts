import { supabase } from "@/integrations/supabase/client";

/**
 * Baseline seeded from the landing copy ("4.200+ Consultas realizadas").
 * The live counter starts there and grows with each verified Stripe purchase.
 */
export const ANALYSIS_BASELINE = 4200;

/** Read the global analysis counter. Public read: anon + authenticated. */
export async function getAnalysisCount(): Promise<number> {
  const { data, error } = await supabase
    .from("global_stats")
    .select("analysis_count")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data?.analysis_count ?? ANALYSIS_BASELINE;
}
