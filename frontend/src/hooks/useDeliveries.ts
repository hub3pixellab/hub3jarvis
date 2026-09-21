import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDeliveredAnalysis,
  generateAnalysis,
  getDeliveredAnalyses,
} from "@/services/deliveries";

/** Lista de análises já entregues ao usuário. */
export function useDeliveredAnalyses(userId?: string | null) {
  return useQuery({
    queryKey: ["delivered_analyses", userId],
    queryFn: () => getDeliveredAnalyses(userId as string),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

/** Após gerar uma análise, atualiza o cache local. */
export function useInvalidateDeliveries() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: ["delivered_analyses"] });
}

/** Apaga uma análise entregue (para refazer após nova compra). */
export function useDeleteDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      documentPath,
    }: {
      id: string;
      documentPath?: string | null;
    }) => deleteDeliveredAnalysis(id, documentPath),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["delivered_analyses"] });
      void queryClient.invalidateQueries({ queryKey: ["entitlements"] });
    },
  });
}

export { generateAnalysis };
