import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock, Send, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePublicMember } from "@/hooks/useSocial";
import { useMatchMessages, useSendMessage } from "@/hooks/useChat";
import { useAuth } from "@/hooks/auth-context";

/** Conversa privada entre dois membros — só visível com match (follow mútuo). */
export default function ChatRoomPage() {
  const { t } = useTranslation();
  const { userId = "" } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { data: member } = usePublicMember(userId);
  const { data: chat, isLoading } = useMatchMessages(userId);
  const sendMessage = useSendMessage(userId);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const matched = Boolean(chat?.matched);
  const messages = chat?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || !matched || sendMessage.isPending) return;
    try {
      await sendMessage.mutateAsync(text);
      setDraft("");
    } catch {
      toast.error(t("chat.sendError"));
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link
        to="/dashboard/chat"
        className="inline-flex w-fit items-center gap-2 font-jost text-[11px] uppercase tracking-[0.3em] text-gold/80 transition hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("chat.back")}
      </Link>

      <Card className="border-gold/20 bg-card">
        <CardContent className="flex flex-col gap-4 p-5 md:p-6">
          {/* Cabeçalho com o parceiro */}
          <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
            <Avatar className="h-10 w-10 shrink-0 border border-gold/30">
              {member?.avatar_url ? (
                <AvatarImage
                  src={member.avatar_url}
                  alt={member?.display_name ?? ""}
                  crossOrigin="anonymous"
                />
              ) : null}
              <AvatarFallback className="bg-royal/50 font-cinzel text-gold">
                {(member?.display_name ?? "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-cinzel text-lg text-cream">
                {member?.display_name ?? t("social.unnamed")}
              </p>
              <p className="font-jost text-[10px] uppercase tracking-[0.25em] text-cream/45">
                {member?.zodiac_sign
                  ? t(`zodiac.${member.zodiac_sign}`)
                  : t("profile.zodiacUnknown")}
              </p>
            </div>
            {matched && (
              <Sparkle className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            )}
          </div>

          {/* Sem match: bloqueado */}
          {!isLoading && !matched && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Lock className="h-7 w-7 text-gold/40" strokeWidth={1} />
              <p className="max-w-sm font-jost text-sm leading-relaxed text-cream/60">
                {t("chat.matchRequired")}
              </p>
            </div>
          )}

          {/* Mensagens */}
          {matched && (
            <>
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-9 w-1/2 bg-gold/10" />
                  <Skeleton className="h-9 w-2/3 self-end bg-gold/10" />
                </div>
              ) : messages.length === 0 ? (
                <p className="py-8 text-center font-jost text-sm text-cream/45">
                  {t("chat.noMessages")}
                </p>
              ) : (
                <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
                  {messages.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-md px-4 py-2.5 font-jost text-sm leading-relaxed tracking-wide ${
                            mine
                              ? "bg-gold text-navy-deep"
                              : "border border-gold/25 bg-navy/70 text-cream/90"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.content}</p>
                          <p
                            className={`mt-1 font-jost text-[9px] uppercase tracking-wider ${
                              mine ? "text-navy/60" : "text-cream/40"
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-3 border-t border-gold/10 pt-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submit();
                    }
                  }}
                  placeholder={t("chat.placeholder")}
                  className="min-h-11 min-w-0 flex-1 rounded-full border border-gold/25 bg-navy/60 px-5 py-3 font-jost text-sm tracking-wide text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!draft.trim() || sendMessage.isPending}
                  aria-label={t("chat.sendAria")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-navy-deep shadow-[0_0_18px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light disabled:opacity-50"
                >
                  <Send className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
