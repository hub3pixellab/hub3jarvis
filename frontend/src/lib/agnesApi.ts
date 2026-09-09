// =====================================================================
// agnesApi.ts — cliente do backend Mestre Agnes (Render)
// Segurança: token de sessão curta via POST /api/agnes/session.
// NENHUMA chave secreta fica neste arquivo ou no bundle do site.
// =====================================================================

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://agnes-backend.onrender.com";

export const STORAGE_DADOS = "agnes:dados";

type Sessao = { token: string; expiraEm: number };
let sessaoCache: Sessao | null = null;

async function obterToken(): Promise<string> {
  const agora = Date.now() / 1000;
  if (sessaoCache && sessaoCache.expiraEm - agora > 60) return sessaoCache.token;
  const res = await fetch(`${API_URL}/api/agnes/session`, { method: "POST" });
  if (!res.ok) throw new Error("Falha ao iniciar sessão com o Mestre Agnes");
  const data = await res.json();
  sessaoCache = { token: data.token, expiraEm: data.expira_em };
  return data.token;
}

async function request(path: string, body?: object, metodo: "POST" | "GET" = "POST") {
  const token = await obterToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${res.status} ao conectar com o Mestre Agnes`);
  }
  return res.json();
}

export async function conversar(mensagem: string, historico: unknown[] = []) {
  const data = await request("/api/Mestre%20Agnes/conversar", { mensagem, historico });
  return data.resposta_MestreAgnes ?? data.resposta ?? data.message ?? JSON.stringify(data);
}

export async function gerarRelatorio(dados: {
  nome: string;
  data_nascimento: string;
  hora_nascimento?: string;
  cidade_nascimento?: string;
  signo?: string;
  foco?: string;
}) {
  const data = await request("/api/agnes/relatorio", dados);
  return data.relatorio ?? data;
}

export async function gerarPDF(dados: { nome: string; data_nascimento: string; signo?: string; foco?: string }) {
  const token = await obterToken();
  const res = await fetch(`${API_URL}/api/agnes/relatorio/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erro ao gerar o PDF");
  }
  return res.blob();
}

export async function checkout(dados: { nome: string; data_nascimento: string; signo?: string; foco?: string; email?: string }) {
  // NÃO envia success_url/cancel_url — o backend usa FRONTEND_URL (env var no Render).
  const data = await request("/api/agnes/checkout", dados);
  return data as { checkout_url: string; session_id?: string };
}

export async function statusCheckout(sessionId: string) {
  return request(`/api/agnes/checkout/${encodeURIComponent(sessionId)}`, undefined, "GET");
}

export async function eneagrama(mensagem: string, foco_analise?: string) {
  const data = await request("/api/agnes/eneagrama", { mensagem, foco_analise });
  return data.resposta ?? data;
}

export async function compatibilidade(pessoas: string[], foco_analise?: string) {
  const data = await request("/api/agnes/compatibilidade", { pessoas, foco_analise });
  return data.resposta ?? data;
}

export async function conselho(dados: { nome: string; data_nascimento: string }) {
  const data = await request("/api/agnes/conselho", dados);
  return data.conselho ?? data;
}
