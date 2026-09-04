import { Sparkle } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Exhibitions", href: "#exhibitions" },
  { label: "Collections", href: "#halls" },
  { label: "About", href: "#curator" },
  { label: "Journal", href: "#archive" },
];

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-10 md:py-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between">
        <a href="#home" className="flex items-center gap-3">
          <Sparkle className="h-5 w-5 text-bone" strokeWidth={1} />
          <div className="leading-tight">
            <div className="font-mono-display text-[12px] tracking-[0.28em] text-bone">
              JIAXUAN
            </div>
            <div className="font-mono-display text-[9px] tracking-[0.32em] text-muted-foreground">
              DIGITAL MUSEUM
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-bone"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button className="flex items-center gap-3 text-bone">
          <span className="font-mono-display text-[11px] uppercase tracking-[0.3em]">
            Menu
          </span>
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-bone/40">
            <span className="absolute h-1 w-1 rounded-full bg-accent" />
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
