import { supabase } from "@/integrations/supabase/client";
import type { PurchasedAnalysis } from "@/domain/models";

/** List the signed-in user's purchased analyses, newest first. */
export async function getUserPurchases(userId: string): Promise<PurchasedAnalysis[]> {
  const { data, error } = await supabase
    .from("purchased_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PurchasedAnalysis[];
}
