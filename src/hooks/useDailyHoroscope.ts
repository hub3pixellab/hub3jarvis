import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchDailyHoroscope } from "@/services/horoscope";

/** Horóscopo do dia do signo informado (fonte: Mestre Agnes). */
export function useDailyHoroscope(sign: string | null | undefined) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "pt-BR";
  return useQuery({
    queryKey: ["daily_horoscope", sign, lang],
    queryFn: () => fetchDailyHoroscope(sign as string, lang),
    enabled: Boolean(sign),
    staleTime: 60 * 60 * 1000,
  });
}
