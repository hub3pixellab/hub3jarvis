import { useTranslation } from "react-i18next";
import { ScrollText } from "lucide-react";
import type { ChineseZodiacSignKey } from "@/domain/models";
import {
  CHINESE_ZODIAC_GLYPHS,
  getChineseZodiacYears,
} from "@/lib/chineseZodiacData";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ChineseZodiacDialogProps {
  animal: ChineseZodiacSignKey | null;
  onClose: () => void;
}

/**
 * Pop-up do zodíaco chinês: caractere do animal, nome, anos regidos e a lenda
 * que explica por que ele ocupa aquela posição no ciclo.
 */
const ChineseZodiacDialog = ({ animal, onClose }: ChineseZodiacDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={animal !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        {animal && (
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 font-cinzel text-4xl text-gold-gradient">
                {CHINESE_ZODIAC_GLYPHS[animal]}
              </span>
              <div>
                <p className="font-jost text-[10px] uppercase tracking-[0.4em] text-gold/80">
                  {t("chineseDialog.eyebrow")}
                </p>
                <DialogTitle className="mt-2 font-cinzel text-3xl text-cream">
                  {t(`chineseZodiac.${animal}`)}
                </DialogTitle>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-gold/15 pt-5">
              <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
                {t("chineseDialog.yearsLabel")}
              </span>
              {getChineseZodiacYears(animal).map((year) => (
                <span
                  key={year}
                  className="rounded-full border border-gold/40 bg-royal/30 px-3 py-1 font-jost text-xs tracking-wide text-gold"
                >
                  {year}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-gold/15 pt-5">
              <span className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.3em] text-cream/50">
                <ScrollText className="h-3.5 w-3.5 text-gold/80" strokeWidth={1.5} />
                {t("chineseDialog.storyLabel")}
              </span>
              <p className="font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
                {t(`chineseStory.${animal}`)}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChineseZodiacDialog;
