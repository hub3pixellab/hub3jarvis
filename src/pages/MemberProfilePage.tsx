import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Lock,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Share2,
  Sparkle,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth-context";
import { usePublicMember, useToggleFollow } from "@/hooks/useSocial";
import { buildWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

/**
 * Perfil público de um membro na rede social. Mostra nome, signo e "sobre"
 * liberados pelo usuário, com seguir/seguidores, compartilhar e contato.
 */
export default function MemberProfilePage() {
  const { t } = useTranslation();
  const { userId = "" } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { data: member, isLoading } = usePublicMember(userId);
  const toggleFollow = useToggleFollow();

  const isSelf = member?.is_self;

  const share = async () => {
    const url = `${window.location.origin}/dashboard/membro/${userId}`;
    const data = {
      title: t("social.shareTitle"),
      text: t("social.shareText", {
        name: member?.display_name ?? "",
      }),
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("social.linkCopied"));
      }
    } catch {
      // compartilhamento cancelado
    }
  };

  const toggle = async () => {
    try {
      await toggleFollow.mutateAsync({
        targetId: userId,
        following: Boolean(member?.is_following),
      });
    } catch {
      toast.error(t("social.error"));
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        to="/dashboard/rede"
        className="inline-flex w-fit items-center gap-2 font-jost text-[11px] uppercase tracking-[0.3em] text-gold/80 transition hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("social.backToNetwork")}
      </Link>

      {isLoading ? (
        <Card className="border-gold/20 bg-card">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <Skeleton className="h-24 w-24 rounded-full bg-gold/10" />
            <Skeleton className="h-6 w-40 bg-gold/10" />
            <Skeleton className="h-4 w-56 bg-gold/10" />
          </CardContent>
        </Card>
      ) : !member?.found ? (
        <Card className="border-gold/20 bg-card">
          <CardContent className="py-14 text-center">
            <p className="font-jost text-sm text-cream/60">
              {t("social.notFound")}
            </p>
          </CardContent>
        </Card>
      ) : member.hidden ? (
        <Card className="border-gold/20 bg-card">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Users className="h-8 w-8 text-gold/40" strokeWidth={1} />
            <p className="max-w-sm font-jost text-sm text-cream/60">
              {t("social.hiddenProfile")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gold/20 bg-card">
          <CardContent className="flex flex-col gap-6 p-6 md:p-8">
            {/* Cabeçalho: avatar + nome + signo */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <Avatar className="h-24 w-24 shrink-0 border-2 border-gold/40">
                {member.avatar_url ? (
                  <AvatarImage
                    src={member.avatar_url}
                    alt={member.display_name ?? ""}
                    crossOrigin="anonymous"
                  />
                ) : null}
                <AvatarFallback className="bg-royal/50 font-cinzel text-3xl text-gold">
                  {(member.display_name ?? "?").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="font-cinzel text-2xl text-cream md:text-3xl">
                  {member.display_name ?? t("social.unnamed")}
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge className="border-gold/50 bg-royal/40 px-3 py-1 font-jost text-xs uppercase tracking-[0.2em] text-gold">
                    {member.zodiac_sign
                      ? t(`zodiac.${member.zodiac_sign}`)
                      : t("profile.zodiacUnknown")}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.2em] text-cream/50">
                    <Sparkle className="h-3 w-3 text-gold/60" strokeWidth={1.5} />
                    {t("social.followers", { count: member.followers ?? 0 })}
                    <span className="text-cream/30">·</span>
                    {t("social.following", { count: member.following ?? 0 })}
                  </span>
                </div>

                {/* Idade, localidade, gênero e sexualidade (informações liberadas) */}
                {(member.age != null ||
                  member.location ||
                  member.gender ||
                  member.sexuality) && (
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
                    {member.age != null && (
                      <span className="inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.2em] text-cream/45">
                        <CalendarDays className="h-3 w-3 text-gold/60" strokeWidth={1.5} />
                        {t("profile.ageValue", { count: member.age })}
                      </span>
                    )}
                    {member.location && (
                      <span className="inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.2em] text-cream/45">
                        <MapPin className="h-3 w-3 text-gold/60" strokeWidth={1.5} />
                        {member.location}
                      </span>
                    )}
                    {member.gender && (
                      <span className="font-jost text-[10px] uppercase tracking-[0.2em] text-cream/45">
                        {t(`profile.gender.${member.gender}`)}
                      </span>
                    )}
                    {member.sexuality && (
                      <span className="font-jost text-[10px] uppercase tracking-[0.2em] text-cream/45">
                        {t(`profile.sexuality.${member.sexuality}`)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sobre */}
            <div className="border-t border-gold/10 pt-5">
              <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
                {t("social.about")}
              </p>
              <p className="mt-2 whitespace-pre-line font-jost text-sm leading-relaxed text-cream/75">
                {member.bio ?? t("social.noBio")}
              </p>
            </div>

            {/* Ações */}
            {!isSelf && (
              <div className="flex flex-wrap items-center gap-3 border-t border-gold/10 pt-5">
                <button
                  type="button"
                  onClick={() => void toggle()}
                  disabled={toggleFollow.isPending}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] transition disabled:opacity-60 ${
                    member.is_following
                      ? "border border-gold/50 text-gold hover:bg-gold/10"
                      : "bg-gold text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] hover:bg-gold-light"
                  }`}
                >
                  {member.is_following ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t("social.following")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t("social.follow")}
                    </>
                  )}
                </button>

                <a
                  href={buildWhatsAppLink(
                    undefined,
                    WHATSAPP_MESSAGES.questionRequest(
                      t("social.hello", { name: member.display_name ?? "" }),
                    ),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t("social.contact")}
                </a>

                {/* Chat privado: habilitado apenas com match (follow mútuo) */}
                {member.matched ? (
                  <Link
                    to={`/dashboard/chat/${member.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] transition hover:bg-gold-light"
                  >
                    <MessagesSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {t("chat.start")}
                  </Link>
                ) : (
                  <span
                    aria-disabled
                    title={t("chat.matchRequiredShort")}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/20 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-cream/35"
                  >
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {t("chat.locked")}
                  </span>
                )}
              </div>
            )}

            {isSelf && (
              <div className="flex flex-wrap items-center gap-3 border-t border-gold/10 pt-5">
                <span className="font-jost text-xs italic text-cream/50">
                  {t("social.selfView")}
                </span>
              </div>
            )}

            {/* Compartilhar */}
            <div className="flex items-center justify-end gap-2 border-t border-gold/10 pt-4">
              <button
                type="button"
                onClick={() => void share()}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold/80 transition hover:text-gold"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t("social.share")}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
