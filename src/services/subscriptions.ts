import { supabase } from "@/integrations/supabase/client";
import type { Subscription } from "@/domain/models";

/** List the signed-in user's subscriptions, newest first. */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Subscription[];
}
