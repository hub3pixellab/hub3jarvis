import { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Sparkle,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppStoreButtons } from "@/components/agnes/AppStoreButtons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { key: "dashboard.overview", to: "/dashboard", Icon: LayoutDashboard },
  { key: "dashboard.profile", to: "/dashboard/perfil", Icon: UserRound },
  { key: "dashboard.social", to: "/dashboard/rede", Icon: Users },
];

const COMING_SOON = [
  { key: "dashboard.comingSoonMatches", Icon: HeartHandshake },
  { key: "dashboard.comingSoonChat", Icon: MessagesSquare },
];

function Brand() {
  const { t } = useTranslation();
  return (
    <Link to="/dashboard" className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-royal/40">
        <Sparkle className="h-4 w-4 text-gold" strokeWidth={1.5} />
      </span>
      <span className="font-cinzel text-lg uppercase tracking-[0.28em] text-gold-gradient">
        Mestre Agnes
      </span>
      <span className="sr-only">{t("dashboard.title")}</span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 font-jost text-xs uppercase tracking-[0.25em] transition ${
                isActive
                  ? "bg-gold/10 text-gold shadow-[0_0_18px_hsl(var(--gold)/0.15)]"
                  : "text-cream/60 hover:bg-gold/5 hover:text-cream"
              }`
            }
          >
            <item.Icon className="h-4 w-4" strokeWidth={1.5} />
            {t(item.key)}
          </NavLink>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="px-3 font-jost text-[10px] uppercase tracking-[0.35em] text-cream/40">
          {t("dashboard.comingSoon")}
        </p>
        {COMING_SOON.map((item) => (
          <span
            key={item.key}
            aria-disabled
            className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 font-jost text-xs uppercase tracking-[0.25em] text-cream/30"
          >
            <item.Icon className="h-4 w-4" strokeWidth={1.5} />
            {t(item.key)}
            <Badge
              variant="outline"
              className="ml-auto border-gold/25 bg-gold/5 px-2 py-0 font-jost text-[8px] uppercase tracking-[0.2em] text-gold/70"
            >
              {t("dashboard.comingSoon")}
            </Badge>
          </span>
        ))}
      </div>
    </nav>
  );
}

function SignOutButton({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  return (
    <Button
      variant="ghost"
      onClick={() => void signOut()}
      className={`text-cream/60 hover:bg-destructive/10 hover:text-destructive ${className}`}
    >
      <LogOut className="h-4 w-4" strokeWidth={1.5} />
      {t("dashboard.signOut")}
    </Button>
  );
}

/** Título curto acima dos botões das lojas. */
function AppTitle() {
  const { t } = useTranslation();
  return (
    <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-cream/40">
      {t("dashboard.appTitle")}
    </p>
  );
}

function FullPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-deep">
      <Skeleton className="h-10 w-10 rounded-full bg-gold/10" />
      <Skeleton className="h-4 w-48 bg-gold/10" />
    </div>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, initializing } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (initializing) return <FullPageSkeleton />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;

  const currentTitle =
    location.pathname === "/dashboard/perfil"
      ? t("dashboard.profile")
      : location.pathname.startsWith("/dashboard/rede") ||
          location.pathname.startsWith("/dashboard/membro/")
        ? t("dashboard.social")
        : t("dashboard.overview");

  return (
    <div className="min-h-screen bg-navy-deep text-cream">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-gold/15 bg-navy p-6 lg:flex">
          <Brand />
          <NavList />
          <div className="mt-auto flex flex-col gap-3">
            <AppTitle />
            <AppStoreButtons size="sm" />
            <SignOutButton className="justify-start" />
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gold/15 bg-navy/80 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-cream lg:hidden"
                    aria-label={t("nav.menuOpen")}
                  >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-r border-gold/15 bg-navy"
                >
                  <SheetHeader className="border-b border-gold/10 pb-4">
                    <SheetTitle className="sr-only">{t("dashboard.title")}</SheetTitle>
                    <Brand />
                  </SheetHeader>
                  <div className="flex flex-col gap-6 pt-6">
                    <NavList onNavigate={() => setMenuOpen(false)} />
                    <div className="flex flex-col gap-3">
                      <AppTitle />
                      <AppStoreButtons size="sm" />
                    </div>
                    <SignOutButton className="justify-start" />
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="font-cinzel text-xl text-cream md:text-2xl">
                {currentTitle}
              </h1>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <span className="font-jost text-xs text-cream/50">
                {t("dashboard.welcome")},{" "}
                <span className="text-gold">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </span>
              </span>
              <SignOutButton className="justify-start" />
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 md:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
