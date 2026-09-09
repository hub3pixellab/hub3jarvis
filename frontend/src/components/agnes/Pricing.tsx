import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Crown, Loader2, Sparkle, X } from "lucide-react";
import { toast } from "sonner";
import { checkout, STORAGE_DADOS } from "@/lib/agnesApi";

const PLANS = [
  {
    nameKey: "pricing.p1Name",
    price: "R$ 47",
    periodKey: "pricing.p1Period",
    descKey: "pricing.p1Desc",
    features: ["pricing.p1f1", "pricing.p1f2", "pricing.p1f3"],
    featured: false,
    priceId: "",
    foco: "geral",
  },
  {
    nameKey: "pricing.p2Name",
    price: "R$ 147",
    periodKey: "pricing.p2Period",
    descKey: "pricing.p2Desc",
    features: ["pricing.p2f1", "pricing.p2f2", "pricing.p2f3", "pricing.p2f4"],
    featured: true,
    priceId: "",
    foco: "geral",
  },
  {
    nameKey: "pricing.p3Name",
    price: "R$ 97",
    periodKey: "pricing.p3Period",
    descKey: "pricing.p3Desc",
    features: ["pricing.p3f1", "pricing.p3f2", "pricing.p3f3"],
    featured: false,
    priceId: "",
    foco: "geral",
  },
];

const Pricing = () => {
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<(typeof PLANS)[number] | null>(null);
  const [form, setForm] = useState({ nome: "", data_nascimento: "", email: "" });
  const [erroForm, setErroForm] = useState("");

  const abrirModal = (plan: (typeof PLANS)[number]) => {
    setErroForm("");
    setPlanoSelecionado(plan);
  };

  const finalizarCheckout = async (plan: (typeof PLANS)[number]) => {
    setLoadingId(plan.nameKey);
    try {
      const dados = {
        nome: form.nome.trim(),
        data_nascimento: form.data_nascimento.trim(),
        signo: "",
        foco: plan.foco,
        email: form.email.trim() || undefined,
        price_id: plan.priceId || undefined,
      };
      localStorage.setItem(STORAGE_DADOS, JSON.stringify(dados));
      const res = await checkout(dados);
      window.location.href = res.checkout_url;
    } catch (e) {
      toast.error(t("pricing.errorTitle"), {
        description: e instanceof Error ? e.message : t("pricing.errorDesc"),
      });
    } finally {
      setLoadingId(null);
    }
  };

  const enviarForm = () => {
    if (!form.nome.trim() || !form.data_nascimento.trim()) {
      setErroForm("Informe nome e data de nascimento (dd/mm/aaaa).");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.data_nascimento.trim())) {
      setErroForm("Data inválida. Use o formato dd/mm/aaaa (ex: 15/03/1990).");
      return;
    }
    if (planoSelecionado) finalizarCheckout(planoSelecionado);
  };

  return (
    <section id="pagamento" className="relative overflow-hidden bg-navy-deep py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-10" />
        <div className="absolute left-1/2 top-1/2 h-96 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/20 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
              {t("pricing.eyebrow")}
            </span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="mt-6 font-cinzel text-4xl leading-tight text-cream md:text-5xl">
            {t("pricing.title1")} <span className="italic text-gold-gradient">{t("pricing.title2")}</span>
          </h2>
          <p className="mt-4 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.nameKey}
              className={`relative flex flex-col rounded-sm border p-8 transition-all duration-500 hover:-translate-y-1 ${
                plan.featured
                  ? "border-gold/70 bg-gradient-to-b from-royal/40 to-card shadow-[0_0_50px_hsl(var(--gold)/0.15)]"
                  : "border-gold/20 bg-card hover:border-gold/45"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-gold/60 bg-gold px-4 py-1 font-jost text-[9px] uppercase tracking-[0.3em] text-navy-deep">
                  <Crown className="h-3 w-3" strokeWidth={1.5} />
                  {t("pricing.featuredBadge")}
                </span>
              )}

              <h3 className="font-cinzel text-2xl text-cream">{t(plan.nameKey)}</h3>
              <p className="mt-2 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
                {t(plan.descKey)}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className={`font-cinzel text-4xl md:text-5xl ${plan.featured ? "text-gold-gradient" : "text-cream"}`}>
                  {plan.price}
                </span>
                <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/45">
                  {t(plan.periodKey)}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3 border-t border-gold/15 pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 font-jost text-sm font-light tracking-wide text-cream/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                    {t(f)}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => abrirModal(plan)}
                disabled={loadingId !== null}
                className={`mt-8 inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 font-jost text-[11px] uppercase tracking-[0.3em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.featured
                    ? "bg-gold text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.35)] hover:bg-gold-light"
                    : "border border-gold/50 text-gold hover:bg-gold/10"
                }`}
              >
                {loadingId === plan.nameKey ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
                {loadingId === plan.nameKey ? t("pricing.loadingCta") : t("pricing.reserveCta")}
              </button>
            </article>
          ))}
        </div>
      </div>

      {planoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setPlanoSelecionado(null)}
        >
          <div
            className="w-full max-w-md rounded-md border border-gold/30 bg-navy-deep p-8 shadow-[0_30px_80px_-20px_hsl(0_0%_0%/0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold">
                  SEU GUIA • SEU DESTINO
                </p>
                <h3 className="mt-2 font-cinzel text-2xl text-cream">
                  {t(planoSelecionado.nameKey)} — {planoSelecionado.price}
                </h3>
              </div>
              <button
                onClick={() => setPlanoSelecionado(null)}
                aria-label="Fechar"
                className="rounded-full border border-gold/30 p-1.5 text-cream/60 transition hover:text-cream"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <p className="mt-4 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
              Para gerar seu relatório, o Mestre Agnes precisa das suas informações de nascimento.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-jost text-[10px] uppercase tracking-[0.25em] text-cream/50">
                  Nome completo
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Seu nome de registro"
                  className="w-full rounded-sm border border-gold/25 bg-navy/60 px-4 py-3 font-jost text-sm text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-jost text-[10px] uppercase tracking-[0.25em] text-cream/50">
                  Data de nascimento
                </label>
                <input
                  value={form.data_nascimento}
                  onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                  placeholder="dd/mm/aaaa"
                  className="w-full rounded-sm border border-gold/25 bg-navy/60 px-4 py-3 font-jost text-sm text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-jost text-[10px] uppercase tracking-[0.25em] text-cream/50">
                  E-mail (opcional — para receber o relatório)
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="voce@email.com"
                  className="w-full rounded-sm border border-gold/25 bg-navy/60 px-4 py-3 font-jost text-sm text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
              </div>
            </div>

            {erroForm && (
              <p className="mt-4 font-jost text-sm text-[#E5989B]">{erroForm}</p>
            )}

            <button
              onClick={enviarForm}
              disabled={loadingId !== null}
              className="mt-6 w-full rounded-full bg-gold py-4 font-jost text-xs uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.35)] transition hover:bg-gold-light disabled:opacity-60"
            >
              {loadingId === planoSelecionado.nameKey
                ? t("pricing.loadingCta")
                : `Continuar para pagamento — ${planoSelecionado.price}`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
