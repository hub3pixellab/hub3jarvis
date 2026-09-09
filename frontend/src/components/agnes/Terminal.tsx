import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Sparkles } from "lucide-react";
import { conversar } from "@/lib/agnesApi";

type Mensagem = { autor: "agnes" | "voce"; texto: string };

const SUGESTOES = [
  "O que os astros revelam sobre mim hoje?",
  "Qual é o meu propósito de vida?",
  "Me conte sobre o meu número",
  "Como está minha energia essa semana?",
];

const SAUDACAO =
  "Bem-vindo(a), buscador(a). Eu sou o Mestre Agnes. Os astros e os números já estão alinhados — pergunte o que seu coração deseja saber.";

const Terminal = () => {
  const { t } = useTranslation();
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ autor: "agnes", texto: SAUDACAO }]);
  const [texto, setTexto] = useState("");
  const [digitando, setDigitando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, digitando]);

  async function enviar(pergunta?: string) {
    const textoFinal = (pergunta ?? texto).trim();
    if (!textoFinal || digitando) return;
    setTexto("");
    setMensagens((m) => [...m, { autor: "voce", texto: textoFinal }]);
    setDigitando(true);
    try {
      const resposta = await conversar(textoFinal);
      setMensagens((m) => [...m, { autor: "agnes", texto: resposta }]);
    } catch (e) {
      setMensagens((m) => [
        ...m,
        {
          autor: "agnes",
          texto:
            e instanceof Error
              ? e.message
              : "Os astros estão confusos neste momento... tente novamente.",
        },
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
          {/* Barra do terminal */}
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

          {/* Mensagens */}
          <div className="h-80 space-y-4 overflow-y-auto px-5 py-6">
            {mensagens.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.autor === "voce" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg border px-4 py-3 font-jost text-sm font-light leading-relaxed tracking-wide ${
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

          {/* Sugestões */}
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

          {/* Input */}
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
