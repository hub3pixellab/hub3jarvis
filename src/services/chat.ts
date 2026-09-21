import { supabase } from "@/integrations/supabase/client";

/** Mensagem do chat privado entre dois membros com match. */
export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

/** Conversa listada no painel de chat. */
export interface Conversation {
  partner_id: string;
  display_name: string | null;
  avatar_url: string | null;
  zodiac_sign: string | null;
  matched: boolean;
  last_message: string | null;
  last_at: string | null;
  unread: number;
}

export interface MatchMessagesResult {
  matched: boolean;
  messages: ChatMessage[];
}

/** Lista minhas conversas (apenas com quem houve match). */
export async function getMyConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase.rpc("get_my_conversations");
  if (error) throw error;
  return (data as unknown as Conversation[]) ?? [];
}

/** Mensagens do chat com um parceiro (valida match e marca como lidas). */
export async function getMatchMessages(
  partnerId: string,
): Promise<MatchMessagesResult> {
  const { data, error } = await supabase.rpc("get_match_messages", {
    p_partner_id: partnerId,
  });
  if (error) throw error;
  return (data as unknown as MatchMessagesResult) ?? {
    matched: false,
    messages: [],
  };
}

/** Envia uma mensagem para um parceiro (só funciona com match). */
export async function sendMatchMessage(
  partnerId: string,
  content: string,
): Promise<ChatMessage> {
  const { data, error } = await supabase.rpc("send_match_message", {
    p_partner_id: partnerId,
    p_content: content,
  });
  if (error) throw error;
  const res = (data ?? {}) as { ok?: boolean; error?: string; message?: ChatMessage };
  if (!res.ok) {
    throw new Error(res.error ?? "Erro ao enviar");
  }
  return res.message as ChatMessage;
}
