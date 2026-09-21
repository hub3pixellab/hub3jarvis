import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Eye, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/auth-context";
import { useMySocial, useSetVisibility } from "@/hooks/useSocial";

/**
 * Controle de visibilidade do perfil na rede social de membros.
 * Quando ativo, outros membros podem ver seu signo, nome e sobre.
 */
export function SocialVisibilityToggle() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: social } = useMySocial(Boolean(user));
  const setVisibility = useSetVisibility();

  const visible = social?.social_visible ?? true;

  const toggle = async () => {
    try {
      await setVisibility.mutateAsync(!visible);
      toast.success(
        t(visible ? "social.hidden" : "social.visible"),
      );
    } catch {
      toast.error(t("social.error"));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-gold/20 bg-navy/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
          <Eye className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <p className="font-jost text-sm text-cream/90">
            {t("social.visibilityTitle")}
          </p>
          <p className="font-jost text-xs leading-relaxed text-cream/50">
            {t("social.visibilityHint")}
          </p>
          <Link
            to={`/dashboard/membro/${user?.id}`}
            className="mt-2 inline-flex items-center gap-1.5 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:text-gold-light"
          >
            <UserRound className="h-3 w-3" strokeWidth={1.5} />
            {t("social.viewMyPage")}
          </Link>
        </div>
      </div>
      <Switch
        checked={visible}
        onCheckedChange={() => void toggle()}
        disabled={setVisibility.isPending}
        className="shrink-0 data-[state=checked]:bg-gold"
        aria-label={t("social.visibilityTitle")}
      />
    </div>
  );
}

export default SocialVisibilityToggle;
