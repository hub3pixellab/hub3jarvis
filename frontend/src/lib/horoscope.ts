import { ZODIAC_SIGNS, type ZodiacSignKey } from "@/domain/models";

/**
 * Horóscopo do dia gerado no navegador, sem backend e sem custo.
 * A leitura é composta por cinco partes traduzíveis:
 *   essência do signo + panorama do dia + amor + carreira + conselho
 * A escolha das partes é determinística (mesmo resultado durante todo o dia,
 * variando por signo), então cada signo recebe uma leitura diferente.
 */

const TONE_COUNT = 8;
const ADVICE_COUNT = 8;
const LOVE_COUNT = 8;
const CAREER_COUNT = 8;

export interface DailyHoroscope {
  sign: ZodiacSignKey;
  /** i18n key: horoscope.overview.<n> */
  overviewKey: string;
  /** i18n key: horoscope.love.<n> */
  loveKey: string;
  /** i18n key: horoscope.career.<n> */
  careerKey: string;
  /** i18n key: horoscope.advice.<n> */
  adviceKey: string;
  /** i18n key: horoscope.essence.<sign> */
  essenceKey: string;
  luckyNumbers: number[];
}

/** Dia do ano (1–366) em horário local, sem depender de UTC. */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000) + 1;
}

/** Hash determinístico e estável para sortear números da sorte. */
function hash(seed: number): number {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return (x ^= x >>> 16) >>> 0;
}

export function getDailyHoroscope(
  sign: ZodiacSignKey,
  date: Date = new Date(),
): DailyHoroscope {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  const day = dayOfYear(date);
  // Mistura signo e dia para que signos vizinhos não compartilhem a sequência.
  const seed = hash(day * 1009 + signIndex * 9176) % 1_000_000;

  // Offsets por signo para que cada signo receba um texto diferente.
  const overviewIndex = (day + signIndex) % TONE_COUNT;
  const loveIndex = (day + signIndex * 2 + 1) % LOVE_COUNT;
  const careerIndex = (day + signIndex * 3 + 2) % CAREER_COUNT;
  const adviceIndex = (day + signIndex * 5 + 2) % ADVICE_COUNT;

  const luckyNumbers: number[] = [];
  let cursor = seed;
  while (luckyNumbers.length < 3) {
    cursor = hash(cursor + 1);
    const n = (cursor % 60) + 1;
    if (!luckyNumbers.includes(n)) luckyNumbers.push(n);
  }

  return {
    sign,
    overviewKey: `horoscope.overview.${overviewIndex}`,
    loveKey: `horoscope.love.${loveIndex}`,
    careerKey: `horoscope.career.${careerIndex}`,
    adviceKey: `horoscope.advice.${adviceIndex}`,
    essenceKey: `horoscope.essence.${sign}`,
    luckyNumbers,
  };
}
