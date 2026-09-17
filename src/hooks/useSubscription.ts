import { useQuery } from "@tanstack/react-query";
import { getUserSubscriptions } from "@/services/subscriptions";
import type { Subscription } from "@/domain/models";

export function useSubscriptions(userId?: string | null) {
  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: () => getUserSubscriptions(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

/** Most recent subscription record, if any. */
export function useActiveSubscription(userId?: string | null) {
  const query = useSubscriptions(userId);
  const rows = query.data ?? [];
  return { ...query, data: (rows[0] as Subscription | undefined) ?? null };
}
