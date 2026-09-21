import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followMember,
  getMySocial,
  getPublicMember,
  listPublicMembers,
  setSocialVisibility,
  unfollowMember,
} from "@/services/social";

/** Lista de membros públicos (rede). */
export function usePublicMembers() {
  return useQuery({
    queryKey: ["public_members"],
    queryFn: listPublicMembers,
    staleTime: 30_000,
  });
}

/** Perfil público de um membro específico. */
export function usePublicMember(userId?: string | null) {
  return useQuery({
    queryKey: ["public_member", userId],
    queryFn: () => getPublicMember(userId as string),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

/** Meus seguidores/seguindo/visibilidade. */
export function useMySocial(enabled = true) {
  return useQuery({
    queryKey: ["my_social"],
    queryFn: getMySocial,
    enabled,
    staleTime: 30_000,
  });
}

function useSocialInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["my_social"] });
    void queryClient.invalidateQueries({ queryKey: ["public_members"] });
    void queryClient.invalidateQueries({ queryKey: ["public_member"] });
  };
}

/** Seguir / deixar de seguir. */
export function useToggleFollow() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: ({
      targetId,
      following,
    }: {
      targetId: string;
      following: boolean;
    }) => (following ? unfollowMember(targetId) : followMember(targetId)),
    onSuccess: invalidate,
  });
}

/** Alterna visibilidade do perfil na rede. */
export function useSetVisibility() {
  const invalidate = useSocialInvalidate();
  return useMutation({
    mutationFn: (visible: boolean) => setSocialVisibility(visible),
    onSuccess: invalidate,
  });
}
