import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

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
            <div className="text-center sm:text-left">
              <p className="font-cinzel text-xl text-cream">
                {profile?.display_name ?? user?.email}
              </p>
              <p className="font-jost text-sm text-cream/50">{user?.email}</p>
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
