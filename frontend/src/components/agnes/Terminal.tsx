import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Sparkles } from "lucide-react";
import { conversar } from "@/lib/agnesApi";

type Mensagem = { autor: "agnes" | "voce"; texto: string };
type Pendencia = { signo?: string } | null;

const SUGESTOES = [
  "O que os astros revelam sobre mim hoje?",
  "Qual é o meu propósito de vida?",
  "Me conte sobre o meu número",
  "Como está minha energia essa semana?",
];

const SAUDACAO =
  "Bem-vindo(a), buscador(a). Eu sou o Mestre Agnes. Os astros e os números já estão alinhados — pergunte o que seu coração deseja saber. Digite seu signo ou sua data de nascimento para ver o horóscopo do dia, ou faça qualquer pergunta para uma análise completa.";

const SIGNOS: { nome: string; chaves: string[] }[] = [
  { nome: "Áries", chaves: ["áries", "aries"] },
  { nome: "Touro", chaves: ["touro"] },
  { nome: "Gêmeos", chaves: ["gêmeos", "gemeos"] },
  { nome: "Câncer", chaves: ["câncer", "cancer"] },
  { nome: "Leão", chaves: ["leão", "leao"] },
  { nome: "Virgem", chaves: ["virgem"] },
  { nome: "Libra", chaves: ["libra"] },
  { nome: "Escorpião", chaves: ["escorpião", "escorpiao"] },
  { nome: "Sagitário", chaves: ["sagitário", "sagitario"] },
  { nome: "Capricórnio", chaves: ["capricórnio", "capricornio"] },
  { nome: "Aquário", chaves: ["aquário", "aquario"] },
  { nome: "Peixes", chaves: ["peixes"] },
];

const FAQS = [
  {
    chaves: ["quanto custa", "preço", "preco", "valor", "plano", "custa"],
    resposta:
      "O valor do seu mapa pessoal completo está disponível na seção de planos, logo abaixo. Você escolhe o plano ideal para sua jornada e paga com segurança via Stripe.",
  },
  {
    chaves: ["como funciona", "como recebo", "como faço", "como faco", "como funciona"],
    resposta:
      "É simples: você escolhe um plano, preenche seu nome e data de nascimento, faz o pagamento seguro e, na página de sucesso, clica em \"Gerar e baixar\" para receber seu mapa pessoal na hora.",
  },
  {
    chaves: ["seguro", "stripe", "pagamento seguro", "confiável", "confiavel"],
    resposta:
      "Sim, totalmente seguro. Usamos o Stripe Checkout, com segurança de nível bancário e compliance PCI DSS. Nenhum dado sensível passa pelos nossos servidores.",
  },
  {
    chaves: ["o que é", "o que e", "quem é", "quem e", "sobre o mestre"],
    resposta:
      "Eu sou o Mestre Agnes, um mestre virtual que une astrologia, numerologia e eneagrama com Inteligência Artificial para gerar um mapa pessoal único, baseado no seu nome e data de nascimento.",
  },
  {
    chaves: ["eneagrama"],
    resposta:
      "O eneagrama é um sistema de nove tipos de personalidade que revela seus padrões de comportamento, motivações profundas e caminhos de crescimento. Eu o uso para enriquecer sua análise com uma visão mais completa de quem você é.",
  },
];

const HOROSCOPO: Record<string, string> = {
  "Áries": "Sua energia está em alta hoje, Áries. Marte te impulsiona a agir, mas cuidado com a impulsividade. É um bom dia para iniciar projetos e liderar, desde que você respire antes de responder.",
  "Touro": "Hoje pede estabilidade, Touro. Vênus favorece suas relações e seu conforto. Aproveite para cuidar do que é seu, mas evite rigidez diante de mudanças que chegam como convites.",
  "Gêmeos": "Sua mente está ágil, Gêmeos. Comunicação favorecida, ideias novas e conexões. Cuidado apenas para não dispersar sua energia em muitas frentes ao mesmo tempo.",
  "Câncer": "As emoções estão à flor da pele, Câncer. A Lua pede acolhimento: cuide de si e dos seus. Um momento propício para fortalecer laços e ouvir sua intuição.",
  "Leão": "O brilho é seu hoje, Leão. O Sol te dá carisma e presença. Um ótimo dia para se destacar e inspirar, sem esquecer de dar espaço para os outros brilharem também.",
  "Virgem": "Dia de organização, Virgem. Mercúrio favorece o detalhe, o planejamento e a ordem. Aproveite para colocar a vida em dia, mas sem se cobrar perfeição.",
  "Libra": "Harmonia é a palavra, Libra. Vênus favorece parcerias e equilíbrio. Um bom dia para resolver conflitos com diplomacia e buscar o que traz paz.",
  "Escorpião": "Sua intensidade está em foco, Escorpião. Plutão convida à transformação profunda. Dia para mergulhar no que importa e soltar o que já não te serve.",
  "Sagitário": "Expansão no ar, Sagitário. Júpiter abre horizontes: novos aprendizados, viagens ou ideias. Aventure-se, mas mantenha os pés no chão nas decisões práticas.",
  "Capricórnio": "Foco e disciplina, Capricórnio. Saturno premia o esforço consistente. Um bom dia para avançar em metas de longo prazo com paciência e estrutura.",
  "Aquário": "Sua mente inovadora brilha, Aquário. Urano traz insights originais e vontade de mudança. Dia para pensar fora da caixa e se conectar com causas que importam.",
  "Peixes": "Sensibilidade em alta, Peixes. Netuno amplia sua intuição e criatividade. Dia para sonhar, criar e se conectar com o espiritual, sem se perder em ilusões.",
};

function horoscopoDoDia(signo: string): string {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
  const base = HOROSCOPO[signo] ?? "Os astros hoje te convidam a olhar para dentro e seguir com confiança.";
  return `☀️ Horóscopo de ${signo} — ${hoje}:\n\n${base}\n\nSe quiser ir mais fundo, me diga e eu posso fazer uma análise completa do seu mapa.`;
}

const Terminal = () => {
  const { t } = useTranslation();
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ autor: "agnes", texto: SAUDACAO }]);
  const [texto, setTexto] = useState("");
  const [digitando, setDigitando] = useState(false);
  const [pendencia, setPendencia] = useState<Pendencia>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, digitando]);

  function detectarSigno(txt: string): string | null {
    const lower = txt.toLowerCase();
    for (const s of SIGNOS) {
      if (s.chaves.some((c) => lower.includes(c))) return s.nome;
    }
    return null;
  }

  function detectarFaq(txt: string): string | null {
    const lower = txt.toLowerCase();
    const faq = FAQS.find((f) => f.chaves.some((c) => lower.includes(c)));
    return faq ? faq.resposta : null;
  }

  async function enviar(pergunta?: string) {
    const textoFinal = (pergunta ?? texto).trim();
    if (!textoFinal || digitando) return;
    setTexto("");
    setMensagens((m) => [...m, { autor: "voce", texto: textoFinal }]);

    // Se há uma pendência (escolha após signo/data), interpreta a resposta
    if (pendencia) {
      const escolha = textoFinal.toLowerCase();
      const { signo } = pendencia;
      setPendencia(null);
      const querBasico =
        escolha === "1" ||
        escolha.includes("básico") || escolha.includes("basico") ||
        escolha.includes("horóscopo") || escolha.includes("horoscopo") ||
        escolha.includes("dia") || escolha.includes("rápido") || escolha.includes("rapido");
      if (querBasico) {
        setMensagens((m) => [...m, { autor: "agnes", texto: horoscopoDoDia(signo!) }]);
        return;
      }
      // Análise completa
      setDigitando(true);
      try {
        const resposta = await conversar(textoFinal);
        setMensagens((m) => [...m, { autor: "agnes", texto: resposta }]);
      } catch (e) {
        setMensagens((m) => [
          ...m,
          { autor: "agnes", texto: e instanceof Error ? e.message : "Os astros estão confusos neste momento... tente novamente." },
        ]);
      } finally {
        setDigitando(false);
      }
      return;
    }

    // 1) FAQ
    const faqResposta = detectarFaq(textoFinal);
    if (faqResposta) {
      setMensagens((m) => [...m, { autor: "agnes", texto: faqResposta }]);
      return;
    }

    // 2) Signo ou data → pergunta o que o usuário quer
    const signo = detectarSigno(textoFinal);
    const temData = /\d{1,2}\/\d{1,2}/.test(textoFinal);
    if (signo || temData) {
      const alvo = signo ?? "seu signo";
      setPendencia({ signo: signo ?? undefined });
      setMensagens((m) => [
        ...m,
        {
          autor: "agnes",
          texto: `Detectei ${alvo}. O que você deseja?\n\n1️⃣ Ver o horóscopo do dia (resposta rápida)\n2️⃣ Fazer uma análise completa do seu mapa`,
        },
      ]);
      return;
    }

    // 3) Análise completa
    setDigitando(true);
    try {
      const resposta = await conversar(textoFinal);
      setMensagens((m) => [...m, { autor: "agnes", texto: resposta }]);
    } catch (e) {
      setMensagens((m) => [
        ...m,
        { autor: "agnes", texto: e instanceof Error ? e.message : "Os astros estão confusos neste momento... tente novamente." },
      ]);
    } finally {
      setDigitando(false);
    }
  }

  return (
    <section id="terminal" className="relative overflow-hidden bg-navy-deep py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-10" />
        <div className="absolute left-1/2 top-1/2 h-96 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/20 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              {t("terminal.eyebrow")}
            </span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="mt-6 font-cinzel text-4xl leading-tight text-cream md:text-5xl">
            {t("terminal.title1")} <span className="italic text-gold-gradient">{t("terminal.title2")}</span>
          </h2>
          <p className="mt-4 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            {t("terminal.subtitle")}
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-md border border-gold/25 bg-[#0B0E14]/90 shadow-[0_30px_80px_-30px_hsl(0_0%_0%/0.9)]">
          <div className="flex items-center justify-between border-b border-gold/15 bg-navy/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E5989B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2ECC71]" />
            </div>
            <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
              TERMINAL DO ORÁCULO
            </span>
            <span
              className={`h-2 w-2 rounded-full ${digitando ? "animate-pulse bg-gold" : "bg-[#2ECC71]"}`}
            />
          </div>

          <div className="h-80 space-y-4 overflow-y-auto px-5 py-6">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.autor === "voce" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-line rounded-lg border px-4 py-3 font-jost text-sm font-light leading-relaxed tracking-wide ${
                    m.autor === "voce"
                      ? "border-gold/40 bg-gold/10 text-cream"
                      : "border-cream/10 bg-cream/5 text-cream/85"
                  }`}
                >
                  {m.texto}
                </div>
              </div>
            ))}

            {digitando && (
              <div className="flex gap-1.5 px-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {mensagens.length <= 1 && !digitando && (
            <div className="flex flex-wrap gap-2 border-t border-gold/10 px-5 py-4">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-full border border-gold/40 px-4 py-1.5 font-jost text-xs text-cream/75 transition hover:bg-gold/10 hover:text-cream"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-gold/15 bg-navy/60 px-5 py-4">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder={t("terminal.placeholder")}
              className="flex-1 bg-transparent font-jost text-sm text-cream placeholder:text-cream/40 focus:outline-none"
            />
            <button
              onClick={() => enviar()}
              disabled={digitando || !texto.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.25em] text-navy-deep transition hover:bg-gold-light disabled:opacity-60"
            >
              {digitando ? (
                <Sparkles className="h-3.5 w-3.5 animate-pulse" strokeWidth={1.5} />
              ) : (
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              {t("terminal.sendCta")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terminal;
