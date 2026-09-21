import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import RedePage from "./pages/RedePage";
import MemberProfilePage from "./pages/MemberProfilePage";
import ChatPage from "./pages/ChatPage";
import ChatRoomPage from "./pages/ChatRoomPage";
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
      { path: "rede", element: <RedePage /> },
      { path: "membro/:userId", element: <MemberProfilePage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "chat/:userId", element: <ChatRoomPage /> },
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
