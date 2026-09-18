import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { routers } from "./router";

// INITIAL LOAD — fresh loads/refreshes always start at the top/hero.
// This module scope runs once, before React renders:
// 1. Disable browser scroll restoration so a refresh never jumps back to a
//    previous scroll position or a stale in-page anchor.
// 2. Clear landing-page hashes that would scroll away from the hero, except
//    the checkout-return target (#pagamento) produced by the Stripe flow,
//    which is intentional navigation. In-app anchor clicks after mount are
//    untouched, so normal navigation keeps working.
// 3. Scroll to (0,0) exactly once per page load — no repeated jumps during
//    route navigation.
if (typeof window !== "undefined") {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  const landingHash = window.location.hash;
  const isCheckoutReturn = landingHash.startsWith("#pagamento");
  if (landingHash && !isCheckoutReturn) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
  window.scrollTo(0, 0);
}

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter(routers);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
