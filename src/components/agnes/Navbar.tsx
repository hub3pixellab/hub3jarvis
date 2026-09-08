import { useState } from "react";
import { Menu, Sparkle, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Terminal", href: "#terminal" },
  { label: "Contato", href: "#contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-navy-deep/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-royal/40">
            <Sparkle className="h-4 w-4 text-gold" strokeWidth={1.5} />
          </span>
          <span className="font-cinzel text-lg uppercase tracking-[0.28em] text-gold-gradient">
            Mestre Agnes
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-jost text-[11px] uppercase tracking-[0.3em] text-cream/70 transition hover:text-gold hover:drop-shadow-[0_0_8px_hsl(var(--gold)/0.6)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#analise"
          className="hidden rounded-full border border-gold/60 bg-gold/10 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-navy-deep hover:shadow-[0_0_20px_hsl(var(--gold)/0.4)] md:inline-flex md:items-center md:gap-2"
        >
          Fazer Análise
        </a>

        <button
          onClick={() => setOpen((o) => !o)}
          className="text-cream md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gold/10 bg-navy-deep/95 px-6 py-4 backdrop-blur-md md:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-gold/5 py-3 font-jost text-xs uppercase tracking-[0.3em] text-cream/80 transition hover:text-gold"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#analise"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex rounded-full border border-gold/60 bg-gold/10 px-5 py-2.5 font-jost text-[11px] uppercase tracking-[0.3em] text-gold"
          >
            Fazer Análise
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
