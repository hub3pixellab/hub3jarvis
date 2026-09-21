import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMatchMessages,
  getMyConversations,
  sendMatchMessage,
} from "@/services/chat";

/** Lista minhas conversas (matches). */
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getMyConversations,
    staleTime: 15_000,
    refetchInterval: 20_000,
  });
}

/** Mensagens do chat com um parceiro; atualiza a cada 8s (simples polling). */
export function useMatchMessages(partnerId?: string | null) {
  return useQuery({
    queryKey: ["match_messages", partnerId],
    queryFn: () => getMatchMessages(partnerId as string),
    enabled: Boolean(partnerId),
    staleTime: 5_000,
    refetchInterval: 8_000,
  });
}

/** Envia uma mensagem e atualiza o cache da conversa. */
export function useSendMessage(partnerId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      sendMatchMessage(partnerId as string, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["match_messages", partnerId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
