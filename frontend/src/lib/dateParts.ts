/**
 * Parseia uma data como { year, month, day } no CALENDÁRIO GREGORIANO LOCAL,
 * sem passar por `new Date(str)` — que interpreta strings "YYYY-MM-DD" como
 * meia-noite UTC e desloca o dia em fusos negativos (ex.: UTC-3 vira o dia
 * anterior às 21h, trocando Áries por Peixes).
 *
 * Aceita strings "YYYY-MM-DD" (o formato do <input type="date">) ou objetos Date
 * (neste caso usa os componentes locais do próprio objeto).
 */
export function parseDateParts(
  value: string | Date,
): { year: number; month: number; day: number } | null {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (
      !Number.isFinite(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }
    return { year, month, day };
  }
  if (Number.isNaN(value.getTime())) return null;
  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
  };
}
