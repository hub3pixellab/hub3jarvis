import { useTranslation } from "react-i18next";
import { Sparkle } from "lucide-react";
import Terminal from "@/components/agnes/Terminal";

/**
 * Seção própria do Terminal, logo após a Hero.
 * Dá o contexto (eyebrow, título, subtítulo) ao painel de vidro.
 */
const TerminalSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="terminal"
      className="relative overflow-hidden bg-navy py-24 md:py-32"
    >
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-royal/25 blur-[140px]" />
        <div className="starfield absolute inset-0 opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-10">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
            {t("terminal.eyebrow")}
          </span>
          <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
        </div>

        <h2 className="mt-6 text-center font-cinzel text-4xl leading-tight text-cream md:text-5xl">
          {t("terminal.title1")}{" "}
          <span className="italic text-gold-gradient">{t("terminal.title2")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
          {t("terminal.subtitle")}
        </p>

        <div className="mt-12">
          <Terminal />
        </div>
      </div>
    </section>
  );
};

export default TerminalSection;
