import { supabase } from "@/integrations/supabase/client";

/** Horóscopo do dia vindo do Mestre Agnes (mesma fonte dos cards). */
export interface DailyHoroscopeReading {
  sign: string;
  lang: string;
  day: string;
  essence: string;
  panorama: string;
  love: string;
  career: string;
  advice: string;
  lucky_numbers: string[];
  lucky_color: string;
  cached: boolean;
  source: string;
}

/**
 * Busca o horóscopo do dia na fonte do Mestre Agnes (backend function).
 * O conteúdo é cacheado por signo+idioma+dia.
 */
export async function fetchDailyHoroscope(
  sign: string,
  lang: string,
): Promise<DailyHoroscopeReading> {
  const { data, error } = await supabase.functions.invoke("daily-horoscope", {
    body: { sign, lang },
  });
  if (error) {
    throw new Error((data as { error?: string } | null)?.error ?? error.message);
  }
  return data as DailyHoroscopeReading;
}
