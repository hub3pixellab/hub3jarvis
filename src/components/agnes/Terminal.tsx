import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Sparkle } from "lucide-react";

const TERMINAL_BG =
  "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/1c2a5250.png";

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
    <section
      id="terminal"
      className="relative isolate overflow-hidden bg-navy py-24 md:py-32"
    >
      {/* Background — mapa estelar */}
      <img
        src={TERMINAL_BG}
        alt=""
        aria-hidden
        crossOrigin="anonymous"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-navy/70" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--navy))_90%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-navy to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy to-transparent" />

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
                {t("terminal.eyebrow")}
              </span>
            </div>
            <h2 className="mt-6 font-cinzel text-4xl leading-tight text-cream md:text-5xl">
              {t("terminal.title1")}
              <br />
              <span className="italic text-gold-gradient">
                {t("terminal.title2")}
              </span>
            </h2>
          </div>
          <p className="max-w-sm font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            {t("terminal.subtitle")}
          </p>
        </div>

        {/* Terminal window */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-md border border-gold/25 bg-navy-deep/80 shadow-[0_30px_80px_-30px_hsl(0_0%_0%/0.8)] backdrop-blur-md">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3.5">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full border border-gold/40"
                    style={{
                      background:
                        i === 0 ? "hsl(var(--gold))" : "transparent",
                    }}
                  />
                ))}
              </div>
              <span className="font-jost text-[10px] uppercase tracking-[0.4em] text-cream/60">
                {t("terminal.windowTitle")}
              </span>
              <Sparkle className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex h-[400px] flex-col gap-4 overflow-y-auto px-5 py-6"
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
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold"
                        style={{ animationDelay: `${i * 180}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions */}
            <div className="flex flex-wrap gap-2 border-t border-gold/15 px-5 py-3">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  disabled={typing}
                  className="rounded-full border border-gold/40 px-4 py-1.5 font-jost text-xs tracking-wide text-gold transition hover:bg-gold/15 hover:shadow-[0_0_14px_hsl(var(--gold)/0.25)] disabled:opacity-50"
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
                className="min-w-0 flex-1 rounded-full border border-gold/25 bg-navy/60 px-5 py-3 font-jost text-sm tracking-wide text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
              />
              <button
                onClick={() => ask(input)}
                disabled={typing || !input.trim()}
                aria-label={t("terminal.sendAria")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-navy-deep shadow-[0_0_18px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light disabled:opacity-50"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <p className="mt-6 text-center font-jost text-[10px] uppercase tracking-[0.35em] text-cream/40">
            {t("terminal.demoNote")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Terminal;
