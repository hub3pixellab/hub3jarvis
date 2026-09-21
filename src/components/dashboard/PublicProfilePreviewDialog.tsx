import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth-context";
import { usePublicMember } from "@/hooks/useSocial";

interface PublicProfilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Prévia do próprio perfil público — mostra exatamente o que os outros
 * membros veem na rede social. Abre ao habilitar a visibilidade.
 */
export function PublicProfilePreviewDialog({
  open,
  onOpenChange,
}: PublicProfilePreviewDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: member } = usePublicMember(user?.id);

  const name = member?.display_name ?? user?.email ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        <div className="flex flex-col gap-5 p-6 md:p-7">
          <div className="flex items-center gap-3 border-b border-gold/15 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                {t("social.previewEyebrow")}
              </p>
              <DialogTitle className="mt-1 font-cinzel text-xl text-cream">
                {t("social.previewTitle")}
              </DialogTitle>
            </div>
          </div>

          <p className="font-jost text-xs leading-relaxed text-cream/55">
            {t("social.previewHint")}
          </p>

          {/* Cartão público, como o membro veria */}
          <div className="rounded-md border border-gold/25 bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 shrink-0 border border-gold/30">
                {member?.avatar_url ? (
                  <AvatarImage
                    src={member.avatar_url}
                    alt={name}
                    crossOrigin="anonymous"
                  />
                ) : null}
                <AvatarFallback className="bg-royal/50 font-cinzel text-xl text-gold">
                  {(name || "?").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-cinzel text-lg text-cream">
                  {name || t("social.unnamed")}
                </p>
                <Badge className="mt-1 border-gold/50 bg-royal/40 px-3 py-0.5 font-jost text-[10px] uppercase tracking-[0.2em] text-gold">
                  {member?.zodiac_sign
                    ? t(`zodiac.${member.zodiac_sign}`)
                    : t("profile.zodiacUnknown")}
                </Badge>
              </div>
            </div>

            <div className="mt-4 border-t border-gold/10 pt-3">
              <p className="font-jost text-[10px] uppercase tracking-[0.3em] text-gold/80">
                {t("social.about")}
              </p>
              <p className="mt-1.5 whitespace-pre-line font-jost text-sm leading-relaxed text-cream/75">
                {member?.bio ?? t("social.noBio")}
              </p>
            </div>
          </div>

          <Link
            to={`/dashboard/membro/${user?.id}`}
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
          >
            {t("social.previewViewFull")}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PublicProfilePreviewDialog;
