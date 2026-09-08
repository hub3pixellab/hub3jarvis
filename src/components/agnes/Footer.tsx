import type { ReactNode } from "react";
import { Instagram, Mail, MessageCircle, Sparkle, Youtube } from "lucide-react";

const SERVICES = [
  "Mapa Natal",
  "Numerologia",
  "Eneagrama",
  "Compatibilidade",
  "Conselho dos Mestres",
];

const NAVIGATION = [
  { label: "Início", href: "#inicio" },
  { label: "Fazer Análise", href: "#analise" },
  { label: "Terminal de Chat", href: "#terminal" },
  { label: "Pagamento", href: "#pagamento" },
  { label: "Contato", href: "#contato" },
];

const SOCIALS = [
  { label: "Instagram", href: "#", Icon: Instagram },
  { label: "WhatsApp", href: "#", Icon: MessageCircle },
  { label: "YouTube", href: "#", Icon: Youtube },
];

const Footer = () => {
  return (
    <footer
      id="contato"
      className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-deep text-cream"
    >
      {/* Fine gold top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      {/* Mystical atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-royal/30 blur-[140px]" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-gold/10 blur-[140px]" />
        <div className="starfield absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-deep/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-16 md:px-12 md:pt-20">
        {/* 4 columns */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-10">
          {/* Col 1 — Brand */}
          <div>
            <a href="#inicio" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-royal/40 shadow-[0_0_24px_hsl(var(--gold)/0.18)]">
                <Sparkle className="h-5 w-5 text-gold" strokeWidth={1} />
              </span>
              <span className="font-cinzel text-xl font-medium uppercase leading-none tracking-[0.3em] text-gold-gradient md:text-2xl">
                Mestre Agnes
              </span>
            </a>
            <p className="mt-4 font-jost text-[10px] font-light uppercase tracking-[0.5em] text-cream/60">
              Seu Guia <span className="text-gold">•</span> Seu Destino
            </p>
            <p className="mt-5 max-w-xs font-jost text-sm font-light leading-relaxed tracking-wide text-cream/70">
              Astrologia e numerologia cabalística para guiar sua jornada.
            </p>
          </div>

          {/* Col 2 — Services */}
          <div>
            <ColumnTitle>Serviços</ColumnTitle>
            <ul className="mt-6 space-y-3">
              {SERVICES.map((s) => (
                <li key={s}>
                  <a
                    href="#servicos"
                    className="link-glow font-jost text-sm font-light tracking-wide text-cream/70"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Navigation */}
          <div>
            <ColumnTitle>Navegação</ColumnTitle>
            <ul className="mt-6 space-y-3">
              {NAVIGATION.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="link-glow font-jost text-sm font-light tracking-wide text-cream/70"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact / Social */}
          <div>
            <ColumnTitle>Contato</ColumnTitle>
            <a
              href="mailto:contato@mestreagnes.com"
              className="link-glow mt-6 inline-flex items-center gap-3 font-jost text-sm font-light tracking-wide text-cream/70"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              contato@mestreagnes.com
            </a>

            <div className="mt-8 flex items-center gap-3">
              <Sparkle className="h-3 w-3 text-gold/80" strokeWidth={1.5} />
              <span className="h-px w-14 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className="social-icon flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-gold/80"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Signature bar */}
        <div className="mt-16 md:mt-20">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
            <span className="font-jost text-[11px] font-light uppercase tracking-[0.4em] text-cream/60">
              Produzido por
            </span>
            <Sparkle className="h-3 w-3 text-gold" strokeWidth={1.5} />
            <span className="font-cinzel text-sm uppercase tracking-[0.4em] text-gold-gradient">
              Hub3 Pixel Lab
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

const ColumnTitle = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="h-px w-6 bg-gradient-to-r from-gold/80 to-transparent" />
    <h3 className="font-cinzel text-xs font-medium uppercase tracking-[0.4em] text-gold">
      {children}
    </h3>
  </div>
);

export default Footer;
