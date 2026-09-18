import { useTranslation } from "react-i18next";
import { Sparkle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
];

const Faq = () => {
  const { t } = useTranslation();

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-navy-deep py-24 md:py-32"
    >
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-royal/20 blur-[140px]" />
        <div className="starfield absolute inset-0 opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-10">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
            {t("faq.eyebrow")}
          </span>
          <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
        </div>

        <h2 className="mt-6 text-center font-cinzel text-4xl leading-tight text-cream md:text-5xl">
          {t("faq.title1")}{" "}
          <span className="italic text-gold-gradient">{t("faq.title2")}</span>
        </h2>

        <Accordion
          type="single"
          collapsible
          className="mt-12 border-t border-gold/15"
        >
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={item.qKey}
              value={`item-${i}`}
              className="border-gold/15"
            >
              <AccordionTrigger className="py-5 text-left font-cinzel text-lg text-cream transition-colors hover:text-gold hover:no-underline data-[state=open]:text-gold [&[data-state=open]>svg]:text-gold md:text-xl">
                {t(item.qKey)}
              </AccordionTrigger>
              <AccordionContent className="pb-6 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
                {t(item.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Faq;
