import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/zodiac";
import { useUpdateAvatar } from "@/hooks/useProfile";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  uploadAvatar,
} from "@/services/profile";
import type { Profile } from "@/domain/models";

interface AvatarUploadProps {
  userId: string;
  profile: Profile | null;
  displayName: string | null;
}

export function AvatarUpload({ userId, profile, displayName }: AvatarUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const updateAvatar = useUpdateAvatar();
  const uploading = updateAvatar.isPending;

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!AVATAR_MIME_TYPES.has(file.type)) {
      setError(t("profile.avatarErrorType"));
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError(t("profile.avatarErrorSize"));
      return;
    }
    try {
      const url = await uploadAvatar(userId, file);
      await updateAvatar.mutateAsync({ userId, avatarUrl: url });
      toast.success(t("profile.avatarUploaded"));
    } catch {
      setError(t("profile.avatarErrorGeneric"));
    }
  };

  const initials = getInitials(displayName);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-gold/40 shadow-[0_0_30px_hsl(var(--gold)/0.2)]">
          <AvatarImage
            src={profile?.avatar_url ?? undefined}
            alt={t("profile.avatarAlt")}
          />
          <AvatarFallback className="bg-royal/50 font-cinzel text-3xl text-gold-gradient">
            {initials}
          </AvatarFallback>
        </Avatar>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          aria-label={t("profile.avatarUpload")}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <Upload className="h-4 w-4" strokeWidth={1.5} />
        )}
        {uploading ? t("profile.avatarUploading") : t("profile.avatarUpload")}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
