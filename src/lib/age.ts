/**
 * Idade a partir de uma data ISO (YYYY-MM-DD), sem depender de UTC.
 * Usa o parse manual para não deslocar o dia em fusos negativos.
 */
export function computeAge(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month < m || (month === m && day < d)) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}
