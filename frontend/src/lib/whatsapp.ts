/**
 * Integração via link wa.me (sem API): gera um link do WhatsApp com a
 * mensagem pronta. Troque o número abaixo pelo WhatsApp do Mestre no formato
 * internacional (DDI + DDD + número), ex.: "5511999999999".
 */
export const MASTER_WHATSAPP_NUMBER = "5511999999999";

/** Remove tudo que não for dígito de um número de celular. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/** Monta um link wa.me com mensagem pré-preenchida. */
export function buildWhatsAppLink(
  phone = MASTER_WHATSAPP_NUMBER,
  message = "",
): string {
  const clean = normalizePhone(phone);
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Mensagens prontas usadas nos botões wa.me. */
export const WHATSAPP_MESSAGES = {
  /** O usuário pede a análise que comprou. */
  analysisRequest: (productName: string) =>
    `Olá, Mestre Agnes! Acabei de adquirir a análise "${productName}" e gostaria de recebê-la.`,
  /** O usuário faz uma das 3 perguntas liberadas. */
  questionRequest: (question: string) =>
    `Olá, Mestre Agnes! Tenho uma pergunta: ${question}`,
};
