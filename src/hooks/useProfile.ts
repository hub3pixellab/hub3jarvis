import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateAvatarUrl,
  upsertProfile,
} from "@/services/profile";
import type { Profile } from "@/domain/models";

export function useProfile(userId?: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      patch,
    }: {
      userId: string;
      patch: Partial<
        Pick<
          Profile,
          | "display_name"
          | "bio"
          | "birth_date"
          | "locale"
          | "phone"
          | "gender"
          | "sexuality"
        >
      >;
    }) => upsertProfile(userId, patch),
    onSuccess: (updated) => {
      void queryClient.setQueryData(["profile", updated.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["profile", updated.id] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, avatarUrl }: { userId: string; avatarUrl: string }) =>
      updateAvatarUrl(userId, avatarUrl),
    onSuccess: (updated) => {
      void queryClient.setQueryData(["profile", updated.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["profile", updated.id] });
    },
  });
}
