import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Crown, Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PLANS = [
  {
    nameKey: "pricing.p1Name",
    price: "R$ 47",
    periodKey: "pricing.p1Period",
    descKey: "pricing.p1Desc",
    features: ["pricing.p1f1", "pricing.p1f2", "pricing.p1f3"],
    featured: false,
    productId: "prod_VDubKDp1jKVsL8",
  },
  {
    nameKey: "pricing.p2Name",
    price: "R$ 147",
    periodKey: "pricing.p2Period",
    descKey: "pricing.p2Desc",
    features: ["pricing.p2f1", "pricing.p2f2", "pricing.p2f3", "pricing.p2f4"],
    featured: true,
    productId: "prod_VDubmi1896ALiM",
  },
  {
    nameKey: "pricing.p3Name",
    price: "R$ 97",
    periodKey: "pricing.p3Period",
    descKey: "pricing.p3Desc",
    features: ["pricing.p3f1", "pricing.p3f2", "pricing.p3f3"],
    featured: false,
    productId: "prod_VDub44DMiyL80u",
  },
];

const Pricing = () => {
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const checkout = async (plan: (typeof PLANS)[number]) => {
    setLoadingId(plan.nameKey);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            productId: plan.productId,
            successUrl: `${window.location.origin}/#pagamento?status=success`,
            cancelUrl: `${window.location.origin}/#pagamento`,
          },
        },
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error ?? "No checkout URL");
      }
    } catch {
      toast.error(t("pricing.errorTitle"), {
        description: t("pricing.errorDesc"),
      });
    } finally {
      setLoadingId(null);
    }
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
                <span
                  className={`font-cinzel text-4xl md:text-5xl ${
                    plan.featured ? "text-gold-gradient" : "text-cream"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/45">
                  {t(plan.periodKey)}
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
                    {t(f)}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => checkout(plan)}
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
                {loadingId === plan.nameKey
                  ? t("pricing.loadingCta")
                  : t("pricing.reserveCta")}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
