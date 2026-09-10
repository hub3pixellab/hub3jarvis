// =====================================================================
// agnesApi.ts — cliente do backend Mestre Agnes (Render)
// Autenticacao: chave intermediaria via header x-api-key.
// A chave vem de VITE_API_KEY (env do build) — nunca hardcoded aqui.
// =====================================================================

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://agnes-backend.onrender.com";
const API_KEY = (import.meta.env.VITE_API_KEY as string | undefined) ?? "";

export const STORAGE_DADOS = "agnes:dados";

async function request(path: string, body?: object, metodo: "POST" | "GET" = "POST") {
  const res = await fetch(`${API_URL}${path}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${res.status} ao conectar com o Mestre Agnes`);
  }
  return res.json();
}

// Gera o relatorio (nome + data de nascimento) e retorna o texto completo.
export async function gerarRelatorio(dados: { nome: string; data_nascimento: string; signo?: string; foco?: string }) {
  return request("/api/agnes/relatorio", dados);
}

// Gera e baixa o PDF do relatorio.
export async function baixarPdf(dados: { nome: string; data_nascimento: string; signo?: string; foco?: string }) {
  const res = await fetch(`${API_URL}/api/agnes/relatorio/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${res.status} ao gerar o PDF`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio-mestre-agnes.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Abre a apresentacao estilo Gamma (HTML navegavel) do relatorio em nova aba.
export async function abrirApresentacao(dados: { nome: string; data_nascimento: string; signo?: string; foco?: string }) {
  const res = await fetch(`${API_URL}/api/agnes/relatorio/apresentacao`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${res.status} ao gerar a apresentacao`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// Cria a sessao de checkout no Stripe e retorna { checkout_url, session_id }.
export async function checkout(dados: {
  nome: string;
  data_nascimento: string;
  signo?: string;
  foco?: string;
  email?: string;
  price_id?: string;
}) {
  return request("/api/agnes/checkout", dados);
}

// Consulta o status de pagamento de uma sessao.
export async function statusCheckout(sessionId: string) {
  return request(`/api/agnes/checkout/${encodeURIComponent(sessionId)}`, undefined, "GET");
}

// Chat do terminal (Mestre Agnes responde).
export async function conversar(mensagem: string) {
  return request("/api/agnes/conselho", { mensagem });
}

// Analise de eneagrama.
export async function analisarEneagrama(mensagem: string, foco_analise?: string) {
  return request("/api/agnes/eneagrama", { mensagem, foco_analise });
}

// Analise de compatibilidade entre pessoas.
export async function analisarCompatibilidade(pessoas: unknown[], foco_analise?: string) {
  return request("/api/agnes/compatibilidade", { pessoas, foco_analise });
}
