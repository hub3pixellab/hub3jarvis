import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Apple, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Logo do Android (cabeça do robô) em traço, no estilo dos ícones do site. */
function AndroidLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* antenas */}
      <path d="M7.2 8.2 5.7 5.7" />
      <path d="M16.8 8.2 18.3 5.7" />
      {/* cabeça */}
      <path d="M4.6 16.6v-2.9a7.4 7.4 0 0 1 14.8 0v2.9z" />
      {/* olhos */}
      <circle cx="9.2" cy="12.6" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12.6" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Botões das lojas de aplicativos (Google Play e App Store).
 * Ainda não publicados: o clique abre um pop-up "em breve".
 */
export function AppStoreButtons() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("hero.storeAriaAndroid")}
          title={t("hero.storeAriaAndroid")}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-cream/80 transition hover:border-gold hover:text-gold hover:shadow-[0_0_20px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <AndroidLogo className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("hero.storeAriaIos")}
          title={t("hero.storeAriaIos")}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-cream/80 transition hover:border-gold hover:text-gold hover:shadow-[0_0_20px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <Apple className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md border-gold/30 bg-navy text-cream">
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
              <Sparkle className="h-5 w-5" strokeWidth={1.25} />
            </span>
            <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
              {t("hero.storeSoonEyebrow")}
            </p>
            <DialogTitle className="font-cinzel text-2xl text-cream">
              {t("hero.storeSoonTitle")}
            </DialogTitle>
            <p className="max-w-sm font-jost text-sm font-light leading-relaxed text-cream/65">
              {t("hero.storeSoonText")}
            </p>
            <div className="flex items-center gap-4 text-cream/70">
              <AndroidLogo className="h-6 w-6" />
              <span className="h-4 w-px bg-gold/30" />
              <Apple className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-1 bg-gold text-navy-deep hover:bg-gold-light"
            >
              {t("hero.storeSoonClose")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AppStoreButtons;
