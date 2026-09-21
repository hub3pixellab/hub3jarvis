import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessagesSquare, Sparkle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/hooks/useChat";

/** Painel de conversas: chat habilitado apenas com quem houve match. */
export default function ChatPage() {
  const { t } = useTranslation();
  const { data: conversations, isLoading } = useConversations();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-cinzel text-3xl text-cream md:text-4xl">
          {t("chat.title")}
        </h2>
        <p className="mt-2 max-w-xl font-jost text-sm font-light text-cream/60">
          {t("chat.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 bg-gold/10" />
          ))}
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {conversations.map((c) => (
            <Link
              key={c.partner_id}
              to={`/dashboard/chat/${c.partner_id}`}
              className="group block"
            >
              <Card className="border-gold/20 bg-card transition-colors group-hover:border-gold/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-11 w-11 shrink-0 border border-gold/30">
                    {c.avatar_url ? (
                      <AvatarImage
                        src={c.avatar_url}
                        alt={c.display_name ?? ""}
                        crossOrigin="anonymous"
                      />
                    ) : null}
                    <AvatarFallback className="bg-royal/50 font-cinzel text-lg text-gold">
                      {(c.display_name ?? "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-cinzel text-lg text-cream">
                        {c.display_name ?? t("social.unnamed")}
                      </p>
                      {c.unread > 0 && (
                        <Badge className="shrink-0 border-gold/50 bg-gold/15 px-2 py-0 font-jost text-[10px] text-gold">
                          {c.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate font-jost text-xs text-cream/55">
                      {c.matched
                        ? c.last_message ?? t("chat.noMessages")
                        : t("chat.matchRequiredShort")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <MessagesSquare className="h-9 w-9 text-gold/40" strokeWidth={1} />
          <p className="max-w-sm font-jost text-sm leading-relaxed text-cream/60">
            {t("chat.empty")}
          </p>
          <Link
            to="/dashboard/rede"
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
          >
            <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("chat.goNetwork")}
          </Link>
        </div>
      )}
    </div>
  );
}
