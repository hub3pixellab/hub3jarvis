import { Check, Crown, Sparkle } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    name: "Leitura Relâmpago",
    price: "R$ 47",
    period: "por consulta",
    desc: "Resposta direta do Mestre para uma pergunta urgente.",
    features: [
      "1 pergunta no terminal",
      "Resposta em até 24h",
      "Leitura da energia do dia",
    ],
    featured: false,
  },
  {
    name: "Mapa Natal Completo",
    price: "R$ 147",
    period: "pagamento único",
    desc: "A leitura mais profunda da sua carta astral e numerologia.",
    features: [
      "Carta astral completa",
      "Numerologia do nome",
      "Interpretação em áudio",
      "1 sessão ao vivo com o Mestre",
    ],
    featured: true,
  },
  {
    name: "Guia Mensal",
    price: "R$ 97",
    period: "por mês",
    desc: "Acompanhamento por ciclo lunar com orientações contínuas.",
    features: [
      "2 consultas por mês",
      "Previsões por ciclo",
      "Prioridade no terminal",
    ],
    featured: false,
  },
];

const Pricing = () => {
  const reserve = (plan: string) => {
    toast("Reserva em breve", {
      description: `O plano "${plan}" estará disponível assim que o pagamento for integrado.`,
    });
  };

  return (
    <section
      id="pagamento"
      className="relative overflow-hidden bg-navy-deep py-24 md:py-32"
    >
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-10" />
        <div className="absolute left-1/2 top-1/2 h-96 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/20 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              Investimento
            </span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="mt-6 font-cinzel text-4xl leading-tight text-cream md:text-5xl">
            Escolha o <span className="italic text-gold-gradient">caminho</span>
          </h2>
          <p className="mt-4 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            Pagamento seguro e atendimento 100% em português, com a orientação
            pessoal do Mestre.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-sm border p-8 transition-all duration-500 hover:-translate-y-1 ${
                plan.featured
                  ? "border-gold/70 bg-gradient-to-b from-royal/40 to-card shadow-[0_0_50px_hsl(var(--gold)/0.15)]"
                  : "border-gold/20 bg-card hover:border-gold/45"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-gold/60 bg-gold px-4 py-1 font-jost text-[9px] uppercase tracking-[0.3em] text-navy-deep">
                  <Crown className="h-3 w-3" strokeWidth={1.5} />
                  Mais procurado
                </span>
              )}

              <h3 className="font-cinzel text-2xl text-cream">{plan.name}</h3>
              <p className="mt-2 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
                {plan.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className={`font-cinzel text-4xl md:text-5xl ${
                    plan.featured ? "text-gold-gradient" : "text-cream"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/45">
                  {plan.period}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3 border-t border-gold/15 pt-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 font-jost text-sm font-light tracking-wide text-cream/75"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => reserve(plan.name)}
                className={`mt-8 inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 font-jost text-[11px] uppercase tracking-[0.3em] transition ${
                  plan.featured
                    ? "bg-gold text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.35)] hover:bg-gold-light"
                    : "border border-gold/50 text-gold hover:bg-gold/10"
                }`}
              >
                <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
                Reservar análise
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
