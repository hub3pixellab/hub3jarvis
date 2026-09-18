import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAnalysisCount } from "@/services/globalStats";

const QUERY_KEY = ["analysisCount"];

/**
 * Live global analysis counter.
 * - Reads the value from Supabase (public read).
 * - Optionally subscribes to realtime updates so the counter refreshes the
 *   moment a new purchase is recorded by the webhook.
 * Falls back to the baseline while loading or on error (no layout shift).
 */
export function useAnalysisCount() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAnalysisCount,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Unique topic per mount: re-runs of this effect (e.g. React 19 double
    // effects, HMR) must never re-subscribe the same realtime topic — that
    // throws "cannot add postgres_changes callbacks after subscribe()".
    const topic = `global-stats-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(topic)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "global_stats" },
        () => {
          void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
