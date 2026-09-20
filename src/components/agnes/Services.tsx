import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BookOpen,
  Compass,
  Hash,
  Heart,
  Sparkle,
  Triangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ServiceDetail {
  n: string;
  nameKey: string;
  tagKey: string;
  descKey: string;
  icon: typeof Compass;
}

const SERVICES: ServiceDetail[] = [
  {
    n: "I",
    nameKey: "services.s1Name",
    tagKey: "services.s1Tag",
    descKey: "services.s1Desc",
    icon: Compass,
  },
  {
    n: "II",
    nameKey: "services.s2Name",
    tagKey: "services.s2Tag",
    descKey: "services.s2Desc",
    icon: Hash,
  },
  {
    n: "III",
    nameKey: "services.s3Name",
    tagKey: "services.s3Tag",
    descKey: "services.s3Desc",
    icon: Triangle,
  },
  {
    n: "IV",
    nameKey: "services.s4Name",
    tagKey: "services.s4Tag",
    descKey: "services.s4Desc",
    icon: Heart,
  },
  {
    n: "V",
    nameKey: "services.s5Name",
    tagKey: "services.s5Tag",
    descKey: "services.s5Desc",
    icon: BookOpen,
  },
];

/** Divide uma lista de itens separados por quebras de linha. */
const toLines = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const Services = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ServiceDetail | null>(null);

  const detail = selected
    ? {
        what: t(`services.s${SERVICES.indexOf(selected) + 1}Detail.what`),
        input: toLines(t(`services.s${SERVICES.indexOf(selected) + 1}Detail.input`)),
        tech: toLines(t(`services.s${SERVICES.indexOf(selected) + 1}Detail.tech`)),
        result: toLines(
          t(`services.s${SERVICES.indexOf(selected) + 1}Detail.result`),
        ),
      }
    : null;

  return (
    <section
      id="servicos"
      className="relative overflow-hidden bg-navy py-24 md:py-32"
    >
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-20" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-royal/25 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* Marquee */}
        <div className="relative overflow-hidden border-y border-gold/15 py-5">
          <div className="animate-marquee flex whitespace-nowrap font-cinzel text-2xl italic text-gold/25 md:text-4xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="px-8">
                — Mestre Agnes ✦ {t("footer.guide")} ✦ {t("footer.destiny")} ✦
              </span>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="font-jost text-[11px] uppercase tracking-[0.35em] text-gold">
                {t("services.eyebrow")}
              </span>
            </div>
            <h2 className="mt-6 max-w-2xl font-cinzel text-4xl leading-tight text-cream md:text-5xl">
              {t("services.title1")}
              <br />
              <span className="italic text-gold-gradient">{t("services.title2")}</span>
            </h2>
          </div>
          <p className="max-w-sm font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Editorial list */}
        <div className="mt-14 border-t border-gold/15">
          {SERVICES.map((s) => (
            <article
              key={s.n}
              className="group flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-gold/15 py-8 transition-colors duration-500 hover:bg-gradient-to-r hover:from-royal/30 hover:to-transparent md:grid md:grid-cols-[64px_72px_minmax(0,1fr)_minmax(0,1.2fr)_auto] md:gap-8 md:px-4"
            >
              <span className="font-cinzel text-2xl text-gold/60 transition-colors group-hover:text-gold md:text-3xl">
                {s.n}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold transition group-hover:border-gold group-hover:shadow-[0_0_18px_hsl(var(--gold)/0.3)]">
                <s.icon className="h-5 w-5" strokeWidth={1.25} />
              </span>
              <div className="min-w-0 flex-1 basis-40 md:flex-none">
                <h3 className="font-cinzel text-2xl text-cream transition-colors group-hover:text-gold-gradient md:text-3xl">
                  {t(s.nameKey)}
                </h3>
                <p className="mt-1 font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                  {t(s.tagKey)}
                </p>
              </div>
              <p className="hidden max-w-md font-jost text-sm font-light leading-relaxed tracking-wide text-cream/60 md:block">
                {t(s.descKey)}
              </p>
              {/* Seta lateral — abre o pop-up com a explicação */}
              <button
                type="button"
                onClick={() => setSelected(s)}
                aria-label={t("services.dialog.aria", { name: t(s.nameKey) })}
                title={t("services.dialog.aria", { name: t(s.nameKey) })}
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-navy-deep hover:shadow-[0_0_20px_hsl(var(--gold)/0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:ml-0 md:justify-self-end"
              >
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.25} />
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Pop-up com a explicação do serviço */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
          {selected && detail && (
            <div className="flex flex-col gap-5 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
                  <selected.icon className="h-5 w-5" strokeWidth={1.25} />
                </span>
                <div className="min-w-0">
                  <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                    {t(selected.tagKey)}
                  </p>
                  <DialogTitle className="mt-1 font-cinzel text-2xl text-cream md:text-3xl">
                    {t(selected.nameKey)}
                  </DialogTitle>
                </div>
              </div>

              <DetailBlock label={t("services.dialog.what")} paragraphs={[detail.what]} />

              <DetailBlock label={t("services.dialog.input")} bullets={detail.input} />

              <DetailBlock label={t("services.dialog.tech")} bullets={detail.tech} />

              <DetailBlock label={t("services.dialog.result")} bullets={detail.result} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const DetailBlock = ({
  label,
  paragraphs = [],
  bullets = [],
}: {
  label: string;
  paragraphs?: string[];
  bullets?: string[];
}) => (
  <div className="border-t border-gold/15 pt-4">
    <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.35em] text-gold/80">
      <Sparkle className="h-3 w-3 text-gold/70" strokeWidth={1.5} />
      {label}
    </p>
    {paragraphs.map((p, i) => (
      <p key={i} className="mt-3 font-jost text-sm leading-relaxed tracking-wide text-cream/80">
        {p}
      </p>
    ))}
    {bullets.length > 0 && (
      <ul className="mt-3 flex flex-col gap-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-3 font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Services;
