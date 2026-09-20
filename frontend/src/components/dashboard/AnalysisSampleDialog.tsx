import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Compass,
  Hash,
  Heart,
  Sparkle,
  Triangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/** Ícones das 5 análises (mesma ordem do Services). */
const ANALYSIS_ICONS = [
  Compass,
  Hash,
  Triangle,
  Heart,
  BookOpen,
] as const;

interface AnalysisSampleDialogProps {
  /** "s1".."s5" */
  analysisKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toLines = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Pop-up com uma amostra da análise selecionada em "Outras análises":
 * o que é, o que você envia e o que recebe — sem liberar a leitura completa.
 */
export function AnalysisSampleDialog({
  analysisKey,
  open,
  onOpenChange,
}: AnalysisSampleDialogProps) {
  const { t } = useTranslation();
  const idx = Number(analysisKey.slice(1)) - 1; // "s1" -> 0
  const Icon = ANALYSIS_ICONS[idx] ?? Compass;

  const name = t(`services.s${idx + 1}Name`);
  const what = t(`services.s${idx + 1}Detail.what`);
  const input = toLines(t(`services.s${idx + 1}Detail.input`));
  const result = toLines(t(`services.s${idx + 1}Detail.result`));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
              <Icon className="h-5 w-5" strokeWidth={1.25} />
            </span>
            <div className="min-w-0">
              <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                {t("analysisSample.eyebrow")}
              </p>
              <DialogTitle className="mt-1 font-cinzel text-2xl text-cream md:text-3xl">
                {name}
              </DialogTitle>
            </div>
          </div>

          <div className="border-t border-gold/15 pt-4">
            <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
              <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
              {t("services.dialog.what")}
            </p>
            <p className="mt-3 font-jost text-sm leading-relaxed tracking-wide text-cream/80">
              {what}
            </p>
          </div>

          <div className="border-t border-gold/15 pt-4">
            <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
              <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
              {t("services.dialog.input")}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {input.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gold/15 pt-4">
            <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
              <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
              {t("services.dialog.result")}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {result.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-gold/15 pt-4 font-jost text-xs font-light leading-relaxed tracking-wide text-cream/50">
            {t("analysisSample.note")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AnalysisSampleDialog;
