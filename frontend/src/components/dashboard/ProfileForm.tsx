import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/auth-context";
import { getZodiacSign } from "@/lib/zodiac";
import { getChineseZodiacSign } from "@/lib/chineseZodiac";
import { computeAge } from "@/lib/age";
import { normalizePhone } from "@/lib/whatsapp";
import { languageOptions } from "@/i18n/config";
import type { Profile } from "@/domain/models";

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(60).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9\s()-]{10,20}$/.test(v), {
      message: "profile.errorPhone",
    })
    .optional()
    .or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  sexuality: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  locale: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;

/** Gêneros disponíveis (valores → i18n `profile.gender.*`). */
const GENDERS = ["homem", "mulher", "sem_genero"];

/** Sexualidades disponíveis (valores → i18n `profile.sexuality.*`). */
const SEXUALITIES = [
  "heterossexual",
  "homossexual",
  "bissexual",
  "pansexual",
  "assexual",
  "queer",
  "outro",
];

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, watch, setValue, formState } =
    useForm<ProfileValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        display_name: profile?.display_name ?? "",
        bio: profile?.bio ?? "",
        birth_date: profile?.birth_date ?? "",
        phone: profile?.phone ?? "",
        gender: profile?.gender ?? "",
        sexuality: profile?.sexuality ?? "",
        location: profile?.location ?? "",
        locale: profile?.locale ?? i18n.resolvedLanguage ?? "pt-BR",
      },
    });

  const birthDate = watch("birth_date");
  const derivedZodiac = getZodiacSign(birthDate || null);
  const derivedChineseZodiac = getChineseZodiacSign(birthDate || null);
  const age = computeAge(birthDate || null);

  const onSubmit = async (values: ProfileValues) => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        patch: {
          display_name: values.display_name || null,
          bio: values.bio || null,
          birth_date: values.birth_date || null,
          phone: values.phone ? normalizePhone(values.phone) : null,
          gender: values.gender || null,
          sexuality: values.sexuality || null,
          location: values.location || null,
          locale: values.locale,
        },
      });
      if (values.locale !== i18n.resolvedLanguage) {
        void i18n.changeLanguage(values.locale);
      }
      toast.success(t("profile.saved"));
    } catch {
      toast.error(t("profile.saveError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="display_name">{t("profile.displayNameLabel")}</Label>
          <Input
            id="display_name"
            placeholder={t("profile.displayNamePlaceholder")}
            className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
            {...register("display_name")}
          />
          {formState.errors.display_name && (
            <p className="text-xs text-destructive">
              {t("profile.errorDisplayName")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="birth_date">{t("profile.birthDateLabel")}</Label>
          <Input
            id="birth_date"
            type="date"
            className="border-gold/25 bg-navy/60 text-cream [color-scheme:dark] focus:border-gold"
            {...register("birth_date")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="locale">{t("profile.localeLabel")}</Label>
          <Select
            value={watch("locale")}
            onValueChange={(v) => setValue("locale", v)}
          >
            <SelectTrigger
              id="locale"
              className="w-full border-gold/25 bg-navy/60 text-cream focus:border-gold"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">{t("profile.phoneLabel")}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("profile.phonePlaceholder")}
            className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
            {...register("phone")}
          />
          {formState.errors.phone ? (
            <p className="text-xs text-destructive">{t("profile.errorPhone")}</p>
          ) : (
            <p className="text-[11px] text-cream/45">{t("profile.phoneHint")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">{t("profile.locationLabel")}</Label>
          <Input
            id="location"
            placeholder={t("profile.locationPlaceholder")}
            className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
            {...register("location")}
          />
          <p className="text-[11px] text-cream/45">{t("profile.locationHint")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("profile.ageLabel")}</Label>
          <div className="flex min-h-10 items-center rounded-md border border-gold/15 bg-navy/40 px-3 font-cinzel text-lg text-gold-gradient">
            {age !== null
              ? t("profile.ageValue", { count: age })
              : t("profile.zodiacUnknown")}
          </div>
          <p className="text-[11px] text-cream/45">{t("profile.ageHint")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gender">{t("profile.genderLabel")}</Label>
          <Select
            value={watch("gender")}
            onValueChange={(v) => setValue("gender", v)}
          >
            <SelectTrigger
              id="gender"
              className="w-full border-gold/25 bg-navy/60 text-cream focus:border-gold"
            >
              <SelectValue placeholder="…" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {t(`profile.gender.${g}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sexuality">{t("profile.sexualityLabel")}</Label>
          <Select
            value={watch("sexuality")}
            onValueChange={(v) => setValue("sexuality", v)}
          >
            <SelectTrigger
              id="sexuality"
              className="w-full border-gold/25 bg-navy/60 text-cream focus:border-gold"
            >
              <SelectValue placeholder="…" />
            </SelectTrigger>
            <SelectContent>
              {SEXUALITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`profile.sexuality.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aviso sobre gênero e a leitura */}
        {watch("gender") && (
          <div className="rounded-md border border-gold/30 bg-gold/5 px-4 py-3 sm:col-span-2">
            <p className="font-jost text-xs leading-relaxed text-gold">
              {t("profile.genderWarning")}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>{t("profile.zodiacLabel")}</Label>
          <div className="flex min-h-10 items-center rounded-md border border-gold/15 bg-navy/40 px-3 font-cinzel text-lg text-gold-gradient">
            {derivedZodiac ? t(`zodiac.${derivedZodiac}`) : t("profile.zodiacUnknown")}
          </div>
          <p className="text-[11px] text-cream/45">{t("profile.zodiacHint")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("profile.chineseZodiacLabel")}</Label>
          <div className="flex min-h-10 items-center rounded-md border border-gold/15 bg-navy/40 px-3 font-cinzel text-lg text-gold-gradient">
            {derivedChineseZodiac
              ? t(`chineseZodiac.${derivedChineseZodiac}`)
              : t("profile.zodiacUnknown")}
          </div>
          <p className="text-[11px] text-cream/45">{t("profile.chineseZodiacHint")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">{t("profile.bioLabel")}</Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder={t("profile.bioPlaceholder")}
          className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
          {...register("bio")}
        />
        {formState.errors.bio && (
          <p className="text-xs text-destructive">{t("profile.errorBio")}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button
          type="submit"
          disabled={updateProfile.isPending || formState.isSubmitting}
          className="bg-gold text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] hover:bg-gold-light"
        >
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.5} />
          )}
          {updateProfile.isPending ? t("profile.saving") : t("profile.save")}
        </Button>
      </div>
    </form>
  );
}
