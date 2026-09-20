import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ScrollText, Crown, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { PurchasesDialog } from "@/components/dashboard/PurchasesDialog";
import { SubscriptionDialog } from "@/components/dashboard/SubscriptionDialog";
import { SocialVisibilityToggle } from "@/components/dashboard/SocialVisibilityToggle";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const [purchasesOpen, setPurchasesOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  const shareProfile = async () => {
    const url = `${window.location.origin}/dashboard/membro/${user?.id}`;
    const data = {
      title: t("social.shareTitle"),
      text: t("social.shareText", {
        name: profile?.display_name ?? user?.email ?? "",
      }),
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        alert(t("social.linkCopied"));
      }
    } catch {
      // usuário cancelou ou clipboard indisponível
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        to="/dashboard"
        className="inline-flex w-fit items-center gap-2 font-jost text-[11px] uppercase tracking-[0.3em] text-gold/80 transition hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("dashboard.backToOverview")}
      </Link>

      <Card className="border-gold/20 bg-card">
        <CardHeader className="border-b border-gold/10 pb-4">
          <CardTitle className="font-cinzel text-2xl text-cream">
            {t("profile.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 p-6 md:p-8">
          <div className="flex flex-col items-center gap-3 border-b border-gold/10 pb-8 sm:flex-row sm:gap-6">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full bg-gold/10" />
            ) : (
              <AvatarUpload
                userId={user?.id ?? ""}
                profile={profile}
                displayName={profile?.display_name ?? null}
              />
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-cinzel text-xl text-cream">
                {profile?.display_name ?? user?.email}
              </p>
              <p className="font-jost text-sm text-cream/50">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void shareProfile()}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold/50 px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t("social.share")}
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 bg-gold/10" />
              <Skeleton className="h-10 bg-gold/10" />
              <Skeleton className="h-24 bg-gold/10" />
            </div>
          ) : (
            <ProfileForm profile={profile} />
          )}

          {/* Rede social: visibilidade + atalhos */}
          <div className="flex flex-col gap-3 border-t border-gold/10 pt-6">
            <SocialVisibilityToggle />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPurchasesOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 bg-navy/40 px-4 py-3 font-jost text-[11px] uppercase tracking-[0.25em] text-cream transition hover:border-gold hover:bg-gold/10"
              >
                <ScrollText className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {t("profile.purchasesCta")}
              </button>
              <button
                type="button"
                onClick={() => setSubscriptionOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 bg-navy/40 px-4 py-3 font-jost text-[11px] uppercase tracking-[0.25em] text-cream transition hover:border-gold hover:bg-gold/10"
              >
                <Crown className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {t("profile.subscriptionCta")}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PurchasesDialog open={purchasesOpen} onOpenChange={setPurchasesOpen} />
      <SubscriptionDialog
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
      />
    </div>
  );
}
