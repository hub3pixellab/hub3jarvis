/**
 * Compatibilidade entre signos por elemento (regra rápida, para filtros).
 * Fogo combina com fogo e ar; terra combina com terra e água.
 * É uma triagem de afinidade — a leitura profunda é a sinastria do Mestre.
 */
export type Element = "fire" | "earth" | "air" | "water";

export const SIGN_ELEMENT: Record<string, Element> = {
  aries: "fire",
  leo: "fire",
  sagittarius: "fire",
  taurus: "earth",
  virgo: "earth",
  capricorn: "earth",
  gemini: "air",
  libra: "air",
  aquarius: "air",
  cancer: "water",
  scorpio: "water",
  pisces: "water",
};

/** Elementos compatíveis com cada elemento. */
const COMPATIBLE: Record<Element, Element[]> = {
  fire: ["fire", "air"],
  air: ["air", "fire"],
  earth: ["earth", "water"],
  water: ["water", "earth"],
};

/** Retorna os signos considerados compatíveis com o signo informado. */
export function compatibleSigns(sign: string | null | undefined): string[] {
  if (!sign) return [];
  const element = SIGN_ELEMENT[sign];
  if (!element) return [];
  const allowed = COMPATIBLE[element];
  return Object.entries(SIGN_ELEMENT)
    .filter(([, el]) => allowed.includes(el))
    .map(([key]) => key);
}

/** Verifica se dois signos são compatíveis. */
export function areSignsCompatible(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  return compatibleSigns(a).includes(b);
}
