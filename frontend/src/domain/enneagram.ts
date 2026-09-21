/**
 * Questionário do Eneagrama — 27 afirmativas (3 por tipo, tipos 1 a 9),
 * respondidas numa escala Likert de 1 a 5. A pontuação é calculada aqui
 * e enviada à IA junto com as respostas para a análise personalizada.
 */

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface EnneagramItem {
  /** id usado como chave de resposta e i18n (`eneagrama.q.<id>`). */
  id: string;
  /** Tipo 1..9 que a afirmativa mede. */
  type: number;
}

/** 27 afirmativas: 3 por tipo, cobrindo motivação, medo e estratégia. */
export const ENNEAGRAM_ITEMS: EnneagramItem[] = [
  { id: "t1_1", type: 1 },
  { id: "t1_2", type: 1 },
  { id: "t1_3", type: 1 },
  { id: "t2_1", type: 2 },
  { id: "t2_2", type: 2 },
  { id: "t2_3", type: 2 },
  { id: "t3_1", type: 3 },
  { id: "t3_2", type: 3 },
  { id: "t3_3", type: 3 },
  { id: "t4_1", type: 4 },
  { id: "t4_2", type: 4 },
  { id: "t4_3", type: 4 },
  { id: "t5_1", type: 5 },
  { id: "t5_2", type: 5 },
  { id: "t5_3", type: 5 },
  { id: "t6_1", type: 6 },
  { id: "t6_2", type: 6 },
  { id: "t6_3", type: 6 },
  { id: "t7_1", type: 7 },
  { id: "t7_2", type: 7 },
  { id: "t7_3", type: 7 },
  { id: "t8_1", type: 8 },
  { id: "t8_2", type: 8 },
  { id: "t8_3", type: 8 },
  { id: "t9_1", type: 9 },
  { id: "t9_2", type: 9 },
  { id: "t9_3", type: 9 },
];

export interface EnneagramScore {
  /** Soma por tipo (1..9). */
  byType: Record<number, number>;
  /** Tipo com maior pontuação. */
  dominant: number;
  /** Asa: vizinho do tipo dominante com maior pontuação (pode ser null). */
  wing: number | null;
  /** Ordem dos tipos por pontuação (maior primeiro). */
  ranking: number[];
}

/** Soma as respostas e calcula o tipo dominante + asa. */
export function scoreEnneagram(
  answers: Record<string, LikertValue>,
): EnneagramScore {
  const byType: Record<number, number> = {};
  for (const item of ENNEAGRAM_ITEMS) {
    const value = answers[item.id] ?? 1;
    byType[item.type] = (byType[item.type] ?? 0) + value;
  }
  const ranking = Object.keys(byType)
    .map(Number)
    .sort((a, b) => (byType[b] ?? 0) - (byType[a] ?? 0));
  const dominant = ranking[0];

  // Asa = vizinho do tipo dominante (dominant-1 ou dominant+1, em círculo 1-9)
  const prev = dominant === 1 ? 9 : dominant - 1;
  const next = dominant === 9 ? 1 : dominant + 1;
  const wing =
    (byType[next] ?? 0) > (byType[prev] ?? 0) ? next : prev;
  const wingOnly =
    wing === dominant
      ? null
      : wing;

  return { byType, dominant, wing: wingOnly, ranking };
}
