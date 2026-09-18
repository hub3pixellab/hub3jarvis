import { useQuery } from "@tanstack/react-query";
import { getUserPurchases } from "@/services/purchases";

export function usePurchases(userId?: string | null) {
  return useQuery({
    queryKey: ["purchased_analyses", userId],
    queryFn: () => getUserPurchases(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
