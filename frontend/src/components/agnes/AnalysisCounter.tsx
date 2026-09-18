import { useTranslation } from "react-i18next";
import { useAnalysisCount } from "@/hooks/useAnalysisCount";
import { ANALYSIS_BASELINE } from "@/services/globalStats";

/**
 * Live "consultas realizadas" counter, locale-formatted.
 * Falls back to the seeded baseline while loading or on error so the layout
 * never shifts, and always keeps a stable rendered width.
 */
export const AnalysisCounter = () => {
  const { i18n } = useTranslation();
  const { data } = useAnalysisCount();
  const count = data ?? ANALYSIS_BASELINE;
  const formatted = new Intl.NumberFormat(i18n.language).format(count);

  return (
    <span
      className="inline-flex min-w-[4.5rem] items-baseline justify-end gap-1 font-cinzel text-gold-gradient"
      title={i18n.t("about.stat2Label")}
    >
      <span className="tabular-nums">{formatted}</span>
      <span className="text-[0.6em] opacity-80">+</span>
    </span>
  );
};
