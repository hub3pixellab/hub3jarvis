import type { ChineseZodiacSignKey } from "@/domain/models";

/** Ordem canônica do ciclo de 12 animais. */
export const CHINESE_ZODIAC_ORDER: ChineseZodiacSignKey[] = [
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
];

/**
 * Caractere chinês de cada animal — usado como arte do card, no lugar de
 * ilustrações (mantém o tema sem depender de imagens externas).
 */
export const CHINESE_ZODIAC_GLYPHS: Record<ChineseZodiacSignKey, string> = {
  rato: "鼠",
  boi: "牛",
  tigre: "虎",
  coelho: "兔",
  dragao: "龍",
  serpente: "蛇",
  cavalo: "馬",
  cabra: "羊",
  macaco: "猴",
  galo: "雞",
  cao: "狗",
  porco: "豬",
};

/** 2020 foi ano do Rato e o ciclo se repete a cada 12 anos. */
const RAT_YEAR = 2020;

/** Anos recentes regidos por cada animal (mais recente primeiro). */
export function getChineseZodiacYears(
  animal: ChineseZodiacSignKey,
  count = 3,
): number[] {
  const index = CHINESE_ZODIAC_ORDER.indexOf(animal);
  const latest = RAT_YEAR + index;
  return Array.from({ length: count }, (_, i) => latest - i * 12);
}
