/**
 * Domain models for the Mestre Agnes user area.
 * Stable, framework-independent types — future modules (social, matches,
 * real-time chat) build on top of these without rewriting the dashboard.
 */

export type AnalysisStatus = "pendente" | "pago" | "cancelado";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  birth_date: string | null;
  zodiac_sign: string | null;
  avatar_url: string | null;
  locale: string;
  /** WhatsApp do usuário (somente dígitos, DDI+DDD+número) — usado na conexão com o terminal. */
  phone: string | null;
  /** Gênero declarado (usado na leitura astrológica): homem, mulher, sem_genero. */
  gender: string | null;
  /** Sexualidade declarada: heterossexual, homossexual, bissexual, pansexual, assexual, queer, outro. */
  sexuality: string | null;
  /** Se o perfil está visível para outros membros na rede social. */
  social_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchasedAnalysis {
  id: string;
  user_id: string;
  product_name: string;
  price_centavos: number;
  status: AnalysisStatus;
  purchased_at: string;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
}

/** Zodiac sign keys — values match the `zodiac.*` i18n keys. */
export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type ZodiacSignKey = (typeof ZODIAC_SIGNS)[number];

/** Chinese zodiac animal keys — values match the `chineseZodiac.*` i18n keys. */
export const CHINESE_ZODIAC_SIGNS = [
  "rato",
  "boi",
  "tigre",
  "coelho",
  "dragao",
  "serpente",
  "cavalo",
  "cabra",
  "macaco",
  "galo",
  "cao",
  "porco",
] as const;

export type ChineseZodiacSignKey = (typeof CHINESE_ZODIAC_SIGNS)[number];
