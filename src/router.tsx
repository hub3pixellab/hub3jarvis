import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import HoroscopoSolo from "./pages/HoroscopoSolo";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  {
    path: "/horoscopo",
    name: "horoscopo",
    element: <HoroscopoSolo />,
  },
  {
    path: "/auth",
    name: "auth",
    element: <AuthPage />,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "perfil", element: <ProfilePage /> },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
