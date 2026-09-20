import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyEntitlements } from "@/services/entitlements";

export function useEntitlements(enabled = true) {
  return useQuery({
    queryKey: ["entitlements"],
    queryFn: getMyEntitlements,
    enabled,
    staleTime: 30_000,
  });
}

/** Invalida o cache de direitos após consumir créditos. */
export function useInvalidateEntitlements() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["entitlements"] });
}
