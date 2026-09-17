import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Sparkle } from "lucide-react";

const QUICK_QUESTIONS = [
  "terminal.q1",
  "terminal.q2",
  "terminal.q3",
  "terminal.q4",
];

const REPLIES: Record<string, string> = {
  "terminal.q1": "terminal.r1",
  "terminal.q2": "terminal.r2",
  "terminal.q3": "terminal.r3",
  "terminal.q4": "terminal.r4",
};

interface Message {
  from: "master" | "user";
  text: string;
}

/**
 * Chat terminal renderizado como overlay de vidro (glass) no Hero.
 * Sem seção própria — o ancorador #terminal aponta para este contêiner.
 */
const Terminal = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "master",
      text: t("terminal.greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const replyKey = REPLIES[q] ?? "terminal.rFallback";
      setMessages((m) => [
        ...m,
        {
          from: "master",
          text: t(replyKey),
        },
      ]);
      setTyping(false);
    }, 1400);
  };

  return (
    <div id="terminal" role="region" aria-label={t("terminal.windowTitle")} className="min-w-0">
      {/* Eyebrow acima do painel de vidro */}
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-gold" />
        <span className="font-jost text-[10px] uppercase tracking-[0.4em] text-gold/90">
          {t("terminal.eyebrow")}
        </span>
        <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
      </div>

      {/* Glass panel — fallback opaco sem backdrop-filter, translúcido com blur */}
      <div className="overflow-hidden rounded-lg border border-gold/25 bg-navy/85 shadow-[0_30px_80px_-30px_hsl(0_0%_0%/0.85)] backdrop-blur-xl supports-[backdrop-filter]:bg-navy/55">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-gold/40"
                style={{
                  background: i === 0 ? "hsl(var(--gold))" : "transparent",
                }}
              />
            ))}
          </div>
          <span className="font-jost text-[10px] uppercase tracking-[0.4em] text-cream/70">
            {t("terminal.windowTitle")}
          </span>
          <Sparkle className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex h-[360px] flex-col gap-4 overflow-y-auto px-5 py-6 md:h-[400px]"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.from === "master" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/50">
                  <Sparkle className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-md px-4 py-3 font-jost text-sm leading-relaxed tracking-wide ${
                  msg.from === "master"
                    ? "border border-gold/25 bg-navy/90 text-cream/90"
                    : "bg-royal-light/70 text-cream"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-end gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/50">
                <Sparkle className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              </span>
              <div className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-navy/90 px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 180}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick questions — alvos de toque >= 44px */}
        <div className="flex flex-wrap gap-2 border-t border-gold/15 px-5 py-3">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={typing}
              className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-4 py-2 font-jost text-xs tracking-wide text-gold transition hover:bg-gold/15 hover:shadow-[0_0_14px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
            >
              {t(q)}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 border-t border-gold/15 px-5 py-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask(input);
            }}
            placeholder={t("terminal.placeholder")}
            className="min-h-11 min-w-0 flex-1 rounded-full border border-gold/25 bg-navy/60 px-5 py-3 font-jost text-sm tracking-wide text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
          />
          <button
            onClick={() => ask(input)}
            disabled={typing || !input.trim()}
            aria-label={t("terminal.sendAria")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-navy-deep shadow-[0_0_18px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p className="mt-4 text-center font-jost text-[9px] uppercase tracking-[0.35em] text-cream/45">
        {t("terminal.demoNote")}
      </p>
    </div>
  );
};

export default Terminal;
