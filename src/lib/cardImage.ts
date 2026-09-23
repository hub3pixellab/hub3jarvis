/**
 * Gera a imagem do card de combinação (para post/story no Instagram) em canvas.
 * Dois formatos: post (1080x1350) e story (1080x1920).
 */

export interface CompatCardData {
  name1: string;
  name2: string;
  score: number;
  summary: string;
  advice?: string | null;
}

export type CardFormat = "post" | "story";

const GOLD = "#d4af37";
const CREAM = "#f5f0ff";
const MUTED = "#a89fc4";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Desenha o card e devolve o canvas (1080 de largura). */
export function renderCompatCard(
  data: CompatCardData,
  format: CardFormat,
): HTMLCanvasElement {
  const W = 1080;
  const H = format === "story" ? 1920 : 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Fundo
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0612");
  bg.addColorStop(1, "#160d24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Moldura dourada
  ctx.strokeStyle = "rgba(212,175,55,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  const centerX = W / 2;
  let y = format === "story" ? 240 : 190;

  // Marca
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = "600 30px Georgia, serif";
  ctx.fillText("M E S T R E   A G N E S", centerX, y);
  y += 46;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 120, y);
  ctx.lineTo(centerX + 120, y);
  ctx.stroke();
  y += 110;

  // Título: signo + signo
  ctx.fillStyle = CREAM;
  ctx.font = "700 74px Georgia, serif";
  ctx.fillText(data.name1, centerX, y);
  y += 66;
  ctx.fillStyle = GOLD;
  ctx.font = "700 54px Georgia, serif";
  ctx.fillText("+", centerX, y);
  y += 76;
  ctx.fillStyle = CREAM;
  ctx.font = "700 74px Georgia, serif";
  ctx.fillText(data.name2, centerX, y);
  y += 130;

  // Score
  ctx.fillStyle = GOLD;
  ctx.font = "700 132px Georgia, serif";
  ctx.fillText(`${data.score}%`, centerX, y);
  y += 52;

  // Barra
  const barW = W - 300;
  const barX = (W - barW) / 2;
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(barX, y, barW, 16);
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, "#9b30ff");
  grad.addColorStop(1, GOLD);
  ctx.fillStyle = grad;
  ctx.fillRect(barX, y, (barW * Math.max(0, Math.min(100, data.score))) / 100, 16);
  y += 96;

  // Resumo
  ctx.fillStyle = CREAM;
  ctx.font = "400 34px Georgia, serif";
  const summaryLines = wrapText(ctx, data.summary, W - 220);
  for (const line of summaryLines.slice(0, format === "story" ? 10 : 7)) {
    ctx.fillText(line, centerX, y);
    y += 50;
  }
  y += 24;

  // Conselho
  if (data.advice) {
    ctx.fillStyle = GOLD;
    ctx.font = "italic 400 32px Georgia, serif";
    const adviceLines = wrapText(ctx, `“${data.advice}”`, W - 260);
    for (const line of adviceLines.slice(0, 4)) {
      ctx.fillText(line, centerX, y);
      y += 46;
    }
  }

  // Rodapé
  ctx.fillStyle = MUTED;
  ctx.font = "400 26px Georgia, serif";
  ctx.fillText("mestreagnes.com  ·  @mestreagnes.br", centerX, H - 150);
  ctx.fillStyle = GOLD;
  ctx.font = "italic 400 30px Georgia, serif";
  ctx.fillText("— Mestre Agnes", centerX, H - 96);

  return canvas;
}

/** Baixa o card como PNG. */
export function downloadCompatCard(data: CompatCardData, format: CardFormat): void {
  const canvas = renderCompatCard(data, format);
  const link = document.createElement("a");
  link.download = `mestre-agnes-${format}-${data.name1}-${data.name2}.png`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .toLowerCase();
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** Converte o card em arquivo PNG (para o compartilhamento nativo). */
export function compatCardFile(
  data: CompatCardData,
  format: CardFormat,
): Promise<File | null> {
  const canvas = renderCompatCard(data, format);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(null);
      resolve(
        new File([blob], `mestre-agnes-${format}.png`, { type: "image/png" }),
      );
    }, "image/png");
  });
}
