import { jsPDF } from "jspdf";

interface AnalysisPdfInput {
  title: string;
  content: string;
  /** Data da entrega (ISO) — opcional. */
  date?: string | null;
  /** Linha de crédito ("Gerado por ...") — opcional. */
  credit?: string | null;
}

/** Limpa a marcação Markdown para o texto ficar legível no PDF. */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*/g, "$1$2")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\|.*\|\s*$/gm, (line) =>
      line
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .join("   "),
    )
    .replace(/^\s*[|\-:\s]{3,}$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Gera e baixa um PDF elegante com o resultado da análise. */
export function downloadAnalysisPdf({
  title,
  content,
  date,
  credit,
}: AnalysisPdfInput): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const gold: [number, number, number] = [176, 141, 68];
  const ink: [number, number, number] = [38, 38, 46];
  const muted: [number, number, number] = [128, 128, 138];

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Cabeçalho da marca
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("MESTRE AGNES", margin, y);
  y += 8;
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.text(title, margin, y);
  y += 20;

  // Data + crédito
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  const metaLine = [date, credit].filter(Boolean).join("  ·  ");
  if (metaLine) {
    doc.text(metaLine, margin, y);
    y += 18;
  }
  y += 8;

  // Corpo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(ink[0], ink[1], ink[2]);
  const lineHeight = 16;
  const paragraphs = cleanMarkdown(content).split("\n");

  for (const rawLine of paragraphs) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      y += lineHeight * 0.6;
      continue;
    }
    const wrapped = doc.splitTextToSize(line, maxWidth) as string[];
    for (const chunk of wrapped) {
      ensureSpace(lineHeight);
      doc.text(chunk, margin, y);
      y += lineHeight;
    }
  }

  // Rodapé com numeração
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p += 1) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(
      `mestreagnes.com  ·  ${p}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 24,
      { align: "center" },
    );
  }

  const safeName = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  doc.save(`mestre-agnes-${safeName || "analise"}.pdf`);
}
