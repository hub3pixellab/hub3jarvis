import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "O que é o Mestre Agnes?",
    a: "Um mestre virtual que une astrologia, numerologia e eneagrama com Inteligência Artificial para gerar um mapa pessoal único, baseado no seu nome e data de nascimento.",
  },
  {
    q: "Como recebo meu relatório?",
    a: "Após o pagamento, você é levado à página de sucesso, onde clica em \"Gerar e baixar\" e recebe sua apresentação personalizada na hora.",
  },
  {
    q: "O que está incluído na análise?",
    a: "Numerologia (caminho de vida), perfil astrológico (signo solar) e análise de personalidade — com foco em amor, carreira, espiritualidade ou saúde.",
  },
  {
    q: "É seguro pagar com Stripe?",
    a: "Sim. Usamos o Stripe Checkout, com segurança de nível bancário e compliance PCI DSS. Nenhum dado sensível passa pelos nossos servidores.",
  },
  {
    q: "Posso testar antes de comprar?",
    a: "Sim. No ambiente sandbox, use o cartão de teste 4242 4242 4242 4242 para simular um pagamento completo.",
  },
  {
    q: "O que é o Terminal do Mestre?",
    a: "Um chat oracular onde você conversa com o Mestre em tempo real: consulta o horóscopo do dia, tira dúvidas rápidas ou recebe uma análise completa.",
  },
];

const Faq = () => {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-navy-deep py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-10" />
        <div className="absolute right-0 top-1/4 h-80 w-80 -translate-y-1/2 rounded-full bg-royal/20 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              Dúvidas Frequentes
            </span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="mt-6 font-cinzel text-4xl leading-tight text-cream md:text-5xl">
            Perguntas <span className="italic text-gold-gradient">Frequentes</span>
          </h2>
          <p className="mt-4 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            Tudo o que você precisa saber antes de iniciar sua jornada com o Mestre Agnes.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-md border border-gold/20 bg-[#0B0E14]/80"
            >
              <button
                onClick={() => setAberto(aberto === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-jost text-sm font-medium text-cream">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gold transition-transform ${
                    aberto === i ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              {aberto === i && (
                <div className="border-t border-gold/10 px-5 py-4">
                  <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
                    {f.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
