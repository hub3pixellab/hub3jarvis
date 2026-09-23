import { supabase } from "@/integrations/supabase/client";

/** Perfil público de um membro na rede (apenas campos liberados). */
export interface PublicMember {
  found: boolean;
  hidden?: boolean;
  is_self?: boolean;
  id?: string;
  display_name?: string | null;
  bio?: string | null;
  zodiac_sign?: string | null;
  avatar_url?: string | null;
  birth_date?: string | null;
  social_visible?: boolean;
  followers?: number;
  following?: number;
  is_following?: boolean;
  /** Se há match (follow mútuo) entre o usuário logado e o membro. */
  matched?: boolean;
  gender?: string | null;
  sexuality?: string | null;
  location?: string | null;
  /** Idade calculada a partir da data de nascimento. */
  age?: number | null;
}

/** Item da lista de membros públicos. */
export interface PublicMemberRow {
  id: string;
  display_name: string | null;
  bio: string | null;
  zodiac_sign: string | null;
  avatar_url: string | null;
  followers: number;
  following: number;
  is_following: boolean;
  gender: string | null;
  sexuality: string | null;
  location: string | null;
  age: number | null;
}

/** Meus números e visibilidade na rede. */
export interface MySocial {
  social_visible: boolean;
  followers: number;
  following: number;
}

type RpcResult = { ok?: boolean; error?: string };

/** Perfil público de um membro (security definer, respeita visibilidade). */
export async function getPublicMember(userId: string): Promise<PublicMember> {
  const { data, error } = await supabase.rpc("get_public_member", {
    p_user_id: userId,
  });
  if (error) throw error;
  return (data as unknown as PublicMember) ?? { found: false };
}

/** Lista de membros com perfil público visível. */
export async function listPublicMembers(): Promise<PublicMemberRow[]> {
  const { data, error } = await supabase.rpc("list_public_members");
  if (error) throw error;
  return (data as unknown as PublicMemberRow[]) ?? [];
}

/** Segue um membro. */
export async function followMember(targetId: string): Promise<RpcResult> {
  const { data, error } = await supabase.rpc("follow_member", {
    p_target_id: targetId,
  });
  if (error) throw error;
  return (data ?? {}) as RpcResult;
}

/** Deixa de seguir um membro. */
export async function unfollowMember(targetId: string): Promise<RpcResult> {
  const { data, error } = await supabase.rpc("unfollow_member", {
    p_target_id: targetId,
  });
  if (error) throw error;
  return (data ?? {}) as RpcResult;
}

/** Meus seguidores/seguindo/visibilidade. */
export async function getMySocial(): Promise<MySocial> {
  const { data, error } = await supabase.rpc("get_my_social");
  if (error) throw error;
  return (data as unknown as MySocial) ?? {
    social_visible: true,
    followers: 0,
    following: 0,
  };
}

/** Liga/desliga a visibilidade do meu perfil na rede. */
export async function setSocialVisibility(visible: boolean): Promise<RpcResult> {
  const { data, error } = await supabase.rpc("set_social_visibility", {
    p_visible: visible,
  });
  if (error) throw error;
  return (data ?? {}) as RpcResult;
}
